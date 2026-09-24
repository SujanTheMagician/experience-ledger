# Running Experience Ledger with Docker

The app is split into three containers, wired together by `docker-compose.yml` at the repo root:

- **db** — PostgreSQL 16, with a named volume so data survives container restarts
- **server** — the Express API (`server/Dockerfile`)
- **client** — the React app, built with Vite and served as static files by nginx (`client/Dockerfile`)

## 1. Prerequisites

Install [Docker Desktop](https://www.docker.com/products/docker-desktop/) (includes Docker Compose).

## 2. Configure secrets

```
cp .env.example .env
```

Edit `.env` and set a real `JWT_SECRET` (any long random string). `GOOGLE_CLIENT_ID` is optional — leave it blank if you haven't set up Google Sign-In.

## 3. Build and start everything

```
docker compose up --build
```

This builds all three images and starts them. First run takes a few minutes (downloading `postgres:16-alpine`, `node:20-alpine`, `nginx:alpine`, and installing dependencies inside the build stages).

## 4. Initialize the database (one-time, first run only)

In a second terminal, once the containers are up:

```
docker compose exec server npm run db:init
docker compose exec server npm run db:seed
```

This applies the schema and seeds two demo accounts (`alex.rivera@example.com` / `sarah.jenkins@example.com`, password `password123`).

## 5. Open the app

- Frontend: **http://localhost:8080**
- Backend API: **http://localhost:5000**
- Postgres: `localhost:5432` (user `postgres`, password `postgres`, db `experience_ledger`) if you want to connect with a GUI client

## Everyday commands

```
docker compose up -d          # start in the background
docker compose logs -f server # tail one service's logs
docker compose down           # stop everything
docker compose down -v        # stop and also delete the database volume (fresh start)
```

## Notes

- The client's `VITE_API_URL` is baked in at **build time** (Vite convention), currently set to `http://localhost:8080`'s sibling port `http://localhost:5000` in `docker-compose.yml`'s `build.args` — this is the URL your browser will use, so it must be reachable from your host machine, not the internal Docker network hostname.
- `npm run db:seed` isn't idempotent for experiences (re-running it adds duplicate rows), so it's a deliberate manual step rather than something the container runs automatically on every restart.
