# Experience Ledger — Bruno API Collection

This folder is a [Bruno](https://www.usebruno.com/) collection documenting every endpoint in the Experience Ledger backend.

## How to use it

1. Install the Bruno desktop app (or the `bru` CLI).
2. **Open Collection** and select this `bruno/` folder.
3. Select the **Local** environment (top-right environment picker) — it points `{{baseUrl}}` at `http://localhost:5000`.
4. Start the backend: `cd server && npm run dev` (make sure you've run `npm run db:init` and `npm run db:seed` at least once).
5. Run **Auth → Login** first. Its post-response script automatically saves the returned JWT into the `{{token}}` environment variable, so every other protected request in this collection works immediately without manually copying a token around.

## Structure

- **Health Check** — plain liveness check on `/`
- **Auth/** — Register, Login, Google Login, Get Current User
- **Experiences/** — full CRUD: Create, Get All (with filters), Get By Id, Update Status (mentor/admin only), Delete
- **Uploads/** — Upload Evidence File (multipart, PDF/JPG/PNG, 10MB limit)

Each request's **Docs** tab explains what it does, which role/token it needs, and any gotchas (e.g. Update Experience Status requires a mentor token, not a student one).
