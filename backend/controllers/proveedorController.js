// controllers/proveedorController.js
const Proveedor = require('../models/Proveedor');

/* ------------------------- CREAR PROVEEDOR -------------------------- */
// POST /proveedores
exports.createProveedor = async (req, res) => {
  try {
    const nuevoProveedor = new Proveedor({ ...req.body });
    const proveedorGuardado = await nuevoProveedor.save();
    res.status(201).json({
      msg: 'Proveedor creado correctamente',
      proveedor: proveedorGuardado
    });
  } catch (error) {
    console.error('Error al crear proveedor:', error);
    res.status(500).json({ msg: 'Error al crear proveedor', error: error.message });
  }
};

/* ------------------------- LISTAR PROVEEDORES ------------------------ */
// GET /proveedores
exports.getProveedores = async (req, res) => {
  try {
    const filtro = req.query.material
      ? { 'materiales.material': req.query.material }
      : {};
    const proveedores = await Proveedor.find(filtro)
      .populate('materiales.material')
      .sort({ fechaActualizacion: -1 });
    res.json(proveedores);
  } catch (error) {
    console.error('Error al obtener proveedores:', error);
    res.status(500).json({ msg: 'Error al obtener proveedores', error: error.message });
  }
};

/* ----------------------- OBTENER POR ID ------------------------------ */
// GET /proveedores/:id
exports.getProveedorById = async (req, res) => {
  try {
    const proveedor = await Proveedor.findById(req.params.id)
      .populate('materiales.material');
    if (!proveedor) {
      return res.status(404).json({ msg: 'Proveedor no encontrado' });
    }
    res.json(proveedor);
  } catch (error) {
    console.error('Error al obtener proveedor:', error);
    res.status(500).json({ msg: 'Error al obtener proveedor', error: error.message });
  }
};

/* ------------------------ ACTUALIZAR PROVEEDOR ----------------------- */
// PUT /proveedores/:id
exports.updateProveedor = async (req, res) => {
  try {
    const actualizado = await Proveedor.findByIdAndUpdate(
      req.params.id,
      { 
        ...req.body,
        fechaActualizacion: new Date() 
      },
      { new: true, runValidators: true }
    ).populate('materiales.material');

    if (!actualizado) {
      return res.status(404).json({ msg: 'Proveedor no encontrado' });
    }
    res.json({
      msg: 'Proveedor actualizado correctamente',
      proveedor: actualizado
    });
  } catch (error) {
    console.error('Error al actualizar proveedor:', error);
    res.status(400).json({ msg: 'Error al actualizar proveedor', error: error.message });
  }
};

/* ------------------------ ELIMINAR PROVEEDOR ------------------------- */
// DELETE /proveedores/:id
exports.deleteProveedor = async (req, res) => {
  try {
    const eliminado = await Proveedor.findByIdAndDelete(req.params.id);
    if (!eliminado) {
      return res.status(404).json({ msg: 'Proveedor no encontrado' });
    }
    res.json({ msg: 'Proveedor eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar proveedor:', error);
    res.status(500).json({ msg: 'Error al eliminar proveedor', error: error.message });
  }
};
