// controllers/cotizacionController.js

const mongoose = require('mongoose');
const Cotizacion = require('../models/Cotizacion');
const CotizacionHistorial = require('../models/CotizacionHistorial');
const Notificacion = require('../models/Notificacion');
const { getIO } = require('../socket'); // ← Importamos getIO en lugar de io

const Cliente = require('../models/Cliente');
const Planta = require('../models/Planta');
const User = require('../models/User');

/* ------------------------------------------------------------------------- */
/* CREAR COTIZACIÓN                                                          */
/* POST /api/cotizaciones                                                    */
/* ------------------------------------------------------------------------- */
exports.createCotizacion = async (req, res) => {
  try {
    const {
      cliente,
      requisitor,
      vendedor,
      fechaInicio,
      planta,
      renglones,
      total,
      tiempoEntregaMin,
      tiempoEntregaMax
    } = req.body;

    const nueva = new Cotizacion({
      cliente,
      requisitor,
      vendedor,
      fechaInicio,
      planta,
      tiempoEntregaMin,
      tiempoEntregaMax,
      renglones,
      total
    });

    // 1) Guardamos la cotización (pre-hook genera serial)
    const cotGuardada = await nueva.save();

    // 2) La cargamos con populate para tener nombres legibles
    const guardadaPop = await Cotizacion.findById(cotGuardada._id)
      .populate('cliente', 'nombre')
      .populate('planta', 'nombre')
      .populate('vendedor', 'nombre');

    const usuario = req.user?.nombre || req.user?.email || 'Desconocido';
    const cotObj = guardadaPop.toObject();

    // 3) Construir array de cambios para historial
    const cambios = [];

    // 3.1) Cabecera
    for (const [campo, valor] of Object.entries(cotObj)) {
      if (['_id', '__v', 'historialCambios', 'renglones'].includes(campo)) continue;

      if (['cliente', 'planta', 'vendedor'].includes(campo)) {
        cambios.push({
          campo,
          actionType: 'create',
          valorAnterior: null,
          valorNuevo: valor?.nombre,
          usuario,
          fecha: new Date()
        });
        continue;
      }
      if (['fechaInicio', 'fechaCreacion'].includes(campo)) {
        cambios.push({
          campo,
          actionType: 'create',
          valorAnterior: null,
          valorNuevo: new Date(valor).toLocaleDateString(),
          usuario,
          fecha: new Date()
        });
        continue;
      }
      cambios.push({
        campo,
        actionType: 'create',
        valorAnterior: null,
        valorNuevo: String(valor),
        usuario,
        fecha: new Date()
      });
    }

    // 3.2) Renglones desglosados
    (cotObj.renglones || []).forEach((r, i) => {
      cambios.push({
        campo: `renglones > ${i + 1}`,
        actionType: 'create',
        valorAnterior: '—',
        valorNuevo: `${r.cantidad}× ${r.descripcion}`,
        usuario,
        fecha: new Date()
      });

      const unitPrice = (r.costo / r.cantidad).toFixed(2);
      const importe = r.costo.toFixed(2);

      const rowAttrs = {
        cantidad: r.cantidad,
        descripcion: r.descripcion,
        precioUnitario: unitPrice,
        importe: importe
      };

      for (const [attr, val] of Object.entries(rowAttrs)) {
        cambios.push({
          campo: `renglones > ${i + 1} > ${attr}`,
          actionType: 'create',
          valorAnterior: '—',
          valorNuevo: String(val),
          usuario,
          fecha: new Date()
        });
      }
    });

    // 4) Guardar historial versión 1
    await CotizacionHistorial.create({
      cotizacionId: guardadaPop._id,
      version: 1,
      action: 'creado',
      actionType: 'creado',
      usuario,
      cambios
    });

    // 5) Crear y emitir notificación a administradores
    const mensajeNoti = `Nueva cotización ${guardadaPop.serial} creada por ${usuario}`;
    const noti = await Notificacion.create({
      tipo: 'cotizacion_creada',
      mensaje: mensajeNoti,
      esGlobal: true,
      creadoPor: req.user?._id,
      refId: guardadaPop._id
    });
    const io = getIO();
    io.to('admin').emit('nueva_notificacion', {
      _id: noti._id,
      tipo: noti.tipo,
      mensaje: noti.mensaje,
      fecha: noti.fecha,
      refId: noti.refId
    });

    return res.status(201).json({
      msg: 'Cotización creada correctamente',
      cotizacion: guardadaPop
    });
  } catch (error) {
    console.error('Error al crear cotización:', error);
    return res.status(500).json({
      msg: 'Error al crear cotización',
      error: error.message
    });
  }
};

