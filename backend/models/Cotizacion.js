// models/Cotizacion.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Counter = require('./Counter');    // Modelo para el contador
const Cliente = require('./Cliente');   // <-- Importamos Cliente para leer su prefijo

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
  cliente: { type: Schema.Types.ObjectId, ref: 'Cliente', required: true },
  requisitor: { type: String, required: true },
  vendedor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  fechaInicio: { type: Date, required: true },
  planta: { type: Schema.Types.ObjectId, ref: 'Planta', required: true },
  serial: { type: String, required: true, unique: true },
  tiempoEntregaMin: { type: Number, default: 1 },
  tiempoEntregaMax: { type: Number, default: 1 },
  renglones: [renglonSchema],  // Esto queda igual
  total: { type: Number, required: true },
  estado: {
    type: String,
    enum: ['Pendiente de aprobación', 'Aprobado', 'Rechazado'],
    default: 'Pendiente de aprobación',
  },
  fechaCreacion: { type: Date, default: Date.now },
  historialCambios: [historialCambioSchema],
  comentarios: [comentarioSchema],
});


/**
 * HOOK pre-validate: Generar el serial usando “cliente” en lugar de “planta”
 */
cotizacionSchema.pre('validate', async function (next) {
  const doc = this;
  // Solo generar el serial si es nuevo (isNew) y aún no lo tiene asignado
  if (doc.isNew) {
    try {
      // 1) Buscar al cliente completo para obtener su prefijo
      const clienteDoc = await Cliente.findById(doc.cliente);
      if (!clienteDoc) {
        return next(new Error("Cliente no encontrado para la cotización."));
      }

      // 2) Obtener prefijo desde el cliente
      //    (puedes usar clienteDoc.prefijo o, si no lo tienes, derivar de nombre)
      const pref = clienteDoc.prefijo
        ? clienteDoc.prefijo.toUpperCase().trim()
        : clienteDoc.nombre.slice(0, 3).toUpperCase(); 
      // En este ejemplo, si el cliente no tiene “prefijo”, tomo las 3 primeras letras de su nombre

      // 3) Usar un contador independiente por cliente:
      const sequenceId = `cotizacionSerial_${doc.cliente}`; 
      // Esto almacenará en Counter un documento con id = "cotizacionSerial_<clienteId>"

      // 4) Incrementar el contador (upsert crea el doc si no existe)
      const counter = await Counter.findOneAndUpdate(
        { id: sequenceId },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );

      // 5) Poner relleno a 4 dígitos (o los que necesites)
      const counterStr = counter.seq.toString().padStart(4, '0'); // "0001", "0002", etc.

      // 6) Construir el serial final:
      //    Por ejemplo: "<PREFIJO>-<SECUENCIA_PAD>" => "CA-0001", "CB-0005"
      doc.serial = `${pref}-${counterStr}`;

      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

cotizacionSchema.index({ 'renglones.descripcion': 'text' });

module.exports = mongoose.model('Cotizacion', cotizacionSchema);
