# web-storefront-ui

## Purpose

Dark storefront presentation shell and per-page layouts (shop, wallet, exchange, link, login) for the web frontend.

## Requirements
### Requirement: Storefront shell

Shop-area pages SHALL render inside a dark storefront shell: sticky topbar (logo, nav Shop/Wallet/Exchange/Link with active state, bot status dot, user email + Login/Logout) and a footer with buying-guide, contact, and terms links. No Admin link SHALL appear in the guest nav.

#### Scenario: Active nav state
- **WHEN** the user is on `/shop`
- **THEN** the Shop nav item shows the gold active underline

#### Scenario: Footer trust signals
- **WHEN** any shop-area page renders
- **THEN** the footer shows buying guide, contact, and terms sections

### Requirement: Shop catalog presentation

The shop page SHALL show a hero strip (headline + live chips: bots online, exchange rate, today's orders), a filter bar (search, server sv1–sv6, price/stock sort), bot status cards (name, type, online/stale), and a responsive product grid (2 cols mobile, 3–4 desktop). Product cards SHALL show an initial-letter tile, server badge, semibold name, gold tabular price, stock line, rarity 3px left border, and a full-width Mua button (disabled with `Het hang` when out of stock). Clicking Mua SHALL open a buy-confirm modal (item, price, fulfilling bot, linked character check); guests SHALL be sent to `/login?next=/shop` instead.

#### Scenario: Hero and filters render
- **WHEN** a visitor opens `/shop`
- **THEN** hero chips, filter bar, bot cards, and product grid all render with skeleton placeholders while loading

#### Scenario: Empty filter result
- **WHEN** filters match zero products
- **THEN** an empty state shows with a clear-filters action

#### Scenario: Successful purchase
- **WHEN** a logged-in user confirms a purchase
- **THEN** a success toast shows the order code with a link to Wallet

### Requirement: Wallet orders presentation

The wallet page SHALL show stat mini-cards (total orders, pending, total xu spent), status filter chips, and an orders table (mono ID + copy, item summary, tabular total, status pill, relative time; row-click expands bot/item/timeline detail). Failed rows SHALL show the reason with a retry action; the empty state SHALL guide to the shop.

#### Scenario: Filter by status
- **WHEN** the user selects the PENDING chip
- **THEN** only pending orders show

### Requirement: Exchange form presentation

The exchange page SHALL use a two-column layout (form card + rate info card with daily-limit progress). The form SHALL use a bot SELECT (online first, showing rate and daily remaining), a KC stepper with quick chips (1/5/10/50), a live preview (`KC x rate = total TT`), and a confirm modal before submit. Success SHALL show the transaction code plus a cross-link to `/link`.

#### Scenario: Live preview updates
- **WHEN** the user changes KC amount or bot
- **THEN** the preview recomputes total TT immediately

### Requirement: Link-code presentation

The link page SHALL show a centered card with the 6-char code in a dashed gold mono box, a copy button with copied feedback, a countdown chip (rose under 60s), and steps 1-2-3 (generate → whisper in game → wait confirm), plus a never-share warning.

#### Scenario: Code expiry warning
- **WHEN** fewer than 60 seconds remain
- **THEN** the countdown chip turns rose

### Requirement: Login split-screen presentation

The login page SHALL use a split-screen layout: brand panel (game-art gradient, trust bullets: 24/7 bots, auto trading, clear history) plus form card with Dang nhap/Dang ky tabs, inline error with retry, and preserved `?next=` redirect. Mobile SHALL stack to a single column with a compact brand strip.

#### Scenario: Register tab
- **WHEN** the user switches to Dang ky and submits
- **THEN** the account is created as USER and the user lands on `/shop` (or safe `next`)
