const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/categoriaController');
const verifyToken = require('../middleware/auth');

router.get('/',        verifyToken, ctrl.getCategorias);
router.post('/',       verifyToken, ctrl.createCategoria);
router.get('/:id',     verifyToken, ctrl.getCategoriaById);
router.put('/:id',     verifyToken, ctrl.updateCategoria);
router.delete('/:id',  verifyToken, ctrl.deleteCategoria);

module.exports = router;
