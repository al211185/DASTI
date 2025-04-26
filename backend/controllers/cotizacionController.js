// controllers/cotizacionController.js
// modelos principales
const Cotizacion = require('../models/Cotizacion');
const CotizacionHistorial = require('../models/CotizacionHistorial');

// 🔽  estos tres faltaban
const Cliente = require('../models/Cliente');
const Planta = require('../models/Planta');
const User = require('../models/User');   // o Vendedor, según tu archivo


/**
 * Crea una nueva cotización y registra su creación en el historial.
 */
// controllers/cotizacionController.js

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

    // Guardamos la cotización para que se genere el serial
    const cotGuardada = await nueva.save();

    // Ahora la cargamos con populate para obtener los nombres
    const guardadaPop = await Cotizacion.findById(cotGuardada._id)
      .populate('cliente', 'nombre')
      .populate('planta', 'nombre')
      .populate('vendedor', 'nombre');

    const usuario = req.user?.nombre || req.user?.email || 'Desconocido';
    const cotObj = guardadaPop.toObject();

    // Construimos el array de cambios legibles
    // --- dentro de createCotizacion -------------------------------
    const cambios = [];

    // 1) cabecera normal ------------------------------------------------
    for (const [campo, valor] of Object.entries(cotObj)) {
      if (['_id', '__v', 'historialCambios', 'renglones'].includes(campo)) continue;

      if (['cliente', 'planta', 'vendedor'].includes(campo)) {
        cambios.push({
          campo, actionType: 'create', valorAnterior: null,
          valorNuevo: valor?.nombre, usuario, fecha: new Date()
        });
        continue;
      }
      if (['fechaInicio', 'fechaCreacion'].includes(campo)) {
        cambios.push({
          campo, actionType: 'create', valorAnterior: null,
          valorNuevo: new Date(valor).toLocaleDateString(),
          usuario, fecha: new Date()
        });
        continue;
      }
      cambios.push({
        campo, actionType: 'create', valorAnterior: null,
        valorNuevo: String(valor), usuario, fecha: new Date()
      });
    }

    // 2) renglones desglosados -----------------------------------------
    (cotObj.renglones || []).forEach((r, i) => {
      cambios.push({
        campo: `renglones > ${i + 1}`,
        actionType: 'create',
        valorAnterior: '—',
        valorNuevo: `${r.cantidad}× ${r.descripcion}`,
        usuario,
        fecha: new Date()
      });

      // Después: calculamos unit price e importe “al vuelo”
      const unitPrice = (r.costo / r.cantidad).toFixed(2);   // precio unitario
      const importe = r.costo.toFixed(2);                  // importe total de la fila

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
          valorNuevo: String(val),    // forzamos string para evitar números “extraños”
          usuario,
          fecha: new Date()
        });
      }

    });


    await CotizacionHistorial.create({
      cotizacionId: guardadaPop._id,
      version:      1,
      action:       'creado',
      actionType:   'creado',    // coincide con tu enum de nivel raíz
      usuario,                   // la misma variable que usas para cada cambio
      cambios                     // array de cambios ya armado
    });

    res.status(201).json({
      msg: 'Cotización creada correctamente',
      cotizacion: guardadaPop
    });
  } catch (error) {
    console.error('Error al crear cotización:', error);
    res.status(500).json({
      msg: 'Error al crear cotización',
      error: error.message
    });
  }
};
/**
 * Obtiene todas las cotizaciones (o sólo las de un vendedor si se indica query param).
 */
// controllers/cotizacionController.js

