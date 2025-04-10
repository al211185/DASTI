const User = require('../models/User');
const Role = require('../models/Role');

exports.getVendedores = async (req, res) => {
  try {
    // Buscar el rol "Ventas"
    const ventasRole = await Role.findOne({ nombre: "Ventas" });
    if (!ventasRole) {
      return res.status(404).json({ msg: "Rol de Ventas no encontrado" });
    }

    // Filtrar usuarios cuyo campo 'rol' coincide con el _id del rol de "Ventas"
    const vendedores = await User.find({ rol: ventasRole._id })
                                 .select('nombre _id');
    res.json(vendedores);
  } catch (error) {
    console.error('Error al obtener vendedores:', error);
    res.status(500).json({ msg: 'Error al obtener vendedores', error: error.message });
  }
};
