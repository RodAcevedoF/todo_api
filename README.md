To-Do List API
Este repositorio contiene una API RESTful que permite gestionar tareas, libros y videos. Puedes crear, leer, actualizar y eliminar elementos en cada lista. Esta API está construida utilizando Node.js con Express y almacena los datos en una base de datos PostgreSQL.

Funcionalidades
La API permite realizar las siguientes acciones:

1. To-Dos
Crear una nueva tarea.

Obtener todas las tareas.

Actualizar el estado de una tarea.

Eliminar una tarea.

2. Lista de Libros
Agregar un libro con detalles como título, autor, y comentario.

Obtener todos los libros almacenados.

Actualizar los detalles de un libro.

Eliminar un libro.

3. Lista de Videos
Agregar un video con título, enlace y categorías.

Obtener todos los videos almacenados.

Actualizar los detalles de un video.

Eliminar un video.

Tecnologías
Node.js (para el servidor backend)

Express (para manejar las rutas y la lógica de la API)

PostgreSQL (base de datos)

JWT (para autenticación)

Bcrypt.js (para encriptación de contraseñas)

Axios (para hacer solicitudes HTTP en el frontend)

Endpoints
1. Autenticación
POST /api/auth/register: Registra un nuevo usuario.

POST /api/auth/login: Inicia sesión y devuelve un token JWT.

2. To-Dos
GET /api/todos: Obtiene todas las tareas.

POST /api/todos: Crea una nueva tarea.

PUT /api/todos/:id: Actualiza una tarea.

DELETE /api/todos/:id: Elimina una tarea.

3. Libros
GET /api/books: Obtiene la lista de libros.

POST /api/books: Crea un nuevo libro.

PUT /api/books/:id: Actualiza un libro.

DELETE /api/books/:id: Elimina un libro.

4. Videos
GET /api/videos: Obtiene la lista de videos.

POST /api/videos: Crea un nuevo video.

PUT /api/videos/:id: Actualiza un video.

DELETE /api/videos/:id: Elimina un video.

Requisitos
Tener Node.js y npm instalados.

Tener una base de datos PostgreSQL en funcionamiento.

Crear un archivo .env con las siguientes variables:

env
Copiar
Editar
PORT=5000
DATABASE_URL=postgres://usuario:contraseña@localhost:5432/nombre_base_de_datos
JWT_SECRET=tu_clave_secreta
Instalación
Clona el repositorio:

bash
Copiar
Editar
git clone https://github.com/tu_usuario/to-do-api.git
Navega al directorio del proyecto:

bash
Copiar
Editar
cd to-do-api
Instala las dependencias:

bash
Copiar
Editar
npm install
Crea las tablas en la base de datos:

Si estás utilizando PostgreSQL, asegúrate de haber creado la base de datos y ejecutado las migraciones para crear las tablas necesarias.

Inicia la API:

bash
Copiar
Editar
npm start
La API debería estar corriendo en http://localhost:5000.

Uso
Una vez que la API esté en funcionamiento, puedes probarla utilizando herramientas como Postman o Insomnia. Asegúrate de enviar un token JWT válido en el encabezado Authorization cuando interactúes con los endpoints que requieren autenticación.

Contribuciones
Las contribuciones son bienvenidas. Si tienes una sugerencia o corrección, no dudes en abrir un issue o enviar un pull request.

Licencia
Este proyecto está bajo la Licencia MIT. Consulta el archivo LICENSE para más detalles.

Este es un esquema básico de un README para tu API. Puedes personalizarlo según las funcionalidades y detalles específicos de tu proyecto. ¿Te gustaría que profundice en algún apartado?


2/2







Tú dijiste:
tambien tiene auth con jwt y uso de multer, puedes hacer el readme ya despues lo voy modificando


ChatGPT Plus
Claro, aquí tienes una versión más detallada del README que incluye autenticación con JWT y el uso de Multer para la carga de archivos. Puedes modificarlo según lo necesites.

To-Do List API
Este repositorio contiene una API RESTful que permite gestionar tareas (To-Dos), libros y videos. Además, incluye autenticación de usuarios utilizando JWT (JSON Web Token) y soporte para carga de archivos utilizando Multer. Está construida con Node.js, Express y almacena los datos en una base de datos PostgreSQL.

Funcionalidades
La API permite realizar las siguientes acciones:

1. Autenticación (JWT)
Registro de usuario: Permite a los usuarios registrarse.

Inicio de sesión: Los usuarios pueden iniciar sesión para obtener un token JWT.

2. To-Dos
Crear una nueva tarea.

Obtener todas las tareas.

Actualizar el estado de una tarea.

Eliminar una tarea.

