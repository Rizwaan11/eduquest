# EduQuest Deployment Guide (Vercel + Render)

## 1. Deploy backend to Render

1. Push this repo to GitHub.
2. In Render, click New + > Blueprint.
3. Select your repo (Render will detect `render.yaml`).
4. Create service.
5. In Render service Environment, set all `sync: false` variables from `server/.env.example` with real values.
6. Set `CLIENT_URL` temporarily to a placeholder (update after Vercel deploy).
7. Deploy and confirm backend is up at:
   - `https://<your-render-service>.onrender.com/api/v1`

## 2. Deploy frontend to Vercel

1. In Vercel, click New Project and import this repo.
2. Set Root Directory to `client`.
3. Framework preset: Vite.
4. Build command: `npm run build`.
5. Output directory: `dist`.
6. Add env vars from `client/.env.example`:
   - `VITE_API_URL=https://<your-render-service>.onrender.com/api/v1`
   - `VITE_GOOGLE_CLIENT_ID=<your google client id>`
7. Deploy.

## 3. Wire frontend URL back into Render

1. Copy your Vercel production URL:
   - `https://<your-vercel-app>.vercel.app`
2. In Render env vars, set:
   - `CLIENT_URL=https://<your-vercel-app>.vercel.app`
3. Redeploy Render.

## 4. Google OAuth setup

Add both callback origins in Google Cloud OAuth:
- `http://localhost:5173` (dev)
- `https://<your-vercel-app>.vercel.app` (prod)

## 5. Smoke test checklist

1. Open frontend and register/login.
2. Check authenticated routes work after refresh.
3. Create/fetch course data.
4. Verify socket-based features connect.
5. Verify file upload and AI features.
