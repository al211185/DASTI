// routes/cotizaciones.js
const express = require('express');
const router = express.Router();
const cotizacionController = require('../controllers/cotizacionController');
const verifyToken = require('../middleware/auth'); // Asegúrate de que este middleware esté correctamente implementado

// Crear una nueva cotización (requiere autenticación)
router.post('/', verifyToken, cotizacionController.createCotizacion);

// Obtener todas las cotizaciones (requiere autenticación)
router.get('/', verifyToken, cotizacionController.getCotizaciones);

// Obtener una cotización por ID (requiere autenticación)
router.get('/:id', verifyToken, cotizacionController.getCotizacionById);

// Actualizar una cotización y registrar cambios (requiere autenticación)
router.put('/:id', verifyToken, cotizacionController.updateCotizacion);

// Obtener historial de cambios de una cotización (requiere autenticación)
router.get('/:id/historial', verifyToken, cotizacionController.getHistorialCotizacion);

// (Opcional) Eliminar una cotización (requiere autenticación)
router.delete('/:id', verifyToken, cotizacionController.deleteCotizacion);

module.exports = router;
