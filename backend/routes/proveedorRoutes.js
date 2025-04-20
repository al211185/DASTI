// routes/proveedorRoutes.js
const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/proveedorController');

// CRUD de proveedores
router.get('/',        ctrl.getProveedores);
router.post('/',       ctrl.createProveedor);
router.get('/:id',     ctrl.getProveedorById);
router.put('/:id',     ctrl.updateProveedor);
router.delete('/:id',  ctrl.deleteProveedor);

module.exports = router;
