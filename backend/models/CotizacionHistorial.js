// models/CotizacionHistorial.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const cambioSchema = new Schema({
  campo:      { type: String, required: true },
  actionType: { 
    type: String, 
    required: true,
    enum: [
      // admito tanto inglés como español
      'create','creado',
      'edit','actualizado',
      'delete','eliminado',
      'upload','download',
      'solicitud_edit','solicitud_delete'
    ]
  },
  valorAnterior: { type: Schema.Types.Mixed },
  valorNuevo:    { type: Schema.Types.Mixed },
  usuario:       { type: String, required: true },
  fecha:         { type: Date, default: Date.now },
});

const cotizacionHistorialSchema = new Schema({
  cotizacionId: { type: Schema.Types.ObjectId, ref: 'Cotizacion', required: true },
  version:      { type: Number, required: true },
  action:       {
    type: String,
    required: true,
    enum: [
      'creado','actualizado','eliminado',
      'solicitud_edit','solicitud_delete'
    ]
  },
  usuario: {                          // ← lo agregamos
    type: String,
    required: true
  },
  estadoSolicitud: {
    type: String,
    enum: ['pendiente','aprobada','rechazada'],
    default: function() {
      return this.action.startsWith('solicitud') ? 'pendiente' : undefined;
    }
  },
  cambios:   [cambioSchema],
  createdAt: { type: Date, default: Date.now }
});


module.exports = mongoose.model('CotizacionHistorial', cotizacionHistorialSchema);
