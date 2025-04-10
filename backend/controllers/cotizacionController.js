// controllers/cotizacionController.js
const Cotizacion = require('../models/Cotizacion');

/**
 * Crea una nueva cotización.
 * Se espera recibir en req.body un objeto con:
 * {
 *   cliente, requisitor, vendedor, fechaInicio, planta, serial,
 *   renglones: [ { cantidad, descripcion, documentos, material, tiempos, porcentaje, costo, comentarios } ],
 *   total
 * }
 */
exports.createCotizacion = async (req, res) => {
  try {
    const { cliente, requisitor, vendedor, fechaInicio, planta, serial, renglones, total } = req.body;

    // Aquí podrías validar que el total concuerde con la suma de los renglones, etc.
    const nuevaCotizacion = new Cotizacion({
      cliente,
      requisitor,
      vendedor,
      fechaInicio,
      planta,
      serial,
      renglones,
      total,
    });
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
 */
exports.updateCotizacion = async (req, res) => {
    try {
      const { id } = req.params;
      const nuevosDatos = req.body; // Datos enviados para actualizar
      const usuario = req.user?.nombre || req.user?.email || 'Desconocido';
  
      // Buscar la cotización existente
      const cotizacionActual = await Cotizacion.findById(id);
      if (!cotizacionActual) {
        return res.status(404).json({ msg: 'Cotización no encontrada' });
      }
  
      // Inicializamos un array para los cambios
      const historialCambios = [];
  
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
  
      // Comparamos campos del encabezado
      const camposEncabezado = ['cliente', 'requisitor', 'vendedor', 'fechaInicio', 'planta', 'serial'];
      camposEncabezado.forEach((campo) => {
        registrarCambio(campo, cotizacionActual[campo], nuevosDatos[campo]);
      });
  
      // Puedes extender la comparación a los renglones si lo deseas.
      // Por simplicidad, aquí solo se registra el cambio de total si difiere.
      registrarCambio('total', cotizacionActual.total, nuevosDatos.total);
  
      // Actualizamos la cotización y concatenamos el historial nuevo
      const cotizacionActualizada = await Cotizacion.findByIdAndUpdate(
        id,
        {
          ...nuevosDatos,
          historialCambios: cotizacionActual.historialCambios.concat(historialCambios),
        },
        { new: true }
      );
  
      res.json({
        msg: 'Cotización actualizada correctamente',
        cotizacion: cotizacionActualizada,
        historial: historialCambios,
      });
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

// controllers/cotizacionController.js

// controllers/cotizacionController.js
exports.updateCotizacion = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, comentario, ...rest } = req.body; // Separa campos de aprobación, etc.
    const usuario = req.user?.nombre || req.user?.email || 'Desconocido';

    // Obtener la cotización actual
    const cotizacionActual = await Cotizacion.findById(id);
    if (!cotizacionActual) {
      return res.status(404).json({ msg: 'Cotización no encontrada' });
    }

    let historial = cotizacionActual.historialCambios || [];
    // Registrar cambios en el encabezado, por ejemplo en estado
    if (estado && estado !== cotizacionActual.estado) {
      historial.push({
        campo: 'estado',
        valorAnterior: cotizacionActual.estado,
        valorNuevo: estado,
        usuario,
      });
    }
    // Registrar el comentario de aprobación o rechazo
    if (comentario) {
      historial.push({
        campo: 'comentario',
        valorAnterior: '',
        valorNuevo: comentario,
        usuario,
      });
    }

    // Actualizar la cotización
    const cotizacionActualizada = await Cotizacion.findByIdAndUpdate(
      id,
      { ...rest, estado, historialCambios: historial },
      { new: true }
    );
    res.json({ msg: 'Cotización actualizada correctamente', cotizacion: cotizacionActualizada });
  } catch (error) {
    res.status(500).json({ msg: 'Error al actualizar la cotización', error: error.message });
  }
};



