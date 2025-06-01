// models/Cliente.js
const mongoose = require('mongoose');

const contactoSchema = new mongoose.Schema({
  nombre: { type: String },
  cargo: { type: String },
  telefono: { type: String },
  email: { type: String }
});

const clienteSchema = new mongoose.Schema({
  nombre: { type: String, required: true, unique: true },
  razonSocial: { type: String },
  direccion: {
    calle: { type: String },
    numero: { type: String },
    colonia: { type: String },
    ciudad: { type: String },
    estado: { type: String },
    codigoPostal: { type: String }
  },
  telefono: { type: String },
  email: { type: String },
  sitioWeb: { type: String },

  // Reemplazamos contactoPrincipal por un array "contactos"
  contactos: [contactoSchema],

  sector: { type: String },
  comentarios: { type: String },
  fechaRegistro: { type: Date, default: Date.now },
  activo: { type: Boolean, default: true },
  prefijo: { type: String, required: true, uppercase: true, trim: true }
});

module.exports = mongoose.model('Cliente', clienteSchema);
