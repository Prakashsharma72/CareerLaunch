# CareerLaunch

## Overview

CareerLaunch is a React and Node.js career platform for students and freshers. It combines email-verified accounts, profiles, nearby company discovery, verified company career pages, saved opportunities, roadmaps, and AI-powered mock interviews.

The current implementation is primarily a company-discovery platform. The legacy `jobs` naming remains in several routes and screens, but Google Places-backed company data is the active search source.

## Problem Statement

Students need one place to discover relevant companies, find career pages, save opportunities, prepare with mock interviews, and maintain a career profile. CareerLaunch brings those workflows into one authenticated web application.

## Features

- Email registration with six-digit OTP verification
- Login, logout, forgot-password, and reset-password flows
- Student profile, skills, avatar, and resume upload
- Nearby and city-based company discovery
- Google Places details, ratings, hours, photos, maps links, and reviews
- Verified company career-page discovery
- Saved company and saved job/company snapshot lists
- Roadmap library for authenticated users
- Gemini-powered mock interview sessions, feedback, scoring, reports, and history
- Admin dashboard statistics, activity feed, roadmap creation, and API-key settings

The current code does not prove persistent AI chat history, AI roadmap generation, resume analysis, or real job application submission. Several resource and user admin screens still use local/demo state.

## Tech Stack

### Frontend

- React 19 with Vite
- React Router DOM 7
- Redux Toolkit and React Redux
- Axios
- Tailwind CSS, React Icons, and Framer Motion

### Backend

- Node.js ES modules
- Express 4
- Sequelize 6
- `jsonwebtoken` for JWTs
- `bcryptjs` for password hashing
- Multer and Cloudinary for uploads
- Nodemailer and Brevo fallback for email
- Google Generative AI SDK for Gemini
- Axios for external HTTP calls

### Database

Runtime persistence uses Sequelize with SQLite by default. MySQL is supported when `DB_DIALECT=mysql`. `server/config/careerlaunch.sql` is a MySQL-oriented schema reference. `server/prisma/schema.prisma` is only an empty PostgreSQL scaffold and is not the runtime data layer.

## Architecture

```text
User browser
  -> React/Vite frontend
  -> Axios API client with Bearer JWT
  -> Express routes and middleware
  -> Controllers and services
  -> Sequelize models
  -> SQLite by default or MySQL when configured
  -> Google Places, Nominatim, Overpass, Gemini, Cloudinary, and email services
```

Typical request flow:

```text
Client -> Route -> JWT/role middleware -> Controller -> Service/model -> Response -> React state -> UI
```

## Project Structure

```text
client/
  src/App.jsx              Routes, lazy loading, and route guards
  src/main.jsx             React bootstrap, Redux Provider, and BrowserRouter
  src/components/          Shared navigation, cards, filters, and UI pieces
  src/layouts/             Public, student, and admin shells
  src/pages/               Auth, student, admin, and public screens
  src/hooks/               useAuth, usePlaces, useCompanyCareers
  src/redux/               Store and auth, places, jobs, resources, AI, company slices
  src/services/            Axios service modules for API calls
  src/utils/               JWT and theme helpers
server/
  app.js                   Express setup and route registration
  server.js                Startup, migrations, database sync, and listen
  routes/                  HTTP endpoint declarations
  controllers/             Request handlers
  services/                Business logic and integrations
  models/                  Sequelize models
  middleware/              JWT, roles, uploads, and errors
  config/                  Database, email, Cloudinary, and SQL schema
  ai/                      Gemini/OpenAI clients and prompts
```

## Frontend

`client/src/main.jsx` applies the saved theme, dispatches `bootstrapAuth()`, and renders the app inside Redux and `BrowserRouter` providers. `App.jsx` defines public routes, protected student routes, admin routes, lazy-loaded pages, and a loading fallback.

