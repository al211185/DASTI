const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/categoriaController');

router.get('/',        ctrl.getCategorias);
router.post('/',       ctrl.createCategoria);
router.get('/:id',     ctrl.getCategoriaById);
router.put('/:id',     ctrl.updateCategoria);
router.delete('/:id',  ctrl.deleteCategoria);

module.exports = router;
