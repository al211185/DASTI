const express = require('express');
const router = express.Router();
const materialController = require('../controllers/materialController');

// GET /api/materiales - Devuelve la lista de materiales ordenados por categoría y nombre.
router.get('/', materialController.getMateriales);

// GET /api/materiales/:id - Devuelve un material por su ID.
router.get('/:id', materialController.getMaterialById);

// POST /api/materiales - Crea un nuevo material.
router.post('/', materialController.createMaterial);

// PUT /api/materiales/:id - Actualiza un material existente.
router.put('/:id', materialController.updateMaterial);

// DELETE /api/materiales/:id - Elimina un material.
router.delete('/:id', materialController.deleteMaterial);

module.exports = router;
