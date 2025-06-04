// seeds/seedRoles.js

const mongoose = require('mongoose');
const Role = require('../models/Role');

(async () => {
  try {
    // Conéctate usando la variable que Azure inyecta: MONGODB_URI
    await mongoose.connect(process.env.MONGO_URI, {
      tlsAllowInvalidHostnames: true,   // clave para Cosmos vCore +srv, si aplica
      serverSelectionTimeoutMS: 30000   // evita timeouts muy cortos
    });
    console.log('🔌 Conectado a la base de datos');

    // Datos a sembrar
    const roles = [
      { nombre: 'director',      descripcion: 'Acceso a todas las operaciones', permisos: ['todo'] },
      { nombre: 'administrador', descripcion: 'Acceso completo al sistema',     permisos: ['todo'] },
      {
        nombre: 'vendedores',
        descripcion: 'Acceso parcial para crear y ver sus cotizaciones',
        permisos: [
          'cotizacion:create', 'cotizacion:view', 'cotizacion:material',
          'cotizacion:documents', 'cotizacion:descripcion', 'cotizacion:cantidad',
          'cotizacion:list', 'cotizacion:view:others?approval'
        ]
      },
      {
        nombre: 'jefe de produccion',
        descripcion: 'Gestiona documentos y tiempos de máquinas',
        permisos: ['cotizacion:documents', 'cotizacion:times']
      },
      {
        nombre: 'disenador',
        descripcion: 'Gestiona documentos y tiempos de diseño',
        permisos: ['cotizacion:documents', 'cotizacion:times:design']
      },
      {
        nombre: 'compras',
        descripcion: 'Registra materiales, categorías y proveedores',
        permisos: ['registro:material', 'registro:categoria', 'registro:proveedor']
      },
      {
        nombre: 'almacen',
        descripcion: 'Gestiona inventario y stock',
        permisos: ['registro:material', 'registro:categoria', 'registro:proveedor']
      }
    ];

    // Elimina roles existentes y los inserta de nuevo
    await Role.deleteMany({});
    await Role.insertMany(roles);

    console.log('🎉 Roles semilla insertados correctamente');
  } catch (err) {
    console.error('❌ Error al sembrar roles:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
})();
