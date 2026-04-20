# Deploy WorkScheduler (free tier)

## Backend — Fly.io (Docker)

Prerequisites: Docker Desktop running, `flyctl` installed (`winget install Fly-io.flyctl`).

1. **Log in** (opens browser):

   ```powershell
   flyctl auth login
   ```

2. **Pick a unique app name** — change `app = '...'` in `fly.toml` if the name is taken (globally unique on Fly).

3. **Set secrets** (use a **new** MongoDB user password; never commit `.env`):

   ```powershell
   flyctl secrets set MONGODB_URI="mongodb+srv://..." JWT_SECRET="(long random)" JWT_REFRESH_SECRET="(long random)" FRONTEND_ORIGIN="https://YOUR-VERCEL-APP.vercel.app"
   ```

   Add extra preview origins if needed (comma-separated), e.g. `https://YOUR-VERCEL-APP-git-main-....vercel.app`.

4. **Deploy** from this folder (`WorkScheduler`):

   ```powershell
   flyctl deploy
   ```

5. **Check**: `https://YOUR-APP.fly.dev/healthz` should return `{"status":"ok"}`.

## Frontend — Vercel

1. Import this GitHub repo in Vercel (root: `frontend` or monorepo with `frontend` as project root — set **Root Directory** to `frontend`).

2. **Environment variable** (Production + Preview):

   - `VITE_API_BASE_URL` = `https://YOUR-APP.fly.dev/api`

3. Deploy. Open the Vercel URL and test login/register.

## Docker image (local)

From `WorkScheduler`:

```powershell
docker build -f Dockerfile -t workscheduler-api:local .
```
