const express        = require('express');
const router         = express.Router();
const authController = require('../controllers/authController');
const verifyToken    = require('../middleware/auth');

// Perfil (protegido)
router.get('/profile', verifyToken, authController.getProfile);

router.post('/register', authController.register);
router.post('/login',    authController.login);
router.post('/logout',   authController.logout);

router.get('/check', verifyToken, (req, res) => {
  res.json({ msg: 'Autenticado' });
});

module.exports = router;
