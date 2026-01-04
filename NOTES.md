# Project Notes

## What changed (backend/admin)
- Admin UI theme and login screen updated to the high-contrast split layout.
- shadcn-style primitives added in `admin/src/components/ui`.
- Auth: JWT expiry check + 401 cleanup in `admin/src/contexts/AuthContext.tsx` and `admin/src/api/client.ts`.
- Video content block now stored in `content` and validated.
- Build passes under Node 22 (Vite warning resolved).

## What changed (portfolio_)
- Blog routes now live under `src/app/blog` to match `/blog` URLs.
- Blog list reads paginated posts (`items`) and uses `coverImage`.
- Tag filtering uses tag names; empty-state added; cover images now show in cards.
- Single post page uses `coverImage`, sorted content blocks, and avoids double view increment in metadata.
- Shared blog types added in `src/app/types/blog.ts`.
- Centralized blog API helpers in `src/lib/blog-api.ts`.
- Blog link enabled in navbar.

## Pending
- None required. Optional: refactor `Article` into smaller components and add stronger empty/loading states.

## Commands
- Admin build (Node 22): `nvm use 22 && bun run build:admin`
- Backend build: `bun run build`
