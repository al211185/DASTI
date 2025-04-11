const mongoose = require('mongoose');
const Counter = require('./Counter'); // Ajusta la ruta según tu proyecto

const plantaSchema = new mongoose.Schema({
  nombre: { type: String, required: true, unique: true, trim: true },
  ubicacion: { type: String, required: true, trim: true },
  responsable: { type: String, trim: true },
  serial: { type: String }  // Cambiamos a String para almacenar el formato
}, {
  timestamps: true
});

plantaSchema.pre('save', async function (next) {
  const doc = this;
  // Solo para documentos nuevos
  if (doc.isNew) {
    try {
      // Usamos la ubicación para crear un código de grupo. Por ejemplo, tomamos los primeros tres caracteres,
      // los convertimos a mayúscula y nos aseguramos de que sean 3 caracteres (rellenando a la derecha con "0" si es necesario)
      const rawGroup = doc.ubicacion ? doc.ubicacion.slice(0, 3).toUpperCase() : "000";
      const groupCode = rawGroup.padEnd(3, '0'); // Aseguramos que tenga longitud 3

      // Definimos la clave para el contador: por ejemplo, "plantaSerial_<ubicación>"
      const sequenceId = `plantaSerial_${doc.ubicacion}`;
      const counter = await Counter.findOneAndUpdate(
        { id: sequenceId },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );

      // Formatear el número de secuencia a 4 dígitos
      const counterStr = counter.seq.toString().padStart(4, '0');

      // Asignar el serial con el formato deseado
      doc.serial = `CE-${groupCode}-${counterStr}`;
      
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

module.exports = mongoose.model('Planta', plantaSchema);