/* ------------------------------------------------------------------------- */
/* LISTAR COTIZACIONES                                                        */
/* GET /api/cotizaciones                                                      */
/* ------------------------------------------------------------------------- */
exports.getCotizaciones = async (req, res) => {
  try {
    const filtro = {};
    if (req.user.rol?.nombre === 'vendedores') {
      filtro.vendedor = req.user._id;
    }

    const cotizaciones = await Cotizacion.find(filtro)
      .populate('cliente', 'nombre')
      .populate('planta', 'nombre')
      .populate('vendedor', 'nombre')
      .sort({ fechaCreacion: -1 });

    return res.json({ cotizaciones });
  } catch (error) {
    console.error('Error al obtener cotizaciones:', error);
    return res.status(500).json({
      msg: 'Error al obtener cotizaciones',
      error: error.message
    });
  }
};

/* ------------------------------------------------------------------------- */
/* OBTENER COTIZACIÓN POR ID                                                  */
/* GET /api/cotizaciones/:id                                                  */
/* ------------------------------------------------------------------------- */
exports.getCotizacionById = async (req, res) => {
  try {
    const cotizacion = await Cotizacion.findById(req.params.id)
      .populate({ path: 'cliente', select: 'nombre direccion telefono contactos' })
      .populate('planta', 'nombre')
      .populate('vendedor', 'nombre')
      .lean();

    if (!cotizacion) {
      return res.status(404).json({ msg: 'Cotización no encontrada' });
    }

    return res.json({ cotizacion });
  } catch (error) {
    console.error('Error al obtener cotización:', error);
    return res.status(500).json({ msg: 'Error al obtener cotización', error: error.message });
  }
};

