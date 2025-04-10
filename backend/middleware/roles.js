module.exports = function (...rolesPermitidos) {
    return (req, res, next) => {
      if (!rolesPermitidos.includes(req.user.rol)) {
        return res.status(403).json({ msg: 'Acceso denegado. Rol insuficiente.' });
      }
      next();
    };
  };
  