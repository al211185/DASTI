// controllers/proveedorController.js
const mongoose = require('mongoose');

const Proveedor = require('../models/Proveedor');

// Crear un proveedor
exports.createProveedor = async (req, res) => {
  try {
    const {
      nombre,
      comentarios,
      catalogo,
      ciudad,
      formaPago,
      sitioWeb,
      direccion,
      telefonoOficina,
      telefonoWhatsapp,
      contactoNombre,
      razonSocial,
      clabeInterbancaria,
      materiales,      // Arreglo de ofertas de materiales, p.ej. [{ material, precioUnitario }]
      datosFiscales    // Objeto, por ejemplo { rfc, domicilioFiscal }
    } = req.body;

    // Crea el proveedor con su información completa, incluyendo el arreglo de materiales
    const nuevoProveedor = new Proveedor({
      nombre,
      comentarios,
      catalogo,
      ciudad,
      formaPago,
      sitioWeb,
      direccion,
      telefonoOficina,
      telefonoWhatsapp,
      contactoNombre,
      razonSocial,
      clabeInterbancaria,
      materiales,   // Aquí se espera que sea un arreglo, por ejemplo:
                    // [
                    //   { material: "606d9c...", precioUnitario: 50 },
                    //   { material: "606d9c...", precioUnitario: 45 }
                    // ]
      datosFiscales
    });

    const proveedorGuardado = await nuevoProveedor.save();
    res.status(201).json({ msg: 'Proveedor creado correctamente', proveedor: proveedorGuardado });
  } catch (error) {
    console.error('Error al crear proveedor:', error);
    res.status(500).json({ msg: 'Error al crear proveedor', error: error.message });
  }
};

// Obtener proveedores (opcional: filtrar por un material ofrecido)
exports.getProveedores = async (req, res) => {
  try {
    // Opcional: si se pasa el query "material", se pueden filtrar proveedores que tengan ese material en su arreglo.
    // Esto se puede lograr con la sintaxis de query en arreglos.
    let filtro = {};
    if (req.query.material) {
      filtro = { 
        "materiales.material": req.query.material 
      };
    }

    // Puedes usar populate para obtener la información completa del material.
    const proveedores = await Proveedor.find(filtro)
      .populate('materiales.material')
      .sort({ fechaActualizacion: -1 });
    res.json(proveedores);
  } catch (error) {
    console.error('Error al obtener proveedores:', error);
    res.status(500).json({ msg: 'Error al obtener proveedores', error: error.message });
  }
};
