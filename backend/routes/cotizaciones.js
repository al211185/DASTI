// routes/cotizaciones.js
const express = require('express');
const router = express.Router();
const cotizacionController = require('../controllers/cotizacionController');
const verifyToken = require('../middleware/auth');

// --- Rutas CRUD básicas ---
router.post('/', verifyToken, cotizacionController.createCotizacion);
router.get('/', verifyToken, cotizacionController.getCotizaciones);

// rutas estáticas (siempre antes de las que usan :id)
router.get('/search', verifyToken, cotizacionController.searchProyectosGlobal);
router.get('/solicitudes', verifyToken, cotizacionController.getSolicitudes);
router.post(
    '/:id/solicitar-aprobacion',
    verifyToken,
    cotizacionController.solicitarAprobacion
);

// rutas más específicas con :id
router.get(
    '/:id/historial',
    verifyToken,
    cotizacionController.getHistorialCotizacion
);

router.post('/:id/solicitudes/:historialId', verifyToken, cotizacionController.responderSolicitud);

router.get('/:id/comentarios',   verifyToken, cotizacionController.listComentarios);
router.post('/:id/comentarios',  verifyToken, cotizacionController.addComentario);

// Finalmente, las genéricas con :id
router.get('/:id', verifyToken, cotizacionController.getCotizacionById);
router.put('/:id', verifyToken, cotizacionController.updateCotizacion);
router.delete('/:id', verifyToken, cotizacionController.deleteCotizacion);



module.exports = router;