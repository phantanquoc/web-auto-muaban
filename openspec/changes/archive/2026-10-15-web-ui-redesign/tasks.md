## 1. Tokens, fonts, shells

- [x] 1.1 Extend `web/tailwind.config.js` with palette/spacing/radius/shadow tokens and add CSS variables to `web/app/globals.css`
- [x] 1.2 Load Be Vietnam Pro + Space Grotesk + JetBrains Mono via `next/font`, set `<html lang="vi">`, slim root `layout.tsx` to bare shell (fix double-main padding)
- [x] 1.3 Build storefront shell in `(shop)/layout.tsx`: sticky dark topbar (logo, nav with active state, bot dot, session) + footer with guide/contact/terms
- [x] 1.4 Build admin shell in `admin/layout.tsx`: collapsible dark sidebar + light topbar (breadcrumb, search, avatar) + content area ← (verify: shells render on every page, no gray-50 default look on shop side, no Admin link in guest nav)

## 2. Shared UI kit

- [x] 2.1 Add `lucide-react` dependency and create `web/components/ui/` primitives: Button, Badge/StatusDot, Card, Input/Select
- [x] 2.2 Create Modal, Toast, EmptyState, Skeleton, StatCard, DataTable primitives plus `vi-VN` format helpers (numbers tabular, relative time, copy-on-click ID)
- [x] 2.3 Remove all `alert()` usage across `web/` ← (verify: zero `alert(` matches, kit covers all repeated markup)

## 3. Shop page

- [x] 3.1 Hero strip with live chips (bots online, rate, today's orders) + filter bar (search, server sv1–sv6, price/stock sort)
- [x] 3.2 Bot status cards + product grid (initial-letter tiles, server badges, gold prices, rarity borders, stock states, skeletons/empty/error)
- [x] 3.3 Buy-confirm modal → success toast with order code; guests go to `/login?next=/shop` ← (verify: full buy flow incl. guest redirect, out-of-stock disabled, filter-empty state)

## 4. Login page

- [x] 4.1 Split-screen layout: brand panel with trust bullets + form card with Dang nhap/Dang ky tabs, inline error + retry, `?next=` preserved, mobile stacking ← (verify: both tabs, failed login inline error, safe next redirect)

## 5. Wallet, exchange, link

- [x] 5.1 Wallet: stat mini-cards + status filter chips + orders table (copy ID, relative time, expandable detail, failed retry, shop-guiding empty state)
- [x] 5.2 Exchange two-column: bot SELECT online-first + KC stepper/chips + live TT preview + confirm modal + daily-limit bar + success with code and /link cross-link; remove raw botId textbox
- [x] 5.3 Link card: dashed gold code box + copy feedback + countdown (rose <60s) + 3 steps + never-share warning ← (verify: preview math, countdown color switch, copy confirmations on all three pages)

## 6. Admin bots

- [x] 6.1 Sub-nav tabs + 4-card stat row + labeled create-bot grid form
- [x] 6.2 Datatable (toggle switch, rate, used/limit bar, relative heartbeat, copy/enable/rotate actions, sort/filter bar) + token modal with copy and saved-confirm ← (verify: full admin flow with skeleton rows, no alert(), placeholder tabs present)

## 7. Build and polish QA

- [x] 7.1 `npm run build` passes in `web/`
- [x] 7.2 Responsive QA 360px→1440px, contrast pairs, reduced-motion, focus rings, 44px targets, aria-labels, diacritics string check ← (verify: per-page loading/error/empty states observable, keyboard-only pass clean)
