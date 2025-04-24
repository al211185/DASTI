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


    // Guardamos la entrada de historial
    await CotizacionHistorial.create({
      cotizacionId: guardadaPop._id,
      version: 1,
      action: 'creado',
      cambios
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
 * Obtiene todas las cotizaciones.
 */
exports.getCotizaciones = async (req, res) => {
  try {
    const cotizaciones = await Cotizacion.find()
      .populate('cliente', 'nombre')
      .populate('planta', 'nombre')
      .populate('vendedor', 'nombre')
      .sort({ fechaCreacion: -1 });
    res.json({ cotizaciones });
  } catch (error) {
    console.error('Error al obtener cotizaciones:', error);
    res.status(500).json({ msg: 'Error al obtener cotizaciones', error: error.message });
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
exports.updateCotizacion = async (req, res) => {
  try {
    const { id } = req.params;
    const nuevosDatos = req.body;
    const usuario = req.user?.nombre || req.user?.email || 'Desconocido';

    // Traemos el original *con populate* para tener nombres
    const original = await Cotizacion.findById(id)
      .populate('cliente', 'nombre')
      .populate('planta', 'nombre')
      .populate('vendedor', 'nombre')
      .lean();
    if (!original) return res.status(404).json({ msg: 'Cotización no encontrada' });

    // Detectamos cambios
    const cambios = [];
    const camposCabecera = ['cliente', 'requisitor', 'vendedor', 'fechaInicio', 'planta', 'total', 'estado', 'tiempoEntregaMin', 'tiempoEntregaMax'];

    // 1) Cabecera
    for (const campo of camposCabecera) {
      if (nuevosDatos[campo] !== undefined) {
        let ant = original[campo], nue = nuevosDatos[campo];
        // Para IDs, buscamos nombres
        if (campo === 'cliente' || campo === 'planta') {
          ant = original[campo]?.nombre;
          const Model = campo === 'cliente' ? Cliente : Planta;
          const doc = await Model.findById(nue).lean();
          nue = doc?.nombre;
        }
        if (campo === 'vendedor') {
          ant = original[campo]?.nombre;
          const doc = await User.findById(nue).lean();
          nue = doc?.nombre;
        }
        // Fecha
        if (campo === 'fechaInicio') {
          ant = (new Date(ant)).toLocaleDateString();
          nue = (new Date(nue)).toLocaleDateString();
        }
        if (String(ant) !== String(nue)) {
          cambios.push({ campo, actionType: 'edit', valorAnterior: ant, valorNuevo: nue, usuario, fecha: new Date() });
        }
      }
    }

    // --- 2) Renglones fila a fila ---------------------------------
    const oldRows = original.renglones || [];
    const newRows = nuevosDatos.renglones || oldRows;   // si no vienen, usa los existentes
    const maxLen = Math.max(oldRows.length, newRows.length);

    for (let i = 0; i < maxLen; i++) {
      const ant = oldRows[i];
      const nue = newRows[i];

      // A) Fila creada
      if (!ant && nue) {
        cambios.push({
          campo: `renglones > ${i + 1}`,
          actionType: 'create',
          valorAnterior: '—',
          valorNuevo: `${nue.cantidad}× ${nue.descripcion}`,
          usuario, fecha: new Date()
        });
        continue;
      }

      // B) Fila eliminada
      if (ant && !nue) {
        cambios.push({
          campo: `renglones > ${i + 1}`,
          actionType: 'delete',
          valorAnterior: `${ant.cantidad}× ${ant.descripcion}`,
          valorNuevo: '—',
          usuario, fecha: new Date()
        });
        continue;
      }

      // C) Campo‑a‑campo dentro de la fila
      const camposFila = ['cantidad', 'descripcion', 'precioUnitario', 'importe']; // ajusta a tu esquema
      for (const cf of camposFila) {
        if (String(ant[cf]) !== String(nue[cf])) {
          cambios.push({
            campo: `renglones > ${i + 1} > ${cf}`,
            actionType: 'edit',
            valorAnterior: ant[cf],
            valorNuevo: nue[cf],
            usuario, fecha: new Date()
          });
        }
      }
    }


    // 3) Comentarios / Documentos por renglón
    const max = Math.max((original.renglones || []).length, (nuevosDatos.renglones || []).length);
    for (let i = 0; i < max; i++) {
      const oRow = (original.renglones || [])[i] || { comentarios: [], documentos: [] };
      const nRow = (nuevosDatos.renglones || original.renglones || [])[i] || { comentarios: [], documentos: [] };
      // Comentarios
      const antC = (oRow.comentarios || []).map(c => c.texto).join(', ');
      const nueC = (nRow.comentarios || []).map(c => c.texto).join(', ');
      if (antC !== nueC) cambios.push({
        campo: `renglones > ${i + 1} > comentarios`,
        actionType: 'edit',
        valorAnterior: antC || '—',
        valorNuevo: nueC || '—',
        usuario, fecha: new Date()
      });
      // Documentos
      const antD = (oRow.documentos || []).map(d => d.originalName || d.url).join(', ');
      const nueD = (nRow.documentos || []).map(d => d.originalName || d.url).join(', ');
      if (antD !== nueD) cambios.push({
        campo: `renglones > ${i + 1} > documentos`,
        actionType: 'edit',
        valorAnterior: antD || '—',
        valorNuevo: nueD || '—',
        usuario, fecha: new Date()
      });
    }

    // Guardamos historial si hubo cambios
    if (cambios.length) {
      const version = await CotizacionHistorial.countDocuments({ cotizacionId: id }) + 1;
      await CotizacionHistorial.create({ cotizacionId: id, version, action: 'actualizado', cambios });
    }

    // Finalmente actualizamos (sin modificar el serial)
    const { serial, ...toUpdate } = nuevosDatos;
    const updated = await Cotizacion.findByIdAndUpdate(id, toUpdate, { new: true });

    res.json({ msg: 'Cotización actualizada correctamente', cotizacion: updated });
  } catch (error) {
    console.error('Error al actualizar cotización:', error);
    res.status(500).json({ msg: 'Error al actualizar cotización', error: error.message });
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
  try {
    const { id } = req.params;
    const eliminado = await Cotizacion.findByIdAndDelete(id);
    if (!eliminado) return res.status(404).json({ msg: 'Cotización no encontrada' });

    const usuario = req.user?.nombre || req.user?.email || 'Desconocido';
    const version = await CotizacionHistorial.countDocuments({ cotizacionId: id }) + 1;
    await CotizacionHistorial.create({
      cotizacionId: id,
      version,
      action: 'eliminado',
      cambios: [{
        campo: 'cotizacion_entera',
        actionType: 'delete',
        valorAnterior: eliminado,
        valorNuevo: null,
        usuario,
        fecha: new Date()
      }]
    });

    res.json({ msg: 'Cotización eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar cotización:', error);
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
