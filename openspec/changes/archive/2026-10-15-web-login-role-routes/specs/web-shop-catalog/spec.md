## ADDED Requirements

### Requirement: Public catalog browsing with login-gated actions

The shop catalog pages SHALL remain viewable without authentication, but any mutating or user-scoped action SHALL require login and redirect unauthenticated users to `/login`.

#### Scenario: Guest browses catalog
- **WHEN** an unauthenticated visitor opens `/shop`
- **THEN** products with price and stock hints render normally

#### Scenario: Guest attempts to buy
- **WHEN** an unauthenticated visitor triggers a buy/order action
- **THEN** they are redirected to `/login` instead of calling the order API

#### Scenario: Guest opens wallet
- **WHEN** an unauthenticated visitor opens `/wallet`
- **THEN** they are redirected to `/login`
