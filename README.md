# OMEGA-1 Old-Money Website + War Room MVP

This repo is a **static** website (Vite + React) with an interactive **War Room** demo that simulates OMEGA-1’s 3 brains + 7 pillars.

## How it works (MVP)

- **Frontend** runs on GitHub Pages (or any static host).
- **War Room** contains a Level-3 agent loop (planner → tools → validation → pillars → final).
- The agent calls a serverless proxy that uses **Cloudflare Workers AI** (open-source) through a serverless proxy** so the **API key is NOT in GitHub**.

## Local run

```bash
npm install
npm run dev -- --host --port 8080
```

## Required config (for real LLM)

Set `VITE_OMEGA_PROXY_URL` to your Worker URL:

- copy `.env.example` → `.env`
- edit:

```bash
VITE_OMEGA_PROXY_URL=https://YOUR-WORKER.workers.dev
```

## Deployment

See `DEPLOY.md` for a step-by-step:
- Deploy Cloudflare Worker proxy (holds API key as secret)
- Configure GitHub Pages build variable `VITE_OMEGA_PROXY_URL`
- Push to `main` → site auto-builds

---
OMEGA-1 MVP