exports.getCotizaciones = async (req, res) => {
  try {
    // 1) Creamos el filtro vacío
    // Usa req.user.rol.nombre en lugar de req.user.role
    const filtro = {};
    if (req.user.rol?.nombre === 'vendedores') {
      filtro.vendedor = req.user._id;
    }
    // (Opcional) Si quieres permitir "superfiltros" via query, podrías hacer:
    // else if (req.query.vendedor) {
    //   filtro.vendedor = req.query.vendedor;
    // }

    // 3) Buscamos ya filtrado
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



/**
 * Obtiene una cotización por su ID.
 */
exports.getCotizacionById = async (req, res) => {
  try {
    const cotizacion = await Cotizacion.findById(req.params.id)
      .populate('cliente', 'nombre')
      .populate('planta', 'nombre')
      .populate('vendedor', 'nombre');
    if (!cotizacion) return res.status(404).json({ msg: 'Cotización no encontrada' });
    res.json({ cotizacion });
  } catch (error) {
    console.error('Error al obtener cotización:', error);
    res.status(500).json({ msg: 'Error al obtener cotización', error: error.message });
  }
};

/**
 * Actualiza una cotización y registra en el historial:
 * - Cambios de cabecera
 * - Cambios completos de renglones
 * - Cambios en comentarios por renglón
 * - Cambios en documentos por renglón
 */
// controllers/cotizacionController.js

exports.updateCotizacion = async (req, res) => {
  const { id } = req.params;
  try {
    // 1) Cargo la cotización original con populate (para tener nombres)
    const original = await Cotizacion.findById(id)
      .populate('cliente', 'nombre')
      .populate('planta', 'nombre')
      .populate('vendedor', 'nombre')
      .lean();
    if (!original) return res.status(404).json({ msg: 'Cotización no encontrada' });

    const usuario = req.user.nombre || req.user.email || 'Desconocido';

    // 2) Si el usuario es vendedor, guardamos directamente los cambios
    //    marcando la cotización como "Pendiente de aprobación"
    if (req.user.rol.nombre === 'vendedores') {
      const cambios = [];

      // 2.1) Cambios de la cabecera
      const camposCabecera = [
        'cliente','requisitor','vendedor','fechaInicio',
        'planta','total','estado','tiempoEntregaMin','tiempoEntregaMax'
      ];
      for (const campo of camposCabecera) {
        if (req.body[campo] !== undefined) {
          let ant = original[campo], nue = req.body[campo];
          // Para cliente/planta: convertimos ID → nombre
          if (campo === 'cliente' || campo === 'planta') {
            ant = original[campo]?.nombre;
            const Model = campo === 'cliente' ? Cliente : Planta;
            const doc = await Model.findById(nue).lean();
            nue = doc?.nombre || nue;
          }
          // Para vendedor
          if (campo === 'vendedor') {
            ant = original.vendedor?.nombre;
            const doc = await User.findById(nue).lean();
            nue = doc?.nombre || nue;
          }
          // Para fecha
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
        // fila creada
        if (!o && n) {
          cambios.push({
            campo: `renglones > ${i+1}`,
            actionType: 'create',
            valorAnterior: '—',
            valorNuevo: `${n.cantidad}× ${n.descripcion}`,
            usuario, fecha: new Date()
          });
          continue;
        }
        // fila eliminada
        if (o && !n) {
          cambios.push({
            campo: `renglones > ${i+1}`,
            actionType: 'delete',
            valorAnterior: `${o.cantidad}× ${o.descripcion}`,
            valorNuevo: '—',
            usuario, fecha: new Date()
          });
          continue;
        }
        // comparo campos internos
        const camposFila = ['cantidad','descripcion','precioUnitario','importe'];
        for (const cf of camposFila) {
          if (String(o[cf]) !== String(n[cf])) {
            cambios.push({
              campo: `renglones > ${i+1} > ${cf}`,
              actionType: 'edit',
              valorAnterior: o[cf],
              valorNuevo: n[cf],
              usuario, fecha: new Date()
            });
          }
        }
      }

      // 2.3) Comentarios y documentos
      const max = Math.max((original.renglones||[]).length, newRows.length);
      for (let i = 0; i < max; i++) {
        const oRow = (original.renglones||[])[i] || { comentarios: [], documentos: [] };
        const nRow = newRows[i] || { comentarios: [], documentos: [] };
        // comentarios
        const antC = (oRow.comentarios||[]).map(c=>c.texto).join(', ');
        const nueC = (nRow.comentarios||[]).map(c=>c.texto).join(', ');
        if (antC !== nueC) {
          cambios.push({
            campo: `renglones > ${i+1} > comentarios`,
            actionType: 'edit',
            valorAnterior: antC || '—',
            valorNuevo: nueC || '—',
            usuario, fecha: new Date()
          });
        }
        // documentos
        const antD = (oRow.documentos||[]).map(d=>d.originalName||d.url).join(', ');
        const nueD = (nRow.documentos||[]).map(d=>d.originalName||d.url).join(', ');
        if (antD !== nueD) {
          cambios.push({
            campo: `renglones > ${i+1} > documentos`,
            actionType: 'edit',
            valorAnterior: antD || '—',
            valorNuevo: nueD || '—',
            usuario, fecha: new Date()
          });
        }
      }

      // 3) Aplico cambios a la cotización y la marco Pendiente
      const { serial, ...toUpdate } = req.body;
      const updated = await Cotizacion.findByIdAndUpdate(id, {
        ...toUpdate,
        estado: 'Pendiente de aprobación'
      }, { new: true });

      // 4) Guardo entrada de historial con actionType 'solicitud_edit'
      const version = await CotizacionHistorial.countDocuments({ cotizacionId: id }) + 1;
      await CotizacionHistorial.create({
        cotizacionId: id,
        version,
        action: 'solicitud_edit',
        actionType: 'solicitud_edit',
        usuario,
        cambios
      });

      return res.json({
        msg: 'Cambios aplicados y cotización marcada como Pendiente de aprobación.',
        cotizacion: updated
      });
    }

    // 5) ADMIN / DIRECTOR —> flujo normal, sin solicitud
    const { serial, ...toUpdate } = req.body;
    const updated = await Cotizacion.findByIdAndUpdate(id, toUpdate, { new: true });

    // (Opcional: aquí podrías también generar un historial 'actualizado' para admin/director)
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


/**
 * Obtiene el historial de cambios de una cotización.
 */
exports.getHistorialCotizacion = async (req, res) => {
  try {
    const historial = await CotizacionHistorial
      .find({ cotizacionId: req.params.id })
      .sort({ createdAt: -1 });
    res.json({ historial });
  } catch (error) {
    console.error('Error al obtener historial:', error);
    res.status(500).json({ msg: 'Error al obtener historial', error: error.message });
  }
};

/**
 * Elimina una cotización (y registra su eliminación).
 */
exports.deleteCotizacion = async (req, res) => {
  const { id } = req.params;

  // VENDEDOR → sólo solicitud
  if (req.user.rol.nombre === 'vendedores') {
    const version = await CotizacionHistorial.countDocuments({ cotizacionId: id }) + 1;
    await CotizacionHistorial.create({
      cotizacionId:    id,
      version,
      action:          'solicitud_delete',
      actionType:      'solicitud_delete',
      estadoSolicitud: 'pendiente',
      cambios:         [],
      usuario:         req.user.nombre,
      createdAt:       new Date()
    });
    return res.status(202).json({ msg: 'Tu solicitud de eliminación ha sido enviada para aprobación.' });
  }

  // ADMIN/DIRECTOR → borrado normal
  try {
    const eliminado = await Cotizacion.findByIdAndDelete(id);
    if (!eliminado) return res.status(404).json({ msg: 'Cotización no encontrada' });

    const version = await CotizacionHistorial.countDocuments({ cotizacionId: id }) + 1;
    await CotizacionHistorial.create({
      cotizacionId: id,
      version,
      action:       'eliminado',
      actionType:   'delete',
      cambios: [{
        campo:          'cotizacion_entera',
        actionType:     'delete',
        valorAnterior:  eliminado,
        valorNuevo:     null,
        usuario:        req.user.nombre,
        fecha:          new Date()
      }],
      createdAt: new Date()
    });

    res.json({ msg: 'Cotización eliminada correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al eliminar cotización', error: error.message });
  }
};

/**
 * Búsqueda global de proyectos (cotizaciones).
 */
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
    res.json({ resultados });
  } catch (error) {
    console.error('Error en búsqueda global:', error);
    res.status(500).json({ msg: 'Error en búsqueda global', error: error.message });
  }
};


/**
 * POST /cotizaciones/:id/solicitar-aprobacion
 * Vendedores piden a Admin/Director que aprueben su EDIT o DELETE
 */
exports.solicitarAprobacion = async (req, res) => {
 try {
   const { id } = req.params;
   const { action } = req.body; // 'edit' o 'delete'
   const version = await CotizacionHistorial.countDocuments({ cotizacionId: id }) + 1;
   await CotizacionHistorial.create({
     cotizacionId:    id,
     version,
     action:          `solicitud_${action}`,
     actionType:      `solicitud_${action}`,
     estadoSolicitud: 'pendiente',
     cambios:         [],
     usuario:         req.user.nombre,
     createdAt:       new Date()
   });
   res.json({ msg: 'Solicitud enviada para aprobación.' });
 } catch (error) {
   console.error(error);
   res.status(500).json({ msg: 'No se pudo solicitar aprobación', error: error.message });
 }
};


/**
 * GET /cotizaciones/solicitudes
 * Lista todas las solicitudes pendientes (edit/delete).
 */
exports.getSolicitudes = async (req, res) => {
  try {
    const solicitudes = await CotizacionHistorial.find({
      action:          { $in: ['solicitud_edit','solicitud_delete'] },
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

    res.json({ solicitudes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al obtener solicitudes', error: error.message });
  }
};



/**
 * POST /cotizaciones/:id/solicitudes/:historialId
 * Admin/Director aprueba o rechaza la solicitud de EDIT o DELETE de un vendedor.
 */
exports.responderSolicitud = async (req, res) => {
  const { id: cotId, historialId } = req.params;
  const { aprovado } = req.body;  // true=aprobar, false=rechazar

  // Sólo Admin o Director pueden responder
  const rol = req.user.rol.nombre.toLowerCase();
  if (rol !== 'administrador' && rol !== 'director') {
    return res.status(403).json({ msg: 'No autorizado' });
  }

  // Busca la solicitud
  const solicitud = await CotizacionHistorial.findById(historialId);
  if (!solicitud) return res.status(404).json({ msg: 'Solicitud no encontrada' });
  if (solicitud.estadoSolicitud !== 'pendiente') {
    return res.status(400).json({ msg: 'Solicitud ya fue procesada' });
  }

  // Marca la solicitud como aprobada/rechazada
  solicitud.estadoSolicitud = aprovado ? 'aprobada' : 'rechazada';
  await solicitud.save();

  // Si era solicitud de delete y la aprobaron, borra la cotización:
  if (aprovado && solicitud.action === 'solicitud_delete') {
    await Cotizacion.findByIdAndDelete(cotId);
    // (Opcional) guarda un historial "eliminado"…
  }

  // Si era solicitud de edit y la aprobaron, aquí deberías
  // aplicar los cambios pendientes. Asumiendo que al pedir
  // aprobación guardaste los nuevos datos en `solicitud.cambios`,
  // tendrías que replicarlos sobre la cotización.  
  // Sino, al menos devuelves OK.

  return res.json({
    msg: `Solicitud ${aprovado ? 'aprobada' : 'rechazada'} con éxito`
  });
};