const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async function (req, res, next) {
  // Intenta obtener el token del header o de la cookie
  const token = req.header('x-auth-token') || req.cookies.token;
  if (!token) {
    console.log('No se encontró token');
    return res.status(401).json({ msg: 'No hay token, autorización denegada' });
  }

  // Log para verificar el token recibido y el JWT_SECRET
  console.log('Token recibido:', token);
  console.log('JWT_SECRET configurado:', process.env.JWT_SECRET);

  try {
    // Verifica y decodifica el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET, { clockTolerance: 5 });
    console.log('Token decodificado:', decoded);

    // Obtener el usuario completo y poblar el rol
    const user = await User.findById(decoded.id).populate('rol');
    if (!user) {
      return res.status(401).json({ msg: 'Usuario no encontrado, autorización denegada' });
    }
    req.user = user;
    next();
  } catch (err) {
    console.error("Error en la verificación del token:", err.message);
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ msg: 'Token expirado' });
    } else if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ msg: 'Token inválido' });
    }
    return res.status(401).json({ msg: 'Token no válido' });
  }    
};
