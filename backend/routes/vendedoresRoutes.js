const express = require('express');
const router = express.Router();
const vendedoresController = require('../controllers/vendedoresController');

router.get('/', vendedoresController.getVendedores);

module.exports = router;
