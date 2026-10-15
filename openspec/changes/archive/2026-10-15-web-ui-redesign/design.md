## Context

The `web/` Next.js 14 App Router app renders all pages with bare Tailwind defaults: `bg-gray-50` body, unstyled white cards, default `blue-600` buttons, no active nav state, raw IDs/prices, `alert()` for the bot token, and no loading/empty/error states. Auth, middleware guards, and API contracts from the `web-login-role-routes` change are in place and MUST NOT change — this change is visual + UX layer only. `tailwind.config.js` has an empty `theme.extend`; `globals.css` holds only directives; no icon or component library is installed.

## Goals / Non-Goals

**Goals:**
- Distinct visual identity: dark gaming storefront + Metronic-style admin, Vietnamese-safe typography, formatted numbers, full state coverage (loading/empty/error/success) on every page.
- Single shared UI kit so future pages stay consistent.
- Accessibility baseline (contrast, focus, touch targets, reduced motion, aria labels).

**Non-Goals:**
- No URL, auth-flow, middleware, or API changes. No real item icons (initial-letter tiles v1). No dark/light toggle. No new admin pages beyond placeholder tabs. No headless UI library.

## Decisions

- **Tailwind-only + `lucide-react`.** Full custom classes via `tailwind.config.js` extend + CSS variables; icons from `lucide-react` (single new dependency). Alternatives rejected: paid Metronic license (cost, jQuery-era markup, hard to fit App Router), headless libs (modals/toggles/dropdowns at this scale are ~30 lines of React each; revisit for admin bulk-actions v2).
- **Dark-only storefront, light-content admin.** Gaming shops convert best dark and Vietnamese mobile buyers skew night-time; admins need light surfaces for dense-table contrast. One theme per area halves QA (user-approved).
- **Fonts via `next/font`:** Be Vietnam Pro (body/UI, designed for Vietnamese diacritics), Space Grotesk (display/prices), JetBrains Mono (codes/amounts). Rejected system-font stack: breaks tones like ễ ệ ộ in many display fonts.
- **Route groups keep URLs:** visual shells live in `(shop)/layout.tsx` and `admin/layout.tsx`; root `layout.tsx` becomes bare shell (fonts, `lang="vi"`, `SessionSync`) to fix the double-`main` padding.
- **Rarity as 3px left border only** (Thuong #9CA3AF, Hiem #3699FF, Sieu #7C5CFF, Cuc pham #FFC531, Than thoai #F64E60) — full-card rarity backgrounds rejected as visual noise.
- **Status never color-alone:** every pill pairs color with text label; FROZEN gets its own slate pill distinct from FAILED rose.
- ** Secrets via modal, not `alert()`:** token/code modals with copy button + explicit confirm ("Toi da luu").

## Risks / Trade-offs

- [next/font Google fetch at build time; offline builds fail] → Mitigation: build has network (docker build already fetches npm); fallback to system fonts is automatic if load fails at runtime.
- [Dark storefront contrast regressions] → Mitigation: fixed token pairs verified in QA task (gold-on-black 12+:1, muted #A1A1AA on #14141D ~4.6:1 body-secondary only).
- [Scope creep into behavior changes] → Mitigation: tasks explicitly mark API/flow freeze; verifier checks no fetch/route logic changes beyond presentation.

## Migration Plan

1. Deploy web only (API untouched). Visual change is atomic per page; rollback = revert web deployment.
2. Order: tokens/shells → UI kit → shop → login → wallet/exchange/link → admin → polish (each step independently shippable; shop first for revenue impact).

## Open Questions

None — concept, palette, fonts, scope, and order locked with user and designer report.
