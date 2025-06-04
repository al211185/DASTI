// routes/maquinaRoutes.js
const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/maquinaController');
const verifyToken = require('../middleware/auth');

router.get('/',        verifyToken, ctrl.getMaquinas);
router.post('/',       verifyToken, ctrl.createMaquina);
router.get('/:id',     verifyToken, ctrl.getMaquinaById);
router.put('/:id',     verifyToken, ctrl.updateMaquina);
router.delete('/:id',  verifyToken, ctrl.deleteMaquina);

module.exports = router;
