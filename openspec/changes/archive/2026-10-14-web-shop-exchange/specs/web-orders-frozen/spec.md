## ADDED Requirements

### Requirement: Create order with frozen TT

The system SHALL create orders via `POST /orders {botId, items: [{productId, qty}]}` for authenticated users with a linked character; it SHALL validate stock, compute total TT from product donGia, check user balance, freeze TT (create PENDING order and frozen ledger entry) in a single transaction, and return order id with status PENDING.

#### Scenario: Successful order creates frozen entry
- **WHEN** a linked user with sufficient TT and available stock calls `POST /orders`
- **THEN** the API creates an order with status PENDING, creates a ledger entry type FROZEN with amount = total, and deducts available balance by that amount

#### Scenario: Rejected when not linked
- **WHEN** an unlinked user calls `POST /orders`
- **THEN** the API returns 403 LINK_REQUIRED and creates no order

#### Scenario: Rejected when insufficient TT
- **WHEN** user available balance is less than total
- **THEN** the API returns 400 INSUFFICIENT_FUNDS

#### Scenario: Rejected when stock unavailable
- **WHEN** requested qty exceeds bag stock for that bot
- **THEN** the API returns 400 STOCK_UNAVAILABLE

### Requirement: Auto-fulfill by bot on in-game trade

When the buyer (linked characterName) trades in-game with the bot that owns a PENDING order, the bot SHALL auto-detect the pending order for that buyerName/bot and fulfill by putting items and locking; on success it SHALL call `POST /bot/orders/:id/fulfilled` with bot token, which SHALL atomically transition PENDING to FULFILLED and deduct the frozen amount to a DEDUCT ledger entry.

#### Scenario: Bot fulfills pending order
- **WHEN** a bot calls `POST /bot/orders/:id/fulfilled` for an order in PENDING belonging to a user linked to the trading characterName and matching that bot
- **THEN** the API updates order to FULFILLED, creates ledger DEDUCT, and returns 200

#### Scenario: Fulfill rejected for wrong status
- **WHEN** fulfill is called for an order not in PENDING
- **THEN** the API returns 409 with code ORDER_NOT_PENDING

#### Scenario: Fulfill rejected for wrong bot
- **WHEN** a bot calls fulfill for an order belonging to a different bot
- **THEN** the API returns 403 with code WRONG_BOT

### Requirement: Expiry cron refunds after 5 minutes

A scheduled task SHALL run every 60s and expire PENDING orders older than 5 minutes, transitioning them to EXPIRED and refunding frozen TT via a REFUND ledger entry. The transition SHALL be conditional on status still being PENDING to avoid races with fulfill.

#### Scenario: Expire old pending order
- **WHEN** a PENDING order has createdAt older than 5 minutes and cron runs
- **THEN** the order becomes EXPIRED and a REFUND ledger entry restores available balance

#### Scenario: Expire does not affect recently created order
- **WHEN** a PENDING order is younger than 5 minutes
- **THEN** cron leaves it as PENDING

#### Scenario: Expire does not override fulfilled order
- **WHEN** an order was fulfilled to FULFILLED just before cron runs
- **THEN** cron does not change it due to WHERE status=PENDING guard

### Requirement: Order visibility and states

Orders SHALL have states PENDING, FULFILLED, EXPIRED; users SHALL list their orders and fetch by id, with frozen/fulfilled/expired amounts visible.

#### Scenario: User lists own orders
- **WHEN** a user calls `GET /orders`
- **THEN** the API returns only orders belonging to that user

#### Scenario: States are persisted correctly
- **WHEN** an order is created, fulfilled, or expired
- **THEN** its status and ledger entries reflect the lifecycle
