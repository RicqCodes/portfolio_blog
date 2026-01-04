# Production Checklist

## DNS

- A records for:
  - `ricqcodes.dev`
  - `www.ricqcodes.dev`
  - `admin.ricqcodes.dev`
  - `api.ricqcodes.dev`

## TLS

- Caddy running and issuing certs
- Ports `80` and `443` open on VPS

## Environment

- `portfolio_blog/.env` with correct `DATABASE_URL`, JWT, Cloudinary keys
- `portfolio_blog/admin/.env.production` set to API URL
- `portfolio_/.env` with `NEXT_PUBLIC_API_BASE_URL` (if used)

## Containers

- `docker compose ps` shows all services healthy
- `docker compose logs -f caddy` shows certs issued

## App Health

- `https://ricqcodes.dev` loads portfolio
- `https://admin.ricqcodes.dev` loads admin
- `https://api.ricqcodes.dev/api/health` or `/api/posts` responds

## Backups

- DB backups configured
- `.env` files stored securely
