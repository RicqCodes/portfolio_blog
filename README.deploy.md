# Deployment Guide (Caddy + Docker)

This setup hosts everything on a single VPS with HTTPS:

- `ricqcodes.dev` → portfolio (Next.js)
- `admin.ricqcodes.dev` → admin UI
- `api.ricqcodes.dev` → Nest API
- `www.ricqcodes.dev` → redirects to `ricqcodes.dev`

## Prereqs

- VPS with Docker + Docker Compose installed
- Domain `ricqcodes.dev` with DNS A records pointing to the VPS:
  - `ricqcodes.dev`
  - `www.ricqcodes.dev`
  - `admin.ricqcodes.dev`
  - `api.ricqcodes.dev`

## Folder Layout on VPS

```
/opt/ricq/
  portfolio_blog/
  portfolio_/
```

`portfolio_blog` contains the API + admin.  
`portfolio_` contains the Next.js portfolio.

## Environment Files

Create/verify these:

- `portfolio_blog/.env` (API config)
- `portfolio_blog/admin/.env.production` (already created)
- `portfolio_/.env` (if the Next app needs runtime envs)

See `.env.example` in each repo for required keys.

## Deploy

From `/opt/ricq/portfolio_blog`:

```
docker compose up -d --build
```

Caddy will automatically request/renew HTTPS certs.

## Updates

Pull latest code and rebuild:

```
docker compose down
docker compose up -d --build
```

## Useful Commands

```
docker compose ps
docker compose logs -f api
docker compose logs -f admin
docker compose logs -f web
docker compose logs -f caddy
```
