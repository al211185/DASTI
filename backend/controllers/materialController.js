const Material = require('../models/Material');

// Obtener todos los materiales (con populate de categoría para obtener el nombre)
exports.getMateriales = async (req, res) => {
  try {
    const materiales = await Material.find()
      .populate('categoria')  // Esto rellenará el campo "categoria" con los datos de la categoría
      .sort({ 'categoria.nombre': 1, nombre: 1 });
    res.json(materiales);
  } catch (error) {
    console.error('Error al obtener materiales:', error);
    res.status(500).json({ msg: 'Error al obtener materiales', error: error.message });
  }
};

// Obtener un material por ID (populado)
exports.getMaterialById = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id).populate('categoria');
    if (!material) {
      return res.status(404).json({ msg: 'Material no encontrado' });
    }
    res.json(material);
  } catch (error) {
    console.error('Error al obtener material:', error);
    res.status(500).json({ msg: 'Error al obtener material', error: error.message });
  }
};

// Crear un nuevo material
exports.createMaterial = async (req, res) => {
  try {
    const newMaterial = new Material(req.body);
    const savedMaterial = await newMaterial.save();
    res.status(201).json(savedMaterial);
  } catch (error) {
    console.error('Error al crear material:', error);
    res.status(500).json({ msg: 'Error al crear material', error: error.message });
  }
};

// Actualizar un material existente
exports.updateMaterial = async (req, res) => {
  try {
    const updatedMaterial = await Material.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('categoria');
    if (!updatedMaterial) {
      return res.status(404).json({ msg: 'Material no encontrado' });
    }
    res.json(updatedMaterial);
  } catch (error) {
    console.error('Error al actualizar material:', error);
    res.status(500).json({ msg: 'Error al actualizar material', error: error.message });
  }
};

// Eliminar un material
exports.deleteMaterial = async (req, res) => {
  try {
    const deletedMaterial = await Material.findByIdAndDelete(req.params.id);
    if (!deletedMaterial) {
      return res.status(404).json({ msg: 'Material no encontrado' });
    }
    res.json({ msg: 'Material eliminado', material: deletedMaterial });
  } catch (error) {
    console.error('Error al eliminar material:', error);
    res.status(500).json({ msg: 'Error al eliminar material', error: error.message });
  }
};
