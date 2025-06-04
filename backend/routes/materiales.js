const express = require('express');
const router = express.Router();
const materialController = require('../controllers/materialController');
const upload = require('../middleware/upload');
const verifyToken = require('../middleware/auth'); // si aplicas auth

// GET /api/materiales
router.get('/', verifyToken, materialController.getMateriales);

// GET /api/materiales/:id
router.get('/:id', verifyToken, materialController.getMaterialById);

// POST /api/materiales
// - primero procesa 'imagen' (campo del form-data)
// - luego llama al controlador
router.post(
  '/', 
  verifyToken,
  upload.single('imagen'), 
  materialController.createMaterial
);

// PUT /api/materiales/:id
router.put(
  '/:id', 
  verifyToken,
  upload.single('imagen'), 
  materialController.updateMaterial
);

// DELETE /api/materiales/:id
router.delete('/:id', verifyToken, materialController.deleteMaterial);

module.exports = router;
