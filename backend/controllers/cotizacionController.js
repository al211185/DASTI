const Cotizacion = require('../models/Cotizacion');

/**
 * Crea una nueva cotización.
 * Se espera recibir en req.body un objeto con:
 * {
 *   cliente, requisitor, vendedor, fechaInicio, planta,
 *   renglones: [ { cantidad, descripcion, documentos, material, tiempos, porcentaje, costo, comentarios } ],
 *   total
 * }
 * El campo "serial" NO se debe enviar desde el front-end, pues el modelo lo genera automáticamente.
 */
exports.createCotizacion = async (req, res) => {
  try {
    // Extraemos los campos necesarios, omitiendo "serial"
    const { cliente, requisitor, vendedor, fechaInicio, planta, renglones, total } = req.body;

    // Creamos la nueva cotización sin incluir "serial"
    const nuevaCotizacion = new Cotizacion({
      cliente,
      requisitor,
      vendedor,
      fechaInicio,
      planta,
      renglones,
      total,
    });

    // Al guardar, el pre-save hook en el modelo asignará el serial de forma automática
    const cotizacionGuardada = await nuevaCotizacion.save();
    res.status(201).json({ msg: 'Cotización creada correctamente', cotizacion: cotizacionGuardada });
  } catch (error) {
    console.error('Error al crear cotización:', error);
    res.status(500).json({ msg: 'Error al crear cotización', error: error.message });
  }
};

/**
 * Obtiene todas las cotizaciones.
 */
exports.getCotizaciones = async (req, res) => {
  try {
    const cotizaciones = await Cotizacion.find().sort({ fechaCreacion: -1 });
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
    const { id } = req.params;
    const cotizacion = await Cotizacion.findById(id);
    if (!cotizacion) {
      return res.status(404).json({ msg: 'Cotización no encontrada' });
    }
    res.json({ cotizacion });
  } catch (error) {
    console.error('Error al obtener cotización:', error);
    res.status(500).json({ msg: 'Error al obtener cotización', error: error.message });
  }
};

/**
 * Actualiza una cotización.
 * Nota: Es recomendable no permitir actualizar el serial manualmente.
 */
exports.updateCotizacion = async (req, res) => {
  try {
    const { id } = req.params;
    // Excluir el campo "serial" de los datos a actualizar
    const { serial, ...nuevosDatos } = req.body;
    const usuario = req.user?.nombre || req.user?.email || 'Desconocido';

    // Buscar la cotización existente
    const cotizacionActual = await Cotizacion.findById(id);
    if (!cotizacionActual) {
      return res.status(404).json({ msg: 'Cotización no encontrada' });
    }

    let historialCambios = cotizacionActual.historialCambios || [];

    // Función para comparar y registrar cambios en un campo
    const registrarCambio = (campo, valorAnterior, valorNuevo) => {
      if (valorAnterior !== valorNuevo) {
        historialCambios.push({
          campo,
          valorAnterior: String(valorAnterior),
          valorNuevo: String(valorNuevo),
          usuario,
        });
      }
    };

    // Comparar campos relevantes (sin incluir "serial")
    const camposEncabezado = ['cliente', 'requisitor', 'vendedor', 'fechaInicio', 'planta'];
    camposEncabezado.forEach((campo) => {
      registrarCambio(campo, cotizacionActual[campo], nuevosDatos[campo]);
    });

    // Registrar cambio en total si difiere
    registrarCambio('total', cotizacionActual.total, nuevosDatos.total);

    // Actualizar la cotización (el serial permanece intacto)
    const cotizacionActualizada = await Cotizacion.findByIdAndUpdate(
      id,
      { ...nuevosDatos, historialCambios: historialCambios },
      { new: true }
    );
    res.json({ msg: 'Cotización actualizada correctamente', cotizacion: cotizacionActualizada });
  } catch (error) {
    console.error('Error al actualizar cotización:', error);
    res.status(500).json({ msg: 'Error al actualizar la cotización', error: error.message });
  }
};

/**
 * Obtiene el historial de cambios de una cotización por su ID.
 */
exports.getHistorialCotizacion = async (req, res) => {
  try {
    const { id } = req.params;
    const cotizacion = await Cotizacion.findById(id, 'historialCambios');
    if (!cotizacion) {
      return res.status(404).json({ msg: 'Cotización no encontrada' });
    }
    res.json({ historialCambios: cotizacion.historialCambios });
  } catch (error) {
    console.error('Error al obtener historial:', error);
    res.status(500).json({ msg: 'Error al obtener historial', error: error.message });
  }
};

/**
 * (Opcional) Elimina una cotización.
 */
exports.deleteCotizacion = async (req, res) => {
  try {
    const { id } = req.params;
    const cotizacionEliminada = await Cotizacion.findByIdAndDelete(id);
    if (!cotizacionEliminada) {
      return res.status(404).json({ msg: 'Cotización no encontrada' });
    }
    res.json({ msg: 'Cotización eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar cotización:', error);
    res.status(500).json({ msg: 'Error al eliminar cotización', error: error.message });
  }
};
