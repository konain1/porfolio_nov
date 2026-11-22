# Portfolio Backend (API)

Express + MongoDB (Mongoose) REST API for Kaunain Kasab's personal portfolio.

## Tech Stack
- **Node.js** (v18+)
- **Express.js**
- **MongoDB** with Mongoose
- **Security & Utilities:** Helmet, CORS, Express Rate Limit, Dotenv

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Update the values in `.env`:
- `PORT`: Server port (default: `5050`)
- `MONGO_URI`: MongoDB connection string
- `CLIENT_URL`: Allowed frontend origins (e.g. `http://localhost:5173`)
- `ADMIN_KEY`: Secret key for admin routes (`x-admin-key` header)

### 3. Seed Database
Seed initial profile data, skills, services, experience, and projects:
```bash
npm run seed
```

### 4. Run the Server
Development mode:
```bash
npm run dev
```
Production mode:
```bash
npm start
```

## API Endpoints

| Method | Route | Auth | Description |
| --- | --- | --- | --- |
| GET | `/api/health` | – | Health check |
| GET | `/api/portfolio` | – | Profile, services, experience, skills, projects |
| GET | `/api/projects?category=web\|mobile` | – | Projects list |
| POST/PUT/DELETE | `/api/projects[/:id]` | admin | Manage projects |
| POST | `/api/contact` | – | Contact form submission (rate-limited, honeypot protected) |
| GET | `/api/contact` | admin | Read messages |
| PATCH | `/api/contact/:id/read` | admin | Mark message as read |
| DELETE | `/api/contact/:id` | admin | Delete message |

Admin routes require the `x-admin-key: <ADMIN_KEY>` header.
