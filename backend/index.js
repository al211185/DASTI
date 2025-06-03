// backend/index.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cookieParser = require('cookie-parser');
const path = require('path');
const http = require('http');

// Carga variables de entorno (.env)
dotenv.config();

// Conecta a la base de datos MongoDB
connectDB();

const app = express();

// Lista de orígenes permitidos (dev + prod)
const allowedOrigins = [
  'http://localhost:5173',
  'https://happy-wave-0e4981b10.6.azurestaticapps.net'
];

app.use(cors({
  origin: function(origin, callback) {
    // Permitir peticiones sin origin (Postman, servidor a servidor, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    callback(new Error('CORS policy: Acceso no permitido desde este origen'));
  },
  credentials: true,
  optionsSuccessStatus: 200,
}));

app.options('*', cors({
  origin: allowedOrigins,
  credentials: true,
}));

// Middleware para manejar cookies y JSON en el body
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

// Carpeta pública de uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ruta de prueba en la raíz
app.get('/', (_req, res) => {
  res.send('Bienvenido a la API de DASTY');
});

// Creamos el servidor HTTP a partir de Express
const server = http.createServer(app);

// Inicializa Socket.IO (si usas sockets)
const { init } = require('./socket');
init(server);

// Puerto que asignará Azure (process.env.PORT) o 8080 por defecto local
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
