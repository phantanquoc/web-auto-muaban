## 1. Project scaffolding and DB

- [x] 1.1 Create `docker-compose.yml` with Postgres service and verify `docker compose up` starts it
- [x] 1.2 Scaffold `api/` NestJS app with `@nestjs/config`, `@nestjs/schedule`, `prisma`, `bcrypt`, `jwt` dependencies
- [x] 1.3 Scaffold `web/` Next.js App Router with Tailwind, `api-client` helper for `NEXT_PUBLIC_API_URL`
- [x] 1.4 Create `prisma/schema.prisma` with models: User, LinkCode, Bot, Product, BotStock, Order, ExchangeRecord, Ledger, and run `prisma migrate` + `prisma generate` ← (verify: migrate applies, client generates)
- [x] 1.5 Add seed script to import `ban/items/*.txt` into Product table and create default admin user
- [x] 1.6 Update `.gitignore` for `api/node_modules`, `web/.next`, `web/node_modules` and confirm `git status` clean for ignored dirs

## 2. Auth and character linking

- [x] 2.1 Implement User entity, password hashing, JWT access/refresh with guards
- [x] 2.2 Implement `POST /auth/register` and `POST /auth/login` (spec web-auth-link) with validation and error codes
- [x] 2.3 Implement `POST /auth/link-code` generating 6-char code TTL 5m (single-use, per-user) and `POST /auth/verify-link` supporting both user JWT and bot token
- [x] 2.4 Add LINK_REQUIRED guard for buy/exchange routes (403 when character not linked)
- [x] 2.5 Add role guard (ADMIN) for `/admin/*` and bot-token guard (`x-bot-token`) for `/bot/*`

## 3. Bots, catalog, and stock

- [x] 3.1 Implement Bot model with fields: name, server, type (SELL/EXCHANGE), map/pos hint, rateOverride, dailyLimitTt, enabled, botToken (hashed), lastHeartbeatAt
- [x] 3.2 Implement `GET /bots` and `GET /bots/:id/stock` (online = heartbeat within 90s, stale flag)
- [x] 3.3 Implement `GET /shop/products` from Product + aggregated stock hint
- [x] 3.4 Implement bot gateway `POST /bot/heartbeat` and `POST /bot/stock` with bot-token auth

## 4. Frozen-TT orders with auto-fulfill

- [x] 4.1 Implement Order creation `POST /orders {botId, items}` with stock check, total calc from Product donGia, balance check, and atomic PENDING + FROZEN ledger insert in one transaction
- [x] 4.2 Implement `GET /orders` and `GET /orders/:id` for user order history
- [x] 4.3 Implement bot fulfillment `POST /bot/orders/:id/fulfilled` with conditional `WHERE status='PENDING' AND botId=:botId` and ledger DEDUCT
- [x] 4.4 Implement expiry cron job every 60s: `UPDATE orders SET EXPIRED WHERE status=PENDING AND createdAt < now-5m` with REFUND ledger entries in transaction ← (verify: concurrent fulfill vs expiry cannot double-process an order)
- [x] 4.5 Add Idempotency guard so repeated fulfill calls for same order are safe (return 409 or idempotent 200)

## 5. Exchange KC 1095 <-> TT

- [x] 5.1 Implement `POST /bot/exchange/kc-to-tt {characterName, kcAmount, botId}` with linked-user lookup, effective rate `bot.rateOverride ?? 495000`, per-bot UTC daily limit check, and ledger EXCHANGE_CREDIT
- [x] 5.2 Implement `POST /exchange/tt-to-kc {kcAmount, botId}` from web with balance freeze and pending exchange, plus `POST /bot/exchange/tt-to-kc/fulfilled` for bot confirmation
- [x] 5.3 Add admin per-bot rateOverride and dailyLimitTt validation (positive integers, nullable)
- [x] 5.4 Add ledger immutability and daily-limit aggregation query indexed by botId + date

## 6. Admin surface

- [x] 6.1 Implement `GET /admin/bots`, `POST /admin/bots` (auto-generate token once), `PATCH /admin/bots/:id`, `DELETE /admin/bots/:id`
- [x] 6.2 Implement `GET /admin/bots/:id/stock` and `GET /admin/bots/:id/logs` (orders + exchanges)
- [x] 6.3 Implement `POST /admin/bots/:id/rotate-token` invalidating old token

## 7. Bot patcher extension (ban)

- [x] 7.1 Extend `ban/patcher/BanSeller.java` with ApiReporter: heartbeat and stock push every ~30s when `BOT_API_URL` + `BOT_API_TOKEN` configured, using `maybeRefreshStorage` cadence
- [x] 7.2 Add auto-fulfill: when `buyerName` matches a linked character with PENDING order for this bot, automatically select items and fulfill via `POST /bot/orders/:id/fulfilled` after successful trade
- [x] 7.3 Add ExchangeBot mode: count KC id 1095 received in trade and report via `POST /bot/exchange/kc-to-tt`; handle verify-link code detection in `onPrivateMessage`
- [ ] 7.4 Add handling for LINK_REQUIRED and STOCK_CHANGED error display to player via in-game chat
- [x] 7.5 Wire `ApiReporter` into `Class_cp.a()` loop without blocking packet-receive thread (background thread) ← (verify: seller trade flow unchanged, exchange flow isolated by bot type)

## 8. Web UI

- [x] 8.1 Implement client pages: Shop listing with stock + stale badge, product detail, cart/order creation (blocked with LINK_REQUIRED banner if not linked)
- [x] 8.2 Implement Wallet/Orders page: balance, frozen amount, order states PENDING/FULFILLED/EXPIRED with refund notice
- [x] 8.3 Implement Exchange page: KC->TT info, TT->KC form with rate display and daily limit hint
- [x] 8.4 Implement Link-character page: request code, display 6-char code with countdown, instructions to whisper bot
- [x] 8.5 Implement Admin pages: bot list, create/edit with type/rate/limit/enabled, stock view, logs, rotate token ← (verify: full user journey register -> link -> buy -> bot fulfill -> wallet updated works end-to-end)

## 9. Hardening and checks

- [x] 9.1 Add request validation (class-validator), error codes, and standardized error responses for all new routes
- [x] 9.2 Add indexes: botId+status+createdAt for orders, botId+date for daily limits, userId for ledger
- [x] 9.3 Run `prisma validate`, `npm run lint` and `npm run build` for both `api/` and `web/`; fix any failures in owned code only
- [ ] 9.4 Manual smoke: register -> link -> create order -> simulate bot fulfill -> verify ledger; KC->TT via bot report; expiry cron with 6-minute-old order; admin bot CRUD and stock push
