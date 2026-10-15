## Context

Current repo has two standalone Java jars: `mua/` (buy bot) and `ban/` (sell bot via BanSeller.java with chest management cd.q.x/cd.q.v, trade state machine, and game hardcode C:/NinjaLite/GomItem/). No web layer, no DB, no auth, no ledger. Requirement is to add a web storefront and KC 1095 <-> TT exchange (base 1:495000, per-bot override + daily limit) that reuses existing in-game trade as fulfillment. Linking is mandatory before buy/exchange, verified by a 6-char code (TTL 5m) that the player whispers to an exchange bot. Orders use frozen TT: PENDING created via web, auto-fulfilled when the linked buyerName trades with the same bot in-game, with a 60s cron expiring PENDING older than 5m. Bot and web must stay consistent without deploying new jars from the web.

## Goals / Non-Goals

**Goals:**
- Separate NestJS API (`api/`) and Next.js App Router web (`web/`) with Postgres + Prisma + JWT.
- Auth with mandatory character linking (6-char code, 5m TTL, 403 LINK_REQUIRED).
- Shop catalog synced from `ban/items/*.txt` plus live stock from `cd.q.v/cd.q.x` pushed by bots every 30s.
- Frozen-TT orders with auto-fulfill on in-game trade and expiry cron, plus KC<->TT exchange with per-bot limits via bots.

**Non-Goals:**
- Real-money payments (VNPay/MoMo), auto-deploy of jars from web, changes to direct in-game buy flow, shared NinjaLite runtime.

## Decisions

- **Stack separation (api/ + web/ + docker-compose Postgres) over monolith.** Rationale: bot needs stable HTTP gateway independent of web SSR; web team can iterate without redeploying API. Alternative (single Next.js with API routes) rejected: bot HTTP client and cron would couple to Next.js runtime.
- **Prisma as single source of truth for ledger.** Rationale: frozen/refund/deduct must be transactional (order + ledger row in one DB transaction). Alternative (file logs) already rejected by requirement (DB persistence).
- **Bot as fulfillment actor, not web.** Orders are NOT claimed by typing a code; bot matches `buyerName == linked characterName` with pending order for that bot and calls `POST /bot/orders/:id/fulfilled` with bot token. Rationale: user's final decision was "bot trace do luon, khong can gui ma don". Alternative (maDon) rejected as extra UX friction and mismatch with BanSeller's existing buyerName flow.
- **Exchange: bot-observed KC count.** Customer gives arbitrary amount of KC 1095 in-game; bot counts KC in the trade (Class_cq/TradeWindow) and calls `POST /bot/exchange/kc-to-tt`. Rate is `effectiveRate = bot.overrideRate ?? 495000`, with per-bot daily limit stored in DB and checked per UTC day. TT->KC mirrors via frozen TT + bot delivering KC.
- **Bot gateway authenticated by per-bot token (ApiKey) separate from user JWT.** Rationale: bots are headless JVMs, cannot do OAuth; simple bearer token per bot row is auditable and rotatable. User JWT remains HS256 with short expiry + refresh.
- **30s push (heartbeat + stock) over WebSocket.** 30s HTTP POST is sufficient and matches existing maybeRefreshStorage cadence; WebSocket would add infra for little benefit now. Uses existing ApiReporter timer in BanSeller.
- **Cron inside NestJS (@nestjs/schedule) every 60s.** No external scheduler needed; single API instance owns expiry. If multiple replicas, add advisory lock later.
- **Keep mua/ and ban/ jars untouched except additive BanSeller patch.** No rewrite of Class_cp/chest logic; BanSeller gains ExchangeBot mode + pending-order lookup cache + ApiReporter.

## Risks / Trade-offs

- **Double-spend on concurrent fulfill vs expiry** → Mitigation: `UPDATE orders SET status=FULFILLED WHERE id=:id AND status='PENDING'` with row-level check; cron and fulfill use same conditional update; ledger insert is transactional.
- **Bot offline during pending window** → Mitigation: order stays PENDING until cron refunds; web shows `Bot offline — will refund in X`. No funds lost because deduction only on fulfill.
- **Stale stock (bot hasn't pushed 30s)** → Mitigation: shop shows `updatedAt` + `stale` badge if >90s; buy rejected with `STOCK_CHANGED` if live check fails.
- **Hardcode C:/NinjaLite/GomItem/** → Mitigation: keep DB as log source of truth; file logs remain but are ignored by git and not used for fulfillment checks.
- **Character name collisions / link hijack** → Mitigation: 6-char code is single-use, bound to user, TTL 5m; verify-link checks `characterName` not already linked to another user; bot only links via in-game whisper to prevent web-only spoof.

## Migration Plan

1. Add `docker-compose.yml` with Postgres, run `prisma migrate`.
2. Deploy `api/` first (auth, bots, shop read-only) so bots can start pushing.
3. Patch `ban/patcher/BanSeller.java` and rebuild `ban/ninja_ban.jar` in place; restart exchange + sell bots with `BOT_API_TOKEN` env.
4. Release `web/` with shop/orders/exchange/admin.
5. Backfill `ban/items/*.txt` into `products` table via seed script; keep file as seed source.
6. Rollback: revert API to previous image; orders in PENDING remain refundable by cron; no schema drop without manual step.

## Open Questions

- None blocking; rate override and daily limit defaults (495000 and null) confirmed. Future: consider per-user daily limit in addition to per-bot.
