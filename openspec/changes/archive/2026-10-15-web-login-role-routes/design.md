## Context

The `web/` Next.js 14 app (App Router) currently has a single root `layout.tsx` with a shared nav (Shop / Wallet / Exchange / Link / Admin) and six pages: `/`, `/shop`, `/wallet`, `/exchange`, `/link`, `/admin/bots`. There is no login page, no middleware, and no client-side role check. Auth state lives only in `localStorage.accessToken` (see `web/lib/api.ts`), which Next.js middleware cannot read. The backend (`api/`) already supports everything needed: `POST /auth/register` (creates USER by default), `POST /auth/login` (returns `{ accessToken, refreshToken, user: { id, email, role, characterName } }` with `role` in the JWT payload), and `JwtAuthGuard + RolesGuard + @Roles('ADMIN')` on `/admin/*`.

## Goals / Non-Goals

**Goals:**
- Single `/login` entry point with register option; post-login redirect by role.
- Server-side (middleware) protection of `/admin/*` for ADMIN only.
- Separate shop/admin layouts and navs; public shop browsing with login-gated actions.
- Zero backend changes.

**Non-Goals:**
- New admin pages (`/admin/orders`, dashboard), permission granularity beyond ADMIN/USER, refresh-token rotation, social login, password reset.

## Decisions

- **JWT in a readable cookie + keep localStorage.** Middleware (Edge runtime) cannot read `localStorage`, so on login/register the client persists the access token to a `accessToken` cookie (and keeps `localStorage` for `apiFetch`). Alternative (verify JWT signature in middleware with `jose`) was rejected: middleware only needs the `role` claim for routing; the API remains the real enforcer. Cookie is not httpOnly (client JS must set it without a backend endpoint); XSS risk is accepted as-is since the token is already in `localStorage` today — no security regression.
- **Middleware redirects, not rewrites.** `/admin/*` without token → `/login?next=<path>`; with token but `role !== 'ADMIN'` → `/shop`. `/login` when already authenticated → role home (`/admin` or `/shop`). Alternative (client-side guard only) was rejected because it flashes protected UI before redirecting.
- **Route groups `(shop)` + `admin/` instead of URL prefix change.** `web/app/(shop)/layout.tsx` holds the guest nav; `web/app/admin/layout.tsx` holds the admin nav plus a client-side role sanity check (defense in depth behind middleware). Public URLs (`/shop`, `/wallet`, ...) stay unchanged — no link breakage.
- **Shop stays public-read.** `GET /shop/products` and `GET /bots` need no auth; only mutating/user actions (create order, link-code, wallet) redirect to `/login` when unauthenticated, handled in the pages via `apiFetch` 401 → router push.
- **Register defaults to USER.** `POST /auth/register` already defaults `role` to USER in Prisma schema; ADMIN promotion is manual (DB or future admin UI). The register form is a mode toggle on `/login`, not a separate route, to keep "single login page".

## Risks / Trade-offs

- [Role claim in middleware is unverified] → Mitigation: middleware is UX routing only; every `/admin/*` API call still passes `JwtAuthGuard + RolesGuard`. A forged cookie only renders UI shells whose data fetches will 401/403.
- [Token expiry between middleware check and API call] → Mitigation: `apiFetch` maps 401 to redirect `/login` and clears stored token.
- [`next` param open-redirect] → Mitigation: only allow relative paths starting with `/` (reject `//` and protocols).

## Migration Plan

1. Deploy web only (API untouched, backward compatible).
2. Existing `localStorage` sessions keep working: on app load, if cookie is missing but `localStorage` has a token, re-sync the cookie client-side.
3. Rollback: revert web deployment; no data migration involved.

## Open Questions

None — all behavior locked in exploration (1C/2B/3B).
