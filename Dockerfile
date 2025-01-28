# Imagen base oficial de Node.js
FROM node:18

# Establecer directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar los archivos de dependencias
COPY package*.json ./

# Instalar dependencias (producción únicamente)
RUN npm install --production

# Copiar el resto de los archivos del proyecto
COPY . .

# Exponer el puerto que usa tu aplicación
EXPOSE 8080

# Comando para iniciar la aplicación
CMD ["npm", "start"]
