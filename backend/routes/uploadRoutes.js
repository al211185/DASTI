const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// Configuración del almacenamiento usando Multer:
// Los archivos se guardarán en la carpeta "uploads/"
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Asegúrate de que esta carpeta exista o créala
  },
  filename: (req, file, cb) => {
    // Genera un nombre único para el archivo: timestamp + nombre original
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  },
});

// Validaciones opcionales:
// Por ejemplo, limitar el tamaño máximo de archivo y aceptar solo ciertos tipos.
const upload = multer({ 
  storage, 
  limits: { fileSize: 5 * 1024 * 1024 }, // Tamaño máximo: 5 MB
  fileFilter: (req, file, cb) => {
    // Permitir solo archivos PDF, imágenes y documentos Word por ejemplo.
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen, PDF o documentos Word'));
    }
  }
});

// Endpoint POST para subir documentos.
// El campo de archivos se llamará "documents" y se permiten múltiples archivos.
router.post('/documents', upload.array('documents', 10), (req, res) => {
  try {
    // req.files contiene la información de los archivos subidos
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ msg: 'No se han seleccionado archivos.' });
    }

    // Genera un array de objetos con información relevante (por ejemplo, URL, nombre, etc.)
    const host = req.get('host');
    // Supón que sirves los archivos estáticos desde la carpeta 'uploads/'
    const documentos = req.files.map((file) => ({
      filename: file.filename,
      originalName: file.originalname,
      // Puedes construir la URL según tu configuración; por ejemplo, si usas Express.static con uploads/
      url: `${req.protocol}://${host}/uploads/${file.filename}`,
    }));

    res.json({ documents: documentos });
  } catch (error) {
    console.error('Error en la subida de archivos:', error);
    res.status(500).json({ msg: 'Error en la subida de archivos', error: error.message });
  }
});

module.exports = router;
