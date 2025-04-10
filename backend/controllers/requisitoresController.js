const Cliente = require('../models/Cliente');

exports.getRequisitores = async (req, res) => {
  try {
    // Buscar clientes que tengan definido contactoPrincipal.nombre
    const clientes = await Cliente.find({ "contactoPrincipal.nombre": { $exists: true, $ne: null } })
                                  .select('contactoPrincipal');
    // Extraer los nombres de los contactos principales
    const requisitores = clientes
      .map((cliente) => cliente.contactoPrincipal?.nombre)
      .filter((nombre) => !!nombre); // Filtra valores nulos o vacíos

    // Para evitar duplicados, opcionalmente puedes usar:
    const uniqueRequisitores = [...new Set(requisitores)];

    res.json(uniqueRequisitores);
  } catch (error) {
    console.error('Error al obtener requisitores:', error);
    res.status(500).json({ msg: 'Error al obtener requisitores', error: error.message });
  }
};
