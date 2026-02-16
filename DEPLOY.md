# DEPLOY (Option 1): GitHub Pages + Serverless Proxy (recommended)

Goal:
- Frontend is public on GitHub Pages + your domain
- LLM runs on Cloudflare Workers AI (open-source models). No upstream API keys needed.

## 0) Prereqs
- Cloudflare account (free)
- Node.js 18+ locally
- GitHub repo created (public)

## 1) Deploy the Cloudflare Worker proxy (Workers AI)

### 1.1 Install Wrangler
```bash
npm i -g wrangler
wrangler login
```

### 1.2 Create the Worker from this repo
```bash
cd serverless/cloudflare-worker
wrangler deploy
```

This prints a URL like:
`https://omega1-proxy.<yourname>.workers.dev`

### 1.3 Configure secrets and access control
### 1.3 Configure the Worker (Workers AI)

No OpenAI key is required.

Optional access gate (recommended):
```bash
wrangler secret put OMEGA_ACCESS_CODE
# enter: omega-99
```

Optional model override (or set in wrangler.toml [vars]):
```bash
wrangler secret put OMEGA_MODEL
# example: @cf/meta/llama-3.1-8b-instruct-fast
```

Set allowed origins in `wrangler.toml` under `[vars] ALLOWED_ORIGINS`.


### 1.4 Quick health check
Open in browser:
`https://<worker-url>/omega/health`
You should see:
`{"ok":true}`

## 2) Configure GitHub Pages deployment (frontend)

### 2.1 Push this repo to GitHub
Create repo → push to `main`.

### 2.2 Set GitHub Pages
GitHub → Settings → Pages:
- Source: **GitHub Actions**

### 2.3 Set repo variable for the proxy URL
GitHub → Settings → Secrets and variables → Actions → **Variables** → New repository variable:

- Name: `VITE_OMEGA_PROXY_URL`
- Value: `https://<worker-url>`

The workflow `.github/workflows/deploy.yml` injects it at build time.

### 2.4 Deploy
Push any commit to `main`.
Actions will build and publish.

## 3) Attach your personal domain
GitHub → Settings → Pages → Custom domain:
- add your domain (e.g. `omega1.yourdomain.com`)
- GitHub shows DNS records (CNAME). Add that in your DNS provider.
- Once verified, enable HTTPS.

## 4) Use the War Room
- Open site → War Room
- Enter access code: `omega-99`
- Command tab:
  - Fetch ministry dataset
  - Run Level-3 agent (3 brains + 7 pillars)

## Notes
- Rate limiting: Use Cloudflare dashboard → Security/WAF → Rate limiting rules (per IP).
- Abuse control: Keep `OMEGA_ACCESS_CODE` enabled + restrict CORS.