Important route groups are `/`, `/login`, `/register`, `/forgot-password`, `/reset-password`, `/student/*`, and `/admin/*`. `ProtectedRoute` waits for auth bootstrapping and requires a valid session. `AdminRoute` additionally requires `user.role === "admin"`.

Pages use local state for forms, loading flags, filters, pagination, modals, and feature-specific workflows. Shared components include navigation, layouts, company cards, career cards, filters, and reusable UI controls. Axios services centralize calls, while the Axios interceptor adds the JWT and logs out on a 401 response.

Loading and error states are handled with component flags and messages. Student and admin pages are lazy-loaded, and Vite config creates manual vendor chunks for React, Router, Redux, Framer Motion, icons, and Axios.

### State Management

The Redux store contains:

- `auth`: user, token, authentication state, bootstrapping, loading, and errors
- `places`: location, filters, company results, pagination, source, and saved-company map
- `jobs`, `resources`, `ai`, and `companies`: older or partially used feature state

Current pages often combine Redux for shared auth/location data with local component state for API results and UI state.

## Backend

`server/server.js` loads environment variables, ensures a JWT secret, authenticates the database, creates missing tables and columns, runs `sequelize.sync({ force: false })`, checks SMTP, and starts the server on port 5000 by default.

`server/app.js` configures an explicit CORS allowlist, JSON and URL-encoded parsing, mounts `/api` routers, exposes a health check at `/`, and installs the global error handler last.

Controllers validate request data and delegate to Sequelize models or services. Services contain external API integration, company career verification, AI logic, email delivery, uploads, and other business logic. Middleware verifies JWTs, checks roles, handles uploads, and formats errors.

## API Endpoints

All endpoints are prefixed with `/api`.

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| POST | `/auth/register` | Public | Create pending registration and send OTP |
| POST | `/auth/verify-otp` | Public | Verify OTP, create user, issue JWT |
| POST | `/auth/resend-otp` | Public | Send a new OTP |
| POST | `/auth/login` | Public | Validate credentials and issue JWT |
| POST | `/auth/forgot-password` | Public | Send reset instructions |
| POST | `/auth/reset-password` | Public | Set a new password |
| GET/PUT | `/users/profile` | JWT | Read or update profile |
| GET | `/users/stats` | JWT | Get user statistics |
| GET | `/jobs` | Public | Google Places-backed company results |
| POST/GET/DELETE | `/jobs/save`, `/jobs/saved/list`, `/jobs/save/:id` | JWT | Save/list/remove snapshots |
| GET | `/companies`, `/companies/search` | Public | Legacy company search/list |
| POST | `/places/nearby` | Public | Find nearby companies |
| GET | `/places/search`, `/places/:placeId` | Public | Search or fetch company details |
| GET | `/company-careers` | Public | Find companies with verified career pages |
| POST/GET/DELETE | `/saved-companies`, `/saved-companies/:id` | JWT | Save/list/remove companies |
| POST | `/ai/chat` | JWT | Send a request to the AI service |
| POST/GET | `/interview/start`, `/interview/history` | JWT | Start or list interviews |
| POST/GET | `/interview/:sessionId/*`, `/interview/:sessionId` | JWT | Answer, skip, end, or inspect a session |
| GET/POST | `/roadmaps` | JWT; POST also admin | List or create roadmaps |
| GET/POST/DELETE | `/resources`, `/resources/:id` | Public GET; JWT mutations | Resource operations |
| GET | `/admin/stats`, `/admin/users`, `/admin/activities` | JWT + admin | Admin data |
| GET/PUT | `/settings/keys` | JWT + admin | Read masked or update integration keys |
| POST | `/upload/avatar` | JWT | Upload JPEG, PNG, or WEBP, max 2 MB |
| POST | `/upload/resume` | JWT | Upload PDF, max 5 MB |

Legacy job mutation, apply, import, and seed handlers exist but currently return `501 Not Implemented` in the controller. Frontend AI history/clear methods exist, but matching backend routes are not mounted.

## Authentication

