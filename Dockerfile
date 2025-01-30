# Usar imagen base de Node.js
FROM node:18

# Establecer directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar archivos de dependencias
COPY package.json package-lock.json ./

# Instalar dependencias de producción
RUN npm ci --only=production

# Copiar el resto del código de la aplicación
COPY . .

# Configurar variable de entorno para producción
ENV NODE_ENV=production

# Usar el puerto que Back4App asigne automáticamente
CMD ["node", "index.js"]
