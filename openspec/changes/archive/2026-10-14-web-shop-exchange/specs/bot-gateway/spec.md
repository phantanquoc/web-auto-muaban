## ADDED Requirements

### Requirement: Bot heartbeat

Bots SHALL authenticate with per-bot token via `x-bot-token` header and report liveness via `POST /bot/heartbeat`; the API SHALL update lastHeartbeatAt.

#### Scenario: Valid heartbeat updates timestamp
- **WHEN** a bot calls `POST /bot/heartbeat` with its valid token
- **THEN** the API updates lastHeartbeatAt to now and returns 200

#### Scenario: Invalid bot token rejected
- **WHEN** heartbeat is called with unknown or missing token
- **THEN** the API returns 401

### Requirement: Bot stock report

Bots SHALL report stock via `POST /bot/stock {bag: [{productId, qty}], chest: [{productId, qty}]}`; the API SHALL persist per-bot bag/chest snapshot with updatedAt.

#### Scenario: Stock snapshot persisted
- **WHEN** a bot POSTs a stock snapshot
- **THEN** the API stores it and subsequent `GET /bots/:id/stock` returns it with updatedAt = now

### Requirement: Bot order fulfillment endpoint

Bots SHALL fulfill orders via `POST /bot/orders/:id/fulfilled` as specified in web-orders-frozen; the gateway SHALL validate bot owns the order's botId and order is PENDING.

#### Scenario: Gateway fulfillment succeeds
- **WHEN** the owning bot calls fulfilled for a PENDING order
- **THEN** the API transitions order to FULFILLED as per orders spec

### Requirement: Bot exchange reporting

Bots SHALL report KC observations via `POST /bot/exchange/kc-to-tt` as specified in web-exchange-kc-tt; the gateway SHALL validate bot type EXCHANGE.

#### Scenario: Exchange report from sell bot rejected
- **WHEN** a SELL bot calls kc-to-tt exchange
- **THEN** the API returns 403 with code WRONG_BOT_TYPE

### Requirement: Bot link verification passthrough

Bots SHALL be able to call `POST /auth/verify-link` with bot token and body `{characterName, code}` to link a user; this route SHALL accept either user JWT or bot token.

#### Scenario: Bot verifies link code
- **WHEN** a bot calls verify-link with a valid code and characterName
- **THEN** the API links as per web-auth-link spec
