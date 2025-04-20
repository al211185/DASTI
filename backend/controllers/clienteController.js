// controllers/clientesController.js
const Cliente = require('../models/Cliente');

/* ---------------------------- LISTAR ---------------------------- */
exports.getClientes = async (_req, res) => {
  try {
    const clientes = await Cliente.find().sort({ nombre: 1 });
    res.json(clientes);
  } catch (err) {
    console.error('Error al obtener clientes:', err);
    res.status(500).json({ msg: 'Error al obtener clientes', error: err.message });
  }
};

/* ------------------------- OBTENER UNO -------------------------- */
exports.getClienteById = async (req, res) => {
  try {
    const cliente = await Cliente.findById(req.params.id);
    if (!cliente) return res.status(404).json({ msg: 'Cliente no encontrado' });
    res.json(cliente);
  } catch (err) {
    console.error('Error al obtener cliente:', err);
    res.status(500).json({ msg: 'Error al obtener el cliente', error: err.message });
  }
};

/* ---------------------------- CREAR ----------------------------- */
exports.createCliente = async (req, res) => {
  try {
    const nuevo = new Cliente(req.body);
    const guardado = await nuevo.save();
    res.status(201).json(guardado);
  } catch (err) {
    console.error('Error al crear cliente:', err);
    res.status(400).json({ msg: 'Error al crear el cliente', error: err.message });
  }
};

/* --------------------------- ACTUALIZAR ------------------------- */
exports.updateCliente = async (req, res) => {
  try {
    const actualizado = await Cliente.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }     // overwrite:false por defecto
    );
    if (!actualizado) return res.status(404).json({ msg: 'Cliente no encontrado' });
    res.json(actualizado);
  } catch (err) {
    console.error('Error al actualizar cliente:', err);
    res.status(400).json({ msg: 'Error al actualizar el cliente', error: err.message });
  }
};

/* ---------------------------- ELIMINAR -------------------------- */
exports.deleteCliente = async (req, res) => {
  try {
    const eliminado = await Cliente.findByIdAndDelete(req.params.id);
    if (!eliminado) return res.status(404).json({ msg: 'Cliente no encontrado' });
    res.json({ msg: 'Cliente eliminado', cliente: eliminado });
  } catch (err) {
    console.error('Error al eliminar cliente:', err);
    res.status(500).json({ msg: 'Error al eliminar el cliente', error: err.message });
  }
};

/* ---------------------- AGREGAR CONTACTO ------------------------ */
exports.addContacto = async (req, res) => {
  try {
    const actualizado = await Cliente.findByIdAndUpdate(
      req.params.id,
      { $push: { contactos: req.body } },
      { new: true, runValidators: true }
    );
    if (!actualizado) return res.status(404).json({ msg: 'Cliente no encontrado' });
    res.json({ msg: 'Contacto agregado', cliente: actualizado });
  } catch (err) {
    console.error('Error al agregar contacto:', err);
    res.status(500).json({ msg: 'Error al agregar contacto', error: err.message });
  }
};

/* ---------------------- QUITAR CONTACTO (opcional) -------------- */
exports.removeContacto = async (req, res) => {
  try {
    const { id, contactoId } = req.params;        // _id del sub‑documento
    const actualizado = await Cliente.findByIdAndUpdate(
      id,
      { $pull: { contactos: { _id: contactoId } } },
      { new: true }
    );
    if (!actualizado) return res.status(404).json({ msg: 'Cliente no encontrado' });
    res.json({ msg: 'Contacto eliminado', cliente: actualizado });
  } catch (err) {
    console.error('Error al eliminar contacto:', err);
    res.status(500).json({ msg: 'Error al eliminar contacto', error: err.message });
  }
};
