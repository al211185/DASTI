const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const roleSchema = new Schema({
  nombre: { type: String, required: true, unique: true },
  descripcion: { type: String },
  permisos: [{ type: String }] // Ejemplos: "crear_cotizacion", "aprobar_cotizacion", etc.
});

module.exports = mongoose.model('Role', roleSchema);
