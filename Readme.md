# Attendance Management System (AttendEase)

QR-based attendance system with:
- Admin dashboard to start attendance sessions and review attendance per subject/student
- Student login to scan QR and mark attendance
- Admin chatbot (Groq) that answers based on the current dashboard state

---

## Live Links

- Frontend (Render): https://attendance-management-system-frontend-g9po.onrender.com/
- Admin dashboard: https://attendance-management-system-frontend-g9po.onrender.com/admin/dashboard
- Backend (Render): https://attendance-management-system-1kuv.onrender.com/
- Backend health: https://attendance-management-system-1kuv.onrender.com/api/health

*AWS link (as provided): http://attendance-react-app.s3-website.eu-north-1.amazonaws.com/api

---

## Features

### Admin
- Take Attendance: pick a year → view today’s timetable → start QR session
- Check Attendance: pick a year + subject → view every student’s attended/missed/%
- Chatbot: sticky button (bottom-right) opens a chat that can answer questions from the currently loaded admin dashboard state

### Student
- Login
- Scan QR to mark attendance (prevents duplicate marking)
- View attendance summary and history

---

## Tech Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MongoDB (Mongoose)

---

## Project Structure

- `Backend/` — Express API server + MongoDB models + seed script
- `Frontend/` — React (Vite) app

---

## Getting Started (Local)

### 1) Backend

From the project root:

```bash
cd Backend
npm install
```

Create/configure `Backend/.env` (example):

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/attendease
JWT_SECRET=change_me
JWT_EXPIRES_IN=7d

# Groq (Admin chatbot)
GROQ_API_KEY=your_key_here
GROQ_MODEL=your_supported_model_here
```

Seed the database:

```bash
node seed.js
```

Run the server:

```bash
npm run dev
```

API base URL (local): `http://localhost:5000/api`

### 2) Frontend

```bash
cd Frontend
npm install
npm run dev
```

Frontend URL (local): `http://localhost:5173`

Optional: set `VITE_API_URL` if your backend is not on the same host:

```env
VITE_API_URL=http://localhost:5000/api
```

---

## Seeded Accounts

When running `node seed.js`:

- Admin
	- Username: `admin`
	- Password: `admin`

- Students
	- Password for all seeded students: `student123`
	- Includes a Year 3 roster (see `Backend/seed.js`)

---

## Chatbot (Groq) Notes

- The chatbot calls the backend endpoint `POST /api/groq/chat` (admin-only).
- The backend forwards the request to Groq using `GROQ_API_KEY`.
- You must set `GROQ_MODEL` to a model that is currently supported by Groq.
- Health endpoint (admin-only): `GET /api/groq/health`

*Security: do **not** commit API keys to git.

---

## Scripts

Backend:
- `npm run dev` — start server with nodemon
- `npm run start` — start server
- `node seed.js` — seed MongoDB with demo data

Frontend:
- `npm run dev` — start Vite dev server
- `npm run build` — production build
- `npm run preview` — preview production build

---

## Troubleshooting

- If admin chatbot shows `Groq request failed (Groq 400) model_decommissioned`:
	- update `GROQ_MODEL` in `Backend/.env` to a supported model from your Groq console.
- If the backend returns 401:
	- ensure you are logged in and sending the Bearer token (frontend already handles this).


