// routes/requisitoresRoutes.js
const express = require('express');
const router = express.Router();
const Cliente = require('../models/Cliente');

// Obtener todos los requisitores (contactos principales) de los clientes
router.get('/', async (req, res) => {
  try {
    // Se asume que cada cliente tiene un campo contactoPrincipal con al menos el nombre.
    const clientes = await Cliente.find().select('contactoPrincipal');
    // Extraer los nombres (podrías filtrar duplicados si es necesario)
    const requisitores = clientes
      .map(c => (c.contactoPrincipal ? c.contactoPrincipal.nombre : null))
      .filter(name => !!name);
    res.json(requisitores);
  } catch (error) {
    console.error('Error al obtener requisitores:', error);
    res.status(500).json({ msg: 'Error al obtener requisitores', error: error.message });
  }
});

module.exports = router;
