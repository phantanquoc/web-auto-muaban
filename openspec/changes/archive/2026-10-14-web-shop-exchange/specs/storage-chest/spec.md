## MODIFIED Requirements

### Requirement: Chest data refresh

The bot SHALL keep chest data (`cd.q.x`) populated by periodically sending the open-chest request `i(4)` (`Class_bo((byte)-30)` + `writeByte(-103)` + `writeByte(4)`) from the current selling spot, without moving to the NPC. The refresh SHALL run on a low-frequency timer (no more often than once per 30 seconds) and SHALL NOT run while a trade is active or a withdraw is in progress. The bot SHALL additionally report the latest chest snapshot to the API via `POST /bot/stock` every ~30s when API is configured.

#### Scenario: Chest data is empty at startup
- **WHEN** the bot has not yet sent `i(4)` and `cd.q.x` is null
- **THEN** the refresh timer sends `i(4)` from the selling spot
- **AND** after the server responds (~500ms) `cd.q.x` is populated for counting and display

#### Scenario: Refresh does not spam the server
- **WHEN** the refresh timer has sent `i(4)` less than 30 seconds ago
- **THEN** the bot does not send another `i(4)` refresh

#### Scenario: Refresh suppressed during trade
- **WHEN** a trade is active (state is not IDLE) or a withdraw is in progress
- **THEN** the refresh timer does not send `i(4)`

#### Scenario: Stock snapshot pushed to API
- **WHEN** API base URL and bot token are configured and 30s have elapsed
- **THEN** the bot POSTs bag and chest counts to `POST /bot/stock` alongside local refresh

### Requirement: Chest stock counting and display

The bot SHALL count chest stock per item id from `cd.q.x`, using field `.e` for the per-slot quantity and matching item id via `al.b.a & 0xFFFF`. The GUI SHALL show a "RUONG" column listing each price-list item that has a mã vp, formatted as `<maVp>=<count>` joined by ", " (e.g. `d7=8, d8=13, d9=9`). When chest data is not yet available or no item matches, the column SHALL show "-". API stock reporting SHALL use the same counting method.

#### Scenario: Display chest stock per item
- **WHEN** `cd.q.x` is populated and holds 8 of d7, 13 of d8, 9 of d9
- **THEN** the "RUONG" GUI column shows `d7=8, d8=13, d9=9`

#### Scenario: Chest not yet loaded
- **WHEN** `cd.q.x` is null (no `i(4)` sent yet) or the price list is empty
- **THEN** the "RUONG" column shows "-"

#### Scenario: Count reads the correct field
- **WHEN** counting a chest item whose slot has `.e=1` and `.d=0`
- **THEN** the count uses `.e` (not `.d`), so each such slot contributes 1 to the total

### Requirement: Automatic withdraw when bag stock depleted

When a price-list item's bag count (`countAvailable` over `cd.q.v`) is 0 and the chest holds that item, the bot SHALL withdraw that item from the chest into the bag. The withdraw SHALL follow the verified sequence: locate the storage NPC via `cd.h.d(5)`; move to it via repeated `cd.h.a(npc.aa, npc.ab)` calls (re-issued about every 500ms to resist being pulled back) until the bot is within 20 distance units; send greet opcode `29` (`writeByte(5)`+`writeByte(0)`+`writeByte(0)`); send open `i(4)`; then withdraw matching chest slots one at a time via opcode `16` (`writeByte(slot)`) with a ~50–100ms pace between slots. The bot SHALL keep withdrawing matching slots until the bag has no empty slot left (bag full) or the chest holds no more of that item. The withdraw trigger SHALL additionally consider pending web orders as demand signal when deciding what to withdraw.

#### Scenario: Withdraw refills bag until full
- **WHEN** an item's bag count is 0, the chest holds 30 of it, and the bag has 5 empty slots
- **THEN** the bot withdraws that item slot-by-slot and stops after the 5 empty bag slots are filled (bag full)

#### Scenario: Withdraw stops when chest empty of item
- **WHEN** an item's bag count is 0, the chest holds 3 of it, and the bag has 10 empty slots
- **THEN** the bot withdraws all 3 and stops (chest empty of that item) without error

#### Scenario: Movement resists being pulled back
- **WHEN** the bot walks to the storage NPC while the farm loop tries to pull it back to the config position
- **THEN** the withdraw re-issues the move command each poll until the bot reaches within 20 units of the NPC, then proceeds to greet and withdraw

#### Scenario: NPC not present in current zone
- **WHEN** `cd.h.d(5)` returns null (no storage NPC in the current zone)
- **THEN** the bot aborts the withdraw attempt without moving or sending withdraw opcodes, and does not crash
