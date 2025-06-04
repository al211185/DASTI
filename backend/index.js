// backend/index.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cookieParser = require('cookie-parser');
const path = require('path');
const http = require('http');

// ─── 1) Carga variables de entorno según NODE_ENV ────────────────────────────
// Si no existe process.env.NODE_ENV, asumimos 'development'
const envFile = `.env.${process.env.NODE_ENV || 'development'}`;
dotenv.config({ path: envFile });

// ─── 2) Conecta a la base de datos MongoDB usando process.env.MONGO_URI ───────
connectDB();

const app = express();

// ─── 3) Lista de orígenes permitidos (dev + prod) ────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',                                      // React local
  'https://happy-wave-0e4981b10.6.azurestaticapps.net',         // React en Azure static
  'https://dastiapp-czcsfba8dra4b3c4.azurewebsites.net',        // API en Azure (dominio principal)
  'https://dastiapp-czcsfba8dra4b3c4.centralus-01.azurewebsites.net' // API en Azure (slot central)
];

// ─── 4) Middleware CORS con credenciales ────────────────────────────────────
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    optionsSuccessStatus: 200
  })
);
app.options('*', cors({ origin: allowedOrigins, credentials: true }));

// ─── 5) Middleware para cookies y JSON ───────────────────────────────────────
app.use(cookieParser());
app.use(express.json());

// ─── 6) Rutas de la API ──────────────────────────────────────────────────────
app.use('/api/auth',           require('./routes/auth'));
app.use('/api/cotizaciones',    require('./routes/cotizaciones'));
app.use('/api/user',           require('./routes/user'));
app.use('/api/clientes',       require('./routes/clienteRoutes'));
app.use('/api/roles',          require('./routes/roleRoutes'));
app.use('/api/plantas',        require('./routes/plantasRoutes'));
app.use('/api/vendedores',     require('./routes/vendedoresRoutes'));
app.use('/api/requisitores',   require('./routes/requisitoresRoutes'));
app.use('/api/upload',         require('./routes/uploadRoutes'));
app.use('/api/materiales',     require('./routes/materiales'));
app.use('/api/maquinas',       require('./routes/maquinasRoutes'));
app.use('/api/proveedores',    require('./routes/proveedorRoutes'));
app.use('/api/categorias',     require('./routes/categoriasRoutes'));
app.use('/api/notificaciones', require('./routes/notificaciones'));

// ─── 7) Carpeta pública de uploads ───────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── 8) Ruta de prueba ───────────────────────────────────────────────────────
app.get('/', (_req, res) => {
  res.send('Bienvenido a la API de DASTY');
});

// ─── 9) Creamos el servidor HTTP y Socket.IO ─────────────────────────────────
const server = http.createServer(app);
const { init } = require('./socket');
init(server);

// ─── 10) Puerto según entorno: Azure pondrá process.env.PORT en producción ───
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(
    `Servidor corriendo en modo "${process.env.NODE_ENV || 'development'}" → http://localhost:${PORT}`
  );
});
