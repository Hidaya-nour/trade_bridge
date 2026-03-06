# TradeBridge

TradeBridge is a full-stack trading platform split into:
- `backend`: Express + TypeScript API
- `frontend`: React + Vite web client

## Repository Layout

```text
trade_bridge/
  backend/      # API server
  frontend/     # Web application
```

## Tech Stack

- Backend: Node.js, Express, TypeScript, Sequelize, MySQL
- Frontend: React, TypeScript, Vite, Tailwind

## Prerequisites

- Node.js 18 or newer
- npm
- MySQL instance

## Quick Start

Run backend and frontend in separate terminals.

1. Backend:

```bash
cd backend
npm install
npm run dev
```

2. Frontend:

```bash
cd frontend
npm install
npm run dev
```

3. Open the Vite URL shown in terminal (usually `http://localhost:5173`).

## Environment Variables

### Backend (`backend/.env`)

```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=tradebridge
DB_SSL=false

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

JWT_SECRET=change_me
JWT_EXPIRES_IN=7d

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=noreply@tradebridge.com

FRONTEND_URL=http://localhost:5173
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:5000/api
```

## Scripts

### Backend

- `npm run dev`: start API in development mode with auto-reload

### Frontend

- `npm run dev`: start Vite dev server
- `npm run build`: type-check and build production bundle
- `npm run preview`: preview production build locally
- `npm run lint`: run ESLint

## API Health Check

```http
GET http://localhost:5000/api/health
```

## Notes

- Backend CORS uses `FRONTEND_URL`.
- There is no root workspace script yet, so backend/frontend are started separately.
