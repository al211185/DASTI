// routes/user.js
const express        = require('express');
const router         = express.Router();
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const verifyToken    = require('../middleware/auth');

// ---------------- Autenticación ----------------
router.post('/register', authController.register);
router.post('/login',    authController.login);
router.post('/logout',   authController.logout);

// ---------------- Perfil ----------------
router.get('/profile', verifyToken, authController.getProfile);

// ---------------- Health check ----------------
router.get('/check', verifyToken, (_req, res) => {
  res.json({ msg: 'Autenticado' });
});

// ---------------- CRUD de usuarios ----------------
router.get('/',        verifyToken, userController.getAllUsers);
router.get('/:id',     verifyToken, userController.getUserById);
router.put('/:id',     verifyToken, userController.updateUser);
router.delete('/:id',  verifyToken, userController.deleteUser);
router.post('/',       verifyToken, userController.registerUser);

module.exports = router;
