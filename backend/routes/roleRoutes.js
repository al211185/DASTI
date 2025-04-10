// routes/roleRoutes.js
const express = require('express');
const router = express.Router();
const Role = require('../models/Role'); // Ajusta la ruta según la estructura de tu proyecto

// Endpoint para obtener todos los roles
router.get('/', async (req, res) => {
  try {
    const roles = await Role.find().sort({ nombre: 1 });
    res.json(roles);
  } catch (error) {
    console.error('Error al obtener roles:', error);
    res.status(500).json({ msg: 'Error al obtener roles', error: error.message });
  }
});

module.exports = router;
