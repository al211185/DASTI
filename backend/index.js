const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cookieParser = require('cookie-parser');

const path = require('path');

require('./models/Role');

dotenv.config();
connectDB();

const app = express();

// Middleware de CORS: se debe aplicar antes de definir las rutas
// Configuración de CORS con opciones adicionales
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200,
}));

// Responder a todas las solicitudes OPTIONS
app.options('*', cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));


// Middleware para parsear cookies
app.use(cookieParser());

// Middleware para parsear el body (JSON)
app.use(express.json());

// Rutas de la API
app.use('/api/auth', require('./routes/auth'));
app.use('/api/cotizaciones', require('./routes/cotizaciones'));
app.use('/api/user', require('./routes/user'));
app.use('/api/clientes', require('./routes/clienteRoutes'));  // <-- Nueva ruta
app.use('/api/roles', require('./routes/roleRoutes'));  // Agrega esta línea para que la ruta /api/roles funcione
app.use('/api/plantas', require('./routes/plantasRoutes'));
app.use('/api/vendedores', require('./routes/vendedoresRoutes'));
app.use('/api/requisitores', require('./routes/requisitoresRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/materiales', require('./routes/materiales'));
app.use('/api/maquinas', require('./routes/maquinasRoutes'));

app.use('/api/proveedores', require('./routes/proveedorRoutes'));
app.use('/api/categorias', require('./routes/categoriasRoutes'));



// Sirve la carpeta de archivos subidos (uploads) de forma estática
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.get('/', (req, res) => {
  res.send('Bienvenido a la API de DASTY');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor Backend corriendo en http://localhost:${PORT}`);
});
