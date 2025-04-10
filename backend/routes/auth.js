// routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');  // Importar el controlador del usuario
const verifyToken = require('../middleware/auth'); // Middleware para validar el token

// Usar el getProfile de userController en lugar de authController
router.get('/profile', verifyToken, userController.getProfile);

router.post('/register', authController.register);
router.post('/login', authController.login);

router.post('/logout', authController.logout);

router.get('/check', verifyToken, (req, res) => {
  res.json({ msg: 'Autenticado' });
});

module.exports = router;
