const express = require('express');
const router = express.Router();
const proveedorController = require('../controllers/proveedorController');

// Ruta para crear un proveedor
router.post('/', proveedorController.createProveedor);

// Ruta para listar proveedores (opcional, con filtrado)
router.get('/', proveedorController.getProveedores);

module.exports = router;