1. Registration validates basic fields, hashes the password with `bcryptjs` cost 12, stores the pending account and six-digit OTP, then emails the OTP.
2. OTP verification checks the email, code, and ten-minute expiry. It creates the permanent user, deletes the pending record, and returns a JWT plus a safe user projection.
3. Login checks the password hash and returns the same JWT shape.
4. The JWT contains `id`, `name`, `email`, and `role`, and expires after seven days.
5. The frontend stores the token in `localStorage`. Axios sends it as `Authorization: Bearer <token>`.
6. `verifyToken` validates the signature server-side and attaches the decoded user to `req.user`.
7. `requireAdmin` checks the role for admin routes. The frontend also hides unauthorized route trees.
8. A 401 response clears local auth state and redirects to `/login`.

Logout removes the local token and user. Password-reset tokens are generated with `crypto.randomBytes`, expire after one hour, and are stored in `password_resets`.

## Database

The main Sequelize tables are `users`, `pending_registrations`, `password_resets`, `jobs`, `resources`, `companies`, `saved_jobs`, `saved_companies`, `roadmaps`, `interview_sessions`, `interview_questions`, and `chats`.

Users have a primary key and unique email. Saved records belong to users and store inline snapshots of external job/company data. Companies are cached by `place_id`. Interview sessions belong to users and contain interview questions with answers, feedback, scores, and skipped state. Roadmaps store title, target role, and content. Startup DDL creates missing tables and adds missing columns for both SQLite and MySQL.

The model association file currently defines no Sequelize associations, so most relationships are represented by ID columns and explicit queries. The `chats` model/table exists, but the active AI controller does not use it.

### Example Database Flows

For a saved company, the client sends the company snapshot and JWT, the route verifies the user, the controller stores it in `saved_companies` with `user_id`, and the saved-companies page later queries records for that user.

For an interview, the start endpoint creates an `interview_sessions` row and question rows. Answer and skip endpoints update the question and session state. Ending the session stores the score/report, which the history and detail endpoints return to React.

## React Hooks

### Core React hooks

| Hook | Where used | Purpose |
|---|---|---|
| `useState` | Auth pages, layouts, Home, student/admin pages, cards, filters, custom hooks | Stores form fields, results, loading/error flags, filters, modal state, theme, and interview state |
| `useEffect` | `main.jsx`, layouts, Home, auth, student/admin pages, filters | Runs startup auth, API loads, theme/route changes, geolocation, animation subscriptions, and synchronization side effects |
| `useRef` | Navbar, Register, Home, CompanySearch, Jobs, Profile, MockInterview, CompanyFilters | Holds DOM/file elements, initialization flags, debounce timers, and chat/input references without causing renders |
| `useMemo` | `Jobs.jsx`, `RoadmapGenerator.jsx`, places selectors | Derives filtered or paginated data without recalculating on unrelated renders |
| `useCallback` | `usePlaces`, `useCompanyCareers`, Dashboard, Jobs, CompanySearch, CompanyDetails, saved pages, Home, ripple hooks | Keeps async/event functions stable for effect dependencies and child props |

There is no project usage of React `useContext` or `useReducer` identifiable in `client/src`.

### Router and Redux hooks

- `useNavigate`: moves between auth, dashboard, company, job, and admin screens.
- `useLocation`: detects the current path for active navigation and closing mobile menus.
- `useParams`: reads job, company `placeId`, and interview session route parameters.
- `useSearchParams`: reads reset-password email/token query parameters.
- `useDispatch`: sends auth, place, and UI actions to Redux.
- `useSelector`: reads auth, location, filters, company results, pagination, and saved maps.

### Framer Motion hooks

- `useInView` in `Home.jsx`: starts reveal/counter effects when sections enter the viewport.
- `useMotionValue` in `Home.jsx`: holds animated counter values.
- `useSpring` in `Home.jsx`: smooths those counter transitions before displaying them.

