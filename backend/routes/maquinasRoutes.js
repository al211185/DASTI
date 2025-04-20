// routes/maquinaRoutes.js
const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/maquinaController');

router.get('/',        ctrl.getMaquinas);
router.post('/',       ctrl.createMaquina);
router.get('/:id',     ctrl.getMaquinaById);
router.put('/:id',     ctrl.updateMaquina);
router.delete('/:id',  ctrl.deleteMaquina);

module.exports = router;
