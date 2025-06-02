// routes/notificaciones.js
const express = require('express');
const router = express.Router();
const notiCtrl = require('../controllers/notificacionesController');

// Importa la función directamente, sin destructurar
const requireAuth = require('../middleware/auth');

router.use(requireAuth);

router.get('/', notiCtrl.getNotificaciones);
router.patch('/:id', notiCtrl.marcarLeida);

module.exports = router;
