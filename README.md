# ChromaFit

AI-powered personal fashion recommendation and wardrobe analytics web app.

Stack: **React (Vite) + Tailwind CSS** frontend, **Node.js/Express** backend, **PostgreSQL** database, **Google Gemini (free tier)** for AI outfit analysis and the stylist chatbot.

## Project layout

```
backend/    Express REST API, PostgreSQL access, Gemini API integration
frontend/   React + Tailwind single-page app
```

## Prerequisites

- Node.js 18+ (already installed)
- PostgreSQL (already installed locally via winget, running as the `postgresql-x64-17` service)
- A free Google Gemini API key for real AI analysis and chatbot replies (get one at https://aistudio.google.com/apikey — no billing required)

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

Edit `backend/.env` and replace `GEMINI_API_KEY` with your real key from https://aistudio.google.com/apikey. Until you do, registration/login/wardrobe CRUD all work — only "Analyze with AI" and the chatbot will fail.

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

## What's built

**Account & profile**
- Registration & login (JWT-based, bcrypt-hashed passwords)
- Full profile editing (bio, measurements, skin tone, body shape, favorite/least-favorite colors, brands, location, style preferences, theme)

**Wardrobe**
- Wardrobe CRUD with image upload (name, category, brand, colors, pattern, material, fit, season, occasion, price, notes, etc.)
- Search & filter by category, occasion, season
- Wear tracking ("mark worn today") and item detail page with arrow-key / on-screen slideshow navigation between items

**Dashboard**
- Total/worn/unused item counts, sustainability score, top categories, favorite colors, average AI fashion score
- Monthly usage chart, most-worn / least-used / unused item lists
- "Style Tools" quick-access grid linking to all AI tools below

**AI-powered tools** (Google Gemini)
- **AI Outfit Analysis** — per-item fashion score, color harmony %, skin-tone match, occasion fit, styling summary
- **AI Stylist Chatbot** — context-aware styling advice based on your actual wardrobe, with persisted history and image-attachment support
- **Color Analysis** — upload a face photo to get your undertone, seasonal color type, and best/avoid color palettes (photo is analyzed then deleted — never stored)
- **Body Analysis** — upload a full-body photo to get your body shape, proportions, and styling do's/don'ts (photo analyzed then deleted)
- **Color Picker** — instant client-side verdict on whether any color suits your undertone/season
- **Match Tool** — pick a wardrobe item and get AI-ranked pairing suggestions from the rest of your closet
- **Outfit Comparison** — pit two wardrobe items against each other for a given occasion and get an AI verdict

**Wishlist**
- Track items you want to buy (name, category, brand, price, notes, optional photo)

**Settings**
- Light/dark theme toggle and small/medium/large font size, applied instantly site-wide and saved to your account

**Admin panel** (role-based, admin accounts only)
- Site-wide stats (users, wardrobe items, AI analyses, chat messages, wishlist items, contact messages, recent signups)
- User management (promote/demote to admin, delete accounts)
- View messages submitted through the Contact Us form

**Public site**
- Home, About, Contact pages with animated hero section and contact form
- Shared Navbar/Footer across public and authenticated views
- Site-wide navy blue theme with an animated gradient background, custom logo/favicon, and consistent gradient page headers across every screen

## Not yet built

Deferred from the original spec: Blend Tool, Smart Packing Assistant, Calendar Outfit Planner, Weather-Based Recommendations, AI Shopping Suggestions, Notification Center, Monthly Fashion Report (PDF), AI Fashion Trend Analysis, Occasion Reminder.

## Notes

- Passwords are hashed with bcrypt; JWTs expire after 7 days (configurable in `backend/.env`).
- Uploaded images are stored on disk in `backend/uploads/` and served at `/uploads/<filename>`.
- `backend/.env` and `frontend/.env` are git-ignored — see the `.env.example` files in each folder.

