// routes/maquinas.js
const express = require('express');
const router = express.Router();
const maquinaController = require('../controllers/maquinaController');

router.post('/', maquinaController.createMaquina);
router.get('/', maquinaController.getMaquinas);

module.exports = router;
