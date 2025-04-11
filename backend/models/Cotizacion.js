// models/Cotizacion.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Planta = require('./Planta');      // Asegúrate de que la ruta sea correcta
const Counter = require('./Counter');    // Modelo para el contador

const historialCambioSchema = new Schema({
  campo: { type: String, required: true },
  valorAnterior: { type: String },
  valorNuevo: { type: String },
  fecha: { type: Date, default: Date.now },
  usuario: { type: String, required: true },
});

const comentarioSchema = new Schema({
  texto: { type: String, required: true },
  fecha: { type: Date, default: Date.now },
  usuario: { type: String, required: true },
});

const renglonSchema = new Schema({
  cantidad: { type: Number, required: true, min: 1 },
  descripcion: { type: String, required: true },
  documentos: [{ type: Object }],
  material: { type: Object },
  tiempos: { type: Object },
  porcentaje: { type: Number, default: 0 },
  costo: { type: Number, default: 0 },
  comentarios: [comentarioSchema],
});

const cotizacionSchema = new Schema({
  cliente: { type: String, required: true },
  requisitor: { type: String, required: true },
  vendedor: { type: String, required: true },
  fechaInicio: { type: Date, required: true },
  // Aquí "planta" se almacena como el _id de la planta (String)
  planta: { type: String, required: true },
  // El serial se genera automáticamente en el pre-hook
  serial: { type: String, required: true },
  renglones: [renglonSchema],
  total: { type: Number, required: true },
  estado: {
    type: String,
    enum: ['Pendiente de aprobación', 'Aprobado', 'Rechazado'],
    default: 'Pendiente de aprobación',
  },
  fechaCreacion: { type: Date, default: Date.now },
  historialCambios: [historialCambioSchema],
});

// Pre-save hook para generar el serial autoincremental por planta
cotizacionSchema.pre('validate', async function (next) {
  const doc = this;
  if (doc.isNew) {
    try {
      // Buscar la planta asociada usando su _id (almacenado en doc.planta)
      const plantaDoc = await Planta.findById(doc.planta);
      if (!plantaDoc) {
        return next(new Error("Planta no encontrada para la cotización."));
      }
      // Generar el código de grupo basándose en la ubicación de la planta.
      const rawGroup = plantaDoc.ubicacion ? plantaDoc.ubicacion.slice(0, 3).toUpperCase() : "000";
      const groupCode = rawGroup.padEnd(3, '0');
      
      // Definir la clave de contador usando la planta (cada planta tendrá su propio contador)
      const sequenceId = `cotizacionSerial_${doc.planta}`;
      
      // Incrementar el contador asociado a esta planta (usando upsert para crearlo si no existe)
      const counter = await Counter.findOneAndUpdate(
        { id: sequenceId },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      
      // Formatear el número de secuencia a 4 dígitos
      const counterStr = counter.seq.toString().padStart(4, '0');
      
      // Construir el serial en el formato deseado: "CE-XXX-YYYY"
      doc.serial = `CE-${groupCode}-${counterStr}`;
      
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});


module.exports = mongoose.model('Cotizacion', cotizacionSchema);