/* ------------------------------------------------------------------------- */
/* ACTUALIZAR COTIZACIÓN                                                       */
/* PUT /api/cotizaciones/:id                                                  */
/* ------------------------------------------------------------------------- */
exports.updateCotizacion = async (req, res) => {
  const { id } = req.params;
  try {
    // 1) Cargo la cotización original con populate para comparaciones
    const original = await Cotizacion.findById(id)
      .populate('cliente', 'nombre')
      .populate('planta', 'nombre')
      .populate('vendedor', 'nombre')
      .lean();
    if (!original) {
      return res.status(404).json({ msg: 'Cotización no encontrada' });
    }

    const usuario = req.user.nombre || req.user.email || 'Desconocido';
    const rol = req.user.rol.nombre.toLowerCase();

    // 2) Si es vendedor, sólo genera solicitud de edición
    if (rol === 'vendedores') {
      const cambios = [];

      // 2.1) Cambios en cabecera
      const camposCabecera = [
        'cliente', 'requisitor', 'vendedor', 'fechaInicio',
        'planta', 'total', 'estado', 'tiempoEntregaMin', 'tiempoEntregaMax'
      ];
      for (const campo of camposCabecera) {
        if (req.body[campo] !== undefined) {
          let ant = original[campo], nue = req.body[campo];
          if (campo === 'cliente' || campo === 'planta') {
            ant = original[campo]?.nombre;
            const Model = campo === 'cliente' ? Cliente : Planta;
            const doc = await Model.findById(nue).lean();
            nue = doc?.nombre || nue;
          }
          if (campo === 'vendedor') {
            ant = original.vendedor?.nombre;
            const doc = await User.findById(nue).lean();
            nue = doc?.nombre || nue;
          }
          if (campo === 'fechaInicio') {
            ant = new Date(ant).toLocaleDateString();
            nue = new Date(nue).toLocaleDateString();
          }
          if (`${ant}` !== `${nue}`) {
            cambios.push({
              campo,
              actionType: 'edit',
              valorAnterior: ant,
              valorNuevo: nue,
              usuario,
              fecha: new Date()
            });
          }
        }
      }

      // 2.2) Cambios en renglones
      const oldRows = original.renglones || [];
      const newRows = req.body.renglones || oldRows;
      const maxLen = Math.max(oldRows.length, newRows.length);
      for (let i = 0; i < maxLen; i++) {
        const o = oldRows[i], n = newRows[i];
        if (!o && n) {
          cambios.push({
            campo: `renglones > ${i + 1}`,
            actionType: 'create',
            valorAnterior: '—',
            valorNuevo: `${n.cantidad}× ${n.descripcion}`,
            usuario,
            fecha: new Date()
          });
          continue;
        }
        if (o && !n) {
          cambios.push({
            campo: `renglones > ${i + 1}`,
            actionType: 'delete',
            valorAnterior: `${o.cantidad}× ${o.descripcion}`,
            valorNuevo: '—',
            usuario,
            fecha: new Date()
          });
          continue;
        }
        ['cantidad', 'descripcion', 'precioUnitario', 'importe'].forEach(cf => {
          if (`${o[cf]}` !== `${n[cf]}`) {
            cambios.push({
              campo: `renglones > ${i + 1} > ${cf}`,
              actionType: 'edit',
              valorAnterior: o[cf],
              valorNuevo: n[cf],
              usuario,
              fecha: new Date()
            });
          }
        });
      }

      // 2.3) Comentarios y documentos por renglón
      const max = Math.max((original.renglones || []).length, newRows.length);
      for (let i = 0; i < max; i++) {
        const oRow = (original.renglones || [])[i] || { comentarios: [], documentos: [] };
        const nRow = newRows[i] || { comentarios: [], documentos: [] };
        const antC = (oRow.comentarios || []).map(c => c.texto).join(', ');
        const nueC = (nRow.comentarios || []).map(c => c.texto).join(', ');
        if (antC !== nueC) {
          cambios.push({
            campo: `renglones > ${i + 1} > comentarios`,
            actionType: 'edit',
            valorAnterior: antC || '—',
            valorNuevo: nueC || '—',
            usuario,
            fecha: new Date()
          });
        }
        const antD = (oRow.documentos || []).map(d => d.originalName || d.url).join(', ');
        const nueD = (nRow.documentos || []).map(d => d.originalName || d.url).join(', ');
        if (antD !== nueD) {
          cambios.push({
            campo: `renglones > ${i + 1} > documentos`,
            actionType: 'edit',
            valorAnterior: antD || '—',
            valorNuevo: nueD || '—',
            usuario,
            fecha: new Date()
          });
        }
      }

      // 3) Actualizar cotización como "Pendiente de aprobación"
      const { serial, ...toUpdate } = req.body;
      const updated = await Cotizacion.findByIdAndUpdate(id, {
        ...toUpdate,
        estado: 'Pendiente de aprobación'
      }, { new: true });

      // 4) Guardar historial de solicitud de edición
      const version = await CotizacionHistorial.countDocuments({ cotizacionId: id }) + 1;
      await CotizacionHistorial.create({
        cotizacionId: id,
        version,
        action: 'solicitud_edit',
        actionType: 'solicitud_edit',
        usuario,
        cambios
      });

      // 5) Notificar a administradores que hay solicitud de edición
      const mensajeNoti = `Solicitud de edición para cotización ${original.serial} enviada por ${usuario}`;
      const noti = await Notificacion.create({
        tipo: 'solicitud_edit',
        mensaje: mensajeNoti,
        esGlobal: true,
        creadoPor: req.user?._id,
        refId: id
      });
      const io = getIO();
      io.to('admin').emit('nueva_notificacion', {
        _id: noti._id,
        tipo: noti.tipo,
        mensaje: noti.mensaje,
        fecha: noti.fecha,
        refId: noti.refId
      });

      return res.json({
        msg: 'Cambios aplicados y cotización marcada como Pendiente de aprobación.',
        cotizacion: updated
      });
    }

    // 6) ADMIN / DIRECTOR —> Flujo de actualización normal
    const cambios = [];
    const camposCabecera = [
      'cliente', 'requisitor', 'vendedor', 'fechaInicio',
      'planta', 'total', 'estado', 'tiempoEntregaMin', 'tiempoEntregaMax'
    ];
    for (const campo of camposCabecera) {
      if (req.body[campo] !== undefined) {
        let ant = original[campo], nue = req.body[campo];
        if (['cliente', 'planta'].includes(campo)) {
          ant = original[campo]?.nombre;
          const Model = campo === 'cliente' ? Cliente : Planta;
          const doc = await Model.findById(nue).lean();
          nue = doc?.nombre || nue;
        }
        if (campo === 'vendedor') {
          ant = original.vendedor?.nombre;
          const doc = await User.findById(nue).lean();
          nue = doc?.nombre || nue;
        }
        if (campo === 'fechaInicio') {
          ant = new Date(ant).toLocaleDateString();
          nue = new Date(nue).toLocaleDateString();
        }
        if (`${ant}` !== `${nue}`) {
          cambios.push({
            campo,
            actionType: 'edit',
            valorAnterior: ant,
            valorNuevo: nue,
            usuario,
            fecha: new Date()
          });
        }
      }
    }

    const oldRows = original.renglones || [];
    const newRows = req.body.renglones || oldRows;
    const maxLen2 = Math.max(oldRows.length, newRows.length);
    for (let i = 0; i < maxLen2; i++) {
      const o = oldRows[i], n = newRows[i];
      if (!o && n) {
        cambios.push({
          campo: `renglones > ${i + 1}`,
          actionType: 'create',
          valorAnterior: '—',
          valorNuevo: `${n.cantidad}× ${n.descripcion}`,
          usuario,
          fecha: new Date()
        });
        continue;
      }
      if (o && !n) {
        cambios.push({
          campo: `renglones > ${i + 1}`,
          actionType: 'delete',
          valorAnterior: `${o.cantidad}× ${o.descripcion}`,
          valorNuevo: '—',
          usuario,
          fecha: new Date()
        });
        continue;
      }
      ['cantidad', 'descripcion', 'precioUnitario', 'importe'].forEach(cf => {
        if (`${o[cf]}` !== `${n[cf]}`) {
          cambios.push({
            campo: `renglones > ${i + 1} > ${cf}`,
            actionType: 'edit',
            valorAnterior: o[cf],
            valorNuevo: n[cf],
            usuario,
            fecha: new Date()
          });
        }
      });
      const antCom = (o.comentarios || []).map(c => c.texto).join(', ');
      const nueCom = (n.comentarios || []).map(c => c.texto).join(', ');
      if (antCom !== nueCom) {
        cambios.push({
          campo: `renglones > ${i + 1} > comentarios`,
          actionType: 'edit',
          valorAnterior: antCom || '—',
          valorNuevo: nueCom || '—',
          usuario,
          fecha: new Date()
        });
      }
      const antDoc = (o.documentos || []).map(d => d.originalName || d.url).join(', ');
      const nueDoc = (n.documentos || []).map(d => d.originalName || d.url).join(', ');
      if (antDoc !== nueDoc) {
        cambios.push({
          campo: `renglones > ${i + 1} > documentos`,
          actionType: 'edit',
          valorAnterior: antDoc || '—',
          valorNuevo: nueDoc || '—',
          usuario,
          fecha: new Date()
        });
      }
    }

    const { serial, ...toUpdate2 } = req.body;
    const updated = await Cotizacion.findByIdAndUpdate(id, toUpdate2, { new: true });

    const version2 = await CotizacionHistorial.countDocuments({ cotizacionId: id }) + 1;
    await CotizacionHistorial.create({
      cotizacionId: id,
      version: version2,
      action: 'actualizado',
      actionType: 'edit',
      usuario,
      cambios
    });

    // Notificar a administradores que la cotización fue actualizada
    const mensajeNoti2 = `Cotización ${updated.serial} actualizada por ${usuario}`;
    const noti2 = await Notificacion.create({
      tipo: 'cotizacion_actualizada',
      mensaje: mensajeNoti2,
      esGlobal: true,
      creadoPor: req.user?._id,
      refId: updated._id
    });
    const io2 = getIO();
    io2.to('admin').emit('nueva_notificacion', {
      _id: noti2._id,
      tipo: noti2.tipo,
      mensaje: noti2.mensaje,
      fecha: noti2.fecha,
      refId: noti2.refId
    });

    return res.json({
      msg: 'Cotización actualizada correctamente',
      cotizacion: updated
    });
  } catch (error) {
    console.error('Error al actualizar cotización:', error);
    return res.status(500).json({
      msg: 'Error al actualizar cotización',
      error: error.message
    });
  }
};

