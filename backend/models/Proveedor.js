const mongoose = require('mongoose');

const proveedorMaterialSchema = new mongoose.Schema({
  material: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Material',
    required: true
  },
  precioUnitario: { 
    type: Number, 
    required: true 
  },
  // Puedes agregar otros campos específicos, como fecha de actualización, condiciones, etc.
}, { _id: false });

const proveedorSchema = new mongoose.Schema({
  // Información básica
  nombre: { 
    type: String, 
    required: true, 
    trim: true 
  },
  comentarios: { 
    type: String, 
    trim: true 
  },
  // Catálogo de archivos
  catalogo: [{
    url: { 
      type: String, 
      required: true,
      trim: true 
    },
    filename: { 
      type: String, 
      trim: true 
    },
  }],
  // Información de contacto y ubicación
  ciudad: { 
    type: String, 
    required: true, 
    trim: true 
  },
  formaPago: { 
    type: String, 
    trim: true 
  },
  sitioWeb: { 
    type: String, 
    trim: true 
  },
  direccion: { 
    type: String, 
    trim: true 
  },
  telefonoOficina: { 
    type: String, 
    trim: true 
  },
  telefonoWhatsapp: { 
    type: String, 
    trim: true 
  },
  contactoNombre: { 
    type: String, 
    trim: true 
  },
  razonSocial: { 
    type: String, 
    trim: true 
  },
  clabeInterbancaria: { 
    type: String, 
    trim: true 
  },
  // Ahora, en lugar de un arreglo simple, tenemos un arreglo de subdocumentos para materiales
  materiales: [proveedorMaterialSchema],
  // Datos fiscales agrupados en un subdocumento
  datosFiscales: {
    rfc: { 
      type: String, 
      trim: true 
    },
    domicilioFiscal: { 
      type: String, 
      trim: true 
    },
  },
}, {
  timestamps: true
});

module.exports = mongoose.model('Proveedor', proveedorSchema);
