const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  categoria: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Categoria', 
    required: true 
  },
  unidadMedida: { 
    type: String,
    enum: ["PIES", "PULGADAS", "LIBRAS", "MILIMETROS", "CENTIMETROS", "GRAMOS", "KILOS"],
    required: true 
  },
  // Otros campos que sean intrínsecos al material pueden ir aquí
});

module.exports = mongoose.model('Material', materialSchema);
