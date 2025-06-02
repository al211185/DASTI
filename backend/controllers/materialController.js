// controllers/materialController.js

const Material = require('../models/Material');
const Notificacion = require('../models/Notificacion');
const { io } = require('../index'); // Ajusta la ruta según tu proyecto

/**
 * Obtener todos los materiales (con populate de categoría para obtener el nombre)
 * GET /api/materiales
 */
exports.getMateriales = async (req, res) => {
  try {
    const materiales = await Material.find()
      .populate('categoria')
      .sort({ 'categoria.nombre': 1, nombre: 1 });
    return res.json(materiales);
  } catch (error) {
    console.error('Error al obtener materiales:', error);
    return res.status(500).json({ msg: 'Error al obtener materiales', error: error.message });
  }
};

/**
 * Obtener un material por ID (populado)
 * GET /api/materiales/:id
 */
exports.getMaterialById = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id).populate('categoria');
    if (!material) {
      return res.status(404).json({ msg: 'Material no encontrado' });
    }
    return res.json(material);
  } catch (error) {
    console.error('Error al obtener material:', error);
    return res.status(500).json({ msg: 'Error al obtener material', error: error.message });
  }
};

/**
 * Crear un nuevo material (con manejo de imagen)
 * POST /api/materiales
 */
exports.createMaterial = async (req, res) => {
  try {
    const { nombre, categoria } = req.body;
    const imagen = req.file ? `/uploads/materiales/${req.file.filename}` : undefined;

    const newMaterial = new Material({ nombre, categoria, imagen });
    const savedMaterial = await newMaterial.save();
    await savedMaterial.populate('categoria');

    // 1) Crear notificación para administradores
    const usuario = req.user?.nombre || req.user?.email || 'Desconocido';
    const mensajeNoti = `Nuevo material creado: ${savedMaterial.nombre} (Categoría: ${savedMaterial.categoria.nombre}) por ${usuario}`;
    const noti = await Notificacion.create({
      tipo: 'material_creado',
      mensaje: mensajeNoti,
      esGlobal: true,
      creadoPor: req.user._id,
      refId: savedMaterial._id
    });

    // 2) Emitir a todos los sockets en room "admin"
    io.to('admin').emit('nueva_notificacion', {
      _id: noti._id,
      tipo: noti.tipo,
      mensaje: noti.mensaje,
      fecha: noti.fecha,
      refId: noti.refId
    });

    return res.status(201).json(savedMaterial);
  } catch (error) {
    console.error('Error al crear material:', error);
    return res.status(400).json({ msg: 'Error al crear material', error: error.message });
  }
};

/**
 * Actualizar un material existente (puede venir o no nueva imagen)
 * PUT /api/materiales/:id
 */
exports.updateMaterial = async (req, res) => {
  try {
    const update = { ...req.body };
    if (req.file) {
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

    // 1) Crear notificación para administradores
    const usuario = req.user?.nombre || req.user?.email || 'Desconocido';
    const mensajeNoti = `Material actualizado: ${updatedMaterial.nombre} (Categoría: ${updatedMaterial.categoria.nombre}) por ${usuario}`;
    const noti = await Notificacion.create({
      tipo: 'material_actualizado',
      mensaje: mensajeNoti,
      esGlobal: true,
      creadoPor: req.user._id,
      refId: updatedMaterial._id
    });

    // 2) Emitir a todos los sockets en room "admin"
    io.to('admin').emit('nueva_notificacion', {
      _id: noti._id,
      tipo: noti.tipo,
      mensaje: noti.mensaje,
      fecha: noti.fecha,
      refId: noti.refId
    });

    return res.json(updatedMaterial);
  } catch (error) {
    console.error('Error al actualizar material:', error);
    return res.status(400).json({ msg: 'Error al actualizar material', error: error.message });
  }
};

/**
 * Eliminar un material
 * DELETE /api/materiales/:id
 */
exports.deleteMaterial = async (req, res) => {
  try {
    const deletedMaterial = await Material.findByIdAndDelete(req.params.id);
    if (!deletedMaterial) {
      return res.status(404).json({ msg: 'Material no encontrado' });
    }

    // 1) Crear notificación para administradores
    const usuario = req.user?.nombre || req.user?.email || 'Desconocido';
    const mensajeNoti = `Material eliminado: ${deletedMaterial.nombre} por ${usuario}`;
    const noti = await Notificacion.create({
      tipo: 'material_eliminado',
      mensaje: mensajeNoti,
      esGlobal: true,
      creadoPor: req.user._id,
      refId: deletedMaterial._id
    });

    // 2) Emitir a todos los sockets en room "admin"
    io.to('admin').emit('nueva_notificacion', {
      _id: noti._id,
      tipo: noti.tipo,
      mensaje: noti.mensaje,
      fecha: noti.fecha,
      refId: noti.refId
    });

    return res.json({ msg: 'Material eliminado correctamente', material: deletedMaterial });
  } catch (error) {
    console.error('Error al eliminar material:', error);
    return res.status(500).json({ msg: 'Error al eliminar material', error: error.message });
  }
};
