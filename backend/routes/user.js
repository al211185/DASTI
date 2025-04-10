// routes/user.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // Asegúrate de tener este middleware configurado
const userController = require('../controllers/userController');

// Endpoint protegido para obtener el perfil del usuario
router.get('/profile', auth, userController.getProfile);

// Endpoint para registrar un nuevo usuario
// Este endpoint es público o bien restringido según la lógica de tu aplicación
router.post('/', userController.registerUser);

module.exports = router;
