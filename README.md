# 📚🎬📝 To-Do API - Libros, Videos y Tareas con Autenticación JWT

Bienvenido a la **To-Do API**, un backend completo construido con **Node.js**, **Express** y **PostgreSQL**, que permite a los usuarios:

✅ Gestionar tareas  
📘 Guardar y comentar libros  
📺 Organizar videos por categorías  
🔐 Registrarse e iniciar sesión con JWT  
📎 Subir archivos con Multer

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
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Registro de usuario |
| `POST` | `/api/auth/login` | Login con respuesta JWT |

### 📝 Tareas (To-Dos)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET`  | `/api/todos` | Obtener todas las tareas |
| `POST` | `/api/todos` | Crear nueva tarea |
| `PUT`  | `/api/todos/:id` | Editar tarea |
| `DELETE` | `/api/todos/:id` | Eliminar tarea |

### 📚 Libros
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET`  | `/api/books` | Obtener libros |
| `POST` | `/api/books` | Crear libro (permite subir archivo) |
| `PUT`  | `/api/books/:id` | Editar libro |
| `DELETE` | `/api/books/:id` | Eliminar libro |

### 🎬 Videos
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET`  | `/api/videos` | Obtener videos |
| `POST` | `/api/videos` | Crear video |
| `PUT`  | `/api/videos/:id` | Editar video |
| `DELETE` | `/api/videos/:id` | Eliminar video |

---

## 🔐 Autenticación con JWT

Una vez que un usuario se **registra o inicia sesión**, recibe un **token JWT** que debe incluir en cada solicitud protegida:

