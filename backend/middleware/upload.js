// middleware/upload.js
const multer = require('multer');
const path = require('path');

// Carpeta donde vas a guardar las imágenes de materiales
const UPLOADS_FOLDER = path.join(__dirname, '../uploads/materiales');

// Configuración de storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_FOLDER);
  },
  filename: (req, file, cb) => {
    // p.ej. material-<timestamp>.<ext>
    const ext = path.extname(file.originalname);
    cb(null, `material-${Date.now()}${ext}`);
  }
});

// Filtro para aceptar solo imágenes
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) cb(null, true);
  else cb(new Error('Solo imágenes permitidas'), false);
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
