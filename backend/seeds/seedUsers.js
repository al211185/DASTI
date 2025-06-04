// seeds/seedUsers.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Role = require('../models/Role');

(async () => {
    try {
      // 1️⃣ Conectar usando MONGO_URI que Azure inyecta
      await mongoose.connect(process.env.MONGO_URI, {
        tlsInsecure: true, // si tu base requiere ignorar mismatch de hostname (por Cosmos DB vCore +srv)
        // podrías agregar serverSelectionTimeoutMS, useNewUrlParser, etc. si es necesario
      });
      console.log('🔌 Conectado a la base de datos');

      // 2️⃣ Obtener los roles “director” y “administrador” que ya deberían existir
      const directorRole = await Role.findOne({
        nombre: 'director'
      });
      const adminRole = await Role.findOne({
        nombre: 'administrador'
      });

      if (!directorRole || !adminRole) {
        throw new Error('Roles “director” y/o “administrador” no encontrados');
      }

      // 3️⃣ Crear o actualizar Director ----------------------------------------
      let director = await User.findOne({
        email: 'vmoreno@dasti.com.mx'
      });
      if (!director) {
        director = await User.create({
          nombre: 'Victor Moreno',
          email: 'vmoreno@dasti.com.mx',
          password: await bcrypt.hash('VmDasti2025@', 10),
          telefono: '6563603586',
          departamento: 'administración',
          rol: directorRole._id
        });
        console.log('✅ Usuario Director creado');
      } else {
        await User.updateOne({
          _id: director._id
        }, { // campos a actualizar siempre
          nombre: 'Victor Moreno',
          telefono: '6563603586',
          departamento: 'administración',
          rol: directorRole._id
        });
        console.log('✅ Usuario Director actualizado');
      }

      // 4️⃣ Crear o actualizar Administrador -----------------------------------
      let admin = await User.findOne({
        email: 'servidordasti2025@dasti.com.mx'
      });
      if (!admin) {
        admin = await User.create({
          nombre: 'Administrador DASTI',
          email: 'servidordasti2025@dasti.com.mx',
          password: await bcrypt.hash('Dasti2025@', 10),
          telefono: '6567828767',
          departamento: 'administración',
          rol: adminRole._id
        });
        console.log('✅ Usuario Administrador creado');
      } else {
        await User.updateOne({
            _id: admin._id
          }, 
          {
            nombre: 'Administrador DASTI',
            telefono: '6567828767',
            departamento: 'administración',
            rol: adminRole._id
          }
      );
      console.log('✅ Usuario Administrador actualizado');
    }

    console.log('🎉 Todos los usuarios semilla han sido insertados o actualizados');
  } catch (err) {
    console.error('❌ Error al sembrar usuarios:', err.message);
  } finally {
    // 5️⃣ Cerrar conexión y salir
    await mongoose.disconnect();
    process.exit(0);
  }
})();