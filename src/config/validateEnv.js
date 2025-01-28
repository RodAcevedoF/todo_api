import dotenv from 'dotenv';

// Carga las variables del archivo .env
dotenv.config();

// Lista de variables requeridas
const requiredEnvVars = [
  'JWT_SECRET',
  'DB_USER',
  'DB_PASSWORD',
  'DB_HOST',
  'DB_PORT',
  'DB_NAME',
  'PORT',
  'NODE_ENV'
];

// Validación de variables requeridas
requiredEnvVars.forEach((varName) => {
  if (!process.env[varName]) {
    throw new Error(`Missing environment variable: ${varName}`);
  }
});

// Validar valores aceptados para NODE_ENV
if (!['development', 'production', 'test'].includes(process.env.NODE_ENV)) {
  throw new Error(`Invalid NODE_ENV value: ${process.env.NODE_ENV}`);
}

console.log('Environment variables successfully validated.');
