const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  const { nombre, email, password, telefono, empleadoID, departamento, rol } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'El usuario ya existe' });

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
    await user.save();

    res.status(201).json({ msg: 'Usuario registrado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
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

    // Aquí, incluimos sólo el id del usuario.
    const payload = { id: user.id };
    // En authController.js
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });


    // Enviar token en una cookie HttpOnly
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // En desarrollo, secure debe ser false
      sameSite: 'Lax', // Cambiado de 'Strict' a 'Lax' para permitir solicitudes entre orígenes (puertos)
      maxAge: 24 * 60 * 60 * 1000, // 1 día en milisegundos
    });

    res.json({ msg: 'Inicio de sesión exitoso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
