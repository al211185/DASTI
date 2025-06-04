// routes/proveedorRoutes.js
const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/proveedorController');
const verifyToken = require('../middleware/auth');

// CRUD de proveedores
router.get('/',        verifyToken, ctrl.getProveedores);
router.post('/',       verifyToken, ctrl.createProveedor);
router.get('/:id',     verifyToken, ctrl.getProveedorById);
router.put('/:id',     verifyToken, ctrl.updateProveedor);
router.delete('/:id',  verifyToken, ctrl.deleteProveedor);

module.exports = router;
