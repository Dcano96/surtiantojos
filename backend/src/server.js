import app from './app.js';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';

// Cargar variables de entorno PRIMERO
dotenv.config();

// Conectar a Mongo
connectDB();

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});