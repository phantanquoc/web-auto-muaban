## ADDED Requirements

### Requirement: User registration and login with JWT

The system SHALL provide email/password registration and login via the API, issuing a JWT access token (and refresh token) for authenticated requests.

#### Scenario: Successful registration
- **WHEN** a client POSTs valid email and password to `POST /auth/register`
- **THEN** the API creates a user, hashes the password with bcrypt, and returns 201 with user id

#### Scenario: Successful login
- **WHEN** a client POSTs correct credentials to `POST /auth/login`
- **THEN** the API returns 200 with access token and refresh token

#### Scenario: Invalid credentials
- **WHEN** login receives wrong password
- **THEN** the API returns 401 with error code INVALID_CREDENTIALS

### Requirement: Mandatory character linking before buy/exchange

The system SHALL require a linked in-game character name before allowing buy or exchange; unlinked requests SHALL be rejected with 403 LINK_REQUIRED.

#### Scenario: Buy without link rejected
- **WHEN** an authenticated user without a linked character calls `POST /orders`
- **THEN** the API returns 403 with code LINK_REQUIRED

#### Scenario: Exchange without link rejected
- **WHEN** an authenticated unlinked user calls `POST /exchange/kc-to-tt` or `POST /exchange/tt-to-kc`
- **THEN** the API returns 403 with code LINK_REQUIRED

### Requirement: Link-code generation (6-char, TTL 5m)

The system SHALL generate a 6-character alphanumeric link code (A-Z, 0-9) with TTL 5 minutes via `POST /auth/link-code`, bound to the requesting user and single-use.

#### Scenario: Generate code
- **WHEN** an authenticated user calls `POST /auth/link-code`
- **THEN** the API stores a code with expiresAt = now + 5m and returns the code

#### Scenario: Code expires after 5 minutes
- **WHEN** 5 minutes have passed since generation
- **THEN** the code is considered expired and verification rejects it

#### Scenario: Code is single-use
- **WHEN** a code has been consumed by successful verification
- **THEN** subsequent verify attempts with the same code are rejected

### Requirement: Link verification via in-game private chat

The system SHALL verify linking when an exchange bot observes the code in a private chat and calls `POST /auth/verify-link {characterName, code}` with its bot token; on success the user is linked to that characterName.

#### Scenario: Successful verification links character
- **WHEN** a bot calls `POST /auth/verify-link` with a valid unexpired unconsumed code and a characterName not linked to another user
- **THEN** the API links the code owner to that characterName and returns 200 with linked characterName

#### Scenario: Invalid or expired code
- **WHEN** verify is called with wrong, expired, or already consumed code
- **THEN** the API returns 400 with code INVALID_LINK_CODE

#### Scenario: Character already linked to another user
- **WHEN** the characterName is already linked to a different user
- **THEN** the API returns 409 with code CHARACTER_ALREADY_LINKED

### Requirement: Auth guards and roles

The system SHALL protect routes with JWT guard; admin routes SHALL additionally require role ADMIN. Bot gateway routes SHALL use per-bot token (ApiKey) instead of user JWT.

#### Scenario: Missing JWT rejected
- **WHEN** a protected route is called without Authorization Bearer token
- **THEN** the API returns 401

#### Scenario: Non-admin cannot access admin bots
- **WHEN** a non-admin user calls `GET /admin/bots`
- **THEN** the API returns 403

#### Scenario: Bot gateway requires bot token
- **WHEN** a bot gateway route is called without valid `x-bot-token`
- **THEN** the API returns 401
