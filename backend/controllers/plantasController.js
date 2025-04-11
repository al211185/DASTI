const Planta = require('../models/Planta');

exports.getPlantas = async (req, res) => {
  try {
    const plantas = await Planta.find().sort({ nombre: 1 });
    res.json(plantas);
  } catch (error) {
    console.error('Error al obtener plantas:', error);
    res.status(500).json({ msg: 'Error al obtener plantas', error: error.message });
  }
};

exports.createPlanta = async (req, res) => {
  try {
    // Se crea una nueva instancia con los datos enviados,
    // el modelo asignará automáticamente el serial al guardarla.
    const nuevaPlanta = new Planta(req.body);
    const plantaGuardada = await nuevaPlanta.save();
    res.status(201).json(plantaGuardada);
  } catch (error) {
    console.error('Error al registrar planta:', error);
    res.status(400).json({ msg: 'Error al registrar planta', error: error.message });
  }
};
