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

# Server
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=root
DB_NAME=trade_bridge
DB_SSL=true

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT
JWT_SECRET=7ccb3b287f555093d86a9d47e6f093e84f1a5a5a10f6bf8c56b8192d635f533de968698cfa28941db49dc0b0484cfc1c29a76d62ba9c950a3139912ab33ab212
JWT_EXPIRES_IN=7d

CLOUDINARY_CLOUD_NAME=dayjl9ogj
CLOUDINARY_API_KEY=444433731322691
CLOUDINARY_API_SECRET=-P7kxHrnpEk16PS_aQVaTLvLeqw

CHAPA_SECRET_KEY=CHASECK_TEST-xenTTutGFZh4KpqJxRW7XJJ0eermkVns
CHAPA_BASE_URL=https://api.chapa.co/v1
CHAPA_CURRENCY=ETB
CHAPA_CALLBACK_URL=http://localhost:5000/api/payments/chapa/callback
CHAPA_RETURN_URL=http://localhost:5173/retailer/orders

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@tradebridge.com

# Frontend
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5000
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
