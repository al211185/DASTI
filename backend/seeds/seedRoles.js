// seeds/seedRoles.js
const mongoose = require('mongoose');
const Role = require('../models/Role');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log("Conectado a la base de datos");

  const roles = [
    {
      nombre: "director",
      descripcion: "Acceso a todas las operaciones",
      permisos: ["todo"]
    },
    {
      nombre: "administrador",
      descripcion: "Acceso completo al sistema",
      permisos: ["todo"]
    },
    {
      nombre: "vendedores",
      descripcion: "Acceso parcial para crear y ver sus cotizaciones",
      permisos: [
        // Nueva Cotización
        "cotizacion:create",
        "cotizacion:view",
        "cotizacion:material",
        "cotizacion:documents",
        "cotizacion:descripcion",
        "cotizacion:cantidad",
        // Lista Cotizaciones (lectura de casi todo)
        "cotizacion:list",
        "cotizacion:view:others?approval"  // editar/borrar requiere aprobación
      ]
    },
    {
      nombre: "jefe de produccion",
      descripcion: "Gestiona documentos y tiempos de máquinas",
      permisos: [
        "cotizacion:documents",
        "cotizacion:times"
      ]
    },
    {
      nombre: "disenador",
      descripcion: "Gestiona documentos y tiempos de diseño",
      permisos: [
        "cotizacion:documents",
        "cotizacion:times:design"
      ]
    },
    {
      nombre: "compras",
      descripcion: "Registra materiales, categorías y proveedores",
      permisos: [
        "registro:material",
        "registro:categoria",
        "registro:proveedor"
      ]
    },
    {
      nombre: "almacen",
      descripcion: "Gestiona inventario y stock",
      permisos: [
        "registro:material",
        "registro:categoria",
        "registro:proveedor"
      ]
    }
  ];

  // Limpia la colección y vuelve a sembrar
  await Role.deleteMany({});
  await Role.insertMany(roles);

  console.log("Roles semilla insertados correctamente");
  process.exit(0);
})
.catch(err => {
  console.error("Error al sembrar roles:", err);
  process.exit(1);
});
