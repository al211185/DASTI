// controllers/plantaController.js
const Planta = require('../models/Planta');

/* ------------------------------------------------------------------------- */
/* LISTAR TODAS                                                             */
/* GET /plantas                                                             */
/* ------------------------------------------------------------------------- */
exports.getPlantas = async (_req, res) => {
  try {
    const plantas = await Planta.find().sort({ nombre: 1 });
    res.json(plantas);
  } catch (error) {
    console.error('Error al obtener plantas:', error);
    res.status(500).json({ msg: 'Error al obtener plantas', error: error.message });
  }
};

/* ------------------------------------------------------------------------- */
/* OBTENER UNA                                                              */
/* GET /plantas/:id                                                         */
/* ------------------------------------------------------------------------- */
exports.getPlantaById = async (req, res) => {
  try {
    const planta = await Planta.findById(req.params.id);
    if (!planta) return res.status(404).json({ msg: 'Planta no encontrada' });
    res.json(planta);
  } catch (error) {
    console.error('Error al obtener planta:', error);
    res.status(500).json({ msg: 'Error al obtener planta', error: error.message });
  }
};

/* ------------------------------------------------------------------------- */
/* CREAR                                                                    */
/* POST /plantas                                                            */
/* ------------------------------------------------------------------------- */
exports.createPlanta = async (req, res) => {
  try {
    const nuevaPlanta = new Planta(req.body);     // el modelo puede generar serial
    const guardada = await nuevaPlanta.save();
    res.status(201).json(guardada);
  } catch (error) {
    console.error('Error al registrar planta:', error);
    res.status(400).json({ msg: 'Error al registrar planta', error: error.message });
  }
};

/* ------------------------------------------------------------------------- */
/* ACTUALIZAR                                                               */
/* PUT /plantas/:id                                                         */
/* ------------------------------------------------------------------------- */
exports.updatePlanta = async (req, res) => {
  try {
    const actualizada = await Planta.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!actualizada) return res.status(404).json({ msg: 'Planta no encontrada' });
    res.json(actualizada);
  } catch (error) {
    console.error('Error al actualizar planta:', error);
    res.status(400).json({ msg: 'Error al actualizar planta', error: error.message });
  }
};

/* ------------------------------------------------------------------------- */
/* ELIMINAR                                                                 */
/* DELETE /plantas/:id                                                      */
/* ------------------------------------------------------------------------- */
exports.deletePlanta = async (req, res) => {
  try {
    const eliminada = await Planta.findByIdAndDelete(req.params.id);
    if (!eliminada) return res.status(404).json({ msg: 'Planta no encontrada' });
    res.json({ msg: 'Planta eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar planta:', error);
    res.status(500).json({ msg: 'Error al eliminar planta', error: error.message });
  }
};
