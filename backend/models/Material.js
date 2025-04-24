// models/Material.js
const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  categoria: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Categoria', 
    required: true 
  },
  imagen: { 
    type: String,   // guardaremos la URL o ruta en el servidor
    trim: true 
  },
}, { timestamps: true });

module.exports = mongoose.model('Material', materialSchema);
