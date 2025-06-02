// controllers/maquinaController.js

const Maquina = require('../models/Maquina');
const Notificacion = require('../models/Notificacion');
const { io } = require('../index');

/* ------------------------------------------------------------------------- */
/* CREAR MÁQUINA                                                             */
/* POST /api/maquinas                                                        */
/* ------------------------------------------------------------------------- */
exports.createMaquina = async (req, res) => {
  try {
    const { nombre, costoHora } = req.body;
    const nuevaMaquina = new Maquina({ nombre, costoHora });
    const guardada = await nuevaMaquina.save();

    // 1) Crear notificación para administradores
    const usuario = req.user?.nombre || req.user?.email || 'Desconocido';
    const mensajeNoti = `Nueva máquina creada: ${guardada.nombre} (Costo/Hora: ${guardada.costoHora}) por ${usuario}`;
    const noti = await Notificacion.create({
      tipo: 'maquina_creada',
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
    console.error('Error al crear máquina:', error);
    return res.status(500).json({ msg: 'Error al crear máquina', error: error.message });
  }
};

/* ------------------------------------------------------------------------- */
/* LISTAR TODAS LAS MÁQUINAS                                                  */
/* GET /api/maquinas                                                         */
/* ------------------------------------------------------------------------- */
exports.getMaquinas = async (_req, res) => {
  try {
    const maquinas = await Maquina.find().sort({ nombre: 1 });
    return res.json(maquinas);
  } catch (error) {
    console.error('Error al obtener máquinas:', error);
    return res.status(500).json({ msg: 'Error al obtener máquinas', error: error.message });
  }
};

/* ------------------------------------------------------------------------- */
/* OBTENER UNA MÁQUINA POR ID                                                */
/* GET /api/maquinas/:id                                                      */
/* ------------------------------------------------------------------------- */
exports.getMaquinaById = async (req, res) => {
  try {
    const maquina = await Maquina.findById(req.params.id);
    if (!maquina) {
      return res.status(404).json({ msg: 'Máquina no encontrada' });
    }
    return res.json(maquina);
  } catch (error) {
    console.error('Error al obtener máquina:', error);
    return res.status(500).json({ msg: 'Error al obtener máquina', error: error.message });
  }
};

/* ------------------------------------------------------------------------- */
/* ACTUALIZAR MÁQUINA                                                         */
/* PUT /api/maquinas/:id                                                      */
/* ------------------------------------------------------------------------- */
exports.updateMaquina = async (req, res) => {
  try {
    const { nombre, costoHora } = req.body;
    const actualizado = await Maquina.findByIdAndUpdate(
      req.params.id,
      { nombre, costoHora },
      { new: true, runValidators: true }
    );
    if (!actualizado) {
      return res.status(404).json({ msg: 'Máquina no encontrada' });
    }

    // 1) Crear notificación para administradores
    const usuario = req.user?.nombre || req.user?.email || 'Desconocido';
    const mensajeNoti = `Máquina actualizada: ${actualizado.nombre} (Nuevo Costo/Hora: ${actualizado.costoHora}) por ${usuario}`;
    const noti = await Notificacion.create({
      tipo: 'maquina_actualizada',
      mensaje: mensajeNoti,
      esGlobal: true,
      creadoPor: req.user._id,
      refId: actualizado._id
    });

    // 2) Emitir a todos los sockets en room "admin"
    io.to('admin').emit('nueva_notificacion', {
      _id: noti._id,
      tipo: noti.tipo,
      mensaje: noti.mensaje,
      fecha: noti.fecha,
      refId: noti.refId
    });

    return res.json(actualizado);
  } catch (error) {
    console.error('Error al actualizar máquina:', error);
    return res.status(400).json({ msg: 'Error al actualizar máquina', error: error.message });
  }
};

/* ------------------------------------------------------------------------- */
/* ELIMINAR MÁQUINA                                                          */
/* DELETE /api/maquinas/:id                                                   */
/* ------------------------------------------------------------------------- */
exports.deleteMaquina = async (req, res) => {
  try {
    const eliminado = await Maquina.findByIdAndDelete(req.params.id);
    if (!eliminado) {
      return res.status(404).json({ msg: 'Máquina no encontrada' });
    }

    // 1) Crear notificación para administradores
    const usuario = req.user?.nombre || req.user?.email || 'Desconocido';
    const mensajeNoti = `Máquina eliminada: ${eliminado.nombre} por ${usuario}`;
    const noti = await Notificacion.create({
      tipo: 'maquina_eliminada',
      mensaje: mensajeNoti,
      esGlobal: true,
      creadoPor: req.user._id,
      refId: eliminado._id
    });

    // 2) Emitir a todos los sockets en room "admin"
    io.to('admin').emit('nueva_notificacion', {
      _id: noti._id,
      tipo: noti.tipo,
      mensaje: noti.mensaje,
      fecha: noti.fecha,
      refId: noti.refId
    });

    return res.json({ msg: 'Máquina eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar máquina:', error);
    return res.status(500).json({ msg: 'Error al eliminar máquina', error: error.message });
  }
};