/* ------------------------------------------------------------------------- */
/* OBTENER HISTORIAL DE CAMBIOS                                               */
/* GET /api/cotizaciones/:id/historial                                        */
/* ------------------------------------------------------------------------- */
exports.getHistorialCotizacion = async (req, res) => {
  try {
    const historial = await CotizacionHistorial
      .find({ cotizacionId: req.params.id })
      .sort({ createdAt: -1 });
    return res.json({ historial });
  } catch (error) {
    console.error('Error al obtener historial:', error);
    return res.status(500).json({ msg: 'Error al obtener historial', error: error.message });
  }
};

/* ------------------------------------------------------------------------- */
/* ELIMINAR COTIZACIÓN                                                        */
/* DELETE /api/cotizaciones/:id                                               */
/* ------------------------------------------------------------------------- */
exports.deleteCotizacion = async (req, res) => {
  try {
    const { id } = req.params;

    // 1) Validar formato de ID
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ msg: 'ID de cotización inválido' });
    }

    // 2) Autenticación
    if (!req.user) {
      return res.status(401).json({ msg: 'No autenticado' });
    }

    // 3) Vendedor: solo solicitud de borrado
    if (req.user.rol?.nombre === 'vendedores') {
      const version = await CotizacionHistorial.countDocuments({ cotizacionId: id }) + 1;
      await CotizacionHistorial.create({
        cotizacionId: id,
        version,
        action: 'solicitud_delete',
        actionType: 'solicitud_delete',
        estadoSolicitud: 'pendiente',
        cambios: [],
        usuario: req.user.nombre,
        createdAt: new Date()
      });

      // Notificar a administradores sobre solicitud de borrado
      const mensajeNoti3 = `Solicitud de eliminación para cotización ID ${id} enviada por ${req.user.nombre}`;
      const noti3 = await Notificacion.create({
        tipo: 'solicitud_delete',
        mensaje: mensajeNoti3,
        esGlobal: true,
        creadoPor: req.user?._id,
        refId: id
      });
      const io3 = getIO();
      io3.to('admin').emit('nueva_notificacion', {
        _id: noti3._id,
        tipo: noti3.tipo,
        mensaje: noti3.mensaje,
        fecha: noti3.fecha,
        refId: noti3.refId
      });

      return res.status(202).json({ msg: 'Solicitud de eliminación enviada para aprobación.' });
    }

    // 4) Admin/Director → flujo de borrado
    const original = await Cotizacion.findById(id).lean();
    if (!original) {
      return res.status(404).json({ msg: 'Cotización no encontrada' });
    }

    // 4.2) Borrado
    await Cotizacion.findByIdAndDelete(id);

    // 4.3) Registrar en historial
    const version4 = await CotizacionHistorial.countDocuments({ cotizacionId: id }) + 1;
    await CotizacionHistorial.create({
      cotizacionId: id,
      version: version4,
      action: 'eliminado',
      actionType: 'delete',
      usuario: req.user.nombre || req.user.email,
      cambios: [{
        campo: 'cotizacion_entera',
        actionType: 'delete',
        valorAnterior: original,
        valorNuevo: null,
        usuario: req.user.nombre,
        fecha: new Date()
      }],
      createdAt: new Date()
    });

    // 5) Notificar a administradores que se eliminó la cotización
    const mensajeNoti4 = `Cotización ${original.serial} eliminada por ${req.user.nombre}`;
    const noti4 = await Notificacion.create({
      tipo: 'cotizacion_eliminada',
      mensaje: mensajeNoti4,
      esGlobal: true,
      creadoPor: req.user?._id,
      refId: id
    });
    const io4 = getIO();
    io4.to('admin').emit('nueva_notificacion', {
      _id: noti4._id,
      tipo: noti4.tipo,
      mensaje: noti4.mensaje,
      fecha: noti4.fecha,
      refId: noti4.refId
    });

    return res.json({ msg: 'Cotización eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar cotización:', error);
    return res.status(500).json({
      msg: 'Error al eliminar cotización',
      error: error.message
    });
  }
};

