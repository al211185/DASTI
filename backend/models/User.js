const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  telefono: { type: String },
  departamento: { type: String, enum: ['administración', 'ventas', 'diseño', 'producción'] },
  rol: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    required: true
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

// -- Ya no hay plugin de AutoIncrement ni campo empleadoID

module.exports = mongoose.model('User', userSchema);
