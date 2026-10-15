## 1. Session plumbing (cookie + 401 handling)

- [x] 1.1 Persist access token to `accessToken` cookie on login/register and clear it on logout/expiry in `web/lib/api.ts`
- [x] 1.2 Redirect to `/login` and clear stored tokens on any 401 from `apiFetch`
- [x] 1.3 Re-sync cookie from `localStorage` on app load when cookie is missing ← (verify: reload with only localStorage token still passes middleware)

## 2. Login page

- [x] 2.1 Create `web/app/login/page.tsx` with email/password form, login/register mode toggle, inline error + retry
- [x] 2.2 Wire login to `POST /auth/login` and register to `POST /auth/register`, then role-based redirect (ADMIN → `/admin`, USER → `/shop`) ← (verify: all web-login scenarios pass end-to-end)

## 3. Middleware route guard

- [x] 3.1 Create `web/middleware.ts` guarding `/admin/*` (no token → `/login?next=`, non-ADMIN → `/shop`, logged-in user on `/login` → role home)
- [x] 3.2 Validate `next` param accepts only single-slash relative paths ← (verify: every web-role-routes guard scenario, including open-redirect fallback)

## 4. Split layouts and navs

- [x] 4.1 Create `web/app/(shop)/layout.tsx` guest nav (Shop, Wallet, Exchange, Link, Login/Logout) and move guest pages under it without URL changes
- [x] 4.2 Create `web/app/admin/layout.tsx` admin nav with client-side role sanity check
- [x] 4.3 Keep root `layout.tsx` as shared shell only (no area nav)

## 5. Login-gated guest actions

- [x] 5.1 Redirect unauthenticated buy/order attempts from `/shop` to `/login`
- [x] 5.2 Redirect unauthenticated `/wallet` and `/link` access to `/login`; keep catalog read public ← (verify: guest sees catalog, gated actions redirect, admin browses shop freely)

## 6. Build and manual verification

- [x] 6.1 `npm run build` passes in `web/`
- [ ] 6.2 Manual pass: register → guest login → admin login → wrong password → expired token → guest/admin cross-access of `/admin/*` ← (verify: all spec scenarios observable in browser; NOT done — needs human browser run against running api+web)
