// middlewares/authorize.js
module.exports = function (...rolesPermitidos) {
    return (req, res, next) => {
      // Suponemos que req.user.rol está poblado y contiene la propiedad "nombre"
      const userRoleName = req.user.rol && req.user.rol.nombre 
        ? req.user.rol.nombre.toLowerCase() 
        : '';
      
      // Convertir roles permitidos a minúsculas para evitar problemas de mayúsculas/minúsculas
      const rolesPermitidosLower = rolesPermitidos.map(role => role.toLowerCase());
      
      if (!rolesPermitidosLower.includes(userRoleName)) {
        return res.status(403).json({ msg: 'Acceso denegado: No tienes permisos para registrar usuarios' });
      }
      
      next();
    };
  };
  