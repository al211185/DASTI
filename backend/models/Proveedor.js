const mongoose = require('mongoose');

// subdocumento enriquecido:
const proveedorMaterialSchema = new mongoose.Schema({
  material: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Material',
    required: true
  },
  precioPresentacion: { type: Number, required: true },
  unidadPresentacion: {
    type: String,
    enum: ["PIES","PULGADAS","LIBRAS","MILIMETROS","CENTIMETROS","GRAMOS","KILOS"],
    required: true
  },
  cantidadPresentacion: { type: Number, required: true, min: 0.001 },
  factorConversion:    { type: Number, required: true, min: 0.000001 },
  // campos opcionales como fecha de actualización, condiciones, etc.
}, { _id: false });

const proveedorSchema = new mongoose.Schema({
  nombre:            { type: String, required: true, trim: true },
  comentarios:       { type: String, trim: true },
  catalogo: [{
    url:      { type: String, required: true, trim: true },
    filename: { type: String, trim: true },
  }],
  ciudad:            { type: String, required: true, trim: true },
  formaPago:         { type: String, trim: true },
  sitioWeb:          { type: String, trim: true },
  direccion:         { type: String, trim: true },
  telefonoOficina:   { type: String, trim: true },
  telefonoWhatsapp:  { type: String, trim: true },
  contactoNombre:    { type: String, trim: true },
  razonSocial:       { type: String, trim: true },
  clabeInterbancaria:{ type: String, trim: true },
  materiales:        [proveedorMaterialSchema],
  datosFiscales: {
    rfc:             { type: String, trim: true },
    domicilioFiscal: { type: String, trim: true },
  },
}, {
  timestamps: true
});

module.exports = mongoose.model('Proveedor', proveedorSchema);
