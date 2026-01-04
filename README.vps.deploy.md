# VPS Deployment Plan (Contabo + Docker Compose)

This guide deploys **API + Admin + Public Blog** to a single Ubuntu VPS
using Docker Compose. It assumes the public blog lives in `portfolio_`
and the API/admin live in `portfolio_blog`.

## 1) DNS (Namecheap)

Create A records pointing to your VPS IP (e.g. `38.242.129.36`):

- `@` -> VPS IP
- `www` -> VPS IP
- `admin` -> VPS IP
- `api` -> VPS IP

## 2) Install Docker (on VPS)

```bash
sudo apt update && sudo apt install -y docker.io docker-compose-plugin git
sudo systemctl enable --now docker
sudo usermod -aG docker $USER
```

Log out and back in so Docker works without sudo.

## 3) Clone Repos (same parent directory)

The compose file expects `portfolio_` to be a sibling of `portfolio_blog`:

```bash
mkdir -p /var/www/ricqcodes
cd /var/www/ricqcodes
git clone <portfolio_blog_repo_url>
git clone <portfolio_repo_url> # this is portfolio_
```

## 4) Environment Files

Create `/var/www/ricqcodes/portfolio_blog/.env`:

```
PORT=4000
JWT_SECRET=replace_me
ADMIN_USERNAME=replace_me
ADMIN_PASSWORD=replace_me
TYPEORM_SYNCHRONIZE=false
TYPEORM_LOGGING=false

DATABASE_HOST=db
DATABASE_PORT=5432
DATABASE_USER=portfolio
DATABASE_PASSWORD=replace_me
DATABASE_DB=portfolio

PUBLIC_BASE_URL=https://api.ricqcodes.dev
UPLOADS_DIR=/app/uploads
UPLOADS_PUBLIC_PATH=/uploads
```

Create `/var/www/ricqcodes/portfolio_blog/admin/.env`:

```
VITE_API_BASE_URL=https://api.ricqcodes.dev/api
```

Create `/var/www/ricqcodes/portfolio_/.env`:

```
NEXT_PUBLIC_API_BASE_URL=https://api.ricqcodes.dev/api
```

## 5) Run Docker Compose

```bash
cd /var/www/ricqcodes/portfolio_blog
docker compose up -d --build
```

## 6) Run Migrations (recommended)

```bash
cd /var/www/ricqcodes/portfolio_blog
docker compose run --rm api bun run migration:run
```

## 7) Verify

- https://ricqcodes.dev
- https://admin.ricqcodes.dev
- https://api.ricqcodes.dev/api/health

If SSL fails, wait for DNS to propagate and retry in a few minutes.
