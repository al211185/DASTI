const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Obtener el perfil del usuario (ya existente)
exports.getProfile = async (req, res) => {
  try {
    console.log('req.user en getProfile:', req.user);
    // Busca el usuario, excluyendo el campo password, y hace populate en el campo "rol"
    const user = await User.findById(req.user.id)
                           .populate('rol')
                           .select('-password');
    if (!user) {
      console.error('Usuario no encontrado para el id:', req.user.id);
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error en getProfile:', error);
    res.status(500).json({ error: error.message });
  }
};

// Registrar un nuevo usuario
exports.registerUser = async (req, res) => {
  try {
    // Extraemos los campos del body
    const {
      nombre,
      email,
      password,
      telefono,
      empleadoID,
      departamento,
      rol
    } = req.body;

    // Validamos campos obligatorios
    if (!nombre || !email || !password || !rol) {
      return res.status(400).json({ msg: 'Por favor, ingresa todos los campos obligatorios (nombre, email, password y rol).' });
    }

    // Verifica si ya existe un usuario con ese email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: 'El email ya está registrado.' });
    }

    // Opcional: Puedes verificar si el empleadoID ya existe, si se envía
    if (empleadoID) {
      const existingEmpleado = await User.findOne({ empleadoID });
      if (existingEmpleado) {
        return res.status(400).json({ msg: 'El empleadoID ya está registrado.' });
      }
    }

    // Generar un salt y hashear la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Crear una nueva instancia del usuario
    const newUser = new User({
      nombre,
      email,
      password: hashedPassword,
      telefono,
      empleadoID,
      departamento, // Este campo opcional según tus necesidades
      rol
    });

    // Guardar el usuario en la base de datos
    const savedUser = await newUser.save();

    // Convertir el usuario a objeto y eliminar la contraseña antes de enviar la respuesta
    const userResponse = savedUser.toObject();
    delete userResponse.password;

    res.status(201).json(userResponse);
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({ msg: 'Error al registrar usuario', error: error.message });
  }
};
