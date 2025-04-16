// controllers/materialController.js
const Material = require('../models/Material');

// Obtener todos los materiales (con populate de categoría para obtener el nombre)
exports.getMateriales = async (req, res) => {
  try {
    const materiales = await Material.find()
      .populate('categoria')  // traemos datos de la categoría
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

// Crear un nuevo material (con manejo de imagen)
exports.createMaterial = async (req, res) => {
  try {
    // Desestructuramos el body
    const { nombre, categoria, unidadMedida } = req.body;
    // Si multer procesó un archivo, añadimos su ruta
    const imagen = req.file ? `/uploads/materiales/${req.file.filename}` : undefined;

    // Creamos y guardamos
    const newMaterial = new Material({ nombre, categoria, unidadMedida, imagen });
    const savedMaterial = await newMaterial.save();

    // Populamos antes de responder
    await savedMaterial.populate('categoria');
    res.status(201).json(savedMaterial);
  } catch (error) {
    console.error('Error al crear material:', error);
    res.status(400).json({ msg: 'Error al crear material', error: error.message });
  }
};

// Actualizar un material existente (puede venir o no nueva imagen)
exports.updateMaterial = async (req, res) => {
  try {
    const update = { ...req.body };
    if (req.file) {
      // Si subieron una nueva imagen, actualizamos la ruta
      update.imagen = `/uploads/materiales/${req.file.filename}`;
    }

    const updatedMaterial = await Material.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true, runValidators: true }
    ).populate('categoria');

    if (!updatedMaterial) {
      return res.status(404).json({ msg: 'Material no encontrado' });
    }
    res.json(updatedMaterial);
  } catch (error) {
    console.error('Error al actualizar material:', error);
    res.status(400).json({ msg: 'Error al actualizar material', error: error.message });
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
