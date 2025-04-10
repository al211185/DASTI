// controllers/userController.js
const User = require('../models/User');

exports.getProfile = async (req, res) => {
  try {
    console.log('req.user en getProfile:', req.user); // Asegura que req.user esté definido
    // Busca el usuario sin el campo password
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      console.error('Usuario no encontrado para el id:', req.user.id);
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }
    res.json(user);
  } catch (error) {
    // Imprime el error exacto en la consola
    console.error('Error en getProfile:', error);
    res.status(500).json({ error: error.message });
  }
};
