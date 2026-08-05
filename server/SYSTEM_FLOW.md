# CareerLaunch AI — System Flow Documentation

> Generated from actual source code. Last updated: August 2026.

---

## Table of Contents

1. [Server Startup](#1-server-startup)
2. [Authentication Flow](#2-authentication-flow)
   - [Registration](#21-registration)
   - [Login](#22-login)
   - [App Bootstrap (page reload)](#23-app-bootstrap-page-reload)
   - [Protected API Requests](#24-protected-api-requests)
   - [Logout](#25-logout)
3. [Jobs Search Flow](#3-jobs-search-flow)
   - [Initial Load](#31-initial-load)
   - [Geolocation](#32-geolocation)
   - [Filtering Pipeline](#33-filtering-pipeline)
   - [Save / Unsave a Job](#34-save--unsave-a-job)
4. [Companies Search Flow](#4-companies-search-flow)
5. [Data Flow Diagram](#5-data-flow-diagram)
6. [Error Codes Reference](#6-error-codes-reference)
7. [File Map](#7-file-map)

---

## 1. Server Startup

**Entry point:** `server/server.js`

```
node server.js
```

Steps run in strict order before the HTTP port opens:

```
Step 1  dotenv.config()           Load server/.env into process.env
Step 2  ensureJwtSecret()         Validate or generate JWT_SECRET
Step 3  sequelize.authenticate()  Test DB connection
Step 4  sequelize.sync()          Create missing tables
Step 5  runMigrations()           Add missing columns (dialect-aware)
Step 6  app.listen(PORT)          Open HTTP server
```

**Console output on clean startup:**
```
✓ Environment loaded
✓ JWT Secret loaded  (128 chars)
✓ Database connected
✓ Authentication initialized
🚀 HTTP server running on port 5000
```

### JWT Secret Auto-Generation (`server/config/ensureSecret.js`)

Called synchronously at step 2. Rules:

| Condition | Action |
|-----------|--------|
| `JWT_SECRET` missing | Generate 64-byte hex secret, write to `.env` |
| Value is in weak list (`super_secret_key`, `secret`, `changeme`, etc.) | Replace with generated secret |
| Value shorter than 32 chars | Replace with generated secret |
| Value ≥ 32 chars and not in weak list | No-op — use as-is |

Generated secrets are 128 hex characters (512 bits of entropy).  
The `.env` file is rewritten in-place — no other variables are touched.

---

## 2. Authentication Flow

### 2.1 Registration

```
Browser                     Frontend (React)              Backend (Express)           MySQL
  │                               │                              │                      │
  │── fills Register form ───────►│                              │                      │
  │                               │── POST /api/auth/register ──►│                      │
  │                               │   { name, email, password }  │                      │
  │                               │                              │── validate input      │
  │                               │                              │── findOne(email) ────►│
  │                               │                              │◄─ null ───────────────│
  │                               │                              │── bcrypt.hash(pw, 12) │
  │                               │                              │── User.create() ─────►│
  │                               │                              │◄─ { id: 7, ... } ─────│
  │                               │                              │── signToken(user)      │
  │                               │                              │   payload: { id, name, │
  │                               │                              │   email, role }        │
  │                               │                              │   expiry: 7 days       │
  │                               │◄── 201 { user, token } ──────│                      │
  │                               │                              │                      │
  │                               │── dispatch(loginSuccess)      │                      │
  │                               │   stores token in            │                      │
  │                               │   localStorage + Redux        │                      │
  │◄── redirect to /student/dashboard ──│                        │                      │
```

**Password is hashed with bcrypt cost factor 12.** Plain text is never stored.

**Validation errors returned as:**
```json
{ "code": "VALIDATION_ERROR", "message": "password must be at least 6 characters" }
{ "code": "EMAIL_TAKEN",      "message": "An account with that email already exists." }
```

---

### 2.2 Login

```
Browser                     Frontend                      Backend                     MySQL
  │                               │                              │                      │
  │── fills Login form ──────────►│                              │                      │
  │                               │── POST /api/auth/login ─────►│                      │
  │                               │   { email, password }        │                      │
  │                               │                              │── User.findOne(email)►│
  │                               │                              │◄─ { id, pw_hash, ...}─│
  │                               │                              │── bcrypt.compare()    │
  │                               │                              │   (plain vs hash)      │
  │                               │                              │── signToken(user)      │
  │                               │◄── 200 { user, token } ──────│                      │
  │                               │                              │                      │
  │                               │── dispatch(loginSuccess)      │                      │
  │                               │   localStorage.setItem        │                      │
  │                               │   ("token", token)            │                      │
  │◄── redirect to dashboard ───────│                             │                      │
```

**Error responses:**
```
404  NOT_FOUND      — no account with that email
401  WRONG_PASSWORD — bcrypt.compare returned false
400  VALIDATION_ERROR — missing field
500  SERVER_ERROR   — DB unavailable
```

---

### 2.3 App Bootstrap (page reload)

Every time the React app starts (`main.jsx` dispatches `bootstrapAuth`):

```
App loads
   │
   ▼
getValidToken()  ← reads localStorage, decodes JWT, checks exp
   │
   ├─ null (missing / expired) ──► isAuthenticated = false, show public pages
   │
   └─ valid token ──► GET /api/users/profile  (sends Bearer token)
                           │
                           ├─ 200 ──► update Redux with fresh DB user object
                           │
                           └─ 401 ──► clear localStorage, isAuthenticated = false
```

This guarantees the Redux user object always reflects the **current database state**, not a stale localStorage snapshot.

---

### 2.4 Protected API Requests

Every request through `client/src/services/api.js` automatically attaches the token:

```
axios interceptor (request)
   │
   ▼
localStorage.getItem("token")
   │
   ├─ exists ──► Authorization: Bearer <token>
   └─ missing ─► request goes without auth header
```

On the backend, `verifyToken` middleware runs before any protected route handler:

```
Incoming request
   │
   ▼
Check JWT_SECRET is configured
   │
   ▼
Read Authorization header
   │
   ├─ missing/malformed ──► 401 NO_TOKEN
   │
   ▼
jwt.verify(token, JWT_SECRET)
   │
   ├─ TokenExpiredError ──► 401 TOKEN_EXPIRED  { expiredAt }
   ├─ JsonWebTokenError ──► 401 TOKEN_INVALID
   │
   └─ valid ──► req.user = { id, name, email, role }
                    │
                    ▼
               route handler runs
               uses req.user.id for all DB queries
```

If the backend returns 401, the `api.js` response interceptor:
1. Dispatches `logout()` → clears Redux + localStorage
2. Redirects to `/login` (unless already on an auth page)

---

### 2.5 Logout

```
User clicks Logout
   │
   ▼
dispatch(logout())
   ├─ Redux: user=null, token=null, isAuthenticated=false
   └─ localStorage: removes "token" and "user"
   │
   ▼
ProtectedRoute detects isAuthenticated=false
   │
   ▼
Redirect to /login
```

No server call is needed — JWTs are stateless. The token simply stops being sent.

---

## 3. Jobs Search Flow

### 3.1 Initial Load

```
Jobs.jsx mounts
   │
   ├─ useGeolocation({ autoRequest: true })
   │     └─ checks sessionStorage for cached coords
   │           ├─ found ──► status="granted", coords ready immediately
   │           └─ missing ──► fires browser GPS prompt
   │
   └─ fetchJobs()  ──► GET /api/jobs?limit=200
                            │
                            ▼
                       job.service.js:getLiveJobs()
                            │
                            ├─ check in-memory cache (10 min TTL)
                            │     └─ HIT ──► return cached jobs
                            │
                            └─ MISS ──► fetch in parallel:
                                  ├─ Remotive API  (8 categories × 25 jobs)
                                  ├─ Arbeitnow API (1 page)
                                  └─ always append SEED_JOBS (25 Indian IT jobs)
                                       │
                                       ▼
                                  cache all jobs for 10 min
                                  apply filters
                                  return paginated result
```

---

### 3.2 Geolocation

```
useGeolocation hook
   │
   ├─ sessionStorage["cl_geo"] exists?
   │     YES ──► restore { lat, lon, city } immediately
   │             status = "granted"
   │
   └─ NO ──► navigator.geolocation.getCurrentPosition()
                  │
                  ├─ granted ──► setCoords({ lat, lon })  ← set BEFORE geocode
                  │              setStatus("granted")
                  │              reverseGeocode(lat, lon)  ← Nominatim API
                  │                   └─ { city: "Marunji", fullCity: "Marunji, Maharashtra" }
                  │              sessionStorage.setItem("cl_geo", ...)
                  │
                  └─ denied ──► status = "denied"
                                error = "Location access denied"
```

When status becomes "granted", `Jobs.jsx` fires a **second `fetchJobs()` call** passing:

```js
{
  location:  "Marunji",
  latitude:  18.598,
  longitude: 73.727,
  radius:    25,          // km
  limit:     200
}
```

These appear in the server log as:
```
[job.service] Incoming params {
  location: "Marunji",
  lat: 18.598,
  lon: 73.727,
  radius: 25,
  ...
}
```

---

### 3.3 Filtering Pipeline

Filtering runs in two layers — server-side (coarse) then client-side (precise).

#### Server-side (`job.service.js → applyFilters`)

```
All jobs (Remotive + Arbeitnow + Seed)
   │
   ├─ keyword filter   title or company contains search string
   ├─ jobType filter   normalised type match
   │
   └─ location filter (when location param provided)
         │
         ├─ split: remoteJobs vs physicalJobs
         ├─ exclude: isInternational() — drops USA/Europe/Africa/etc.
         │
         ├─ WITH lat/lon ──► Haversine distance ≤ radius km
         │                    sort nearest-first
         │
         └─ WITHOUT lat/lon ──► city name string match (includes)
         │
         └─ append remoteJobs if includeRemote=true
```

#### Client-side (`geoUtils.js → filterJobsByLocation`)

Runs on every state change (memoised with `useMemo`):

```
allJobs (from server)
   │
   ├─ keyword filter
   ├─ jobType filter
   │
   ├─ split remote / physical
   │
   └─ location selected?
         NO ──► return physicalJobs (+ remote if toggled)
         │
         YES ──►
               exclude isInternationalJob()
               annotate each job with _distKm (Haversine or CITY_COORDS lookup)
               │
               Progressive radius expansion:
               ┌─ try radius=10 km  → found > 0? stop
               ├─ try radius=25 km  → found > 0? stop
               ├─ try radius=50 km  → found > 0? stop
               └─ try radius=100 km → found > 0? stop
                         │
                         └─ still 0? ──► city-string match fallback
                                        (catches any city not in CITY_COORDS)
               │
               sort by _distKm ascending (unknown distance → end)
               append remoteJobs if includeRemote=true
               │
               return { jobs, searchedRadius, expandedRadius }
```

If `expandedRadius=true`, the UI shows:
> "No jobs within 10 km. Expanded to 25 km of Marunji."

#### Distance display on cards

```
job._distKm = 0.734  ──► JobCard shows "📍 734 m away"
job._distKm = 4.2    ──► JobCard shows "📍 4.2 km away"
job._distKm = null   ──► no distance badge shown
```

---

### 3.4 Save / Unsave a Job

**Optimistic update** — UI responds instantly, API call happens in background:

```
User clicks bookmark
   │
   ├─ already saved?
   │     YES ──► remove from savedMap immediately
   │             DELETE /api/jobs/save/:savedId
   │             on error ──► restore savedMap
   │
   └─ not saved
         add tmp key to savedMap immediately
         POST /api/jobs/save  { externalJobId, title, company, ... }
         (full payload stored in MySQL saved_jobs — no FK to jobs table)
         on success ──► replace tmp key with real savedId
         on error   ──► remove tmp key
```

Saved jobs survive indefinitely (not tied to the 10-min jobs cache) because the full job payload is stored inline in `saved_jobs`.

---

## 4. Companies Search Flow

```
User types "Infosys" in keyword, "Marunji" in city
   │
   ▼
POST /api/companies/search  { keyword, city, lat, lon }
   │
   ▼
company.service.js: searchCompanies()
   │
   ├─ check 30-min in-memory cache
   │
   ├─ validateGoogleKey()
   │     ├─ key starts with "AIza" and ≥ 35 chars? ──► VALID
   │     └─ missing / placeholder / malformed?      ──► INVALID_KEY (skip Google)
   │
   ├─ Google Places API v2 (if key valid)
   │     POST https://places.googleapis.com/v1/places:searchText
   │     { textQuery: "Infosys in Marunji" }
   │     ├─ success ──► normaliseGooglePlace() → places[]
   │     └─ error   ──► log error, fall through to OSM
   │
   └─ OSM fallback (when Google fails or key invalid)
         │
         ├─ lat/lon provided? ──► use directly (skip Nominatim geocode)
         └─ lat/lon missing?  ──► geocodeCity("Marunji") via Nominatim
         │
         Overpass API with progressive radius expansion:
         ┌─ 2 km   → results > 0? stop
         ├─ 5 km   → results > 0? stop
         ├─ 10 km  → results > 0? stop
         ├─ 15 km  → results > 0? stop
         └─ 25 km  → results > 0? stop
               │
               └─ still 0? ──► Nominatim name search (last resort)
         │
         ▼
   enrichResults()
         ├─ detectCareerPage()  probe /careers, /jobs, /hiring, etc.
         ├─ upsertCompany()     save to MySQL companies table (idempotent by placeId)
         └─ haversineKm()       calculate distance from user coords
         │
         sort nearest-first
         cache for 30 min
         │
         ▼
   return { companies[], source, total, googleWarning }
```

**Why Overpass starts at 2 km (not 25 km):**  
Large Overpass queries on dense urban areas caused 504 Gateway Timeout errors.  
Starting small avoids this and returns results faster for nearby searches.

---

## 5. Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│  BROWSER                                                            │
│                                                                     │
│  React + Redux                                                      │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────────┐   │
│  │ authSlice   │  │ Jobs.jsx     │  │ CompanySearch.jsx        │   │
│  │             │  │              │  │                          │   │
│  │ user        │  │ allJobs[]    │  │ results[]                │   │
│  │ token       │  │ filtered[]   │  │ selectedCity             │   │
│  │ isAuth      │  │ coords ref   │  │                          │   │
│  └──────┬──────┘  └──────┬───────┘  └──────────┬──────────────┘   │
│         │                │                      │                   │
│  localStorage             useGeolocation         │                   │
│  token, user              sessionStorage         │                   │
│                           cl_geo                 │                   │
└─────────┼────────────────┼──────────────────────┼───────────────────┘
          │  Bearer token   │  location params      │  keyword + city
          ▼                ▼                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│  EXPRESS SERVER  (port 5000)                                        │
│                                                                     │
│  verifyToken middleware                                             │
│  req.user = { id, name, email, role }                              │
│                                                                     │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐ │
│  │ /api/auth        │  │ /api/jobs        │  │ /api/companies   │ │
│  │                  │  │                  │  │                  │ │
│  │ register         │  │ getLiveJobs()    │  │ searchCompanies()│ │
│  │ login            │  │ applyFilters()   │  │ Google Places    │ │
│  │                  │  │ Haversine        │  │ Overpass OSM     │ │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘ │
│                                │                        │           │
│                         in-memory cache          in-memory cache    │
│                         10 min TTL               30 min TTL         │
└─────────────────────────────────────────────────────────────────────┘
          │                      │                        │
          ▼                      ▼                        ▼
┌──────────────────┐   ┌──────────────────┐   ┌──────────────────────┐
│  MySQL           │   │  Remotive API    │   │  Google Places v2    │
│                  │   │  Arbeitnow API   │   │  Overpass API (OSM)  │
│  users           │   │  (live jobs)     │   │  Nominatim           │
│  saved_jobs      │   │                  │   │                      │
│  companies       │   │  Seed jobs       │   │                      │
│  saved_companies │   │  (25 Indian IT)  │   │                      │
└──────────────────┘   └──────────────────┘   └──────────────────────┘
```

---

## 6. Error Codes Reference

### Auth errors

| HTTP | Code | Meaning | Frontend action |
|------|------|---------|----------------|
| 400 | `VALIDATION_ERROR` | Missing/invalid field | Show field error |
| 401 | `WRONG_PASSWORD` | bcrypt mismatch | "Incorrect password" |
| 401 | `NO_TOKEN` | No Authorization header | Redirect to /login |
| 401 | `TOKEN_EXPIRED` | Past `exp` claim | Logout + redirect |
| 401 | `TOKEN_INVALID` | Bad signature | Logout + redirect |
| 403 | `FORBIDDEN` | Wrong role | "Access denied" |
| 404 | `NOT_FOUND` | Email not in DB | "No account found" |
| 409 | `EMAIL_TAKEN` | Duplicate email | "Email already used" |
| 500 | `SECRET_MISSING` | `JWT_SECRET` not set | Server config error |
| 500 | `SERVER_ERROR` | Uncaught DB error | Retry |

### Jobs errors

| Scenario | Behaviour |
|----------|-----------|
| Both Remotive + Arbeitnow fail | Fall back to 25 built-in seed jobs |
| No jobs match location | Progressive radius expansion (10→25→50→100 km) |
| Still no match | City-name string match fallback |
| Save fails | Optimistic UI reverted |

### Companies errors

| Scenario | Behaviour |
|----------|-----------|
| Google key invalid | Skip Google, use OSM immediately |
| Google returns error | Log error, fall back to OSM |
| Overpass 504 | Retry at next radius step |
| All sources fail | Return 503 with `suggestion` field |

---

## 7. File Map

```
server/
├── server.js                   Entry point, startup sequence
├── app.js                      Express app, routes, CORS
├── .env                        Secrets (never commit)
│
├── config/
│   ├── ensureSecret.js         JWT_SECRET validation + auto-generation
│   ├── db.js                   Sequelize (MySQL or SQLite)
│   └── dotenv.js               dotenv loader
│
├── middleware/
│   └── auth.middleware.js      verifyToken, requireRole
│
├── controllers/
│   ├── auth.controller.js      register, login
│   ├── user.controller.js      getProfile, updateProfile, getStats
│   └── job.controller.js       getAllJobs, saveJob, ...
│
├── services/
│   ├── auth.service.js         (legacy, logic now in controller)
│   ├── job.service.js          getLiveJobs, applyFilters, save/unsave
│   └── company.service.js      searchCompanies, Google/OSM pipeline
│
├── routes/
│   ├── auth.routes.js
│   ├── user.routes.js
│   ├── job.routes.js
│   └── company.routes.js
│
└── models/
    ├── user.model.js
    ├── job.model.js
    ├── savedJob.model.js
    └── company.model.js

client/src/
├── main.jsx                    App entry, dispatches bootstrapAuth
├── App.jsx                     Routes + ProtectedRoute
│
├── redux/
│   ├── store.js
│   └── authSlice.js            loginSuccess, logout, bootstrapAuth
│
├── services/
│   ├── api.js                  Axios instance + JWT interceptors
│   ├── authService.js          register, login, fetchProfile
│   └── jobService.js           getAllJobs, saveJobBookmark, ...
│
├── hooks/
│   ├── useGeolocation.js       GPS + Nominatim + sessionStorage cache
│   └── useJobs.js              (legacy Redux hook)
│
├── utils/
│   ├── jwt.js                  decodeToken, isTokenValid, getValidToken
│   ├── geoUtils.js             haversineKm, filterJobsByLocation, ...
│   └── constants.js            BASE_URL, JOB_TYPES, etc.
│
├── pages/student/
│   ├── Jobs.jsx                Location-aware job search page
│   ├── CompanySearch.jsx       Company search page
│   └── ...
│
└── components/
    ├── Jobs/JobFilter.jsx      Keyword + location + radius + remote toggle
    ├── Jobs/JobCard.jsx        Job card with distance badge
    └── common/
        ├── Navbar.jsx
        └── ProtectedRoute.jsx  Redirects unauthenticated users
```
