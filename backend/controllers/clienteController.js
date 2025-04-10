const Cliente = require('../models/Cliente');

// Obtener la lista de clientes
exports.getClientes = async (req, res) => {
  try {
    const clientes = await Cliente.find().sort({ nombre: 1 });
    res.json(clientes);
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    res.status(500).json({ msg: 'Error al obtener clientes', error: error.message });
  }
};

// Obtener un cliente por su id
exports.getClienteById = async (req, res) => {
  try {
    const { id } = req.params;
    const cliente = await Cliente.findById(id);
    if (!cliente) {
      return res.status(404).json({ msg: 'Cliente no encontrado' });
    }
    res.json(cliente);
  } catch (error) {
    console.error('Error al obtener el cliente:', error);
    res.status(500).json({ msg: 'Error al obtener el cliente', error: error.message });
  }
};

// Crear un nuevo cliente
exports.createCliente = async (req, res) => {
  try {
    const nuevoCliente = new Cliente(req.body);
    const clienteGuardado = await nuevoCliente.save();
    res.status(201).json(clienteGuardado);
  } catch (error) {
    console.error('Error al crear el cliente:', error);
    res.status(400).json({ msg: 'Error al crear el cliente', error: error.message });
  }
};

// Actualizar un cliente existente
exports.updateCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const clienteActualizado = await Cliente.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!clienteActualizado) {
      return res.status(404).json({ msg: 'Cliente no encontrado' });
    }
    res.json(clienteActualizado);
  } catch (error) {
    console.error('Error al actualizar el cliente:', error);
    res.status(400).json({ msg: 'Error al actualizar el cliente', error: error.message });
  }
};

// Eliminar un cliente
exports.deleteCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const clienteEliminado = await Cliente.findByIdAndRemove(id);
    if (!clienteEliminado) {
      return res.status(404).json({ msg: 'Cliente no encontrado' });
    }
    res.json({ msg: 'Cliente eliminado', cliente: clienteEliminado });
  } catch (error) {
    console.error('Error al eliminar el cliente:', error);
    res.status(500).json({ msg: 'Error al eliminar el cliente', error: error.message });
  }
};
