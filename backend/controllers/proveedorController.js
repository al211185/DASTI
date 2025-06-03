// controllers/proveedorController.js

const Proveedor = require('../models/Proveedor');
const Notificacion = require('../models/Notificacion');
const { getIO } = require('../socket'); // Usamos getIO en lugar de io directamente

/* ------------------------- CREAR PROVEEDOR -------------------------- */
/* POST /api/proveedores                                               */
exports.createProveedor = async (req, res) => {
  try {
    const nuevoProveedor = new Proveedor({ ...req.body });
    const proveedorGuardado = await nuevoProveedor.save();

    // 1) Crear notificación para administradores
    const usuario = req.user?.nombre || req.user?.email || 'Desconocido';
    const mensajeNoti = `Nuevo proveedor creado: ${proveedorGuardado.nombre} por ${usuario}`;
    const noti = await Notificacion.create({
      tipo: 'proveedor_creado',
      mensaje: mensajeNoti,
      esGlobal: true,
      creadoPor: req.user?._id,
      refId: proveedorGuardado._id
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

    return res.status(201).json({
      msg: 'Proveedor creado correctamente',
      proveedor: proveedorGuardado
    });
  } catch (error) {
    console.error('Error al crear proveedor:', error);
    return res.status(500).json({ msg: 'Error al crear proveedor', error: error.message });
  }
};

/* ------------------------- LISTAR PROVEEDORES ------------------------ */
/* GET /api/proveedores                                                */
exports.getProveedores = async (req, res) => {
  try {
    const filtro = req.query.material
      ? { 'materiales.material': req.query.material }
      : {};
    const proveedores = await Proveedor.find(filtro)
      .populate('materiales.material')
      .sort({ fechaActualizacion: -1 });
    return res.json(proveedores);
  } catch (error) {
    console.error('Error al obtener proveedores:', error);
    return res.status(500).json({ msg: 'Error al obtener proveedores', error: error.message });
  }
};

/* ----------------------- OBTENER POR ID ------------------------------ */
/* GET /api/proveedores/:id                                            */
exports.getProveedorById = async (req, res) => {
  try {
    const proveedor = await Proveedor.findById(req.params.id)
      .populate('materiales.material');
    if (!proveedor) {
      return res.status(404).json({ msg: 'Proveedor no encontrado' });
    }
    return res.json(proveedor);
  } catch (error) {
    console.error('Error al obtener proveedor:', error);
    return res.status(500).json({ msg: 'Error al obtener proveedor', error: error.message });
  }
};

/* ------------------------ ACTUALIZAR PROVEEDOR ----------------------- */
/* PUT /api/proveedores/:id                                            */
exports.updateProveedor = async (req, res) => {
  try {
    const actualizado = await Proveedor.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        fechaActualizacion: new Date()
      },
      { new: true, runValidators: true }
    ).populate('materiales.material');

    if (!actualizado) {
      return res.status(404).json({ msg: 'Proveedor no encontrado' });
    }

    // 1) Crear notificación para administradores
    const usuario = req.user?.nombre || req.user?.email || 'Desconocido';
    const mensajeNoti = `Proveedor actualizado: ${actualizado.nombre} por ${usuario}`;
    const noti = await Notificacion.create({
      tipo: 'proveedor_actualizado',
      mensaje: mensajeNoti,
      esGlobal: true,
      creadoPor: req.user?._id,
      refId: actualizado._id
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

    return res.json({
      msg: 'Proveedor actualizado correctamente',
      proveedor: actualizado
    });
  } catch (error) {
    console.error('Error al actualizar proveedor:', error);
    return res.status(400).json({ msg: 'Error al actualizar proveedor', error: error.message });
  }
};

/* ------------------------ ELIMINAR PROVEEDOR ------------------------- */
/* DELETE /api/proveedores/:id                                          */
exports.deleteProveedor = async (req, res) => {
  try {
    const eliminado = await Proveedor.findByIdAndDelete(req.params.id);
    if (!eliminado) {
      return res.status(404).json({ msg: 'Proveedor no encontrado' });
    }

    // 1) Crear notificación para administradores
    const usuario = req.user?.nombre || req.user?.email || 'Desconocido';
    const mensajeNoti = `Proveedor eliminado: ${eliminado.nombre} por ${usuario}`;
    const noti = await Notificacion.create({
      tipo: 'proveedor_eliminado',
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

    return res.json({ msg: 'Proveedor eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar proveedor:', error);
    return res.status(500).json({ msg: 'Error al eliminar proveedor', error: error.message });
  }
};