/* ------------------------------------------------------------------------- */
/* BÚSQUEDA GLOBAL DE COTIZACIONES                                             */
/* GET /api/cotizaciones/search                                                */
/* ------------------------------------------------------------------------- */
exports.searchProyectosGlobal = async (req, res) => {
  try {
    const { q } = req.query;
    let resultados;
    if (!q || !q.trim()) {
      resultados = await Cotizacion.find()
        .populate('cliente', 'nombre')
        .populate('planta', 'nombre')
        .sort({ fechaCreacion: -1 });
    } else {
      resultados = await Cotizacion.find({ $text: { $search: q } })
        .populate('cliente', 'nombre')
        .populate('planta', 'nombre')
        .sort({ fechaCreacion: -1 });
    }
    return res.json({ resultados });
  } catch (error) {
    console.error('Error en búsqueda global:', error);
    return res.status(500).json({ msg: 'Error en búsqueda global', error: error.message });
  }
};

/* ------------------------------------------------------------------------- */
/* SOLICITAR APROBACIÓN (vendedores)                                           */
/* POST /api/cotizaciones/:id/solicitar-aprobacion                             */
/* ------------------------------------------------------------------------- */
exports.solicitarAprobacion = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'edit' o 'delete'
    const version = await CotizacionHistorial.countDocuments({ cotizacionId: id }) + 1;
    await CotizacionHistorial.create({
      cotizacionId: id,
      version,
      action: `solicitud_${action}`,
      actionType: `solicitud_${action}`,
      estadoSolicitud: 'pendiente',
      cambios: [],
      usuario: req.user.nombre,
      createdAt: new Date()
    });

    // Notificar a administradores de la solicitud
    const tipoNoti = action === 'edit' ? 'solicitud_edit' : 'solicitud_delete';
    const mensajeNoti = action === 'edit'
      ? `Solicitud de edición para cotización ID ${id} enviada por ${req.user.nombre}`
      : `Solicitud de eliminación para cotización ID ${id} enviada por ${req.user.nombre}`;

    const noti = await Notificacion.create({
      tipo: tipoNoti,
      mensaje: mensajeNoti,
      esGlobal: true,
      creadoPor: req.user?._id,
      refId: id
    });
    const io5 = getIO();
    io5.to('admin').emit('nueva_notificacion', {
      _id: noti._id,
      tipo: noti.tipo,
      mensaje: noti.mensaje,
      fecha: noti.fecha,
      refId: noti.refId
    });

    return res.json({ msg: 'Solicitud enviada para aprobación.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: 'No se pudo solicitar aprobación', error: error.message });
  }
};

