# web-role-routes Specification

## Purpose
TBD - created by archiving change web-login-role-routes. Update Purpose after archive.
## Requirements
### Requirement: Middleware guards admin routes

The web app SHALL protect all `/admin/*` routes with `web/middleware.ts`: requests without a valid token redirect to `/login?next=<path>`; requests with a non-ADMIN role redirect to `/shop`. The `next` parameter SHALL only accept relative paths starting with a single `/`.

#### Scenario: Unauthenticated visitor opens admin page
- **WHEN** a visitor without a token opens `/admin/bots`
- **THEN** they are redirected to `/login?next=/admin/bots`, and after login land back on `/admin/bots` if authorized

#### Scenario: Guest opens admin page
- **WHEN** an authenticated USER opens `/admin/bots`
- **THEN** they are redirected to `/shop`

#### Scenario: Admin opens admin page
- **WHEN** an authenticated ADMIN opens `/admin/bots`
- **THEN** the page renders normally

#### Scenario: Open-redirect rejected
- **WHEN** the `next` parameter is an absolute URL or protocol-relative URL
- **THEN** middleware falls back to the role home (`/admin` or `/shop`)

### Requirement: Separate shop and admin layouts

The web app SHALL provide a guest `(shop)` layout (nav: Shop, Wallet, Exchange, Link, plus Login/Logout by session state) and an `admin` layout (nav: admin pages plus link back to Shop and Logout). Each nav SHALL show only its own area links. The `/admin/*` UI SHALL additionally verify the role client-side as defense in depth behind the middleware.

#### Scenario: Guest nav has no admin link
- **WHEN** any user views a shop-area page
- **THEN** the nav shows Shop, Wallet, Exchange, Link and no Admin link

#### Scenario: Admin layout shows admin nav
- **WHEN** an admin views an `/admin/*` page
- **THEN** the nav shows admin links, a Shop link, and Logout — and no guest-area confusion

#### Scenario: Admin can still browse shop
- **WHEN** an authenticated ADMIN opens `/shop`
- **THEN** the shop renders normally (only guest-to-admin direction is blocked)

