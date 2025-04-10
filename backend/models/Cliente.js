// models/Cliente.js
const mongoose = require('mongoose');

const clienteSchema = new mongoose.Schema({
  // Nombre corto o denominación comercial (único y obligatorio)
  nombre: { type: String, required: true, unique: true },
  // Razón social (nombre legal completo de la empresa)
  razonSocial: { type: String },
  // Información de contacto general
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
  // Datos de contacto principal (persona clave en la empresa)
  contactoPrincipal: {
    nombre: { type: String },
    cargo: { type: String },
    telefono: { type: String },
    email: { type: String }
  },
  // Sector o industria en que opera la empresa (por ejemplo, tecnología, salud, construcción, etc.)
  sector: { type: String },
  // Información adicional o notas que puedan ser útiles
  comentarios: { type: String },
  // Fecha en la que el cliente fue registrado en el sistema
  fechaRegistro: { type: Date, default: Date.now },
  // Estado del cliente: si está activo o inactivo (útil para filtrados en la app)
  activo: { type: Boolean, default: true }
});

module.exports = mongoose.model('Cliente', clienteSchema);
