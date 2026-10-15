## Why

Players currently trade only inside the game via P2P bots (BanSeller/Mua). There is no web storefront, no account wallet, and no auditable ledger. Adding a web shop with an in-game exchange (KC 1095 <-> TT) lets customers browse stock, freeze funds, and receive goods via the existing in-game trade flow while keeping all movements in a database.

## What Changes

- Add `api/` (NestJS) and `web/` (Next.js App Router) with Postgres + Prisma + JWT, separated repos under one root.
- Implement character linking via 6-char code TTL 5m: `POST /auth/link-code` and bot `POST /auth/verify-link {characterName, code}`.
- Require linked character for buy/exchange; return `403 LINK_REQUIRED` otherwise.
- Sync shop catalog from `ban/items/*.txt` plus live stock from bot `cd.q.v/cd.q.x` via bot push/pull every 30s (`POST /bot/heartbeat`, `POST /bot/stock`).
- Implement frozen-TT orders: `POST /orders` creates PENDING + frozen ledger entry; bot auto-fulfills when `buyerName` matches a pending order for that bot; bot calls `POST /orders/:id/fulfilled` to deduct; cron every 60s expires PENDING older than 5m to EXPIRED + refund.
- Implement exchange via exchange bots: `POST /exchange/kc-to-tt` (bot counts KC 1095 received, `TT = kcAmount * rate(bot)`) and `POST /exchange/tt-to-kc`, with per-bot daily limit, balance checks, and ledger.
- Add admin bot management: `CRUD /admin/bots` with type SELL/EXCHANGE, per-bot rate override and daily limit, toggle, stock/log views.
- Extend `ban/patcher/BanSeller.java` with ExchangeBot mode, ApiReporter (heartbeat/stock), auto-fulfill pending orders on trade, and verify-link hook; keep direct in-game buy flow unchanged.
- Persist all transactions to DB; keep `mua/` and `ban/` jars runnable.

## Capabilities

### New Capabilities
- `web-auth-link`: registration/login, JWT, link-code generation and verification via in-game private chat.
- `web-shop-catalog`: bot listing, live stock, and product catalog synced from `ban/items`.
- `web-orders-frozen`: frozen-TT order lifecycle with auto-fulfill by bots and 5m expiry cron.
- `web-exchange-kc-tt`: KC 1095 <-> TT exchange through exchange bots with rate override and daily limits.
- `bot-gateway`: bot heartbeat, stock reports, order fulfillment, and exchange reporting APIs.
- `web-admin-bots`: admin CRUD for bots, enable/disable, stock/log visibility.

### Modified Capabilities
- `storage-chest`: extend with API-backed stock reporting and exchange stock semantics (delta spec).

## Impact

- New top-level `api/`, `web/`, `docker-compose.yml`, Prisma schema; new DB tables for users, bots, link codes, orders, exchange records, ledger.
- Modified `ban/patcher/BanSeller.java`, `ban/patcher/fix_cq.py` paths already adjusted, `.gitignore` for `api/node_modules`, `web/.next`.
- Breaking: none for existing in-game flow; new API requires JWT and linked character for shop/exchange.
