const express = require('express');
const router = express.Router();
const categoriaController = require('../controllers/categoriaController');

// Endpoint para obtener todas las categorías
router.get('/', categoriaController.getCategorias);

// Endpoint para crear una nueva categoría
router.post('/', categoriaController.createCategoria);

module.exports = router;
