// routes/plantasRoutes.js
const express = require('express');
const router = express.Router();
const Planta = require('../models/Planta');

// Endpoint para obtener todas las plantas ordenadas por nombre
router.get('/', async (req, res) => {
  try {
    const plantas = await Planta.find().sort({ nombre: 1 });
    res.json(plantas);
  } catch (error) {
    console.error('Error al obtener plantas:', error);
    res.status(500).json({ msg: 'Error al obtener plantas', error: error.message });
  }
});

module.exports = router;
