// routes/plantaRoutes.js
const express = require('express');
const router  = express.Router();
const plantaCtrl = require('../controllers/plantasController');
const verifyToken = require('../middleware/auth');

router.get('/',          verifyToken, plantaCtrl.getPlantas);
router.get('/:id',       verifyToken, plantaCtrl.getPlantaById);
router.post('/',         verifyToken, plantaCtrl.createPlanta);
router.put('/:id',       verifyToken, plantaCtrl.updatePlanta);
router.delete('/:id',    verifyToken, plantaCtrl.deletePlanta);

module.exports = router;
