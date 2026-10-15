# web-login Specification

## Purpose
TBD - created by archiving change web-login-role-routes. Update Purpose after archive.
## Requirements
### Requirement: Single login page with register mode

The web app SHALL provide a single `/login` page with email/password login and a register mode toggle. Registering creates a USER-role account via `POST /auth/register`. On success the client SHALL persist the access token to both `localStorage` (existing `apiFetch` behavior) and an `accessToken` cookie (for middleware), then redirect by role.

#### Scenario: Successful login as guest
- **WHEN** a user logs in with valid USER credentials
- **THEN** the client stores the token in `localStorage` and cookie, and redirects to `/shop`

#### Scenario: Successful login as admin
- **WHEN** a user logs in with valid ADMIN credentials
- **THEN** the client stores the token in `localStorage` and cookie, and redirects to `/admin`

#### Scenario: Failed login shows inline error
- **WHEN** login returns 401 (invalid credentials)
- **THEN** the page displays the error message inline below the form and keeps the entered email, with a retry button

#### Scenario: Register creates guest account
- **WHEN** a new user registers with email/password
- **THEN** the account is created with role USER and the user is logged in and redirected to `/shop`

#### Scenario: Already authenticated user visits login
- **WHEN** an authenticated user opens `/login`
- **THEN** middleware redirects them to their role home (`/admin` for ADMIN, `/shop` otherwise)

### Requirement: Session expiry handling

The web app SHALL treat an expired or invalid token as logged out: `apiFetch` SHALL clear stored tokens and redirect to `/login` on any 401 response.

#### Scenario: Token expires mid-session
- **WHEN** an API call returns 401
- **THEN** the client clears `localStorage` and cookie tokens and redirects to `/login`

#### Scenario: Cookie missing but localStorage has token
- **WHEN** the app loads with a valid token in `localStorage` but no cookie
- **THEN** the client re-syncs the cookie from `localStorage` so middleware works

### Requirement: Login page visual layout

The `/login` page SHALL use the split-screen brand + form presentation defined in `web-storefront-ui` while keeping the existing login/register behavior, role redirects, inline errors, and `?next=` handling unchanged.

#### Scenario: Brand panel on desktop
- **WHEN** a visitor opens `/login` on desktop widths
- **THEN** the brand panel with trust bullets renders beside the form card

