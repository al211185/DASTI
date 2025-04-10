const mongoose = require('mongoose');

const plantaSchema = new mongoose.Schema({
  // Nombre único y obligatorio, con eliminación de espacios adicionales.
  nombre: { type: String, required: true, unique: true, trim: true },
  // Ubicación obligatoria, por ejemplo la dirección o zona donde se encuentra la planta.
  ubicacion: { type: String, required: true, trim: true },
  // Responsable o encargado de la planta.
  responsable: { type: String, trim: true }
}, {
  // Agrega campos "createdAt" y "updatedAt" automáticamente.
  timestamps: true
});

module.exports = mongoose.model('Planta', plantaSchema);
