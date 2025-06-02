// index.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cookieParser = require('cookie-parser');
const path = require('path');

// Para Socket.io
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('./models/User'); // Ajusta la ruta según tu proyecto

// Inicializar variables de entorno y conectar a base de datos
dotenv.config();
connectDB();

const app = express();

// Middleware de CORS: se debe aplicar antes de definir las rutas
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200,
}));
app.options('*', cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

// Middleware para parsear cookies y JSON
app.use(cookieParser());
app.use(express.json());

// Rutas de la API
app.use('/api/auth', require('./routes/auth'));
app.use('/api/cotizaciones', require('./routes/cotizaciones'));
app.use('/api/user', require('./routes/user'));
app.use('/api/clientes', require('./routes/clienteRoutes'));
app.use('/api/roles', require('./routes/roleRoutes'));
app.use('/api/plantas', require('./routes/plantasRoutes'));
app.use('/api/vendedores', require('./routes/vendedoresRoutes'));
app.use('/api/requisitores', require('./routes/requisitoresRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/materiales', require('./routes/materiales'));
app.use('/api/maquinas', require('./routes/maquinasRoutes'));
app.use('/api/proveedores', require('./routes/proveedorRoutes'));
app.use('/api/categorias', require('./routes/categoriasRoutes'));
app.use('/api/notificaciones', require('./routes/notificaciones'));


// Sirve la carpeta de archivos subidos (uploads) de forma estática
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ruta raíz de prueba
app.get('/', (req, res) => {
  res.send('Bienvenido a la API de DASTY');
});

// Creamos un servidor HTTP a partir de la app de Express
const server = http.createServer(app);

// Inicializamos Socket.io sobre ese servidor HTTP
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    credentials: true
  }
});

// Middleware de autenticación para Socket.io (verifica JWT)
io.use(async (socket, next) => {
  try {
    // El front-end debe enviar el token JWT al conectar el socket, por ejemplo:
    // const socket = io(API_URL, { auth: { token: myJwtToken } });
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Falta token de autenticación'));
    }
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id).lean();
    if (!user) {
      return next(new Error('Usuario inválido'));
    }
    // Guardamos datos útiles en socket.user
    socket.user = {
      id: user._id.toString(),
      rol: user.rol.nombre.toLowerCase()
    };
    next();
  } catch (err) {
    console.error('Error de autenticación socket:', err.message);
    next(new Error('Error de autenticación'));
  }
});

// Al conectar cada socket, lo unimos a “rooms” según rol y userId
io.on('connection', (socket) => {
  const { id: userId, rol } = socket.user;

  // Si es administrador o director, entra al room "admin"
  if (rol === 'administrador' || rol === 'director') {
    socket.join('admin');
  }

  // Todos se unen a su room personal "user_<userId>"
  socket.join(`user_${userId}`);

  console.log(`Socket conectado: ${userId} (rol: ${rol})`);

  socket.on('disconnect', () => {
    console.log(`Socket desconectado: ${userId}`);
  });
});

// Exportamos la instancia io para usarla en controladores
module.exports = { io };

// Finalmente arrancamos el servidor HTTP (en lugar de app.listen)
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
