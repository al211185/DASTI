// models/Cotizacion.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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
  planta: { type: String, required: true },
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

module.exports = mongoose.model('Cotizacion', cotizacionSchema);
