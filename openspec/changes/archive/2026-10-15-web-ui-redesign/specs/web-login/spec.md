## ADDED Requirements

### Requirement: Login page visual layout

The `/login` page SHALL use the split-screen brand + form presentation defined in `web-storefront-ui` while keeping the existing login/register behavior, role redirects, inline errors, and `?next=` handling unchanged.

#### Scenario: Brand panel on desktop
- **WHEN** a visitor opens `/login` on desktop widths
- **THEN** the brand panel with trust bullets renders beside the form card
