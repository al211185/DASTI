// models/Notificacion.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const notificacionSchema = new Schema({
  tipo: {
    type: String,
    enum: [
      // Cotizaciones
      'cotizacion_creada',
      'cotizacion_actualizada',
      'cotizacion_eliminada',
      // Comentarios y aprobaciones (valores previos)
      'comentario_nuevo',
      'aprobacion',
      // Usuarios
      'usuario_registrado',
      'usuario_creado',
      'usuario_actualizado',
      'usuario_eliminado',
      // Categorías
      'categoria_creada',
      'categoria_actualizada',
      'categoria_eliminada',
      // Clientes y contactos
      'cliente_creado',
      'cliente_actualizado',
      'cliente_eliminado',
      'contacto_agregado',
      'contacto_eliminado',
      // Plantas
      'planta_creada',
      'planta_actualizada',
      'planta_eliminada',
      // Máquinas
      'maquina_creada',
      'maquina_actualizada',
      'maquina_eliminada',
      // Materiales
      'material_creado',
      'material_actualizado',
      'material_eliminado',
      // Proveedores
      'proveedor_creado',
      'proveedor_actualizado',
      'proveedor_eliminado',
      // Solicitudes y comentarios de cotización
      'solicitud_edit',
      'solicitud_delete',
      'solicitud_aprobada',
      'solicitud_rechazada',
      'comentario_cotizacion'
    ],
    required: true
  },
  mensaje: {
    type: String,
    required: true
  },
  // Si la notificación va dirigida a un usuario concreto:
  destinatario: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  // Si es global (admin):
  esGlobal: {
    type: Boolean,
    default: false
  },
  // Además puedes guardar metadatos opcionales:
  refId: {
    type: Schema.Types.ObjectId,
    default: null
  }, // ej. _id de cotización relacionada
  creadoPor: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  fecha: {
    type: Date,
    default: Date.now
  },
  leida: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('Notificacion', notificacionSchema);