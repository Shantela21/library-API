<img src="https://socialify.git.ci/Shantela21/library-API/image?language=1&owner=1&name=1&stargazers=1&theme=Light" alt="library-API" width="640" height="320" />

# Library-API
A RESTful Library API built using TypeScript and Express, designed to manage authors and books efficiently.
This project demonstrates clean architecture, middleware usage, error handling, logging, and security best practices in a Node.js environment.

## 🚀 Features

* ✅ Built with TypeScript for type safety

* 🔐 Includes Helmet, CORS, and Rate Limiting for security

* 🧠 Custom middleware for logging and error handling

* 📚 Endpoints for managing Authors and Books

* ⚙️ Modular structure with Express Routers

* 💾 In-memory storage for authors and books (easily extendable to databases)

* 🧩 Graceful error handling for uncaughtException, unhandledRejection, and SIGTERM

## 🗂️ Project Structure
```bash
library-api/
├── src/
│   ├── interfaces/
│   │   ├── author.interface.ts
│   │   └── book.interface.ts
│   ├── middleware/
│   │   ├── error.middleware.ts
│   │   └── logger.middleware.ts
│   ├── routes/
│   │   ├── authors.route.ts
│   │   └── books.route.ts
│   ├── server.ts
│   └── ...
├── dist/
├── package.json
├── tsconfig.json
└── README.md
```
## 🧩 API Endpoints
### 🧑 Authors
| Method | Endpoint                    | Description                |
| ------ | --------------------------- | -------------------------- |
| GET    | `/api/v1/authors`           | Get all authors            |
| GET    | `/api/v1/authors/:id`       | Get author by ID           |
| GET    | `/api/v1/authors/:id/books` | Get all books by an author |
| POST   | `/api/v1/authors`           | Create a new author        |
| PUT    | `/api/v1/authors/:id`       | Update author details      |
| DELETE | `/api/v1/authors/:id`       | Delete an author           |
### 📚 Books
| Method | Endpoint            | Description       |
| ------ | ------------------- | ----------------- |
| GET    | `/api/v1/books`     | Get all books     |
| GET    | `/api/v1/books/:id` | Get book by ID    |
| POST   | `/api/v1/books`     | Create a new book |
| PUT    | `/api/v1/books/:id` | Update a book     |
| DELETE | `/api/v1/books/:id` | Delete a book     |

### 🩺 Health Check
| Method | Endpoint  | Description                 |
| ------ | --------- | --------------------------- |
| GET    | `/health` | Check if the API is running |

## ⚙️ Installation & Setup
### 1️⃣ Clone the repository
```bash
git clone https://github.com/Shantela21/library-api.git
```
```
cd library-api
```
### 2️⃣ Install dependencies
```bash
npm install
```
### 3️⃣ Run in development mode
```bash
npm run dev
```
### 4️⃣ Build and start in production mode
```
npm run build:start
```
### 5️⃣ Test the API
After starting the server, open:
```bash
http://localhost:3000/
```

### 🧱 Scripts
| Command               | Description                                           |
| --------------------- | ----------------------------------------------------- |
| `npm start`           | Start compiled server from `dist/`                    |
| `npm run dev`         | Run server with `ts-node` + `nodemon` for live reload |
| `npm run build`       | Compile TypeScript files to JavaScript                |
| `npm run build:start` | Build and start the server                            |
| `npm test`            | Placeholder for future tests                          |

### 🧠 Technologies Used

* Node.js
* Express.js
* TypeScript
* Helmet
* CORS
* Express Rate Limit
* Body Parser
* Nodemon (for development)
* Jest + Supertest (for future testing setup)

### 🛡️ Security Middleware
| Middleware           | Purpose                       |
| -------------------- | ----------------------------- |
| `helmet()`           | Sets secure HTTP headers      |
| `cors()`             | Enables cross-origin requests |
| `express-rate-limit` | Prevents brute-force attacks  |
| `body-parser`        | Parses incoming JSON requests |

## 🧩 Error Handling
The API uses custom middleware for:

* Request logging
* Global error handling
* 404 (Not Found) responses
* Safe shutdown on unhandled exceptions or rejections

## 👨‍💻 Author

Developed by **Shantela Noyila**