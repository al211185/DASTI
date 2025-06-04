// controllers/notificacionesController.js

const Notificacion = require('../models/Notificacion');

/**
 * GET /api/notificaciones
 * Obtiene las notificaciones para el usuario autenticado.
 * - Administradores y directores ven todas las notificaciones.
 * - Usuarios normales ven las globales (esGlobal: true) y las dirigidas a ellos.
 * Opcionalmente soporta:
 *   - paginación (query params: page, limit)
 *   - filtrar solo no leídas (query param: soloNoLeidas=true)
 */
exports.getNotificaciones = async (req, res) => {
  try {
    const rol = req.user.rol.nombre.toLowerCase();
    const filtro = {};

    // Si no es admin/director, filtramos por destinatario o global
    if (!(rol === 'administrador' || rol === 'director')) {
      filtro.destinatario = req.user._id;
    }
    // Si piden solo no-leídas, añadimos filtro.leida = false
    if (req.query.soloNoLeidas === 'true') {
      filtro.leida = false;
    }

    // Paginación: page y limit opcionales
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit) || 50, 1);
    const skip = (page - 1) * limit;

    // Conteo total para paginación
    const totalItems = await Notificacion.countDocuments(filtro);
    const totalPages = Math.ceil(totalItems / limit);

    // Selección de campos: devolvemos solo lo esencial
    const notis = await Notificacion.find(filtro)
      .select('tipo mensaje fecha leida refId esGlobal destinatario')
      .sort({
        fecha: -1
      })
      .skip(skip)
      .limit(limit)
      .lean();

    return res.json({
      notificaciones: notis,
      page,
      totalPages,
      totalItems
    });
  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    return res.status(500).json({
      msg: 'Error al obtener notificaciones',
      error: error.message
    });
  }
};

/**
 * PATCH /api/notificaciones/:id
 * Marca una notificación como leída.
 * Solo puede hacerlo:
 *   - El destinatario de esa notificación.
 *   - Administrador o director (pueden marcar cualquier notificación).
 * Retorna la notificación actualizada.
 */
exports.marcarLeida = async (req, res) => {
  try {
    const {
      id
    } = req.params;
    const noti = await Notificacion.findById(id).lean();
    if (!noti) {
      return res.status(404).json({
        msg: 'Notificación no encontrada'
      });
    }

    // Si hay un destinatario definido, verificamos que coincida con el usuario actual
    if (noti.destinatario && String(noti.destinatario) !== String(req.user._id)) {
      const rol = req.user.rol.nombre.toLowerCase();
      if (!(rol === 'administrador' || rol === 'director')) {
        return res.status(403).json({
          msg: 'No autorizado para marcar esta notificación'
        });
      }
    }

    // Si ya estaba leída, devolvemos un mensaje específico
    if (noti.leida) {
      return res.status(400).json({
        msg: 'La notificación ya estaba marcada como leída'
      });
    }

    // Actualizamos y devolvemos la notificación completa
    const notiActualizada = await Notificacion.findByIdAndUpdate(
      id, {
        leida: true
      }, {
        new: true,
        select: 'tipo mensaje fecha leida refId esGlobal destinatario'
      }
    ).lean();

    return res.json({
      msg: 'Notificación marcada como leída',
      notificacion: notiActualizada
    });
  } catch (error) {
    console.error('Error al marcar notificación:', error);
    return res.status(500).json({
      msg: 'Error al marcar notificación',
      error: error.message
    });
  }
};