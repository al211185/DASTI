// controllers/usuariosController.js

const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Notificacion = require('../models/Notificacion');
const { getIO } = require('../socket'); // Usamos getIO en lugar de io directamente

/* ------------------------------------------------------------------------- */
/* LISTAR TODOS                                                              */
/* GET /api/user                                                             */
/* ------------------------------------------------------------------------- */
exports.getAllUsers = async (_req, res) => {
  try {
    const usuarios = await User
      .find()
      .select('-password')
      .populate('rol', 'nombre');
    return res.json(usuarios);
  } catch (err) {
    console.error('Error al obtener usuarios:', err);
    return res.status(500).json({ msg: 'Error al obtener usuarios', error: err.message });
  }
};

/* ------------------------------------------------------------------------- */
/* OBTENER UNO                                                               */
/* GET /api/user/:id                                                          */
/* ------------------------------------------------------------------------- */
exports.getUserById = async (req, res) => {
  try {
    const usuario = await User
      .findById(req.params.id)
      .select('-password')
      .populate('rol', 'nombre');
    if (!usuario) {
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }
    return res.json(usuario);
  } catch (err) {
    console.error('Error al obtener usuario:', err);
    return res.status(500).json({ msg: 'Error al obtener el usuario', error: err.message });
  }
};

/* ------------------------------------------------------------------------- */
/* CREAR                                                                     */
/* POST /api/user                                                             */
/* ------------------------------------------------------------------------- */
exports.registerUser = async (req, res) => {
  try {
    const { nombre, email, password, telefono, departamento, rol } = req.body;
    // validar campos obligatorios
    if (!nombre || !email || !password || !rol) {
      return res.status(400).json({ msg: 'Faltan campos obligatorios' });
    }
    // verificar duplicados
    if (await User.findOne({ email })) {
      return res.status(400).json({ msg: 'Email ya registrado' });
    }
    // hashear contraseña
    const salt = await bcrypt.genSalt(10);
    const pwd = await bcrypt.hash(password, salt);

    const nuevo = new User({ nombre, email, password: pwd, telefono, departamento, rol });
    const guardado = await nuevo.save();
    const resp = guardado.toObject();
    delete resp.password;

    // 1) Crear notificación para administradores
    const usuarioActivo = req.user?.nombre || req.user?.email || 'Desconocido';
    const mensajeNoti = `Nuevo usuario registrado: ${guardado.nombre} (${guardado.email}) por ${usuarioActivo}`;
    const noti = await Notificacion.create({
      tipo: 'usuario_creado',
      mensaje: mensajeNoti,
      esGlobal: true,
      creadoPor: req.user?._id,
      refId: guardado._id
    });

    // 2) Emitir a todos los sockets en room "admin"
    const io = getIO();
    io.to('admin').emit('nueva_notificacion', {
      _id: noti._id,
      tipo: noti.tipo,
      mensaje: noti.mensaje,
      fecha: noti.fecha,
      refId: noti.refId
    });

    return res.status(201).json(resp);
  } catch (err) {
    console.error('Error al crear usuario:', err);
    return res.status(500).json({ msg: 'Error al crear usuario', error: err.message });
  }
};

/* ------------------------------------------------------------------------- */
/* ACTUALIZAR                                                                 */
/* PUT /api/user/:id                                                          */
/* ------------------------------------------------------------------------- */
exports.updateUser = async (req, res) => {
  try {
    // extraer y descartar empleadoID (si existe)
    const { empleadoID, ...updates } = req.body;
    // si se actualiza contraseña, hashearla
    if (updates.password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(updates.password, salt);
    }
    const usuarioActualizado = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    )
      .select('-password')
      .populate('rol', 'nombre');

    if (!usuarioActualizado) {
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }

    // 1) Crear notificación para administradores
    const usuarioActivo = req.user?.nombre || req.user?.email || 'Desconocido';
    const mensajeNoti = `Usuario actualizado: ${usuarioActualizado.nombre} (${usuarioActualizado.email}) por ${usuarioActivo}`;
    const noti = await Notificacion.create({
      tipo: 'usuario_actualizado',
      mensaje: mensajeNoti,
      esGlobal: true,
      creadoPor: req.user?._id,
      refId: usuarioActualizado._id
    });

    // 2) Emitir a todos los sockets en room "admin"
    const io = getIO();
    io.to('admin').emit('nueva_notificacion', {
      _id: noti._id,
      tipo: noti.tipo,
      mensaje: noti.mensaje,
      fecha: noti.fecha,
      refId: noti.refId
    });

    return res.json(usuarioActualizado);
  } catch (err) {
    console.error('Error al actualizar usuario:', err);
    return res.status(400).json({ msg: 'Error al actualizar usuario', error: err.message });
  }
};

/* ------------------------------------------------------------------------- */
/* ELIMINAR                                                                  */
/* DELETE /api/user/:id                                                       */
/* ------------------------------------------------------------------------- */
exports.deleteUser = async (req, res) => {
  try {
    const eliminado = await User.findByIdAndDelete(req.params.id);
    if (!eliminado) {
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }

    // 1) Crear notificación para administradores
    const usuarioActivo = req.user?.nombre || req.user?.email || 'Desconocido';
    const mensajeNoti = `Usuario eliminado: ${eliminado.nombre} (${eliminado.email}) por ${usuarioActivo}`;
    const noti = await Notificacion.create({
      tipo: 'usuario_eliminado',
      mensaje: mensajeNoti,
      esGlobal: true,
      creadoPor: req.user?._id,
      refId: eliminado._id
    });

    // 2) Emitir a todos los sockets en room "admin"
    const io = getIO();
    io.to('admin').emit('nueva_notificacion', {
      _id: noti._id,
      tipo: noti.tipo,
      mensaje: noti.mensaje,
      fecha: noti.fecha,
      refId: noti.refId
    });

    return res.json({ msg: 'Usuario eliminado correctamente' });
  } catch (err) {
    console.error('Error al eliminar usuario:', err);
    return res.status(500).json({ msg: 'Error al eliminar usuario', error: err.message });
  }
};
