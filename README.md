# WorkScheduler

Smart work scheduling system for organizations. Managers create and optimize schedules considering employee availability. Employees submit preferences, view shifts, request swaps, and manage time off.

## Live Demo

- **Demo app**: `https://work-scheduler-nine.vercel.app/`
- **API (Fly.io)**: `https://workscheduler-michaelkupfer97.fly.dev`
- **API health**: `https://workscheduler-michaelkupfer97.fly.dev/healthz`

Notes:
- This is a **demo** deployment; the Fly machine may sleep/stop on free trial. If the UI can’t reach the API, hit the health URL once, wait ~10–30s, and refresh.

## Features

- **Authentication** -- JWT-based login/register with refresh tokens
- **Organizations** -- Create or join via invite code, configure shift types
- **Schedule Management** -- Weekly grid editor, auto-generate with constraint-aware algorithm
- **Employee Availability** -- Interactive grid to mark preferred/available/unavailable per shift
- **Shift Swaps** -- Request, accept/reject, manager approval workflow
- **Time-Off Requests** -- Submit and manage time-off with approval flow
- **Notifications** -- In-app + email notifications for schedule changes
- **i18n** -- English + Hebrew with full RTL support
- **Mobile-first** -- Responsive design, works on any device

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS + ShadCN/UI |
| Routing | React Router v6 |
| State | React Context + TanStack Query |
| i18n | react-i18next |
| Backend | Node.js + Express + TypeScript |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcrypt |
| Validation | Zod |

## Deployment

- **Frontend**: Vercel (root directory `frontend`), env `VITE_API_BASE_URL=https://workscheduler-michaelkupfer97.fly.dev/api`
- **Backend**: Fly.io (Docker from repo root `Dockerfile`)
- **Database**: MongoDB Atlas
- **CORS**: backend `FRONTEND_ORIGIN` must include the Vercel URL (comma-separated origins supported)

See `DEPLOY.md` for step-by-step setup.

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (or local MongoDB)

### Backend

```bash
cd backend
npm install
# Configure .env (see .env.example)
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` and proxies API requests to the backend on port 5000.

## Environment Variables

### Backend (.env)

```
PORT=5000
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
FRONTEND_ORIGIN=http://localhost:5173
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
```

## Project Structure

```
WorkScheduler/
  backend/src/        -- Express API (TypeScript)
  frontend/src/       -- React app (TypeScript)
  shared/             -- Shared types and Zod validation schemas
```