/* ------------------------------------------------------------------------- */
/* OBTENER SOLICITUDES PENDIENTES                                              */
/* GET /api/cotizaciones/solicitudes                                           */
/* ------------------------------------------------------------------------- */
exports.getSolicitudes = async (req, res) => {
  try {
    const solicitudes = await CotizacionHistorial.find({
      action: { $in: ['solicitud_edit', 'solicitud_delete'] },
      estadoSolicitud: 'pendiente'
    })
      .populate({
        path: 'cotizacionId',
        select: 'serial cliente vendedor',
        populate: [
          { path: 'cliente', select: 'nombre' },
          { path: 'vendedor', select: 'nombre' }
        ]
      })
      .sort({ createdAt: -1 });

    return res.json({ solicitudes });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: 'Error al obtener solicitudes', error: error.message });
  }
};

/* ------------------------------------------------------------------------- */
/* RESPONDER SOLICITUD DE APROBACIÓN                                            */
/* POST /api/cotizaciones/:id/solicitudes/:historialId                         */
/* ------------------------------------------------------------------------- */
exports.responderSolicitud = async (req, res) => {
  const { id: cotId, historialId } = req.params;
  const { aprovado } = req.body; // true=aprobar, false=rechazar

  // Solo Admin o Director pueden responder
  const rol = req.user.rol.nombre.toLowerCase();
  if (rol !== 'administrador' && rol !== 'director') {
    return res.status(403).json({ msg: 'No autorizado' });
  }

  const solicitud = await CotizacionHistorial.findById(historialId);
  if (!solicitud) {
    return res.status(404).json({ msg: 'Solicitud no encontrada' });
  }
  if (solicitud.estadoSolicitud !== 'pendiente') {
    return res.status(400).json({ msg: 'Solicitud ya fue procesada' });
  }

  solicitud.estadoSolicitud = aprovado ? 'aprobada' : 'rechazada';
  await solicitud.save();

  // Si era solicitud de delete y fue aprobada → borrar cotización
  if (aprovado && solicitud.action === 'solicitud_delete') {
    const original = await Cotizacion.findById(cotId).lean();
    if (original) {
      await Cotizacion.findByIdAndDelete(cotId);

      // Registrar en historial de eliminado
      const version = await CotizacionHistorial.countDocuments({ cotizacionId: cotId }) + 1;
      await CotizacionHistorial.create({
        cotizacionId: cotId,
        version,
        action: 'eliminado',
        actionType: 'delete',
        usuario: req.user.nombre || req.user.email,
        cambios: [{
          campo: 'cotizacion_entera',
          actionType: 'delete',
          valorAnterior: original,
          valorNuevo: null,
          usuario: req.user.nombre,
          fecha: new Date()
        }],
        createdAt: new Date()
      });

      // Notificar a administradores y vendedor propietario
      const mensajeNotiDel = `Cotización ${original.serial} eliminada por ${req.user.nombre}`;
      const notiDel = await Notificacion.create({
        tipo: 'cotizacion_eliminada',
        mensaje: mensajeNotiDel,
        esGlobal: false,
        creadoPor: req.user?._id,
        destinatario: original.vendedor, // notificar al vendedor propietario
        refId: cotId
      });
      const io6 = getIO();
      // Emitir a admin
      io6.to('admin').emit('nueva_notificacion', {
        _id: notiDel._id,
        tipo: notiDel.tipo,
        mensaje: notiDel.mensaje,
        fecha: notiDel.fecha,
        refId: notiDel.refId
      });
      // Emitir al vendedor propietario
      io6.to(`user_${original.vendedor}`).emit('nueva_notificacion', {
        _id: notiDel._id,
        tipo: notiDel.tipo,
        mensaje: notiDel.mensaje,
        fecha: notiDel.fecha,
        refId: notiDel.refId
      });
    }
  }

  // Si era solicitud de edit y fue aprobada → aplicar cambios
  if (aprovado && solicitud.action === 'solicitud_edit') {
    // Si en `solicitud.cambios` guardaste los nuevos datos, aplícalos aquí.
    // Ejemplo: const nuevosDatos = solicitud.cambios; … Cotizacion.findByIdAndUpdate
    // Por simplificar, omitimos la implementación concreta.
  }

  // Notificar al vendedor propietario que su solicitud fue procesada
  const mensajeNotiResp = aprovado
    ? `Tu solicitud (${solicitud.action}) para cotización ID ${cotId} fue aprobada`
    : `Tu solicitud (${solicitud.action}) para cotización ID ${cotId} fue rechazada`;
    const usuarioSolic = await User.findOne({ nombre: solicitud.usuario }).lean();
    const destinatarioId = usuarioSolic ? usuarioSolic._id : undefined;
    const notiResp = await Notificacion.create({
    tipo: aprovado ? 'solicitud_aprobada' : 'solicitud_rechazada',
    mensaje: mensajeNotiResp,
    esGlobal: false,
    creadoPor: req.user?._id,
    destinatario: destinatarioId,
    refId: cotId
  });
  const io7 = getIO();
  io7.to(`user_${destinatarioId || solicitud.usuario}`).emit('nueva_notificacion', {
    _id: notiResp._id,
    tipo: notiResp.tipo,
    mensaje: notiResp.mensaje,
    fecha: notiResp.fecha,
    refId: cotId
  });

  return res.json({
    msg: `Solicitud ${aprovado ? 'aprobada' : 'rechazada'} con éxito`
  });
};

