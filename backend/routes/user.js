// routes/user.js
const express        = require('express');
const router         = express.Router();
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const verifyToken    = require('../middleware/auth');

// — Autenticación —
// Registro
router.post('/register', authController.register);
// Login
router.post('/login',    authController.login);
// Logout
router.post('/logout',   authController.logout);

// — Perfil (protegido) —
// Ya que getProfile vive en authController
router.get('/profile', verifyToken, authController.getProfile);

// — Health check de token —
router.get('/check', verifyToken, (_req, res) => {
  res.json({ msg: 'Autenticado' });
});

// — CRUD de usuarios —
// Lista todos
router.get('/',        verifyToken, userController.getAllUsers);
// Obtiene uno por id
router.get('/:id',     verifyToken, userController.getUserById);
// Actualiza
router.put('/:id',     verifyToken, userController.updateUser);
// Elimina
router.delete('/:id',  verifyToken, userController.deleteUser);

module.exports = router;
