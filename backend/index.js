// index.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cookieParser = require('cookie-parser');
const path = require('path');
const http = require('http');

// Ya no importas Server de socket.io ni jwt/User aquí
// const { Server } = require('socket.io');
// const jwt = require('jsonwebtoken');
// const User = require('./models/User');

dotenv.config();
connectDB();

const app = express();

// CORS
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200,
}));
app.options('*', cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

// Cookies + JSON
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

// Carpeta de uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (_req, res) => {
  res.send('Bienvenido a la API de DASTY');
});

// Creamos servidor HTTP con Express
const server = http.createServer(app);

// En lugar de new Server(...) aquí, invocamos a socket.js:
const { init } = require('./socket');
init(server);

// Ya no exportamos `io` desde index.js. Los controladores usarán getIO() desde socket.js.

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
