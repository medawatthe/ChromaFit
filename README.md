# ChromaFit

AI-powered personal fashion recommendation and wardrobe analytics web app.

Stack: **React (Vite) + Tailwind CSS** frontend, **Node.js/Express** backend, **PostgreSQL** database, **OpenAI** for AI outfit analysis and the stylist chatbot.

## Project layout

```
backend/    Express REST API, PostgreSQL access, OpenAI integration
frontend/   React + Tailwind single-page app
```

## Prerequisites

- Node.js 18+ (already installed)
- PostgreSQL (already installed locally via winget, running as the `postgresql-x64-17` service)
- An OpenAI API key for real AI analysis and chatbot replies

## First-time setup

### 1. Database

The `chromafit` database and its tables already exist locally. If you ever need to recreate them:

```powershell
$env:PGPASSWORD = "postgres"
psql -U postgres -h localhost -c "CREATE DATABASE chromafit;"
cd backend
npm run migrate
```

### 2. Backend

```powershell
cd backend
npm install
```

Edit `backend/.env` and replace `OPENAI_API_KEY` with your real key (starts with `sk-`). Until you do, registration/login/wardrobe CRUD all work — only "Analyze with AI" and the chatbot will fail.

```powershell
npm run dev      # starts on http://localhost:5000
```

### 3. Frontend

```powershell
cd frontend
npm install
npm run dev       # starts on http://localhost:5173
```

Open http://localhost:5173 in your browser, register an account, and start adding wardrobe items.

## What's built (MVP)

- Registration & login (JWT-based), full profile editing
- Wardrobe CRUD with image upload (name, category, brand, colors, pattern, material, fit, season, occasion, price, notes, etc.)
- Dashboard: total/worn/unused item counts, sustainability score, top categories, favorite colors, average AI fashion score
- AI outfit analysis per item (dominant colors, skin-tone match, colour harmony %, fashion score 0–10, occasion fit, styling summary) via OpenAI vision
- AI stylist chatbot with persisted chat history

## Not yet built

Everything else in the original spec (admin dashboard, sustainability deep-dive, packing assistant, calendar planner, weather recommendations, shopping suggestions, wishlist, outfit comparison, trend analysis, notifications, monthly PDF reports, smart search) — these can be added incrementally on top of this foundation.

## Notes

- Passwords are hashed with bcrypt; JWTs expire after 7 days (configurable in `backend/.env`).
- Uploaded images are stored on disk in `backend/uploads/` and served at `/uploads/<filename>`.
- `backend/.env` and `frontend/.env` are git-ignored — see the `.env.example` files in each folder.
