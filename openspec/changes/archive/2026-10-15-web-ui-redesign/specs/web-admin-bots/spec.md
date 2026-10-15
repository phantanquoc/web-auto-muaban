## ADDED Requirements

### Requirement: Admin presentation shell and bot table

The `/admin/*` area SHALL render in the Metronic-style shell (fixed dark navy sidebar 220px collapsible to 64px icons, light topbar with breadcrumb + search + avatar, light content) with sub-nav tabs (Tong quan / Bots / Don hang / Ty gia; non-Bots tabs may be placeholders). The bots view SHALL show a 4-card stat row (bots online/total, orders today, xu volume, frozen orders), a labeled create-bot grid form, and a datatable (name+type, enable toggle switch, rate, daily used/limit bar, relative heartbeat, actions: copy ID, enable/disable, rotate token) with a sort/filter bar. Token creation/rotation SHALL show the plain token once in a modal with copy button and "saved" confirm — never `alert()`.

#### Scenario: Admin stat overview
- **WHEN** an admin opens `/admin/bots`
- **THEN** stat cards, create form, and datatable render in the admin shell with table skeleton rows while loading
