# 📦 Todo API

A complete RESTful API built with **Express** and **PostgreSQL**, allowing users to authenticate and manage tasks, books, and videos. Includes JWT authentication with refresh tokens, file uploads (Multer), Swagger documentation, and is Docker-ready.

---

## 🚀 Main Features

- ✅ JWT + Refresh Token authentication
- 📋 CRUD for To-Dos
- 📚 CRUD for Books
- 🎥 CRUD for Videos
- 📂 File uploads using **Multer**
- 🛡️ HTTP security with **Helmet**
- 🧱 Environment variable validation
- 📈 Swagger documentation at `/api-docs`
- 🐳 Docker support for production
- 🖥️ Deployed on VPS with PostgreSQL
- 🔄 Custom logger and error handler
- 🔐 Rate limiting on sensitive routes
- 🔧 Compression, CORS, logging

---

## 📁 Project Structure

```
todo_api/
│
├── src/
│   ├── config/          # DB, environment, logger, swagger configs
│   ├── controllers/     # Entity logic
│   ├── middlewares/     # Auth, error handler, rate limiting, etc.
│   ├── models/          # Data schemas (no ORM)
│   ├── routes/          # API routes
│   └── services/        # Business logic
│
├── uploads/             # Uploaded user files
├── Dockerfile           # Docker build file
├── .env                 # Environment variables
├── README.md            # This file 📄
└── main.js              # Entry point
```

---

## 🔑 Authentication

All protected routes require `Authorization: Bearer <token>`.

- `POST /api/auth/register` – Register a new user
- `POST /api/auth/login` – Login and receive token + refresh token
- `POST /api/auth/refresh-token` – Get a new access token
- `GET /api/auth/profile` – Get authenticated user profile
- `POST /api/auth/logout` – Invalidate refresh token (coming)

---

## ✅ To-Do Routes

- `GET /api/todos` – Get all tasks
- `POST /api/todos` – Create a task
- `PUT /api/todos/:id` – Update a task
- `DELETE /api/todos/:id` – Delete a task

---

## 📚 Book Routes

- `GET /api/books` – List books
- `POST /api/books` – Add a book
- `PUT /api/books/:id` – Update a book
- `DELETE /api/books/:id` – Delete a book

---

## 🎥 Video Routes

- `GET /api/videos` – List saved videos
- `POST /api/videos` – Save a new video
- `DELETE /api/videos/:id` – Delete a video

---

## 🧠 Category Routes

Basic categorization for todos/books/videos:

- `GET /api/categories` – Get all categories
- `POST /api/categories` – Create a new category

---

## 🧪 Utility Routes

- `GET /ping` – Returns `{ message: "Server is running!" }`
- `GET /health` – Returns server status and uptime
- `GET /api-docs` – Access Swagger documentation

---

## 🔒 Security

- **CORS:** Restricted to specific domains
- **Helmet:** Secures HTTP headers
- **Rate Limit:** On login and register
- **Multer:** Validates and stores uploads in `/uploads`

---

## 🐳 Docker

```bash
# Build the image
docker build -t todo_api .

# Run the container
docker run -d -p 3000:3000 --env-file .env todo_api
```

---

## 🛠️ Tech Stack

- **Express**
- **PostgreSQL**
- **JWT + Refresh Tokens**
- **Multer**
- **Swagger**
- **Docker**
- **Helmet**
- **Nodemon** (dev)
- **dotenv**
- **cors**
- **compression**
- **winston** (logger)

---

## 🧭 Roadmap

- [x] Full CRUD for to-dos, books, videos
- [x] JWT + Refresh Token auth
- [x] Swagger integration
- [x] Docker and VPS setup
- [ ] Add unit testing (Jest / Supertest)
- [ ] Migrate to **Sequelize**
- [ ] Migrate to **TypeScript**

---

## 📄 License

MIT License.  
Crafted with ❤️ by [Rodrigo Acevedo](https://github.com/RodAcevedoF)
