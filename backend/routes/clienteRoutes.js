// routes/clienteRoutes.js
const router = require('express').Router();
const ctrl = require('../controllers/clienteController');

router.get('/',            ctrl.getClientes);
router.post('/',           ctrl.createCliente);
router.get('/:id',         ctrl.getClienteById);
router.put('/:id',         ctrl.updateCliente);
router.delete('/:id',      ctrl.deleteCliente);

// sub‑ruta para contactos
router.post('/:id/contactos',          ctrl.addContacto);
router.delete('/:id/contactos/:contactoId', ctrl.removeContacto);

module.exports = router;
