// controllers/usuariosController.js
const bcrypt = require('bcryptjs');
const User   = require('../models/User');

/* ------------------------------------------------------------------------- */
/* LISTAR TODOS                                                              */
/* GET /user                                                                 */
/* ------------------------------------------------------------------------- */
exports.getAllUsers = async (_req, res) => {
  try {
    const usuarios = await User
      .find()
      .select('-password')              // quita el campo password
      .populate('rol', 'nombre');       // trae sólo nombre del rol
    res.json(usuarios);
  } catch (err) {
    console.error('Error al obtener usuarios:', err);
    res.status(500).json({ msg: 'Error al obtener usuarios', error: err.message });
  }
};

/* ------------------------------------------------------------------------- */
/* OBTENER UNO                                                               */
/* GET /user/:id                                                              */
/* ------------------------------------------------------------------------- */
exports.getUserById = async (req, res) => {
  try {
    const usuario = await User
      .findById(req.params.id)
      .select('-password')
      .populate('rol', 'nombre');
    if (!usuario) return res.status(404).json({ msg: 'Usuario no encontrado' });
    res.json(usuario);
  } catch (err) {
    console.error('Error al obtener usuario:', err);
    res.status(500).json({ msg: 'Error al obtener el usuario', error: err.message });
  }
};

/* ------------------------------------------------------------------------- */
/* CREAR                                                                     */
/* POST /user                                                                 */
/* ------------------------------------------------------------------------- */
exports.registerUser = async (req, res) => {
  try {
    const { nombre, email, password, telefono, empleadoID, departamento, rol } = req.body;
    // validar
    if (!nombre || !email || !password || !rol) {
      return res.status(400).json({ msg: 'Faltan campos obligatorios' });
    }
    // duplicados
    if (await User.findOne({ email })) {
      return res.status(400).json({ msg: 'Email ya registrado' });
    }
    if (empleadoID && await User.findOne({ empleadoID })) {
      return res.status(400).json({ msg: 'empleadoID ya registrado' });
    }
    // hash
    const salt = await bcrypt.genSalt(10);
    const pwd  = await bcrypt.hash(password, salt);

    const nuevo = new User({ nombre, email, password: pwd, telefono, empleadoID, departamento, rol });
    const guardado = await nuevo.save();
    const resp = guardado.toObject();
    delete resp.password;
    res.status(201).json(resp);
  } catch (err) {
    console.error('Error al crear usuario:', err);
    res.status(500).json({ msg: 'Error al crear usuario', error: err.message });
  }
};

/* ------------------------------------------------------------------------- */
/* ACTUALIZAR                                                                 */
/* PUT /user/:id                                                              */
/* ------------------------------------------------------------------------- */
exports.updateUser = async (req, res) => {
  try {
    const updates = { ...req.body };
    // si se actualiza contraseña, hashearla
    if (updates.password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(updates.password, salt);
    }
    const usuario = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    )
      .select('-password')
      .populate('rol', 'nombre');
    if (!usuario) return res.status(404).json({ msg: 'Usuario no encontrado' });
    res.json(usuario);
  } catch (err) {
    console.error('Error al actualizar usuario:', err);
    res.status(400).json({ msg: 'Error al actualizar usuario', error: err.message });
  }
};

/* ------------------------------------------------------------------------- */
/* ELIMINAR                                                                  */
/* DELETE /user/:id                                                           */
/* ------------------------------------------------------------------------- */
exports.deleteUser = async (req, res) => {
  try {
    const eliminado = await User.findByIdAndDelete(req.params.id);
    if (!eliminado) return res.status(404).json({ msg: 'Usuario no encontrado' });
    res.json({ msg: 'Usuario eliminado correctamente' });
  } catch (err) {
    console.error('Error al eliminar usuario:', err);
    res.status(500).json({ msg: 'Error al eliminar usuario', error: err.message });
  }
};
