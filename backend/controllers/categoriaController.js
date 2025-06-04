// controllers/categoriaController.js

const Categoria = require('../models/Categoria');
const Notificacion = require('../models/Notificacion');
const { getIO } = require('../socket'); // ← importamos getIO

/* ------------------------------------------------------------------------- */
/* CREAR UNA NUEVA CATEGORÍA                                                 */
/* POST /categorias                                                          */
/* ------------------------------------------------------------------------- */
exports.createCategoria = async (req, res) => {
  try {
    const { nombre } = req.body;
    const nuevaCategoria = new Categoria({ nombre });
    const categoriaGuardada = await nuevaCategoria.save();

    // 1) Crear notificación en BD para administradores
    const mensajeNoti = `Nueva categoría creada: ${categoriaGuardada.nombre}`;
    const noti = await Notificacion.create({
      tipo: 'categoria_creada',
      mensaje: mensajeNoti,
      esGlobal: true,
      creadoPor: req.user?._id,
      refId: categoriaGuardada._id
    });

    // 2) Emitir a todos los sockets en room "admin"
    const io = getIO();
    io.to('admin').emit('nueva_notificacion', {
      _id: noti._id,
      tipo: noti.tipo,
      mensaje: noti.mensaje,
      fecha: noti.fecha,
      refId: noti.refId
    });

    return res.status(201).json(categoriaGuardada);
  } catch (error) {
    console.error('Error al crear categoría:', error);
    return res.status(500).json({ msg: 'Error al crear categoría', error: error.message });
  }
};

/* ------------------------------------------------------------------------- */
/* LISTAR TODAS LAS CATEGORÍAS                                                */
/* GET /categorias                                                           */
/* ------------------------------------------------------------------------- */
exports.getCategorias = async (req, res) => {
  try {
    const categorias = await Categoria.find().sort({ nombre: 1 });
    return res.json(categorias);
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    return res.status(500).json({ msg: 'Error al obtener categorías', error: error.message });
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
    return res.json(categoria);
  } catch (error) {
    console.error('Error al obtener categoría:', error);
    return res.status(500).json({ msg: 'Error al obtener categoría', error: error.message });
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

    // 1) Crear notificación en BD para administradores
    const mensajeNoti = `Categoría actualizada: ${categoriaActualizada.nombre}`;
    const noti = await Notificacion.create({
      tipo: 'categoria_actualizada',
      mensaje: mensajeNoti,
      esGlobal: true,
      creadoPor: req.user?._id,
      refId: categoriaActualizada._id
    });

    // 2) Emitir a room "admin"
    const io = getIO();
    io.to('admin').emit('nueva_notificacion', {
      _id: noti._id,
      tipo: noti.tipo,
      mensaje: noti.mensaje,
      fecha: noti.fecha,
      refId: noti.refId
    });

    return res.json(categoriaActualizada);
  } catch (error) {
    console.error('Error al actualizar categoría:', error);
    return res.status(400).json({ msg: 'Error al actualizar categoría', error: error.message });
  }
};

/* ------------------------------------------------------------------------- */
/* ELIMINAR UNA CATEGORÍA                                                     */
/* DELETE /categorias/:id                                                     */
/* ------------------------------------------------------------------------- */
exports.deleteCategoria = async (req, res) => {
  try {
    const categoriaEliminada = await Categoria.findByIdAndDelete(req.params.id);
    if (!categoriaEliminada) {
      return res.status(404).json({ msg: 'Categoría no encontrada' });
    }

    // 1) Crear notificación en BD para administradores
    const mensajeNoti = `Categoría eliminada: ${categoriaEliminada.nombre}`;
    const noti = await Notificacion.create({
      tipo: 'categoria_eliminada',
      mensaje: mensajeNoti,
      esGlobal: true,
      creadoPor: req.user?._id,
      refId: categoriaEliminada._id
    });

    // 2) Emitir a room "admin"
    const io = getIO();
    io.to('admin').emit('nueva_notificacion', {
      _id: noti._id,
      tipo: noti.tipo,
      mensaje: noti.mensaje,
      fecha: noti.fecha,
      refId: noti.refId
    });

    return res.json({ msg: 'Categoría eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar categoría:', error);
    return res.status(500).json({ msg: 'Error al eliminar categoría', error: error.message });
  }
};
