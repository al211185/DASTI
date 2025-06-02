// backend/socket.js
let ioInstance = null;

module.exports = {
  init: (httpServer) => {
    const { Server } = require('socket.io');
    ioInstance = new Server(httpServer, {
      cors: {
        origin: 'http://localhost:5173',
        credentials: true
      }
    });

    ioInstance.use(async (socket, next) => {
      const jwt = require('jsonwebtoken');
      const User = require('./models/User');
      try {
        const token = socket.handshake.auth.token;
        if (!token) throw new Error('Falta token de autenticación');
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(payload.id).lean();
        if (!user) throw new Error('Usuario inválido');
        socket.user = {
          id: user._id.toString(),
          rol: user.rol.nombre.toLowerCase()
        };
        next();
      } catch (err) {
        next(new Error('Error de autenticación'));
      }
    });

    ioInstance.on('connection', (socket) => {
      const { id: userId, rol } = socket.user;
      if (rol === 'administrador' || rol === 'director') {
        socket.join('admin');
      }
      socket.join(`user_${userId}`);
      socket.on('disconnect', () => {
        console.log(`Socket desconectado: ${userId}`);
      });
    });

    return ioInstance;
  },
  getIO: () => {
    if (!ioInstance) {
      throw new Error('Socket.io no ha sido inicializado. Llama primero a init().');
    }
    return ioInstance;
  }
};
