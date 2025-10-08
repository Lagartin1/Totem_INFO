
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from "path";
import { fileURLToPath } from "url";

// 1. Convierte import.meta.url en ruta de archivo
const __filename = fileURLToPath(import.meta.url);

// 2. Obtén el directorio del archivo
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, "../config/.env");
console.log("Cargando .env desde:", envPath);
dotenv.config({ path: envPath });


const mongoUrl = process.env.MONGODB_URL;
if (!mongoUrl) {
  throw new Error("MONGODB_URL no está definido en las variables de entorno");
}
console.log("Conectando a MongoDB en:", mongoUrl);  
// Create a single instance of PrismaClient
export const mongoClient = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'], // opcional: logs útiles
});


