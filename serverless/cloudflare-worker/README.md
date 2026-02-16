# OMEGA-1 Proxy Worker (Cloudflare Workers AI)

This Worker exposes:
- `POST /omega/chat` (LLM text)
- `POST /omega/dataset` (generates rows[] JSON)

It uses Cloudflare **Workers AI** via the `AI` binding (open-source models).

## Deploy
```bash
cd serverless/cloudflare-worker
wrangler login
wrangler deploy
```

## Optional gate (recommended)
```bash
wrangler secret put OMEGA_ACCESS_CODE
# enter: omega-99
```

## Configure model / CORS
Edit `wrangler.toml`:
- `OMEGA_MODEL` (default is llama 3.1 fast)
- `ALLOWED_ORIGINS` (comma-separated). Leave blank to allow any origin.
