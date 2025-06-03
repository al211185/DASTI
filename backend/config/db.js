const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      tlsInsecure: true           // ← clave p/ Cosmos vCore +srv desde local
    });
    console.log('✅ MongoDB conectado');
  } catch (err) {
    console.error('❌ Error al conectar a MongoDB:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
