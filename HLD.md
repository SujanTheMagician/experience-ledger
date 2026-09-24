# High-Level Design (HLD)

## Experience Ledger

### 1. Architecture Overview

Experience Ledger is a three-tier web application:

```
 ┌────────────────────┐      HTTPS/JSON      ┌──────────────────────┐      SQL       ┌──────────────────┐
 │   React Client      │  ───────────────►   │   Express.js API      │  ─────────►    │   PostgreSQL       │
 │   (Vite, SPA)        │  ◄───────────────   │   (Node.js)            │  ◄─────────    │   Database          │
 └────────────────────┘                      └──────────────────────┘                 └──────────────────┘
       served by nginx                        stateless, JWT-auth'd                  relational schema,
       (Docker/Netlify)                        REST endpoints                          raw SQL via `pg`
```

- **Client**: React 19 SPA built with Vite, routed with React Router.
  Talks to the backend only via REST/JSON over HTTP(S).
- **Server**: Node.js + Express REST API. Stateless — every request
  carries its own JWT; no server-side session store.
- **Database**: PostgreSQL. All persistence and referential integrity
  (foreign keys, enum-style `CHECK` constraints) live here.
- **File storage**: uploaded evidence files stored on the server's local
  disk (`server/uploads/`), served as static files.

### 2. Major Components

| Component | Responsibility |
|---|---|
| `client/src/pages/*` | One page per user-facing screen (Login, Dashboard, AddExperience, ReviewQueue, Analytics, UserManagement, StudentRecords, ExportProfile) |
| `client/src/context/AuthContext` | Holds the logged-in user + JWT client-side, exposes auth state to the whole app |
| `client/src/api/*` | Thin fetch wrappers per resource (auth, experiences, uploads, users) |
| `server/routes/*` | Maps URLs + HTTP verbs to controller functions, attaches auth middleware |
| `server/controllers/*` | Business logic per resource (auth, experiences, uploads, users) |
| `server/middleware/auth.js` | `protect` (JWT verification) and `authorize(...roles)` (RBAC) |
| `server/middleware/upload.js` | Multer config: file type/size validation, disk storage |
| `server/config/db.js` | PostgreSQL connection pool, SSL auto-detection for hosted Postgres |
| `server/config/schema.sql` | Full relational schema definition |

### 3. Key Design Decisions

- **Stateless auth (JWT)** instead of server-side sessions — simplifies
  horizontal scaling and fits a decoupled SPA + API architecture.
- **Relational database (PostgreSQL)** over a document store — the
  domain is inherently relational (a user owns many experiences, an
  experience has one reviewer, experiences and skills are many-to-many).
  The project initially used MongoDB/Mongoose and was deliberately
  migrated to PostgreSQL for this reason.
- **No ORM** — raw parameterized SQL via the `pg` driver, for
  transparency and direct control over queries.
- **Role-based access control (RBAC)** enforced at the middleware layer,
  not just in the UI — the API rejects unauthorized requests regardless
  of what the frontend shows.
- **Google OAuth as an additive login path** — verified server-side via
  `google-auth-library`, with automatic account linking by email so a
  user never ends up with duplicate accounts.

### 4. Data Flow — Example: Submitting and Verifying an Experience

1. Student logs in → client stores JWT.
2. Student submits an experience (`POST /api/experiences`) with the JWT
   attached → server verifies JWT, inserts a row with
   `status = 'Pending Verification'`, owner forced to the JWT's user id.
3. Student optionally uploads evidence (`POST /api/uploads`) → server
   validates file type/size, stores it, returns a URL.
4. Mentor opens the Review Queue → `GET /api/experiences?status=Pending%20Verification`.
5. Mentor approves/rejects (`PUT /api/experiences/:id/status`) → RBAC
   middleware confirms the caller's role is mentor/placement_officer/admin.
6. Placement Officer/Admin views Analytics → `GET /api/experiences`
   (all), aggregated client-side into readiness %, trends, and cohort
   stats.

### 5. Deployment Architecture

- **Local/dev**: `docker-compose.yml` spins up Postgres, the Express API,
  and an nginx-served React build as three linked containers.
- **Production**: API + Postgres deployed on Render (SSL auto-detected
  from the connection string); static frontend build deployed on
  Netlify with an SPA fallback redirect so client-side routes don't
  404 on refresh.

### 6. External Dependencies

- **Google Identity Services** — third-party authentication provider.
- **Bruno** — API collection used for manual endpoint testing/documentation
  (not part of the runtime system, a development-time tool).
