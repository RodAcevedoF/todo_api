
# 📚🎬📝 To-Do API - Libros, Videos y Tareas con Autenticación JWT

Bienvenido a la **To-Do API**, un backend completo construido con **Node.js**, **Express** y **PostgreSQL**, que permite a los usuarios:

- ✅ Gestionar tareas  
- 📘 Guardar y comentar libros  
- 📺 Organizar videos por categorías  
- 🔐 Registrarse e iniciar sesión con JWT  
- 📎 Subir archivos con Multer

---

## 🚀 Tecnologías Utilizadas

- 🟩 Node.js  
- ⚡ Express.js  
- 🐘 PostgreSQL  
- 🔐 JWT (Json Web Token)  
- 🔒 Bcrypt.js  
- 📦 Multer (para carga de archivos)  
- 🌐 CORS, Dotenv, Body-parser

---

## 📂 Estructura de la API

### 🔐 Autenticación

| Método | Endpoint             | Descripción                |
|--------|----------------------|----------------------------|
| POST   | `/api/auth/register` | Registro de usuario        |
| POST   | `/api/auth/login`    | Login con respuesta JWT    |

### 📝 Tareas (To-Dos)

| Método | Endpoint           | Descripción             |
|--------|--------------------|-------------------------|
| GET    | `/api/todos`       | Obtener todas las tareas |
| POST   | `/api/todos`       | Crear nueva tarea        |
| PUT    | `/api/todos/:id`   | Editar tarea             |
| DELETE | `/api/todos/:id`   | Eliminar tarea           |

### 📚 Libros

| Método | Endpoint            | Descripción               |
|--------|---------------------|---------------------------|
| GET    | `/api/books`        | Obtener libros            |
| POST   | `/api/books`        | Crear libro (con archivo) |
| PUT    | `/api/books/:id`    | Editar libro              |
| DELETE | `/api/books/:id`    | Eliminar libro            |

### 🎬 Videos

| Método | Endpoint             | Descripción     |
|--------|----------------------|-----------------|
| GET    | `/api/videos`        | Obtener videos  |
| POST   | `/api/videos`        | Crear video     |
| PUT    | `/api/videos/:id`    | Editar video    |
| DELETE | `/api/videos/:id`    | Eliminar video  |

---

## 🔐 Autenticación con JWT

Una vez que un usuario se **registra o inicia sesión**, recibe un **token JWT** que debe incluir en cada solicitud protegida:

```
Authorization: Bearer TU_TOKEN_AQUÍ
```

---

## 📎 Subida de Archivos

Puedes subir archivos (por ejemplo, portadas de libros) usando el endpoint:

```
POST /api/books
Content-Type: multipart/form-data
```

---

## ⚙️ Configuración

1. Clona el repositorio:

```bash
git clone https://github.com/tu_usuario/to-do-api.git
cd to-do-api
```

2. Instala las dependencias:

```bash
npm install
```

3. Crea el archivo `.env`:

```env
PORT=5000
DATABASE_URL=postgres://usuario:contraseña@localhost:5432/tu_db
JWT_SECRET=tu_clave_secreta
UPLOAD_DIR=uploads/
```

4. Inicia el servidor:

```bash
npm start
```

---

## 🧪 Ejemplo de Solicitud de Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "rodrigo",
  "password": "123456"
}
```

🔁 Respuesta:

```json
{
  "token": "jwt_token_aquí"
}
```

---

## 🛠 Próximas Mejoras

- 🔄 Refresh tokens  
- 🗃️ Paginación de resultados  
- 🔍 Búsqueda y filtrado avanzado  
- 📱 Documentación Swagger  

---

## 🤝 Contribuciones

¿Ideas o mejoras? ¡Haz un fork y crea un pull request!  
También puedes abrir un issue si encuentras algún bug 🐞.

---

## 📄 Licencia

MIT © Rodrigo

---

> ¿Te gustó este proyecto? 🌟 ¡No olvides darle una estrella en GitHub!