## Custom Hooks

- `useAuth()` in `client/src/hooks/useAuth.js`: wraps Redux auth state and login, registration, OTP verification, OTP resend, and logout operations. It returns user/token/auth flags, errors, loading flags, and those actions. It prevents auth logic from being duplicated across `Login.jsx` and `Register.jsx`.
- `usePlaces()` in `client/src/hooks/usePlaces.js`: reads shared location/filter state and returns `requestLocation`, `fetchByCity`, `refetch`, and `doFetch`. It combines browser geolocation, Nominatim reverse geocoding, Places API service calls, Redux loading/error actions, and explicit fetch parameters to avoid stale closures. It is used by `CompanySearch.jsx`.
- `useCompanyCareers()` in `client/src/hooks/useCompanyCareers.js`: returns company results, loading/error/source state, and location/search/refetch actions. It uses the shared places location/filter state and calls `/company-careers`. It is used by `Jobs.jsx`.
- Local `useRipple()` exists independently in `Login.jsx` and `Register.jsx`. It stores ripple objects and creates button-click ripple animations; it is not shared between those files.

Interview explanation: “I use `useState` for local UI state, `useEffect` for API and browser side effects, `useRef` for DOM and timer references, and `useCallback`/`useMemo` where stable handlers or derived filtering are useful. Shared authentication and location data use Redux, while custom hooks package reusable workflows such as login and company discovery.”

## Important Features

### Company discovery

The user grants location access or enters a city. React calls the Places service, the backend calls Google Places, deduplicates and sorts results, caches them briefly, and may enrich companies with career-page information. Results and filters are rendered in the company search screen.

### Career-page discovery

`Jobs.jsx` uses `useCompanyCareers` to request companies whose career URLs pass backend verification. The backend combines location/company data with outbound career-page checks and returns the verified list.

### Profile and uploads

`Profile.jsx` loads and updates the authenticated profile. Avatar and PDF resume files are sent through protected upload endpoints, validated by Multer for type and size, streamed to Cloudinary, and saved as URLs on the user.

### Mock interviews

The user selects a role and difficulty. The interview API creates a session, Gemini generates or evaluates interview content, answer/skip actions update questions, and ending the session produces a report and score. React switches between setup, interview, report, history, and detail views.

### Roadmaps and resources

Roadmaps are fetched for authenticated users and can be created by admins. The current student roadmap screen is a searchable roadmap library. Student resources and some admin resource/user management screens contain local hard-coded/demo data even though related backend routes/models exist.

## Third-Party APIs

- Google Places API v2: server-side company text search and place details using `GOOGLE_MAPS_API_KEY`; field masks and timeouts are used.
- Google Generative AI Gemini 2.0 Flash: chat and mock-interview generation/evaluation using `GEMINI_API_KEY`.
- OpenStreetMap Nominatim: browser-triggered reverse geocoding in `usePlaces` and `useCompanyCareers`.
- OpenStreetMap Overpass: legacy company-search fallback.
- Cloudinary: server-side in-memory avatar and resume uploads.
- SMTP/Nodemailer with Brevo HTTP fallback: OTP and password-reset email delivery.
- OpenAI client code exists, but the active AI controller uses Gemini; active production use of OpenAI is not identifiable from the code.

## Security

Implemented protections include bcrypt password hashing, JWT signature verification, safe user projections that exclude password/OTP, protected routes, admin role middleware, CORS origin filtering, upload size/type limits, masked key reads, and non-revealing forgot-password responses.

Risks visible in the current code include JWTs in `localStorage` (XSS impact), public registration accepting `role: "admin"`, resource mutation routes requiring authentication but not admin role, development error responses exposing stack traces, runtime admin settings writing server `.env`, MIME-only file validation, no identifiable rate limiting/security-header middleware, and outbound career-page probing that needs SSRF hardening. Secrets are expected from environment variables and are not documented with values.

## Installation

