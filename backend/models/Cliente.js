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

  // (Opcional) si deseas conservar "contactoPrincipal", lo puedes dejar,
  // pero ya no lo usarías al tener varios contactos
  // contactoPrincipal: {
  //   nombre: { type: String },
  //   cargo: { type: String },
  //   telefono: { type: String },
  //   email: { type: String }
  // },

  sector: { type: String },
  comentarios: { type: String },
  fechaRegistro: { type: Date, default: Date.now },
  activo: { type: Boolean, default: true }
});

module.exports = mongoose.model('Cliente', clienteSchema);
