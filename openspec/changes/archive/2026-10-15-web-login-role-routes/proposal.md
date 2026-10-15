## Why

The web app currently has no login page and no role-based access control: a single shared nav exposes the Admin link to everyone, `/admin/bots` renders for any visitor, and the access token lives only in `localStorage` where Next.js middleware cannot read it. Only the API enforces roles (`@Roles('ADMIN')`), so the UI leaks admin surface and provides no guided login/redirect flow.

## What Changes

- Add a single `/login` page (email/password) with a register link; new accounts default to role USER (guest).
- Store the JWT in a cookie on login/register so Next.js middleware can read the role; keep `localStorage` usage for `apiFetch` as-is.
- Add `web/middleware.ts` guarding `/admin/*` to ADMIN role only: unauthenticated visitors redirect to `/login`, authenticated non-admin users redirect to `/shop`.
- Split layouts/nav by area: guest `(shop)` layout for shop/wallet/exchange/link pages, dedicated `admin` layout for `/admin/*`; each nav shows only its own area links.
- Role-based post-login redirect: ADMIN → `/admin`, USER → `/shop`.
- Shop catalog stays publicly viewable; purchase/wallet/link actions require login (redirect to `/login`).
- Inline login error display with retry; expired/invalid token redirects to `/login`.
- No backend changes.

## Capabilities

### New Capabilities
- `web-login`: single login/register page, session cookie handling, role-based post-login redirect.
- `web-role-routes`: middleware route guard for `/admin/*` plus split shop/admin layouts and navs.

### Modified Capabilities
- `web-shop-catalog`: catalog remains publicly readable, but buy actions now require authentication (behavior change at spec level).
- `web-admin-bots`: admin UI moves behind the ADMIN-only route guard with its own layout/nav.

## Impact

- Affected code: `web/` only — new `web/app/login/page.tsx`, new `web/middleware.ts`, new `(shop)` + `admin` layouts, updated `web/lib/api.ts` (cookie persistence). No changes to `api/`.
- Breaking: unauthenticated access to `/admin/*` UI is now blocked (previously viewable, API already returned 401/403).
