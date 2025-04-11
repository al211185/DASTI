const express = require('express');
const router = express.Router();
const plantasController = require('../controllers/plantasController');

// Obtener la lista de plantas
router.get('/', plantasController.getPlantas);

// Crear una nueva planta
router.post('/', plantasController.createPlanta);

module.exports = router;
