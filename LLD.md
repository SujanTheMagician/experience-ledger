# Low-Level Design (LLD)

## Experience Ledger

### 1. Database Schema

**users**
| Column | Type | Notes |
|---|---|---|
| id | SERIAL PK | |
| name | VARCHAR(255) NOT NULL | |
| email | VARCHAR(255) UNIQUE NOT NULL | |
| password | TEXT | nullable — Google-only accounts have no password |
| google_id | VARCHAR(255) UNIQUE | nullable — password-only accounts have no google_id |
| role | VARCHAR(50) NOT NULL DEFAULT 'student' | CHECK IN ('student','mentor','placement_officer','admin') |
| department | VARCHAR(255) | |
| batch | VARCHAR(50) | |
| mentor_id | INTEGER FK → users(id) | self-referencing, assigns a student's mentor |
| created_at / updated_at | TIMESTAMPTZ | |

`CHECK (password IS NOT NULL OR google_id IS NOT NULL)` — every user must
have at least one login method.
Indexes: `mentor_id`, `(department, batch)`.

**skills**
| Column | Type | Notes |
|---|---|---|
| id | SERIAL PK | |
| name | VARCHAR(255) UNIQUE NOT NULL | |
| category | VARCHAR(255) | |

**experiences**
| Column | Type | Notes |
|---|---|---|
| id | SERIAL PK | |
| student_id | INTEGER FK → users(id) NOT NULL | owner |
| type | VARCHAR(50) NOT NULL | CHECK IN ('internship','project') |
| organization | VARCHAR(255) NOT NULL | |
| role | VARCHAR(255) NOT NULL | |
| duration | VARCHAR(255) | |
| description | TEXT NOT NULL | |
| outcome | TEXT | |
| evidence_link | TEXT | uploaded file URL or external link |
| status | VARCHAR(50) NOT NULL DEFAULT 'Pending Verification' | CHECK IN ('Pending Verification','Approved','Rejected','Changes Requested') |
| mentor_comment | TEXT | |
| reviewed_by | INTEGER FK → users(id) | |
| verified_at | TIMESTAMPTZ | |
| created_at / updated_at | TIMESTAMPTZ | |

Indexes: `(student_id, status)`, `(reviewed_by, status)`.

**experience_skills** (many-to-many join table)
`(experience_id, skill_id)` composite PK, both FKs `ON DELETE CASCADE`.

**notifications**
| Column | Type | Notes |
|---|---|---|
| id | SERIAL PK | |
| user_id | INTEGER FK → users(id) NOT NULL | recipient |
| message | TEXT NOT NULL | |
| related_experience_id | INTEGER FK → experiences(id) | nullable |
| is_read | BOOLEAN DEFAULT false | |
| created_at / updated_at | TIMESTAMPTZ | |

Index: `(user_id, is_read)`.

### 2. API Endpoint Contracts

**Auth** (`/api/auth`)
| Method | Path | Auth | Body | Response |
|---|---|---|---|---|
| POST | `/register` | none | `{name, email, password, role?}` | `201 {token, user}` — role restricted to `student\|mentor\|placement_officer` |
| POST | `/login` | none | `{email, password}` | `200 {token, user}` or `401` |
| POST | `/google` | none | `{credential}` | `200 {token, user}` — verifies Google ID token server-side |
| GET | `/me` | Bearer JWT | — | `200 {user}` |

**Experiences** (`/api/experiences`)
| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/` | Bearer JWT | Creates experience owned by `req.user.id`; status forced to `Pending Verification` |
| GET | `/` | none | Optional `?student=&status=` filters |
| GET | `/:id` | none | 404 if not found |
| PUT | `/:id/status` | Bearer JWT + role in (mentor, placement_officer, admin) | Body `{status, mentorComment}` |
| DELETE | `/:id` | Bearer JWT | Owner or reviewer role only (403 otherwise) |

**Uploads** (`/api/uploads`)
| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/` | Bearer JWT | multipart field `file`; PDF/JPG/PNG only, ≤10MB (Multer `fileFilter` + `limits`); returns `{url, originalName, sizeBytes}` |

**Users** (`/api/users`) — admin only
| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/` | Bearer JWT + role=admin | Lists all users (id, name, email, role) |
| PATCH | `/:id/role` | Bearer JWT + role=admin | Body `{role}`, validated against allowed role list |

### 3. Module-Level Design

**`middleware/auth.js`**
```
protect(req, res, next):
  read Authorization header → extract Bearer token
  if missing → 401
  verify JWT with JWT_SECRET → attach payload to req.user
  if invalid/expired → 401
  else → next()

authorize(...roles)(req, res, next):
  if req.user.role not in roles → 403
  else → next()
```
`authorize` always runs after `protect`, so `req.user` is guaranteed set.

**`controllers/authController.js`**
- `SELF_REGISTERABLE_ROLES = ['student','mentor','placement_officer']` —
  `admin` is deliberately excluded; it can only be granted via the
  authenticated `PATCH /api/users/:id/role` endpoint.
- `register`: validates required fields → checks role is self-registerable
  → checks email uniqueness → hashes password with bcrypt (cost 10) →
  inserts → signs JWT → returns token + public user (password never
  included in the response).
- `login`: fetches user by email → `bcrypt.compare` against stored hash →
  signs JWT on match, `401` otherwise (same error message for
  "no such user" and "wrong password" to avoid leaking which emails exist).
- `googleLogin`: verifies the Google ID token's signature and audience via
  `OAuth2Client.verifyIdToken` → looks up by `google_id` → falls back to
  looking up by `email` and linking the Google identity to an existing
  password account → otherwise creates a new `student` account.

**`controllers/experienceController.js`**
- `createExperience`: `student_id` always taken from `req.user.id`, never
  from the request body, to prevent submitting on behalf of another user.
- `getExperiences` / `getExperienceById`: joins `users` to include
  student name/email/role alongside each experience.
- `updateExperienceStatus`: validates `status` against the allowed enum
  before writing.
- `deleteExperience`: loads the experience first to check
  `isOwner = experience.student_id === req.user.id` OR
  `isReviewer = role in (mentor, placement_officer, admin)`; only then
  deletes.

**`middleware/upload.js`**
- Multer disk storage; filename generated as
  `${timestamp}-${randomHex}${originalExtension}` to avoid collisions
  and path traversal via the original filename.
- `fileFilter` rejects any MIME type outside `{application/pdf,
  image/jpeg, image/png}`.
- `limits.fileSize` enforces the 10MB cap; `uploadRoutes.js` translates
  Multer's `LIMIT_FILE_SIZE` error into a clean `400` JSON response.

### 4. Error Handling Convention

Every controller follows the same response shape:
```json
{ "success": true|false, "data": ..., "message": "..." }
```
- `400` — validation failure (missing/invalid fields)
- `401` — not authenticated (missing/invalid/expired token, bad credentials)
- `403` — authenticated but not authorized for this action/role
- `404` — resource not found
- `409` — conflict (duplicate email on register)
- `500` — unexpected server/database error (logged server-side, generic
  message returned to the client)

### 5. Testing Strategy (Jest)

Controllers and middleware are unit-tested with the database mocked
(`jest.mock('../../config/db', () => ({ pool: { query: jest.fn() } }))`),
so tests run without a live Postgres instance and assert exact
`res.status(...)` / `res.json(...)` calls for each branch (missing
fields, duplicate email, blocked admin self-registration, wrong
password, valid login, JWT verification, and role authorization).
