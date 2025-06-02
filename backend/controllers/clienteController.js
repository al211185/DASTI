// controllers/clientesController.js

const Cliente = require('../models/Cliente');
const Notificacion = require('../models/Notificacion');
const { io } = require('../index'); // Asegúrate de la ruta correcta

/* ---------------------------- LISTAR ---------------------------- */
/* GET /api/clientes                                              */
exports.getClientes = async (_req, res) => {
  try {
    const clientes = await Cliente.find().sort({ nombre: 1 });
    return res.json(clientes);
  } catch (err) {
    console.error('Error al obtener clientes:', err);
    return res.status(500).json({ msg: 'Error al obtener clientes', error: err.message });
  }
};

/* ------------------------- OBTENER UNO -------------------------- */
/* GET /api/clientes/:id                                          */
exports.getClienteById = async (req, res) => {
  try {
    const cliente = await Cliente.findById(req.params.id);
    if (!cliente) {
      return res.status(404).json({ msg: 'Cliente no encontrado' });
    }
    return res.json(cliente);
  } catch (err) {
    console.error('Error al obtener cliente:', err);
    return res.status(500).json({ msg: 'Error al obtener el cliente', error: err.message });
  }
};

/* ---------------------------- CREAR ----------------------------- */
/* POST /api/clientes                                             */
exports.createCliente = async (req, res) => {
  try {
    const nuevo = new Cliente(req.body);
    const guardado = await nuevo.save();

    // 1) Crear notificación para administradores
    const mensajeNoti = `Nuevo cliente registrado: ${guardado.nombre}`;
    const noti = await Notificacion.create({
      tipo: 'cliente_creado',
      mensaje: mensajeNoti,
      esGlobal: true,
      creadoPor: req.user._id,
      refId: guardado._id
    });

    // 2) Emitir a room "admin"
    io.to('admin').emit('nueva_notificacion', {
      _id: noti._id,
      tipo: noti.tipo,
      mensaje: noti.mensaje,
      fecha: noti.fecha,
      refId: noti.refId
    });

    return res.status(201).json(guardado);
  } catch (err) {
    console.error('Error al crear cliente:', err);
    return res.status(400).json({ msg: 'Error al crear el cliente', error: err.message });
  }
};

/* --------------------------- ACTUALIZAR ------------------------- */
/* PUT /api/clientes/:id                                           */
exports.updateCliente = async (req, res) => {
  try {
    const actualizado = await Cliente.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!actualizado) {
      return res.status(404).json({ msg: 'Cliente no encontrado' });
    }

    // 1) Crear notificación para administradores
    const mensajeNoti = `Cliente actualizado: ${actualizado.nombre}`;
    const noti = await Notificacion.create({
      tipo: 'cliente_actualizado',
      mensaje: mensajeNoti,
      esGlobal: true,
      creadoPor: req.user._id,
      refId: actualizado._id
    });

    // 2) Emitir a room "admin"
    io.to('admin').emit('nueva_notificacion', {
      _id: noti._id,
      tipo: noti.tipo,
      mensaje: noti.mensaje,
      fecha: noti.fecha,
      refId: noti.refId
    });

    return res.json(actualizado);
  } catch (err) {
    console.error('Error al actualizar cliente:', err);
    return res.status(400).json({ msg: 'Error al actualizar el cliente', error: err.message });
  }
};

/* ---------------------------- ELIMINAR -------------------------- */
/* DELETE /api/clientes/:id                                        */
exports.deleteCliente = async (req, res) => {
  try {
    const eliminado = await Cliente.findByIdAndDelete(req.params.id);
    if (!eliminado) {
      return res.status(404).json({ msg: 'Cliente no encontrado' });
    }

    // 1) Crear notificación para administradores
    const mensajeNoti = `Cliente eliminado: ${eliminado.nombre}`;
    const noti = await Notificacion.create({
      tipo: 'cliente_eliminado',
      mensaje: mensajeNoti,
      esGlobal: true,
      creadoPor: req.user._id,
      refId: eliminado._id
    });

    // 2) Emitir a room "admin"
    io.to('admin').emit('nueva_notificacion', {
      _id: noti._id,
      tipo: noti.tipo,
      mensaje: noti.mensaje,
      fecha: noti.fecha,
      refId: noti.refId
    });

    return res.json({ msg: 'Cliente eliminado correctamente', cliente: eliminado });
  } catch (err) {
    console.error('Error al eliminar cliente:', err);
    return res.status(500).json({ msg: 'Error al eliminar el cliente', error: err.message });
  }
};

/* ---------------------- AGREGAR CONTACTO ------------------------ */
/* POST /api/clientes/:id/contactos                                */
exports.addContacto = async (req, res) => {
  try {
    const actualizado = await Cliente.findByIdAndUpdate(
      req.params.id,
      { $push: { contactos: req.body } },
      { new: true, runValidators: true }
    );
    if (!actualizado) {
      return res.status(404).json({ msg: 'Cliente no encontrado' });
    }

    // 1) Crear notificación para administradores
    const mensajeNoti = `Nuevo contacto agregado a cliente: ${actualizado.nombre}`;
    const noti = await Notificacion.create({
      tipo: 'contacto_agregado',
      mensaje: mensajeNoti,
      esGlobal: true,
      creadoPor: req.user._id,
      refId: actualizado._id
    });

    // 2) Emitir a room "admin"
    io.to('admin').emit('nueva_notificacion', {
      _id: noti._id,
      tipo: noti.tipo,
      mensaje: noti.mensaje,
      fecha: noti.fecha,
      refId: noti.refId
    });

    return res.json({ msg: 'Contacto agregado', cliente: actualizado });
  } catch (err) {
    console.error('Error al agregar contacto:', err);
    return res.status(500).json({ msg: 'Error al agregar contacto', error: err.message });
  }
};

/* ---------------------- QUITAR CONTACTO (opcional) -------------- */
/* DELETE /api/clientes/:id/contactos/:contactoId                  */
exports.removeContacto = async (req, res) => {
  try {
    const { id, contactoId } = req.params;
    const actualizado = await Cliente.findByIdAndUpdate(
      id,
      { $pull: { contactos: { _id: contactoId } } },
      { new: true }
    );
    if (!actualizado) {
      return res.status(404).json({ msg: 'Cliente no encontrado' });
    }

    // 1) Crear notificación para administradores
    const mensajeNoti = `Contacto eliminado de cliente: ${actualizado.nombre}`;
    const noti = await Notificacion.create({
      tipo: 'contacto_eliminado',
      mensaje: mensajeNoti,
      esGlobal: true,
      creadoPor: req.user._id,
      refId: actualizado._id
    });

    // 2) Emitir a room "admin"
    io.to('admin').emit('nueva_notificacion', {
      _id: noti._id,
      tipo: noti.tipo,
      mensaje: noti.mensaje,
      fecha: noti.fecha,
      refId: noti.refId
    });

    return res.json({ msg: 'Contacto eliminado', cliente: actualizado });
  } catch (err) {
    console.error('Error al eliminar contacto:', err);
    return res.status(500).json({ msg: 'Error al eliminar contacto', error: err.message });
  }
};