```powershell
cd client
npm install
cd ..\server
npm install
```

## Environment Variables

Do not commit secret values. The code reads variables including:

- Frontend: `VITE_API_URL`
- Server: `JWT_SECRET`, `PORT`, `FRONTEND_URL`
- Database: `DB_DIALECT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`, `DB_STORAGE`
- Integrations: `GEMINI_API_KEY`, `OPENAI_API_KEY`, `GOOGLE_MAPS_API_KEY`, Cloudinary variables, SMTP variables, and `BREVO_API_KEY`

The backend defaults to SQLite storage `careerlaunch.sqlite` and port `5000`. Configure MySQL values and `DB_DIALECT=mysql` when using MySQL.

## Running the Project

Start the backend:

```powershell
cd server
npm run dev
```

Start the frontend in another terminal:

```powershell
cd client
npm run dev
```

The frontend has `npm run build`, `npm run preview`, and `npm run lint` scripts. The server has `npm start`, `npm run dev`, and a legacy seed script.

## Deployment

The frontend has Vercel configuration with an SPA rewrite to `index.html`. Production API configuration references a Render-hosted backend. No backend Dockerfile, Render manifest, CI workflow, or definitive production database choice is present, so actual backend hosting and production dialect are not identifiable from the repository.

## Interview Explanation

### One-minute answer

“CareerLaunch is a full-stack career platform for students and freshers. I built a React frontend with Vite, React Router, Redux Toolkit, Axios, and Framer Motion, backed by a Node.js and Express API. Users can register with email OTP verification, manage their profile, upload a resume and avatar, discover nearby companies through Google Places, save companies, browse career pages, and practise with AI mock interviews. The backend uses Sequelize with SQLite by default and supports MySQL, JWT authentication, bcrypt password hashing, Cloudinary uploads, email delivery, and Gemini for interview features. One important challenge was keeping location-based company discovery reliable, so the frontend custom hook handles geolocation and city fallback while the backend caches, deduplicates, sorts, and enriches results.”

### Two-minute answer

“CareerLaunch solves the problem of scattered career preparation tools for students. The React app is organized around public auth pages, a protected student dashboard, and a role-protected admin dashboard. The frontend starts by bootstrapping authentication from a JWT in local storage, then uses Axios to attach the Bearer token to API requests. Redux stores shared auth and location state, while pages and custom hooks manage feature-specific data and UI state.

The Express backend separates routes, middleware, controllers, services, and Sequelize models. It supports SQLite by default and can use MySQL. The authentication flow stores a pending registration, sends a six-digit OTP, hashes passwords with bcryptjs, creates the verified user, and signs a seven-day JWT. Protected middleware verifies that token, and admin middleware checks the role.

The main product flow is company discovery. A user grants location permission or searches by city. The frontend calls the API, the backend queries Google Places, caches and deduplicates results, and can verify career pages. The user can inspect details and save company snapshots. Another substantial feature is the mock interview workflow, where sessions, questions, answers, feedback, scores, and reports are persisted and Gemini supports the AI behavior. The repository also contains a roadmap library, profile uploads through Cloudinary, and admin statistics. The main technical caveat is that some older job, resource, and admin screens are transitional, so I would describe those as partially implemented rather than claim functionality that the code does not currently provide.”

## My Contribution

The repository does not identify an author or commit ownership, so personal contribution cannot be proven from code alone. The implementation areas present in the project are:

- Frontend: React pages, layouts, reusable components, hooks, Redux slices, services, and routing.
- Backend: Express app/startup, routes, controllers, services, middleware, Sequelize models, and integrations.
- APIs: Auth, profile, places/companies, saved records, interviews, roadmaps, uploads, admin, and settings endpoints.
- Database: Sequelize models plus startup migrations and SQL schema reference.
- Authentication: OTP registration, bcryptjs password handling, JWT issuance/verification, and role checks.
- UI: Responsive public, student, and admin screens with theme support and Framer Motion animations.
- Deployment: Vercel frontend configuration and Render API references are present; personal deployment ownership is not identifiable.
- Other: Personal authorship and exact division of work are not identifiable from the project.

