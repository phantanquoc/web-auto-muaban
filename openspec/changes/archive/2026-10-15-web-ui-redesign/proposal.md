## Why

The web storefront and admin UI are built with bare Tailwind defaults (gray-50 background, plain white cards, default blue-600 everywhere): no visual identity, no active nav states, raw unformatted IDs/prices, `alert()` for secrets, and no loading/empty/error states. For a game-item shop handling real-money-adjacent transactions, this erodes trust and conversion.

## What Changes

- Introduce the "Cho Dem Ngau Hanh" design system: dark-first storefront (Void Black #0B0B12, Charcoal #14141D, Xu Gold #FFC531) + Metronic-style admin (Navy #1E1E2D sidebar, Mist Gray #F1F2F6 content). Dark-only storefront in v1 (no toggle).
- Vietnamese-safe typography: Be Vietnam Pro (body) + Space Grotesk (display/prices) + JetBrains Mono (codes/amounts) via `next/font`; `<html lang="vi">`; `Intl.NumberFormat('vi-VN')` for all xu amounts.
- New storefront shell: sticky topbar (logo, nav, bot status, user session) + footer with trust signals; new admin shell: fixed dark sidebar (collapsible) + light topbar (breadcrumb, search, avatar) + content area.
- Shared UI kit under `web/components/ui/`: Button, Badge/StatusDot, Card, Input/Select, Modal, Toast, EmptyState, Skeleton, StatCard, DataTable primitives; add `lucide-react` for icons. Remove all `alert()` usage.
- Page redesigns: shop (hero stats, filters, bot cards, rarity-coded product grid, buy-confirm modal), login (split-screen brand + form), wallet (stats + filterable orders table), exchange (bot SELECT, KC stepper, live TT preview, confirm modal), link (copy button, countdown), admin/bots (stat row, create form, datatable, token modal, sub-nav tabs).
- Accessibility baseline: 44px touch targets, focus-visible rings, aria-labels, prefers-reduced-motion, verified contrast pairs.

## Capabilities

### New Capabilities
- `web-design-system`: tokens, fonts, shells, shared UI kit, formatting/a11y baselines.
- `web-storefront-ui`: shop hero/filters/grid/buy flow, wallet table, exchange form, link card, login split-screen visuals.

### Modified Capabilities
- `web-shop-catalog`: catalog presentation requirements (cards, filters, states) change at spec level.
- `web-admin-bots`: admin presentation (stats, datatable, token modal, tabs) changes at spec level.
- `web-exchange-kc-tt`: exchange form UX (bot select, live preview, confirm) changes at spec level.
- `web-auth-link`: link-code presentation (copy, countdown, steps) changes at spec level.
- `web-orders-frozen`: order display (status pills incl. FROZEN, detail expansion) changes at spec level.
- `web-login`: login page visual layout (split-screen) changes at spec level.

## Impact

- Affected code: `web/` only — `tailwind.config.js`, `app/globals.css`, `app/layout.tsx`, both group layouts, all pages, new `components/ui/`. New dependency: `lucide-react`. No `api/` changes.
- URLs, auth flow, middleware guards, and API contracts are unchanged (visual + UX layer only).
