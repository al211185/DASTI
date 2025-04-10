// seeds/seedUsers.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Role = require('../models/Role');
require('dotenv').config();

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { 
      useNewUrlParser: true, 
      useUnifiedTopology: true 
    });

    // Buscar los roles correspondientes en la colección de Roles
    const directorRole = await Role.findOne({ nombre: 'Director' });
    const adminRole = await Role.findOne({ nombre: 'Administrador' });    

    if (!directorRole || !adminRole) {
      throw new Error('Roles necesarios no fueron encontrados en la base de datos');
    }

    // Verificar si ya existen usuarios con estos roles
    const existingDirector = await User.findOne({ email: 'director@empresa.com' });
    const existingAdmin = await User.findOne({ email: 'admin@empresa.com' });

    if (!existingDirector) {
      const director = new User({
        nombre: 'Director Inicial',
        email: 'director@empresa.com',
        password: 'claveSeguraDirector', // recuerda cambiarla y hashearla
        telefono: '123456789',
        empleadoID: 'D001',
        departamento: 'administración',
        rol: directorRole._id,
      });

      // Hashear la contraseña
      const salt = await bcrypt.genSalt(10);
      director.password = await bcrypt.hash(director.password, salt);

      await director.save();
      console.log('Usuario Director creado exitosamente');
    }

    if (!existingAdmin) {
      const admin = new User({
        nombre: 'Administrador Inicial',
        email: 'admin@empresa.com',
        password: 'claveSeguraAdmin', // recuerda cambiarla y hashearla
        telefono: '987654321',
        empleadoID: 'A001',
        departamento: 'administración',
        rol: adminRole._id,
      });

      const salt = await bcrypt.genSalt(10);
      admin.password = await bcrypt.hash(admin.password, salt);

      await admin.save();
      console.log('Usuario Administrador creado exitosamente');
    }

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedUsers();
