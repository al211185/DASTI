const Planta = require('../models/Planta');

// Obtener todas las plantas ordenadas por nombre
exports.getPlantas = async (req, res) => {
  try {
    const plantas = await Planta.find().sort({ nombre: 1 });
    res.json(plantas);
  } catch (error) {
    console.error('Error al obtener plantas:', error);
    res.status(500).json({ msg: 'Error al obtener plantas', error: error.message });
  }
};

// Obtener una planta por su ID
exports.getPlantaById = async (req, res) => {
  try {
    const { id } = req.params;
    const planta = await Planta.findById(id);
    if (!planta) {
      return res.status(404).json({ msg: 'Planta no encontrada' });
    }
    res.json(planta);
  } catch (error) {
    console.error('Error al obtener la planta:', error);
    res.status(500).json({ msg: 'Error al obtener la planta', error: error.message });
  }
};

// Crear una nueva planta
exports.createPlanta = async (req, res) => {
  try {
    const nuevaPlanta = new Planta(req.body);
    const plantaGuardada = await nuevaPlanta.save();
    res.status(201).json(plantaGuardada);
  } catch (error) {
    console.error('Error al crear la planta:', error);
    res.status(400).json({ msg: 'Error al crear la planta', error: error.message });
  }
};

// Actualizar una planta existente
exports.updatePlanta = async (req, res) => {
  try {
    const { id } = req.params;
    const plantaActualizada = await Planta.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!plantaActualizada) {
      return res.status(404).json({ msg: 'Planta no encontrada' });
    }
    res.json(plantaActualizada);
  } catch (error) {
    console.error('Error al actualizar la planta:', error);
    res.status(400).json({ msg: 'Error al actualizar la planta', error: error.message });
  }
};

// Eliminar una planta
exports.deletePlanta = async (req, res) => {
  try {
    const { id } = req.params;
    const plantaEliminada = await Planta.findByIdAndRemove(id);
    if (!plantaEliminada) {
      return res.status(404).json({ msg: 'Planta no encontrada' });
    }
    res.json({ msg: 'Planta eliminada', planta: plantaEliminada });
  } catch (error) {
    console.error('Error al eliminar la planta:', error);
    res.status(500).json({ msg: 'Error al eliminar la planta', error: error.message });
  }
};
