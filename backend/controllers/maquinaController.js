// controllers/maquinaController.js
const Maquina = require('../models/Maquina');

exports.createMaquina = async (req, res) => {
  try {
    const { nombre, costoHora } = req.body;
    const nuevaMaquina = new Maquina({ nombre, costoHora });
    const guardada = await nuevaMaquina.save();
    res.status(201).json(guardada);
  } catch (error) {
    console.error('Error al crear máquina:', error);
    res.status(500).json({ msg: 'Error al crear máquina', error: error.message });
  }
};

exports.getMaquinas = async (req, res) => {
  try {
    const maquinas = await Maquina.find().sort({ nombre: 1 });
    res.json(maquinas);
  } catch (error) {
    res.status(500).json({ msg: 'Error al obtener máquinas', error: error.message });
  }
};
