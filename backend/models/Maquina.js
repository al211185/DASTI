const mongoose = require('mongoose');

const maquinaSchema = new mongoose.Schema({
  nombre: { 
    type: String, 
    required: true, 
    trim: true 
  },
  costoHora: { 
    type: Number, 
    required: true, 
    min: 0 
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Maquina', maquinaSchema);
