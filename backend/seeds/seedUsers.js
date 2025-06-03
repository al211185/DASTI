// seeds/seedUsers.js

const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const User     = require('../models/User');
const Role     = require('../models/Role');

(async () => {
  try {
    // 1️⃣ Conectar usando MONGO_URI que Azure inyecta
    await mongoose.connect(process.env.MONGO_URI, {
      tlsInsecure: true,  // si tu base requiere ignorar mismatch de hostname (por Cosmos DB vCore +srv)
      // podrías agregar serverSelectionTimeoutMS, useNewUrlParser, etc. si es necesario
    });
    console.log('🔌 Conectado a la base de datos');

    // 2️⃣ Obtener los roles “director” y “administrador” que ya deberían existir
    const directorRole = await Role.findOne({ nombre: 'director' });
    const adminRole    = await Role.findOne({ nombre: 'administrador' });

    if (!directorRole || !adminRole) {
      throw new Error('Roles “director” y/o “administrador” no encontrados');
    }

    // 3️⃣ Upsert Director ----------------------------------------------------
    await User.updateOne(
      { email: 'vmoreno@dasti.com.mx' },  // filtro por email
      {
        $set: {                          // campos a actualizar siempre
          nombre:       'Victor Moreno',
          empleadoID:   1,
          telefono:     '6563603586',
          departamento: 'administración',
          rol:          directorRole._id
        },
        $setOnInsert: {                  // sólo la primera vez que se inserte
          password: await bcrypt.hash('VmDasti2025@', 10)
        }
      },
      { upsert: true }
    );
    console.log('✅ Usuario Director preparado');

    // 4️⃣ Upsert Administrador -----------------------------------------------
    await User.updateOne(
      { email: 'servidordasti2025@dasti.com.mx' }, // filtro por email
      {
        $set: {                                   // campos a actualizar siempre
          nombre:       'Administrador DASTI',
          empleadoID:   2,
          telefono:     '6567828767',
          departamento: 'administración',
          rol:          adminRole._id
        },
        $setOnInsert: {                           // sólo la primera vez
          password: await bcrypt.hash('Dasti2025@', 10)
        }
      },
      { upsert: true }
    );
    console.log('✅ Usuario Administrador preparado');

    console.log('🎉 Todos los usuarios semilla han sido insertados o actualizados');
  } catch (err) {
    console.error('❌ Error al sembrar usuarios:', err.message);
  } finally {
    // 5️⃣ Cerrar conexión y salir
    await mongoose.disconnect();
    process.exit(0);
  }
})();
