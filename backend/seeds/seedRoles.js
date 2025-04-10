const mongoose = require('mongoose');
const Role = require('../models/Role');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log("Conectado a la base de datos");

    const roles = [
      { nombre: "Director", descripcion: "Acceso a todas las operaciones", permisos: ["todo"] },
      { nombre: "Administrador", descripcion: "Gestión del sistema", permisos: ["gestionar_usuarios", "gestionar_configuraciones"] },
      { nombre: "Ventas", descripcion: "Acceso a operaciones de ventas", permisos: ["crear_cotizacion", "ver_clientes", "modificar_cotizacion"] },
      { nombre: "Diseño", descripcion: "Acceso a operaciones de diseño", permisos: ["crear_diseno", "modificar_diseno"] },
      { nombre: "Compras", descripcion: "Acceso a operaciones de compras", permisos: ["crear_pedido", "aprobar_pedido"] },
      { nombre: "Almacén", descripcion: "Acceso a stock y logística", permisos: ["ver_stock", "actualizar_inventario"] },
      { nombre: "Producción", descripcion: "Gestión de la producción", permisos: ["iniciar_produccion", "reportar_avance"] },
      { nombre: "Calidad", descripcion: "Control de calidad", permisos: ["inspeccionar_producto", "reportar_calidad"] },
      { nombre: "Administrativo", descripcion: "Soporte administrativo (finanzas, RH, etc.)", permisos: ["gestionar_finanzas", "gestionar_RH"] },
      { nombre: "Visitas", descripcion: "Acceso restringido a funciones de consulta", permisos: ["ver_informacion"] }
    ];

    // Borrar roles existentes para reinicializar (opcional)
    await Role.deleteMany({});
    
    // Insertar los nuevos roles
    await Role.insertMany(roles);
    console.log("Roles semilla insertados");
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
