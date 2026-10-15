## ADDED Requirements

### Requirement: KC to TT exchange via exchange bot (any amount)

Customers SHALL hand any amount of KC (itemId 1095) to an exchange bot in-game; the bot SHALL count KC received in the trade and call `POST /bot/exchange/kc-to-tt {characterName, kcAmount, botId}` with bot token; the API SHALL credit `TT = kcAmount * effectiveRate`, where `effectiveRate = bot.rateOverride ?? 495000`.

#### Scenario: Credit TT for KC handed
- **WHEN** a bot reports `kcAmount = 3` for a characterName linked to a user, with effective rate 495000
- **THEN** the API credits 1485000 TT to that user and creates a ledger EXCHANGE_CREDIT entry plus an exchange record

#### Scenario: Rejects unlinked character
- **WHEN** exchange is reported for a characterName not linked to any user
- **THEN** the API returns 404 with code CHARACTER_NOT_LINKED

#### Scenario: Rejects non-positive amount
- **WHEN** kcAmount is 0 or negative
- **THEN** the API returns 400 with code INVALID_AMOUNT

### Requirement: TT to KC exchange

Authenticated linked users SHALL request TT to KC via `POST /exchange/tt-to-kc {kcAmount, botId}`; the API SHALL check balance, enforce per-bot daily limit, freeze TT, and await bot delivery; bot SHALL call `POST /bot/exchange/tt-to-kc/fulfilled` to confirm.

#### Scenario: Create TT to KC request
- **WHEN** a linked user with sufficient TT requests kcAmount 2 with a bot whose effective rate is 495000
- **THEN** the API freezes 990000 TT and creates a pending exchange

#### Scenario: Insufficient TT
- **WHEN** available balance is less than kcAmount * rate
- **THEN** the API returns 400 INSUFFICIENT_FUNDS

### Requirement: Per-bot rate override and daily limit

Admin SHALL configure per-bot `rateOverride` (nullable, defaults to 495000) and `dailyLimitTt` (nullable, max TT credited per UTC day per bot); the API SHALL enforce the limit on KC->TT exchanges per bot per day and return 429 DAILY_LIMIT_EXCEEDED when exceeded.

#### Scenario: Enforce daily limit
- **WHEN** a KC->TT exchange would make the bot's credited TT for that UTC day exceed dailyLimitTt
- **THEN** the API returns 429 with code DAILY_LIMIT_EXCEEDED and credits nothing

#### Scenario: Rate override applied
- **WHEN** a bot has rateOverride 500000
- **THEN** a KC->TT for 2 KC credits 1000000 TT

#### Scenario: No limit when null
- **WHEN** dailyLimitTt is null
- **THEN** exchanges are not limited

### Requirement: Ledger for all exchange movements

Every exchange SHALL create an immutable ledger entry with type, amount, user, bot, and reference id.

#### Scenario: Ledger exists after exchange
- **WHEN** a KC->TT exchange succeeds
- **THEN** a ledger row with type EXCHANGE_CREDIT and the credited amount exists for that user

### Requirement: Exchange form UX

The TT-to-KC exchange form SHALL use the two-column layout, bot SELECT, KC stepper with quick chips, live TT preview, confirm modal, and success-with-transaction-code presentation defined in `web-storefront-ui`. The raw `botId` textbox SHALL NOT remain.

#### Scenario: Bot selection guidance
- **WHEN** the user opens the bot SELECT
- **THEN** online bots list first with rate and daily remaining shown
