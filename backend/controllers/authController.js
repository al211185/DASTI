// controllers/authController.js

const User = require('../models/User');
const Notificacion = require('../models/Notificacion');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// Importamos getIO para obtener la instancia de Socket.IO
const { getIO } = require('../socket');

// Nuevo método para obtener el perfil
exports.getProfile = async (req, res) => {
  try {
    const usuario = await User.findById(req.user.id)
      .select('-password')
      .populate('rol', 'nombre');
    if (!usuario) return res.status(404).json({ msg: 'Usuario no encontrado' });
    return res.json(usuario);
  } catch (error) {
    console.error('Error en getProfile:', error);
    return res.status(500).json({ error: error.message });
  }
};

exports.register = async (req, res) => {
  const { nombre, email, password, telefono, empleadoID, departamento, rol } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'El usuario ya existe' });
    }

    user = new User({
      nombre,
      email,
      password,
      telefono,
      empleadoID,
      departamento,
      rol,
    });

    // Hashear la contraseña
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Guardar el usuario en la base de datos
    const guardado = await user.save();

    // 1) Crear la notificación en BD (para admins)
    const mensajeNoti = `Nuevo usuario registrado: ${guardado.nombre} (${guardado.email})`;
    const noti = await Notificacion.create({
      tipo: 'usuario_registrado',
      mensaje: mensajeNoti,
      esGlobal: true,
      creadoPor: guardado._id,
      refId: guardado._id
    });

    // 2) Obtener la instancia de Socket.IO y emitir a 'admin'
    const io = getIO();
    io.to('admin').emit('nueva_notificacion', {
      _id: noti._id,
      tipo: noti.tipo,
      mensaje: noti.mensaje,
      fecha: noti.fecha,
      refId: noti.refId
    });

    return res.status(201).json({ msg: 'Usuario registrado correctamente' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Credenciales incorrectas' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Credenciales incorrectas' });

    // Actualizar último acceso
    user.ultimoAcceso = new Date();
    await user.save();

    // Generar JWT con solo el id
    const payload = { id: user.id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

    // Enviar token en una cookie HttpOnly con SameSite=None y Secure
    const secureCookie =
      process.env.NODE_ENV === 'production' ||
      req.secure ||
      req.headers['x-forwarded-proto'] === 'https';

    res.cookie('token', token, {
      httpOnly: true,
      secure: secureCookie,                          // requiere HTTPS en prod
      sameSite: 'None',                              // permitir cross-site
      maxAge: 24 * 60 * 60 * 1000,                   // 1 día
    });

    return res.json({ msg: 'Inicio de sesión exitoso' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

exports.logout = (req, res) => {
  // Limpiar la cookie 'token' con SameSite=None y Secure
  const secureCookie =
    process.env.NODE_ENV === 'production' ||
    req.secure ||
    req.headers['x-forwarded-proto'] === 'https';

  res.clearCookie('token', {
    httpOnly: true,
    secure: secureCookie,
    sameSite: 'None'  // cambiar de 'Lax' a 'None'
  });
  return res.json({ msg: 'Cierre de sesión exitoso' });
};
