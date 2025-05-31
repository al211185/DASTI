const mongoose = require('mongoose');
// ① Importa e inicializa el plugin con tu instancia de mongoose
const AutoIncrement = require('mongoose-sequence')(mongoose);
 
const userSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  telefono: { type: String },
  empleadoID:   { type: Number, unique: true },
  departamento: { type: String, enum: ['administración', 'ventas', 'diseño', 'producción'] },
  rol: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    required: true  // Ahora es obligatorio asignar un rol válido
  },
  activo: { type: Boolean, default: true },
  ultimoAcceso: { type: Date },
  fechaCreacion: { type: Date, default: Date.now },
  preferencias: {
    idioma: { type: String, default: 'es' },
    tema: { type: String, default: 'light' }
  },
  historialAccesos: [
    {
      fecha: { type: Date, default: Date.now },
      ip: { type: String },
      navegador: { type: String }
    }
  ]
});
 
// ③ Aplica el plugin para que cada nuevo documento incremente empleadoID
userSchema.plugin(AutoIncrement, { inc_field: 'empleadoID' });
 
module.exports = mongoose.model('User', userSchema);