# CareerLaunch Interview Questions

## Interview Questions

The 30 project-specific questions and short speaking answers are included in the “Interview Questions” section below.

### Basic

1. **What is CareerLaunch?** It is a career platform for students with discovery, profiles, saved companies, roadmaps, and AI mock interviews.
2. **What is the frontend stack?** React, Vite, React Router, Redux Toolkit, Axios, Tailwind CSS, React Icons, and Framer Motion.
3. **What is the backend stack?** Node.js ES modules with Express, Sequelize, JWT, bcryptjs, and integration services.
4. **How does the frontend call the backend?** Shared Axios services use `VITE_API_URL`; an interceptor adds the Bearer token.
5. **How are routes organized?** Public auth/main routes, protected `/student` routes, and role-protected `/admin` routes.
6. **What does Redux store?** Auth state and shared places/location state, plus older feature slices.
7. **What database is used?** Sequelize uses SQLite by default and supports MySQL through configuration.
8. **How are passwords stored?** Only bcryptjs hashes are stored, using cost 12 in the active auth controller.
9. **What happens on logout?** The token and cached user are removed from local storage and Redux auth is cleared.
10. **What does the profile page do?** It edits profile fields and uploads avatar/resume files through protected APIs.

### Intermediate

11. **Explain registration.** The server creates a pending record, sends a ten-minute OTP, and creates the permanent user only after verification.
12. **How does auth survive refresh?** `bootstrapAuth` reads a valid local JWT, calls `/users/profile`, and repopulates Redux.
13. **How are protected routes implemented?** React guards wait for bootstrapping, and the server independently verifies every protected request.
14. **Why use custom hooks?** They package reusable workflows such as auth and location search so pages stay focused on presentation.
15. **How does company search work?** Geolocation or city input becomes a Places request; results are stored in Redux and filtered/paginated for display.
16. **Why use `useCallback` in search hooks?** Stable callbacks prevent effects from refiring because a function identity changed on every render.
17. **Why use `useMemo`?** Jobs and roadmaps derive filtered lists without repeating that calculation on unrelated renders.
18. **How do uploads work?** Multer validates size/type, the server streams the file to Cloudinary, then stores the returned URL.
19. **How does the interview feature persist data?** Sessions and question rows record answers, feedback, skipped state, scores, and reports.
20. **How does the backend start safely?** It loads env values, ensures JWT configuration, authenticates the DB, runs dialect-aware DDL, syncs models, then listens.

### Advanced

21. **Why are saved records snapshots?** They preserve the external company/job data at save time and do not depend on live search rows.
22. **What is the active AI provider?** Gemini 2.0 Flash is active in the AI flow; an OpenAI wrapper exists but is not active there.
23. **How is Places traffic optimized?** Field masks, bounded timeouts, a 24-hour in-memory cache, deduplication, and distance sorting are used.
24. **What happens when a JWT expires?** The server returns 401; Axios dispatches logout and redirects the browser to login.
25. **What role does CORS play?** Express allows known local, production, and Vercel preview origins and rejects others.
26. **What security issue would you improve first?** I would prevent public admin-role registration, then move tokens away from local storage and add rate limiting.
27. **What is unusual about the database setup?** Runtime Sequelize, MySQL SQL documentation, SQLite defaults, and an empty Prisma scaffold coexist, so deployment configuration must be made explicit.
28. **What is a current API limitation?** Several legacy job mutations, apply/import actions, and seed handlers intentionally return 501.
29. **How would you scale the cache?** Replace the process-local cache with a shared cache such as Redis and control external-request concurrency centrally.
30. **What would you test?** Auth/OTP expiry, JWT guards, role checks, profile/upload validation, company search fallbacks, saved-record ownership, and interview state transitions.
