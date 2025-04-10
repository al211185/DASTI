// routes/clienteRoutes.js
const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');

// Listar todos los clientes
router.get('/', clienteController.getClientes);
// Obtener un cliente por su id
router.get('/:id', clienteController.getClienteById);
// Crear un nuevo cliente
router.post('/', clienteController.createCliente);
// Actualizar un cliente
router.put('/:id', clienteController.updateCliente);
// Eliminar un cliente
router.delete('/:id', clienteController.deleteCliente);

module.exports = router;
