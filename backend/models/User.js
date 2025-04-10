const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  telefono: { type: String },
  empleadoID: { type: String, unique: true },
  departamento: { type: String, enum: ['administración', 'ventas', 'requisiciones', 'diseño', 'producción'] },
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

module.exports = mongoose.model('User', userSchema);
