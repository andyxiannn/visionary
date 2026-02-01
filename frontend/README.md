# Frontend (Next.js) – Clean Run Guide

This project includes a Next.js app (primary) and a Vite SPA (optional). To avoid confusion and port conflicts, use the Next app.

## Configure API URL

- Default backend is `http://localhost:8000` (set in `frontend/.env`).
- You can override at runtime using a query param or localStorage:
  - Example: `http://localhost:3005/?api=http://localhost:8000`

## Start Next.js Dev

```bash
cd frontend
npm install
npm run dev:3005
```
Open http://localhost:3005

If it shows the wrong backend, clear saved override:
```js
localStorage.removeItem('apiUrl')
```
Then reload with `?api=http://localhost:8000`.

## Vite SPA (optional)

```bash
cd frontend
npx vite --port 5173
```
The Vite app reads `VITE_API_URL` from `frontend/.env` and supports the `?api=` override the same way.

## Backend

Ensure the backend is running on 8000 and Ollama is reachable:
```bash
cd backend
npm install
npm run dev
```
Backend envs (in `backend/.env`):
- `PORT=8000`
- `OLLAMA_URL=http://localhost:11434`
- Optional: `CORS_ORIGIN=^http:\/\/localhost:3005$`

## Troubleshooting

- If Next dev fails due to permissions inside `.next`, close any running Next processes and start with `npm run dev:3005`.
- 500 errors usually mean the Ollama server is not reachable at `OLLAMA_URL`.
- To force a fresh API URL without rebuild, use the `?api=` query param.
