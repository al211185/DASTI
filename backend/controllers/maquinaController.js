// controllers/maquinaController.js
const Maquina = require('../models/Maquina');

/* ------------------------------------------------------------------------- */
/* CREAR MÁQUINA                                                             */
/* POST /maquinas                                                            */
/* ------------------------------------------------------------------------- */
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

/* ------------------------------------------------------------------------- */
/* LISTAR TODAS LAS MÁQUINAS                                                  */
/* GET /maquinas                                                             */
/* ------------------------------------------------------------------------- */
exports.getMaquinas = async (_req, res) => {
  try {
    const maquinas = await Maquina.find().sort({ nombre: 1 });
    res.json(maquinas);
  } catch (error) {
    console.error('Error al obtener máquinas:', error);
    res.status(500).json({ msg: 'Error al obtener máquinas', error: error.message });
  }
};

/* ------------------------------------------------------------------------- */
/* OBTENER UNA MÁQUINA POR ID                                                */
/* GET /maquinas/:id                                                         */
/* ------------------------------------------------------------------------- */
exports.getMaquinaById = async (req, res) => {
  try {
    const maquina = await Maquina.findById(req.params.id);
    if (!maquina) {
      return res.status(404).json({ msg: 'Máquina no encontrada' });
    }
    res.json(maquina);
  } catch (error) {
    console.error('Error al obtener máquina:', error);
    res.status(500).json({ msg: 'Error al obtener máquina', error: error.message });
  }
};

/* ------------------------------------------------------------------------- */
/* ACTUALIZAR MÁQUINA                                                         */
/* PUT /maquinas/:id                                                         */
/* ------------------------------------------------------------------------- */
exports.updateMaquina = async (req, res) => {
  try {
    const { nombre, costoHora } = req.body;
    const actualizado = await Maquina.findByIdAndUpdate(
      req.params.id,
      { nombre, costoHora },
      { new: true, runValidators: true }
    );
    if (!actualizado) {
      return res.status(404).json({ msg: 'Máquina no encontrada' });
    }
    res.json(actualizado);
  } catch (error) {
    console.error('Error al actualizar máquina:', error);
    res.status(400).json({ msg: 'Error al actualizar máquina', error: error.message });
  }
};

/* ------------------------------------------------------------------------- */
/* ELIMINAR MÁQUINA                                                          */
/* DELETE /maquinas/:id                                                      */
/* ------------------------------------------------------------------------- */
exports.deleteMaquina = async (req, res) => {
  try {
    const eliminado = await Maquina.findByIdAndDelete(req.params.id);
    if (!eliminado) {
      return res.status(404).json({ msg: 'Máquina no encontrada' });
    }
    res.json({ msg: 'Máquina eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar máquina:', error);
    res.status(500).json({ msg: 'Error al eliminar máquina', error: error.message });
  }
};
