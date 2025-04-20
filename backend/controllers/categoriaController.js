// controllers/categoriaController.js
const Categoria = require('../models/Categoria');

/* ------------------------------------------------------------------------- */
/* CREAR UNA NUEVA CATEGORÍA                                                 */
/* POST /categorias                                                          */
/* ------------------------------------------------------------------------- */
exports.createCategoria = async (req, res) => {
  try {
    const { nombre } = req.body;
    const nuevaCategoria = new Categoria({ nombre });
    const categoriaGuardada = await nuevaCategoria.save();
    res.status(201).json(categoriaGuardada);
  } catch (error) {
    console.error("Error al crear categoría:", error);
    res.status(500).json({ msg: 'Error al crear categoría', error: error.message });
  }
};

/* ------------------------------------------------------------------------- */
/* LISTAR TODAS LAS CATEGORÍAS                                                 */
/* GET /categorias                                                           */
/* ------------------------------------------------------------------------- */
exports.getCategorias = async (req, res) => {
  try {
    const categorias = await Categoria.find().sort({ nombre: 1 });
    res.json(categorias);
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({ msg: 'Error al obtener categorías', error: error.message });
  }
};

/* ------------------------------------------------------------------------- */
/* OBTENER UNA CATEGORÍA POR ID                                              */
/* GET /categorias/:id                                                       */
/* ------------------------------------------------------------------------- */
exports.getCategoriaById = async (req, res) => {
  try {
    const categoria = await Categoria.findById(req.params.id);
    if (!categoria) {
      return res.status(404).json({ msg: 'Categoría no encontrada' });
    }
    res.json(categoria);
  } catch (error) {
    console.error('Error al obtener categoría:', error);
    res.status(500).json({ msg: 'Error al obtener categoría', error: error.message });
  }
};

/* ------------------------------------------------------------------------- */
/* ACTUALIZAR UNA CATEGORÍA                                                   */
/* PUT /categorias/:id                                                       */
/* ------------------------------------------------------------------------- */
exports.updateCategoria = async (req, res) => {
  try {
    const { nombre } = req.body;
    const categoriaActualizada = await Categoria.findByIdAndUpdate(
      req.params.id,
      { nombre },
      { new: true, runValidators: true }
    );
    if (!categoriaActualizada) {
      return res.status(404).json({ msg: 'Categoría no encontrada' });
    }
    res.json(categoriaActualizada);
  } catch (error) {
    console.error('Error al actualizar categoría:', error);
    res.status(400).json({ msg: 'Error al actualizar categoría', error: error.message });
  }
};

/* ------------------------------------------------------------------------- */
/* ELIMINAR UNA CATEGORÍA                                                     */
/* DELETE /categorias/:id                                                    */
/* ------------------------------------------------------------------------- */
exports.deleteCategoria = async (req, res) => {
  try {
    const categoriaEliminada = await Categoria.findByIdAndDelete(req.params.id);
    if (!categoriaEliminada) {
      return res.status(404).json({ msg: 'Categoría no encontrada' });
    }
    res.json({ msg: 'Categoría eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar categoría:', error);
    res.status(500).json({ msg: 'Error al eliminar categoría', error: error.message });
  }
};
