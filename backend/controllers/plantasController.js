// controllers/plantaController.js

const Planta = require('../models/Planta');
const Notificacion = require('../models/Notificacion');
const { io } = require('../index'); // Ajusta la ruta si es necesario

/* ------------------------------------------------------------------------- */
/* LISTAR TODAS                                                              */
/* GET /api/plantas                                                          */
/* ------------------------------------------------------------------------- */
exports.getPlantas = async (_req, res) => {
  try {
    const plantas = await Planta.find().sort({ nombre: 1 });
    return res.json(plantas);
  } catch (error) {
    console.error('Error al obtener plantas:', error);
    return res.status(500).json({ msg: 'Error al obtener plantas', error: error.message });
  }
};

/* ------------------------------------------------------------------------- */
/* OBTENER UNA                                                               */
/* GET /api/plantas/:id                                                      */
/* ------------------------------------------------------------------------- */
exports.getPlantaById = async (req, res) => {
  try {
    const planta = await Planta.findById(req.params.id);
    if (!planta) {
      return res.status(404).json({ msg: 'Planta no encontrada' });
    }
    return res.json(planta);
  } catch (error) {
    console.error('Error al obtener planta:', error);
    return res.status(500).json({ msg: 'Error al obtener planta', error: error.message });
  }
};

/* ------------------------------------------------------------------------- */
/* CREAR                                                                     */
/* POST /api/plantas                                                         */
/* ------------------------------------------------------------------------- */
exports.createPlanta = async (req, res) => {
  try {
    const nuevaPlanta = new Planta(req.body); // El modelo puede generar serial
    const guardada = await nuevaPlanta.save();

    // 1) Notificación para administradores
    const usuario = req.user?.nombre || req.user?.email || 'Desconocido';
    const mensajeNoti = `Nueva planta registrada: ${guardada.nombre} por ${usuario}`;
    const noti = await Notificacion.create({
      tipo: 'planta_creada',
      mensaje: mensajeNoti,
      esGlobal: true,
      creadoPor: req.user._id,
      refId: guardada._id
    });

    // 2) Emitir a todos los sockets en room "admin"
    io.to('admin').emit('nueva_notificacion', {
      _id: noti._id,
      tipo: noti.tipo,
      mensaje: noti.mensaje,
      fecha: noti.fecha,
      refId: noti.refId
    });

    return res.status(201).json(guardada);
  } catch (error) {
    console.error('Error al registrar planta:', error);
    return res.status(400).json({ msg: 'Error al registrar planta', error: error.message });
  }
};

/* ------------------------------------------------------------------------- */
/* ACTUALIZAR                                                                */
/* PUT /api/plantas/:id                                                      */
/* ------------------------------------------------------------------------- */
exports.updatePlanta = async (req, res) => {
  try {
    const actualizada = await Planta.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!actualizada) {
      return res.status(404).json({ msg: 'Planta no encontrada' });
    }

    // 1) Notificación para administradores
    const usuario = req.user?.nombre || req.user?.email || 'Desconocido';
    const mensajeNoti = `Planta actualizada: ${actualizada.nombre} por ${usuario}`;
    const noti = await Notificacion.create({
      tipo: 'planta_actualizada',
      mensaje: mensajeNoti,
      esGlobal: true,
      creadoPor: req.user._id,
      refId: actualizada._id
    });

    // 2) Emitir a todos los sockets en room "admin"
    io.to('admin').emit('nueva_notificacion', {
      _id: noti._id,
      tipo: noti.tipo,
      mensaje: noti.mensaje,
      fecha: noti.fecha,
      refId: noti.refId
    });

    return res.json(actualizada);
  } catch (error) {
    console.error('Error al actualizar planta:', error);
    return res.status(400).json({ msg: 'Error al actualizar planta', error: error.message });
  }
};

/* ------------------------------------------------------------------------- */
/* ELIMINAR                                                                  */
/* DELETE /api/plantas/:id                                                    */
/* ------------------------------------------------------------------------- */
exports.deletePlanta = async (req, res) => {
  try {
    const eliminada = await Planta.findByIdAndDelete(req.params.id);
    if (!eliminada) {
      return res.status(404).json({ msg: 'Planta no encontrada' });
    }

    // 1) Notificación para administradores
    const usuario = req.user?.nombre || req.user?.email || 'Desconocido';
    const mensajeNoti = `Planta eliminada: ${eliminada.nombre} por ${usuario}`;
    const noti = await Notificacion.create({
      tipo: 'planta_eliminada',
      mensaje: mensajeNoti,
      esGlobal: true,
      creadoPor: req.user._id,
      refId: eliminada._id
    });

    // 2) Emitir a todos los sockets en room "admin"
    io.to('admin').emit('nueva_notificacion', {
      _id: noti._id,
      tipo: noti.tipo,
      mensaje: noti.mensaje,
      fecha: noti.fecha,
      refId: noti.refId
    });

    return res.json({ msg: 'Planta eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar planta:', error);
    return res.status(500).json({ msg: 'Error al eliminar planta', error: error.message });
  }
};
