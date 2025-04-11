const Categoria = require('../models/Categoria');

exports.createCategoria = async (req, res) => {
  try {
    const { nombre } = req.body;
    // Crea una nueva categoría
    const nuevaCategoria = new Categoria({ nombre });
    const categoriaGuardada = await nuevaCategoria.save();
    res.status(201).json(categoriaGuardada);
  } catch (error) {
    console.error("Error al crear categoría:", error);
    res.status(500).json({ msg: 'Error al crear categoría', error: error.message });
  }
};

exports.getCategorias = async (req, res) => {
  try {
    const categorias = await Categoria.find().sort({ nombre: 1 });
    res.json(categorias);
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({ msg: 'Error al obtener categorías', error: error.message });
  }
};
