// models/Notificacion.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const notificacionSchema = new Schema({
  tipo: { 
    type: String, 
    enum: ['cotizacion_creada', 'cotizacion_actualizada', 'cotizacion_eliminada', 
           'comentario_nuevo', 'aprobacion', /* ...otros tipos */], 
    required: true 
  },
  mensaje: { type: String, required: true },
  // Si la notificación va dirigida a un usuario concreto:
  destinatario: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  // Si es global (admin):
  esGlobal: { type: Boolean, default: false },
  // Además puedes guardar metadatos opcionales:
  refId: { type: Schema.Types.ObjectId, default: null }, // ej. _id de cotización relacionada
  creadoPor: { type: Schema.Types.ObjectId, ref: 'User' },
  fecha: { type: Date, default: Date.now },
  leida: { type: Boolean, default: false }
});

module.exports = mongoose.model('Notificacion', notificacionSchema);
