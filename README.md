# DailyWell Tracker

DailyWell Tracker is a full-stack, mobile-first wellness tracking MVP. It helps users log hydration, meals, snacks, supplements, fasting sessions, and personal wellness goals from a soft pastel interface inspired by modern habit-tracking mobile apps.

## Features

- JWT authentication with register, login, and current-user profile endpoints
- Private per-user data for all wellness logs
- Mobile-first dashboard with pastel habit cards and reusable logging modals
- Hydration logging with a CSS bottle UI and quick amount controls
- Food and snack logging with meal type, calories, and notes
- Medicine/supplement tracking with daily status logs
- Fasting start/end flow with active session detection
- Goals page with daily/weekly sections, circular progress indicators, and add-goal cards
- Analytics page with hydration progress and empty/error/loading states
- Demo seed data for portfolio walkthroughs and screenshots

## Tech Stack

- Frontend: React, Vite, React Router, Axios, lucide-react
- Backend: Node.js, Express, mysql2/promise
- Database: MySQL
- Auth: JSON Web Tokens, bcrypt password hashing
- Tooling: npm workspaces, concurrently, nodemon

## Monorepo Structure

```text
client/
  src/
    api/
    components/
    pages/
server/
  controllers/
  routes/
  middleware/
  db/
```

## Database Schema

The schema lives in [server/schema.sql](C:/Users/HP5CD/OneDrive/Desktop/cse/dailyhabit/server/schema.sql).

- `users`: account profile and hashed password
- `water_logs`: amount, note, and timestamp for hydration entries
- `food_logs`: breakfast/lunch/dinner/snack logs with calories and notes
- `medicines`: supplement/medicine definitions and schedule metadata
- `medicine_logs`: taken/skipped/missed status entries
- `fasting_sessions`: active and completed fasting windows
- `goals`: daily, weekly, monthly, or one-time goals by category

Demo seed data lives in [server/db/seed.sql](C:/Users/HP5CD/OneDrive/Desktop/cse/dailyhabit/server/db/seed.sql).

Demo login:

```text
Email: demo@dailywell.app
Password: demo123
```

## API Endpoints

All routes except register/login require:

```text
Authorization: Bearer <token>
```

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Water

- `POST /api/water`
- `GET /api/water/today`
- `DELETE /api/water/:id`

### Food

- `POST /api/food`
- `GET /api/food/today`
- `DELETE /api/food/:id`

### Medicines

- `POST /api/medicines`
- `GET /api/medicines`
- `POST /api/medicines/logs`
- `GET /api/medicines/status`

### Fasting

- `POST /api/fasting/start`
- `PATCH /api/fasting/:id/end`
- `GET /api/fasting/history`

### Goals

- `POST /api/goals`
- `GET /api/goals`
- `PUT /api/goals/:id`
- `DELETE /api/goals/:id`

## Setup Instructions

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create backend environment file:

   ```bash
   cp server/.env.example server/.env
   ```

3. Update `server/.env` with your MySQL credentials and a strong `JWT_SECRET`.

4. Create the database schema:

   ```bash
   npm run db:schema
   ```

5. Load demo data:

   ```bash
   npm run db:seed
   ```

6. Start frontend and backend together:

   ```bash
   npm run dev
   ```

Frontend: http://localhost:5173  
Backend API: http://localhost:4000/api

The frontend defaults to `http://localhost:4000/api`. To override it, copy [client/.env.example](C:/Users/HP5CD/OneDrive/Desktop/cse/dailyhabit/client/.env.example) to `client/.env` and update `VITE_API_URL`.

## Screenshots

Add screenshots here for your resume or portfolio:

- Login / Register
- Dashboard
- Add Drink
- Goals
- Analytics

Suggested folder:

```text
docs/screenshots/
```

## Available Scripts

- `npm run dev`: start client and server together
- `npm run dev:client`: start Vite only
- `npm run dev:server`: start Express with nodemon
- `npm run dev:frontend`: alias for `dev:client`
- `npm run dev:backend`: alias for `dev:server`
- `npm run build`: build the frontend
- `npm run start`: start the backend with Node
- `npm run db:schema`: create the MySQL schema through Node/mysql2
- `npm run db:seed`: load demo seed data through Node/mysql2

## Future Improvements

- Add charted weekly history from backend aggregate endpoints
- Add edit/update flows for food, water, medicine, and fasting logs
- Add goal completion tracking and real streak calculations
- Add refresh-token auth and password reset
- Add automated API tests and frontend component tests
- Add screenshot assets and deployment notes
- Add PWA install support and offline-first local caching
