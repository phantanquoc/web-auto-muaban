## ADDED Requirements

### Requirement: Order display states

Orders SHALL render status as text-labeled pills (PENDING amber, PROCESSING blue, DONE emerald, FAILED/CANCELLED rose, FROZEN slate distinct from failed) inside the wallet table defined in `web-storefront-ui`, with expandable row detail and retry on failed rows.

#### Scenario: Frozen order distinct
- **WHEN** an order is frozen
- **THEN** its pill reads FROZEN in slate, visually distinct from FAILED rose
