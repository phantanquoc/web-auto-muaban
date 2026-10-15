# web-design-system

## Purpose

Shared visual tokens, fonts, UI primitives, formatting helpers, and accessibility baseline for the web frontend.

## Requirements
### Requirement: Design tokens and fonts

The web app SHALL define its palette, spacing, radius, and shadows as Tailwind `theme.extend` tokens plus CSS variables in `globals.css`, and load Be Vietnam Pro (body), Space Grotesk (display/prices), and JetBrains Mono (codes) via `next/font`. The `<html>` element SHALL use `lang="vi"`.

#### Scenario: Tokens applied
- **WHEN** any page renders
- **THEN** backgrounds, surfaces, accents, and status colors come from the token set (no hardcoded gray-50/blue-600 defaults on the shop side)

#### Scenario: Vietnamese diacritics render correctly
- **WHEN** text containing tones (e.g. ễ ệ ộ ư ơ đ) renders
- **THEN** glyphs display without clipping or fallback-box artifacts

### Requirement: Shared UI kit

The web app SHALL provide presentational primitives under `web/components/ui/`: Button, Badge/StatusDot, Card, Input/Select, Modal, Toast, EmptyState, Skeleton, StatCard, and DataTable. All icons SHALL use `lucide-react` SVG (no emoji-as-icons). No page SHALL use `alert()`.

#### Scenario: Consistent controls
- **WHEN** a page needs a button, badge, modal, or table
- **THEN** it composes the shared primitives instead of inline one-off markup

#### Scenario: No alert usage
- **WHEN** searching the `web/` source for `alert(`
- **THEN** zero matches exist

### Requirement: Number and time formatting

All xu amounts SHALL render with `Intl.NumberFormat('vi-VN')` in tabular figures; order/bot IDs SHALL show as 8-char mono with copy-on-click; timestamps SHALL show relative time with absolute time on hover/title.

#### Scenario: Formatted price
- **WHEN** a product costs 12500 xu
- **THEN** it renders as `12.500 xu`

### Requirement: Accessibility baseline

Interactive elements SHALL have min 44px touch targets, visible `:focus-visible` rings, and `aria-label`s on icon-only buttons. The app SHALL honor `prefers-reduced-motion` (no card lift, pulse, or countdown animation). Status SHALL never rely on color alone (always a text label).

#### Scenario: Keyboard navigation
- **WHEN** tabbing through any page
- **THEN** focus order matches visual order and every focused control shows a visible ring

#### Scenario: Reduced motion
- **WHEN** the OS requests reduced motion
- **THEN** decorative animations are disabled while countdown values still update as text
