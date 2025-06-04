// seeds/seedUsers.js

const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const User     = require('../models/User');
const Role     = require('../models/Role');

(async () => {
  try {
    // 1️⃣ Conectar usando MONGO_URI que Azure inyecta (apunta a la BD “test”)
    await mongoose.connect(process.env.MONGO_URI, {
      tlsInsecure: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('🔌 Conectado a la base de datos');

    // ─── Sincronizar el contador de empleadoID ────────────────────────────────
    // 2️⃣ Obtener el documento con el mayor empleadoID actual
    const maxDoc = await User.findOne().sort({ empleadoID: -1 }).lean();
    const maxID  = maxDoc ? maxDoc.empleadoID : 0;

    const legacyFilter = { _id: 'users_empleadoID' };
    const legacyDoc    = await counters.findOne(legacyFilter);

    const filter = legacyDoc
      ? legacyFilter
      : { id: 'empleadoID', reference_value: null };


    if (legacyDoc) {
      console.log('ℹ️ Contador en formato antiguo detectado');
    }
      { $set: { seq: maxID } },
      { upsert: true }
    );
    console.log(`🔧 Contador sincronizado a ${maxID} (próximo será ${maxID + 1})`);
    if (useOld) console.log('ℹ️ Contador en formato antiguo detectado');
    // ──────────────────────────────────────────────────────────────────────────

    // 4️⃣ Obtener los roles “director” y “administrador” (deben existir previamente)
    const directorRole = await Role.findOne({ nombre: 'director' });
    const adminRole    = await Role.findOne({ nombre: 'administrador' });
    if (!directorRole || !adminRole) {
      throw new Error('Roles “director” y/o “administrador” no encontrados');
    }

    // 5️⃣ Crear o actualizar “Victor Moreno”
    let director = await User.findOne({ email: 'vmoreno@dasti.com.mx' });
    if (!director) {
      director = await User.create({
        nombre:      'Victor Moreno',
        email:       'vmoreno@dasti.com.mx',
        password:    await bcrypt.hash('VmDasti2025@', 10),
        telefono:    '6563603586',
        departamento:'administración',
        rol:         directorRole._id
        // NO enviamos empleadoID: mongoose-sequence lo genera
      });
      console.log('✅ Usuario Director creado (empleadoID: ' + director.empleadoID + ')');
    } else {
      await User.updateOne(
        { _id: director._id },
        {
          nombre:      'Victor Moreno',
          telefono:    '6563603586',
          departamento:'administración',
          rol:         directorRole._id
        }
      );
      console.log('✅ Usuario Director actualizado (empleadoID: ' + director.empleadoID + ')');
    }

    // 6️⃣ Crear o actualizar “Administrador DASTI”
    let admin = await User.findOne({ email: 'servidordasti2025@dasti.com.mx' });
    if (!admin) {
      admin = await User.create({
        nombre:      'Administrador DASTI',
        email:       'servidordasti2025@dasti.com.mx',
        password:    await bcrypt.hash('Dasti2025@', 10),
        telefono:    '6567828767',
        departamento:'administración',
        rol:         adminRole._id
        // Tampoco enviamos empleadoID: lo genera el plugin
      });
      console.log('✅ Usuario Administrador creado (empleadoID: ' + admin.empleadoID + ')');
    } else {
      await User.updateOne(
        { _id: admin._id },
        {
          nombre:      'Administrador DASTI',
          telefono:    '6567828767',
          departamento:'administración',
          rol:         adminRole._id
        }
      );
      console.log('✅ Usuario Administrador actualizado (empleadoID: ' + admin.empleadoID + ')');
    }

    console.log('🎉 Todos los usuarios semilla han sido insertados o actualizados');
  } catch (err) {
    console.error('❌ Error al sembrar usuarios:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
})();
