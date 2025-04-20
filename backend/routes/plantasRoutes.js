// routes/plantaRoutes.js
const express = require('express');
const router  = express.Router();
const plantaCtrl = require('../controllers/plantasController');

router.get('/',          plantaCtrl.getPlantas);
router.get('/:id',       plantaCtrl.getPlantaById);
router.post('/',         plantaCtrl.createPlanta);
router.put('/:id',       plantaCtrl.updatePlanta);
router.delete('/:id',    plantaCtrl.deletePlanta);

module.exports = router;