3. Lista de Libros
Agregar un libro con detalles como título, autor, comentario y archivo (opcional).

Obtener todos los libros almacenados.

Actualizar los detalles de un libro.

Eliminar un libro.

4. Lista de Videos
Agregar un video con título, enlace y categorías.

Obtener todos los videos almacenados.

Actualizar los detalles de un video.

Eliminar un video.

5. Cargar Archivos
Los usuarios pueden cargar imágenes o archivos asociados a los libros (usando Multer para gestionar la carga de archivos).

Tecnologías
Node.js (para el servidor backend)

Express (para manejar las rutas y la lógica de la API)

PostgreSQL (base de datos)

JWT (para autenticación)

Bcrypt.js (para encriptación de contraseñas)

Multer (para cargar archivos)

Axios (para hacer solicitudes HTTP en el frontend)

Endpoints
1. Autenticación
POST /api/auth/register: Registra un nuevo usuario.

Body: { "username": "user", "password": "pass" }

POST /api/auth/login: Inicia sesión y devuelve un token JWT.

Body: { "username": "user", "password": "pass" }

Response: { "token": "jwt_token" }

2. To-Dos
GET /api/todos: Obtiene todas las tareas.

Autenticación requerida

POST /api/todos: Crea una nueva tarea.

Body: { "title": "Task", "description": "Description", "dueDate": "2025-01-01" }

Autenticación requerida

PUT /api/todos/:id: Actualiza una tarea.

Body: { "title": "Updated Task", "completed": true }

Autenticación requerida

DELETE /api/todos/:id: Elimina una tarea.

Autenticación requerida

3. Libros
GET /api/books: Obtiene la lista de libros.

Autenticación requerida

POST /api/books: Crea un nuevo libro con la opción de cargar un archivo (usando Multer).

Body: { "title": "Book Title", "author": "Author", "comment": "Comment", "file": "file_path" }

Autenticación requerida

PUT /api/books/:id: Actualiza un libro.

Body: { "title": "Updated Book", "author": "Updated Author" }

Autenticación requerida

DELETE /api/books/:id: Elimina un libro.

Autenticación requerida

4. Videos
GET /api/videos: Obtiene la lista de videos.

Autenticación requerida

POST /api/videos: Crea un nuevo video.

Body: { "title": "Video Title", "link": "video_url", "category": "Category" }

Autenticación requerida

PUT /api/videos/:id: Actualiza un video.

Body: { "title": "Updated Video", "link": "new_video_url" }

Autenticación requerida

DELETE /api/videos/:id: Elimina un video.

Autenticación requerida

5. Carga de Archivos con Multer
POST /api/upload: Permite la carga de archivos (por ejemplo, una imagen asociada a un libro).

Body: Formulario de carga de archivos con multipart/form-data

Autenticación requerida

Requisitos
Tener Node.js y npm instalados.

Tener una base de datos PostgreSQL en funcionamiento.

Crear un archivo .env con las siguientes variables:

env
Copiar
Editar
PORT=5000
DATABASE_URL=postgres://usuario:contraseña@localhost:5432/nombre_base_de_datos
JWT_SECRET=tu_clave_secreta
UPLOAD_DIR=uploads/
Instalación
Clona el repositorio:

bash
Copiar
Editar
git clone https://github.com/tu_usuario/to-do-api.git
Navega al directorio del proyecto:

bash
Copiar
Editar
cd to-do-api
Instala las dependencias:

bash
Copiar
Editar
npm install
Crea las tablas en la base de datos:

Si estás utilizando PostgreSQL, asegúrate de haber creado la base de datos y ejecutado las migraciones para crear las tablas necesarias.

Inicia la API:

bash
Copiar
Editar
npm start
La API debería estar corriendo en http://localhost:5000.

Uso
Una vez que la API esté en funcionamiento, puedes probarla utilizando herramientas como Postman o Insomnia. Asegúrate de enviar un token JWT válido en el encabezado Authorization cuando interactúes con los endpoints que requieren autenticación.

Ejemplo de autenticación
Para iniciar sesión y obtener un JWT, realiza una solicitud POST a /api/auth/login con las credenciales del usuario.

Body:

json
Copiar
Editar
{
  "username": "user",
  "password": "password"
}
Response:

json
Copiar
Editar
{
  "token": "jwt_token"
}
Usa este token en los encabezados Authorization para las solicitudes autenticadas.

Contribuciones
Las contribuciones son bienvenidas. Si tienes una sugerencia o corrección, no dudes en abrir un issue o enviar un pull request.

Licencia
Este proyecto está bajo la Licencia MIT. Consulta el archivo LICENSE para más detalles.
