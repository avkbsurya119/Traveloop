<div align="center">

<br/>

```
████████╗██████╗  █████╗ ██╗   ██╗███████╗██╗      ██████╗  ██████╗ ██████╗
╚══██╔══╝██╔══██╗██╔══██╗██║   ██║██╔════╝██║     ██╔═══██╗██╔═══██╗██╔══██╗
   ██║   ██████╔╝███████║██║   ██║█████╗  ██║     ██║   ██║██║   ██║██████╔╝
   ██║   ██╔══██╗██╔══██║╚██╗ ██╔╝██╔══╝  ██║     ██║   ██║██║   ██║██╔═══╝
   ██║   ██║  ██║██║  ██║ ╚████╔╝ ███████╗███████╗╚██████╔╝╚██████╔╝██║
   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝  ╚═══╝  ╚══════╝╚══════╝ ╚═════╝  ╚═════╝ ╚═╝
```

### **Dream it. Plan it. Loop it.**
*A production-grade, AI-augmented full-stack travel planning platform*

<br/>

[![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Node.js](https://img.shields.io/badge/Node.js_18+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://prisma.io)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgresql.org)
[![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io)

<br/>

[🚀 Live Demo](#) · [📖 API Docs](#api-reference) · [🐛 Report Bug](https://github.com/avkbsurya119/Traveloop/issues) · [✨ Request Feature](https://github.com/avkbsurya119/Traveloop/issues)

<br/>

> **Built for hackathon submission** — 50+ API endpoints, 11 database models, 17 screens, AI-powered suggestions, real-time budget intelligence, and a community platform. Every feature is production-wired — no stubs, no placeholders, no fake data.

</div>

---

## 📸 Screenshots

<div align="center">

| Dashboard | Trip Builder | Timeline |
|:---------:|:------------:|:--------:|
| Hero carousel, live stats, weather widget | Multi-city drag-and-drop itinerary | Visual stop-by-stop timeline |

| Community Feed | Admin Analytics | AI Suggestions |
|:--------------:|:---------------:|:--------------:|
| Infinite scroll, likes, comments | Recharts dashboards, user growth | Claude-powered itinerary & budget |

</div>

---

## ✨ Feature Overview

### 🔐 Authentication & Security
- **JWT + Refresh Token** dual-token auth with remember-me (30-day session)
- **5-attempt lockout** with countdown timer and automatic unlock
- **Math CAPTCHA** triggered after 3 failed attempts
- **Live email uniqueness check** on register (debounced API call)
- **Password strength meter** with real-time scoring (Weak → Excellent)
- **Forgot password flow** — 6-digit email code → verify → reset (3-step)
- **Bcrypt** password hashing, helmet security headers, CORS whitelist

### ✈️ Core Trip Flow
- **Create trip** with title, dates, currency, travel style, budget
- **Multi-city stops** — search and add unlimited destinations with arrival/departure dates
- **Drag-and-drop itinerary builder** — reorder activities, section types (Morning / Afternoon / Evening / Transit)
- **Time conflict detection** — highlights overlapping activities automatically
- **CSV import** — bulk import itinerary items from a spreadsheet
- **Trip cloning** — duplicate any trip with one click
- **Trip sharing** — generate a public share token with read-only access
- **7 quick actions** per trip: Edit · Timeline · Checklist · Notes · Expenses · Invoice · Share

### 📊 Smart Budget Intelligence
- **Real-time budget progress bar** — green → amber → red as you approach limit
- **Over-budget warnings** with exact overage amount
- **Category breakdown** — visual bars for hotel/flight/food/activity/transport/shopping
- **Daily spend analysis** — per-day expense grouping
- **Predicted remaining budget** — based on current burn rate
- **Itinerary cost vs actual expenses** — planned vs real comparison
- **Multi-currency support** — USD, EUR, GBP, and more

### 🤖 AI-Powered Features *(Claude API)*
- **AI itinerary suggester** — enter city + days → get a full day-by-day activity plan
- **Smart budget estimator** — travel style (budget / moderate / luxury) → cost breakdown by category
- **Checklist auto-suggestions** — destination-aware packing (beach → sunscreen, winter → gloves, safari → DEET)
- All AI output is **fully editable** — no locked chat-only responses
- Graceful fallback if API key is not set

### 🗺️ Interactive Maps
- **OpenStreetMap embeds** per trip stop — no API key required
- City coordinates from database (latitude/longitude on every City record)
- **Stop selector tabs** — switch between cities on the map
- Direct link to full OpenStreetMap view

### 📅 Visual Timeline
- **Horizontal stop timeline** — city thumbnails connected by flight icons
- **Day-by-day activity cards** — section icons, time slots, cost labels
- Click any stop → expand its full day-by-day breakdown
- Budget summary with progress bar at the bottom
- Routes: `/trips/:id/timeline` and `/trips/:id/itinerary`

### 💸 Expense Tracking & Invoice
- Log expenses by category with emoji prefixes
- **PieChart + list view toggle** (Recharts)
- **Category bars** showing percentage of total
- **Invoice generator** — branded PDF-ready layout with print button
- Table: all expenses with date · category · description · amount
- Budget remaining shown with color-coded surplus/deficit

### ✅ Packing Checklist
- **Smart auto-suggestions** based on trip destinations
  - 🏖️ Beach/tropical → sunscreen, swimwear, flip flops
  - ❄️ Snow/winter → thermal layers, gloves, waterproof boots
  - 🏔️ Mountain/trekking → poles, first aid, altitude pills
  - 🦁 Safari → binoculars, malaria prophylaxis, neutral clothing
  - 🗺️ Europe → rail pass, adapter, walking shoes
  - 🏯 Japan/Asia → pocket WiFi, slip-on shoes, cash
- **Category icons** with colored gradient card backgrounds
- Progress bar with celebration state at 100%
- Apply pre-built templates (beach, winter, business travel, etc.)
- Reset all in one click

### 📝 Trip Notes
- **3 filter modes** — All · By Day · By Stop
- Color-coded gradient cards (5 colors, cycling by index)
- Link note to specific stop for context
- Note count display per filter
- Rich empty states per filter type

### 🌍 Explore & Search
- **Full-text search** across cities, activities, and trips
- **Trending searches** tracked server-side
- **Type filters** — All / Cities / Activities / Trips
- **Debounced search** (300ms) for instant feel
- Save/unsave destinations with heart toggle (persisted to DB)
- City cards with hover "Plan a Trip →" overlay
- Activity cards with category emoji, rating, cost range

### 👥 Community Platform
- **Infinite scroll** feed with IntersectionObserver
- Create posts with text, image URL, hashtags, linked trip
- **Like / Unlike** with optimistic UI update
- **Threaded comments** — expand per post
- **Copy Trip** — clone any shared community trip to your account
- **Hashtag click-to-search** — click any tag to filter feed
- Sort by: Recent · Popular · Following

### 🔔 Smart Notifications *(real data, not mocked)*
- Pulls live data from database:
  - 🚀 "Your trip starts today!"
  - ✈️ "Trip in X days — make sure you're packed!"
  - ⚠️ Budget exceeded alert with exact overage
  - 💬 "Someone commented on your post"
  - ❤️ "X and 3 others liked your post"
- Auto-refreshes every 2 minutes
- Click notification → navigates to relevant trip/post
- Unread count badge on bell icon

### 🎨 Theme System *(4 dark themes)*
- 🌙 **Midnight** — deep space purple (default)
- 🌊 **Ocean** — dark navy blue
- 🌿 **Forest** — deep emerald green
- 🌅 **Dusk** — dark violet/warm purple
- Persisted to `localStorage`, applied before first paint (zero flash)
- CSS variable-based — all 17 screens update instantly

### 👤 Profile & Gamification
- Avatar upload (base64, Cloudinary-backed)
- Public/private profile toggle
- **Achievement badges** — earned and displayed on profile grid
- Stats: trips · countries visited · posts · saved destinations
- Saved destinations as image grid (add/remove from Explore)

### 🛡️ Admin Dashboard
- Platform stats: total users · trips · posts · cities
- **AreaChart** — user growth over last 6 months (Recharts)
- **LineChart** — trip activity over time
- Top 10 popular destinations by trip count
- User management: list · search · role change · delete
- Trip management: filter by status · search by title/owner
- Budget aggregates: total platform spend · average trip budget

### 📤 Export Features
- **Trip JSON export** — full structured export from `/trips/:id/export`
- **Invoice PDF** — browser print-to-PDF with styled layout
- **Expense CSV** — category breakdown bars in invoice page
- Share link via clipboard with one click

### 📱 PWA & Mobile
- **Service Worker** — offline shell caching, network-first API strategy
- **Web App Manifest** — installable, standalone display, shortcuts (New Trip, Explore)
- **Bottom navigation bar** on mobile with active indicators
- **Responsive design** — all 17 screens tested on mobile breakpoints

---

## 🏗️ Architecture

```
Traveloop/
├── client/                        # React 18 + Vite frontend
│   ├── public/
│   │   ├── manifest.json          # PWA manifest
│   │   └── sw.js                  # Service worker
│   └── src/
│       ├── api/                   # 12 Axios API client modules
│       │   ├── auth.js            # login, register, forgot/reset password
│       │   ├── trips.js           # 25+ methods: CRUD, clone, share, export
│       │   ├── ai.js              # suggestItinerary, estimateBudget
│       │   ├── notifications.js   # getAll
│       │   ├── weather.js         # getWeather
│       │   └── ...
│       ├── components/
│       │   ├── common/            # Button, Card, Input, Badge, Avatar, Toast, Skeleton
│       │   └── layout/            # Navbar, Sidebar, BottomNav, MainLayout, AuthLayout
│       ├── pages/                 # 17 fully-implemented screens
│       │   ├── Dashboard.jsx      # Hero carousel, stats, region filter, weather
│       │   ├── CreateTrip.jsx     # Multi-city, AI suggestions, budget estimator
│       │   ├── BuildItinerary.jsx # Drag-drop, CSV import, time conflicts
│       │   ├── TripTimeline.jsx   # Horizontal stop timeline, day-by-day view
│       │   ├── TripDetail.jsx     # Stats, map, quick actions, share
│       │   ├── TripList.jsx       # Status groups, filters, sort, action menu
│       │   ├── Expenses.jsx       # PieChart, category bars, add form
│       │   ├── Invoice.jsx        # Print-ready branded invoice
│       │   ├── Checklist.jsx      # Smart suggestions, templates, progress
│       │   ├── Notes.jsx          # Filter tabs, color-coded cards
│       │   ├── Explore.jsx        # Search, trending, city/activity/trip results
│       │   ├── Community.jsx      # Infinite scroll, posts, likes, comments
│       │   ├── Profile.jsx        # Avatar, badges, saved places, settings
│       │   ├── Admin.jsx          # Analytics charts, user/trip management
│       │   ├── Login.jsx          # Lockout, CAPTCHA, remember-me
│       │   ├── Register.jsx       # Live email check, strength meter
│       │   └── ForgotPassword.jsx # 3-step code flow
│       └── store/
│           ├── authStore.js       # JWT, user, login/logout/register
│           ├── tripStore.js       # trips[], currentTrip, CRUD actions
│           └── uiStore.js         # sidebar, theme management
│
└── server/                        # Node.js + Express backend
    ├── prisma/
    │   ├── schema.prisma          # 11 models, enums, indexes, relations
    │   └── seed.js                # Rich demo data seeder
    └── src/
        ├── config/
        │   └── db.js              # Prisma client singleton
        ├── middleware/
        │   ├── auth.js            # authenticate, requireAdmin
        │   └── errorHandler.js    # Consistent error shape
        └── routes/                # 12 Express route files
            ├── auth.routes.js     # register, login, logout, password reset
            ├── trip.routes.js     # 746 lines — full trip CRUD + sub-resources
            ├── ai.routes.js       # suggestItinerary, estimateBudget
            ├── notifications.routes.js  # real-data notification aggregator
            ├── community.routes.js      # posts, likes, comments
            ├── search.routes.js         # full-text, trending
            ├── weather.routes.js        # OpenWeather + mock fallback
            ├── admin.routes.js          # stats, user/trip management
            └── ...
```

---

## 🗄️ Database Design

```
┌──────────────┐     ┌─────────────┐     ┌──────────────────┐
│    User      │────<│    Trip     │────<│    TripStop      │
│──────────────│     │─────────────│     │──────────────────│
│ id (uuid)    │     │ id          │     │ id               │
│ firstName    │     │ userId ─FK  │     │ tripId ─FK       │
│ lastName     │     │ title       │     │ cityId ─FK       │
│ email unique │     │ startDate   │     │ arrivalDate      │
│ passwordHash │     │ endDate     │     │ departureDate    │
│ role (enum)  │     │ status(enum)│     │ orderIndex       │
│ isActive     │     │ totalBudget │     └──────────────────┘
│ isPublic     │     │ currency    │              │
│ avatarUrl    │     │ shareToken  │              │
└──────────────┘     │ isPublic    │     ┌──────────────────┐
        │            └─────────────┘     │ ItineraryItem    │
        │                    │           │──────────────────│
        │            ┌───────┴───────┐   │ id               │
        │            │   Expense     │   │ stopId ─FK       │
        │            │───────────────│   │ activityId ─FK?  │
        │            │ tripId ─FK    │   │ customTitle      │
        │            │ stopId ─FK?   │   │ date             │
        │            │ category(enum)│   │ startTime        │
        │            │ amount        │   │ endTime          │
        │            │ date          │   │ cost             │
        │            └───────────────┘   │ sectionType      │
        │                                └──────────────────┘
        │
  ┌─────┴────────────────────────────────────────┐
  │                                               │
┌─┴──────────────┐   ┌──────────────┐   ┌───────┴──────────┐
│ CommunityPost  │   │  PackingItem │   │  TripNote        │
│────────────────│   │──────────────│   │──────────────────│
│ userId ─FK     │   │ tripId ─FK   │   │ tripId ─FK       │
│ tripId ─FK?    │   │ label        │   │ stopId ─FK?      │
│ content        │   │ category(enum│   │ title            │
│ tags (String[])│   │ isPacked     │   │ content          │
│ likesCount     │   └──────────────┘   │ noteDate         │
└────────────────┘                      └──────────────────┘
        │
   ┌────┴────┐
   │         │
┌──┴──┐ ┌───┴──────┐
│Like │ │ Comment  │
└─────┘ └──────────┘
```

**Key design decisions:**
- `uuid` primary keys throughout (no sequential integer leakage)
- Enums: `UserRole`, `TripStatus`, `ActivityCategory`, `ExpenseCategory`, `PackingCategory`
- Indexes on `userId`, `status`, `shareToken`, `cityId` for fast queries
- `onDelete: Cascade` everywhere — no orphaned records
- `Decimal` for all monetary values — no floating point errors
- `shareToken` unique constraint — safe public sharing

---

## 🔒 Validation & Authorization

### Backend Validation
| Rule | Endpoint | Behavior |
|------|----------|----------|
| Invalid email format | `POST /auth/register` | 400 with field error |
| Weak password (< 8 chars, no uppercase, no number) | register | 400 with specific rule |
| End date before start date | `POST /trips` | 400 with date error |
| Overlapping itinerary items | `POST /trips/:id/itinerary` | Conflict detection + 409 |
| Duplicate saved destination | `POST /users/:id/saved` | 409 Conflict |
| Unauthorized trip edit | `PUT /trips/:id` | 403 Forbidden |
| Admin-only routes | `/admin/*` | 401 / 403 |

### Authorization Matrix
| Resource | Owner | Other User | Admin | Public (no auth) |
|----------|-------|-----------|-------|-----------------|
| View trip | ✅ Full | ❌ | ✅ Full | ✅ If `isPublic=true` |
| Edit trip | ✅ | ❌ 403 | ✅ | ❌ |
| Delete trip | ✅ | ❌ 403 | ✅ | ❌ |
| View itinerary | ✅ | ❌ | ✅ | ✅ If shared |
| Admin dashboard | ❌ | ❌ | ✅ | ❌ |
| Edit user role | ❌ | ❌ | ✅ | ❌ |
| Delete user | ❌ | ❌ | ✅ | ❌ |

### Error Response Shape (consistent across all endpoints)
```json
{
  "error": "Human-readable message",
  "field": "email",
  "code": "VALIDATION_ERROR",
  "statusCode": 400
}
```

---

## 🚀 Getting Started

### Prerequisites

```
Node.js 18+       → https://nodejs.org
PostgreSQL        → Supabase free tier recommended
Redis             → Docker (one command below)
Docker (optional) → https://docker.com
```

### 1. Clone

```bash
git clone https://github.com/avkbsurya119/Traveloop.git
cd Traveloop
```

### 2. Start Redis

```bash
docker-compose up -d
# Redis will be available at localhost:6379
```

### 3. Server Environment

Create `server/.env`:

```env
# ── App ──────────────────────────────────────────
PORT=5000
NODE_ENV=development

# ── Database (Supabase free tier or local PG) ────
DATABASE_URL=postgresql://postgres:PASSWORD@db.PROJECT.supabase.co:5432/postgres

# ── Redis ────────────────────────────────────────
REDIS_URL=redis://localhost:6379

# ── Auth (generate any 32+ char strings) ─────────
JWT_SECRET=traveloop_jwt_super_secret_change_me_2024
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_SECRET=traveloop_refresh_secret_change_me_2024
REFRESH_TOKEN_EXPIRES_IN=30d

# ── AI (optional — fallback mock exists) ─────────
ANTHROPIC_API_KEY=sk-ant-...

# ── Weather (optional — fallback mock exists) ─────
OPENWEATHER_API_KEY=

# ── Email (optional) ──────────────────────────────
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=noreply@traveloop.app

# ── Cloudinary (optional — base64 fallback exists) 
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# ── Admin seed account ────────────────────────────
ADMIN_EMAIL=admin@traveloop.app
ADMIN_PASSWORD=Admin123!
```

### 4. Client Environment

Create `client/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_GOOGLE_MAPS_KEY=
VITE_UNSPLASH_ACCESS_KEY=
VITE_WEATHER_API_KEY=
```

> **The app works fully with only `DATABASE_URL` set.** All other keys are optional — each service has a fallback.

### 5. Install & Migrate

```bash
# Server
cd server
npm install
npx prisma generate
npx prisma db push

# Seed with rich demo data (cities, activities, trips, expenses, posts)
node src/seed.js
```

```bash
# Client
cd ../client
npm install
```

### 6. Run

Open two terminals:

```bash
# Terminal 1 — Backend (http://localhost:5000)
cd server && npm run dev

# Terminal 2 — Frontend (http://localhost:5173)
cd client && npm run dev
```

---

## 👤 Demo Accounts

| Role | Email | Password | Notes |
|------|-------|----------|-------|
| 🛡️ Admin | `admin@traveloop.app` | `Admin123!` | Full admin dashboard access |
| 👤 User | `john@example.com` | `User123!` | Seeded trips, expenses, posts |
| 👤 User | `sarah@example.com` | `User123!` | Separate trip data for demo |

---

## 📡 API Reference

<details>
<summary><strong>🔐 Authentication</strong></summary>

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | — | Register with email + password |
| POST | `/api/auth/login` | — | Login, returns JWT + refresh token |
| POST | `/api/auth/logout` | ✅ | Invalidate refresh token |
| GET | `/api/auth/me` | ✅ | Get current user |
| POST | `/api/auth/refresh` | — | Exchange refresh token |
| GET | `/api/auth/check-email` | — | Live email uniqueness check |
| POST | `/api/auth/forgot-password` | — | Send reset code |
| POST | `/api/auth/verify-reset-code` | — | Verify 6-digit code |
| POST | `/api/auth/reset-password` | — | Set new password |

</details>

<details>
<summary><strong>✈️ Trips</strong></summary>

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/trips` | ✅ | List user's trips (filter + sort) |
| POST | `/api/trips` | ✅ | Create trip |
| GET | `/api/trips/:id` | ✅ | Get trip with stops, items, expenses |
| PUT | `/api/trips/:id` | ✅ owner | Update trip |
| DELETE | `/api/trips/:id` | ✅ owner | Delete trip |
| POST | `/api/trips/:id/clone` | ✅ | Clone trip (full deep copy) |
| POST | `/api/trips/:id/share` | ✅ owner | Generate share token |
| GET | `/api/trips/shared/:token` | — | Public read-only trip view |
| GET | `/api/trips/:id/export` | ✅ | Export full trip as JSON |
| POST | `/api/trips/:id/stops` | ✅ owner | Add city stop |
| PUT | `/api/trips/:id/stops/:stopId` | ✅ | Update stop |
| DELETE | `/api/trips/:id/stops/:stopId` | ✅ | Remove stop |
| GET | `/api/trips/:id/itinerary` | ✅ | Get all itinerary items |
| POST | `/api/trips/:id/itinerary` | ✅ | Add itinerary item |
| PUT | `/api/trips/:id/itinerary/:itemId` | ✅ | Update item |
| DELETE | `/api/trips/:id/itinerary/:itemId` | ✅ | Delete item |
| GET | `/api/trips/:id/expenses` | ✅ | List expenses |
| POST | `/api/trips/:id/expenses` | ✅ | Add expense |
| PUT | `/api/trips/:id/expenses/:expId` | ✅ | Update expense |
| DELETE | `/api/trips/:id/expenses/:expId` | ✅ | Delete expense |
| GET | `/api/trips/:id/expense-summary` | ✅ | Aggregated summary for invoice |
| GET | `/api/trips/:id/checklist` | ✅ | Get packing items |
| POST | `/api/trips/:id/checklist` | ✅ | Add item |
| PATCH | `/api/trips/:id/checklist/:itemId` | ✅ | Toggle packed |
| DELETE | `/api/trips/:id/checklist/:itemId` | ✅ | Delete item |
| POST | `/api/trips/:id/checklist/reset` | ✅ | Unpack all |
| GET | `/api/trips/:id/notes` | ✅ | Get notes |
| POST | `/api/trips/:id/notes` | ✅ | Create note |
| PUT | `/api/trips/:id/notes/:noteId` | ✅ | Update note |
| DELETE | `/api/trips/:id/notes/:noteId` | ✅ | Delete note |

</details>

<details>
<summary><strong>🏙️ Cities & Activities</strong></summary>

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/cities` | — | List cities (filter by region/country) |
| GET | `/api/cities/popular` | — | Top cities by trip count |
| GET | `/api/cities/suggestions` | — | Random sample for quick-add |
| GET | `/api/cities/:id` | — | City details with lat/lon |
| GET | `/api/activities` | — | List activities (filter by city, category) |
| GET | `/api/activities/:id` | — | Activity details |

</details>

<details>
<summary><strong>🔍 Search</strong></summary>

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/search` | — | Full-text search across cities, activities, trips |
| GET | `/api/search/trending` | — | Most searched queries (in-memory store) |

</details>

<details>
<summary><strong>👥 Community</strong></summary>

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/community/posts` | — | Feed (sort: recent/popular, paginated) |
| POST | `/api/community/posts` | ✅ | Create post with tags, image, linked trip |
| DELETE | `/api/community/posts/:id` | ✅ owner | Delete post |
| POST | `/api/community/posts/:id/like` | ✅ | Like post |
| DELETE | `/api/community/posts/:id/like` | ✅ | Unlike post |
| GET | `/api/community/posts/:id/comments` | — | Get comments |
| POST | `/api/community/posts/:id/comments` | ✅ | Add comment |
| DELETE | `/api/community/posts/:id/comments/:cId` | ✅ | Delete comment |

</details>

<details>
<summary><strong>👤 Users & Profile</strong></summary>

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/users/:id` | ✅ | Get user profile |
| PUT | `/api/users/:id` | ✅ owner | Update profile |
| POST | `/api/users/:id/avatar` | ✅ owner | Upload avatar |
| PATCH | `/api/users/:id/privacy` | ✅ owner | Toggle public/private |
| GET | `/api/users/:id/stats` | ✅ | Trip count, countries, badges |
| GET | `/api/users/:id/saved` | ✅ | Saved destinations |
| POST | `/api/users/:id/saved` | ✅ | Save destination |
| DELETE | `/api/users/:id/saved/:cityId` | ✅ | Unsave destination |

</details>

<details>
<summary><strong>🤖 AI & Weather</strong></summary>

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/ai/suggest-itinerary` | ✅ | Generate day-by-day itinerary for city |
| POST | `/api/ai/estimate-budget` | ✅ | Budget breakdown by travel style |
| GET | `/api/weather/:city` | ✅ | Current weather with emoji + mock fallback |

</details>

<details>
<summary><strong>🔔 Notifications</strong></summary>

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/notifications` | ✅ | Real notifications from live DB data |

</details>

<details>
<summary><strong>📋 Checklist Templates</strong></summary>

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/checklist/templates` | ✅ | All pre-built templates |
| POST | `/api/checklist/templates/:id/apply/:tripId` | ✅ | Apply template to trip |

</details>

<details>
<summary><strong>🛡️ Admin</strong></summary>

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/admin/stats` | ✅ admin | Platform stats + budget aggregates |
| GET | `/api/admin/users` | ✅ admin | All users (search + paginate) |
| PUT | `/api/admin/users/:id/role` | ✅ admin | Change user role |
| DELETE | `/api/admin/users/:id` | ✅ admin | Hard delete user |
| GET | `/api/admin/trips` | ✅ admin | All trips (filter + paginate) |
| GET | `/api/admin/cities/popular` | ✅ admin | Top destinations by usage |

</details>

---

## 🧰 Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **UI Framework** | React 18 + Vite | Component model, HMR, fast builds |
| **Styling** | Tailwind CSS + custom CSS vars | 4 themes, glassmorphism, animations |
| **State** | Zustand | Lightweight global store (auth, trips, UI) |
| **Charts** | Recharts | AreaChart, BarChart, PieChart, LineChart |
| **Icons** | Lucide React | Consistent icon set |
| **HTTP** | Axios | API client with interceptors |
| **Dates** | date-fns | Format, diff, interval utilities |
| **UI Primitives** | Radix UI | Accessible dropdowns, dialogs, tabs |
| **Backend** | Node.js + Express | REST API server |
| **ORM** | Prisma | Type-safe DB queries, migrations |
| **Database** | PostgreSQL (Supabase) | Relational data with enums + indexes |
| **Cache/Rate** | Redis (ioredis) | Rate limiting, session store |
| **Auth** | JWT + bcrypt | Dual-token auth, secure hashing |
| **Validation** | Zod + express-validator | Schema validation on all inputs |
| **Email** | Nodemailer | Password reset codes |
| **Storage** | Cloudinary | Avatar/image uploads |
| **AI** | Anthropic Claude | Itinerary + budget suggestions |
| **Security** | Helmet + CORS + Rate limit | HTTP headers, origin whitelist |
| **PWA** | Service Worker + manifest | Offline shell, installable |

---

## 🔬 What Makes This Stand Out

### 1. Real Data, Not Stubs
Every feature is backend-wired. No `setTimeout(() => setData(mockData))`. The seed file generates a full universe of cities (with lat/lon, cost index, region), activities (with ratings, categories, cost ranges), trips (multi-stop, with itinerary and expenses), community posts, and checklist templates.

### 2. Production-Grade Auth
5-attempt lockout, CAPTCHA, refresh tokens, remember-me sessions, live email checks, forgot-password with OTP — features most apps skip entirely.

### 3. Schema Maturity
11 Prisma models with proper enums, foreign keys, cascade deletes, unique constraints, and database-level indexes. `Decimal` for money. `uuid` keys. No JSON blobs masking missing relations.

### 4. Consistent Error Handling
Every API route uses a central `errorHandler`. Every 400/403/404/409 returns the same shape. The frontend shows field-level inline errors, not just toast popups.

### 5. Smart Defaults
Weather falls back to mock data if no API key. AI generates rule-based suggestions if Claude is not configured. Cloudinary skips gracefully if no credentials. The app runs fully with just a database URL.

---

## 📊 Project Stats

```
Lines of code      ~9,000+
API endpoints      50+
Database models    11
Frontend pages     17
Zustand stores     3
Chart types        4 (Area, Bar, Pie, Line)
Themes             4
Animation types    6 (float, shimmer, pulse-ring, fade-up, slide-in, gradient-x)
```

---

## 🛣️ Roadmap

- [ ] Real-time collaborative editing (Socket.io + TripCollaborator model)
- [ ] Activity log / audit trail ("who changed what")
- [ ] Trip templates ("7-day Japan", "Weekend beach")
- [ ] Trip recommendation engine from user history
- [ ] Full offline sync with IndexedDB + background sync
- [ ] Blockchain-verified travel receipts *(low priority)*

---

## 🤝 Contributing

```bash
# Fork → clone → branch
git checkout -b feature/your-feature

# Make changes, then
git commit -m "feat: add your feature"
git push origin feature/your-feature
# Open a Pull Request
```

---

## 📄 License

MIT © 2026 Traveloop — [avkbsurya119](https://github.com/avkbsurya119)

---

<div align="center">

**Built with ❤️ for hackathon**

*Every screen production-wired. Every feature actually works.*

[⬆ Back to top](#)

</div>
