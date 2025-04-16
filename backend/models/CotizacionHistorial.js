// models/CotizacionHistorial.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cambioSchema = new Schema({
  campo: { type: String, required: true },
  actionType: { type: String, required: true },      // 'create'|'edit'|'delete'|'upload'|'download'
  valorAnterior: { type: Schema.Types.Mixed },
  valorNuevo: { type: Schema.Types.Mixed },
  usuario: { type: String, required: true },
  fecha: { type: Date, default: Date.now },
});

const cotizacionHistorialSchema = new Schema({
  cotizacionId: { type: Schema.Types.ObjectId, ref: 'Cotizacion', required: true },
  version: { type: Number, required: true },
  action: { type: String, required: true },          // 'creado'|'actualizado'|'eliminado', etc.
  cambios: [cambioSchema],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CotizacionHistorial', cotizacionHistorialSchema);
