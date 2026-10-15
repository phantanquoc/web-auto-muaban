## ADDED Requirements

### Requirement: Admin UI behind ADMIN-only route guard

The `/admin/*` UI (bot management, stock, logs, token rotation) SHALL only render for authenticated ADMIN users, enforced by middleware with a client-side role sanity check as defense in depth. The admin area SHALL use its own layout and nav, separate from the shop area.

#### Scenario: Guest sees no admin UI
- **WHEN** an unauthenticated visitor or non-admin user navigates to any `/admin/*` page
- **THEN** they are redirected away (to `/login` or `/shop` per `web-role-routes`) and never see the admin UI

#### Scenario: Admin manages bots in admin layout
- **WHEN** an authenticated ADMIN opens `/admin/bots`
- **THEN** the bot list, create form, and admin nav render inside the admin layout
