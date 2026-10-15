## ADDED Requirements

### Requirement: Catalog visual presentation

Catalog browsing SHALL use the dark storefront product cards, filters, skeletons, and empty states defined in `web-storefront-ui`. Prices SHALL be gold tabular `vi-VN` formatted; stock states SHALL use emerald (`Con N`) / rose (`Het hang`) with text labels.

#### Scenario: Card states
- **WHEN** products load, fail, or filter to zero
- **THEN** skeleton cards, an error block with Retry, or the empty state render respectively