/* ------------------------------------------------------------------------- */
/* LISTAR COMENTARIOS                                                        */
/* GET /api/cotizaciones/:id/comentarios                                     */
/* ------------------------------------------------------------------------- */
exports.listComentarios = async (req, res) => {
  try {
    const cot = await Cotizacion.findById(req.params.id);
    if (!cot) {
      return res.status(404).json({ msg: 'Cotización no encontrada' });
    }

    // globales
    const globales = cot.comentarios.map(c => ({ ...c.toObject(), tipo: 'general' }));
    // por renglón
    const porRenglon = cot.renglones.flatMap((r, idx) =>
      (r.comentarios || []).map(c => ({ ...c.toObject(), tipo: 'renglon', renglon: idx + 1 }))
    );

    return res.json({ comentarios: [...globales, ...porRenglon] });
  } catch (error) {
    console.error('Error al listar comentarios:', error);
    return res.status(500).json({ msg: 'Error al listar comentarios', error: error.message });
  }
};

/* ------------------------------------------------------------------------- */
/* AGREGAR COMENTARIO                                                        */
/* POST /api/cotizaciones/:id/comentarios                                     */
/* ------------------------------------------------------------------------- */
exports.addComentario = async (req, res) => {
  try {
    const { texto } = req.body;
    const usuario = req.user.nombre || req.user.email || 'Desconocido';

    const nuevo = { texto, usuario, fecha: new Date() };
    await Cotizacion.updateOne(
      { _id: req.params.id },
      { $push: { comentarios: nuevo } }
    );

    // 1) Notificar al vendedor propietario y a administradores
    const cot = await Cotizacion.findById(req.params.id).lean();
    if (cot) {
      const mensajeNotiCom = `Nuevo comentario en cotización ${cot.serial} por ${usuario}`;
      // Notificación al vendedor
      const notiCom = await Notificacion.create({
        tipo: 'comentario_cotizacion',
        mensaje: mensajeNotiCom,
        esGlobal: false,
        creadoPor: req.user?._id,
        destinatario: cot.vendedor // notificar al vendedor
      });
      const io8 = getIO();
      // Emitir al vendedor
      io8.to(`user_${cot.vendedor}`).emit('nueva_notificacion', {
        _id: notiCom._id,
        tipo: notiCom.tipo,
        mensaje: notiCom.mensaje,
        fecha: notiCom.fecha,
        refId: cot._id
      });
      // También notificar a administradores como global
      const notiComAdmin = await Notificacion.create({
        tipo: 'comentario_cotizacion',
        mensaje: mensajeNotiCom,
        esGlobal: true,
        creadoPor: req.user?._id,
        refId: cot._id
      });
      io8.to('admin').emit('nueva_notificacion', {
        _id: notiComAdmin._id,
        tipo: notiComAdmin.tipo,
        mensaje: notiComAdmin.mensaje,
        fecha: notiComAdmin.fecha,
        refId: cot._id
      });
    }

    return res.status(201).json({ comentario: nuevo });
  } catch (error) {
    console.error('Error al agregar comentario:', error);
    return res.status(500).json({ msg: 'Error al agregar comentario', error: error.message });
  }
};
