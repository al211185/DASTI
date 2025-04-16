// routes/cotizaciones.js
const express = require('express');
const router = express.Router();
const cotizacionController = require('../controllers/cotizacionController');
const verifyToken = require('../middleware/auth');

// Crear una nueva cotización (requiere autenticación)
router.post('/', verifyToken, cotizacionController.createCotizacion);

// Obtener todas las cotizaciones (requiere autenticación)
router.get('/', verifyToken, cotizacionController.getCotizaciones);

// IMPORTANTE: primero definimos "/search" 
// (para que "search" no sea interpretado como un :id)
router.get('/search', verifyToken, cotizacionController.searchProyectosGlobal);

// Luego, la ruta que usa :id
// Obtener una cotización por ID (requiere autenticación)
router.get('/:id', verifyToken, cotizacionController.getCotizacionById);

// Actualizar una cotización
router.put('/:id', verifyToken, cotizacionController.updateCotizacion);

// Obtener historial
router.get('/:id/historial', verifyToken, cotizacionController.getHistorialCotizacion);

// Eliminar
router.delete('/:id', verifyToken, cotizacionController.deleteCotizacion);

module.exports = router;
