// routes/clienteRoutes.js
const router = require('express').Router();
const ctrl = require('../controllers/clienteController');
const verifyToken = require('../middleware/auth');

router.get('/',            verifyToken, ctrl.getClientes);
router.post('/',           verifyToken, ctrl.createCliente);
router.get('/:id',         verifyToken, ctrl.getClienteById);
router.put('/:id',         verifyToken, ctrl.updateCliente);
router.delete('/:id',      verifyToken, ctrl.deleteCliente);

// sub‑ruta para contactos
router.post('/:id/contactos',          verifyToken, ctrl.addContacto);
router.delete('/:id/contactos/:contactoId', verifyToken, ctrl.removeContacto);

module.exports = router;
