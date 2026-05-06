# Roadmap

Planned features in implementation order. Each phase builds on the previous one — later phases have dependencies on earlier work.

---

## Phase 1 — Pure Frontend (no DB changes)

These touch only React components. No migrations, no API changes. Fastest to ship.

### Card Count Badge
Show a live card count on each column header (e.g. `4 cards`).
- Read `column.cards.length` from the existing query data
- Render a small badge next to the column name in `Column.tsx`

### Search / Filter
A search bar above the board that dims non-matching cards in real time.
- Client-side only — filter against the existing TanStack Query cache
- Cards not matching the query get reduced opacity; layout is preserved (no reflow)
- Lives in `Board.tsx` as local state passed down as a prop

---

## Phase 2 — Extend the Card Model

One migration that adds three new nullable columns. All three features ship together or independently — they share the same migration.

**Migration:** `add_card_priority_duedate_checklist`

```
Card
+ priority    String?   -- "low" | "medium" | "high"
+ dueDate     DateTime?
+ checklist   Json?     -- [{ text: string, done: boolean }]
```

### Card Priority
Low / medium / high selector in `AddCardModal` and `EditCardModal`, displayed as a colored dot or label on the card.
- Same pattern as the existing tag picker — a row of three buttons
- Color convention: low = muted, medium = yellow, high = red

### Due Dates
A date input in both modals. On the card, shown as a small date badge below the title.
- Badge turns red when the date is today or in the past
- Use a standard `<input type="date">` — no date-picker library needed

### Checklist
A dynamic list of subtasks inside the edit modal. Stored as JSON in the DB.
- Add / remove items, toggle done state
- On the card, show a compact progress indicator: `2 / 5` with a small progress bar
- Checklist state updates via the existing `PATCH /cards/:id` endpoint (no new route)

---

## Phase 3 — Column-Level Features

Extends the Column model and adds new UI states to `Column.tsx`.

**Migration:** `add_column_wip_limit`

```
Column
+ wipLimit    Int?
```

### WIP Limit
An optional max card count per column, set when creating or editing a column.
- If `wipLimit` is set and `cards.length >= wipLimit`, highlight the column header in red/amber
- Block adding new cards to that column when at limit (disable the add button + tooltip)
- Pairs naturally with the card count badge from Phase 1

### Card Archive
Soft-delete cards instead of hard-deleting them. Archived cards leave the board but can be restored.

**Migration:** `add_card_archived` — adds `archived Boolean @default(false)` to Card

- `DELETE /cards/:id` becomes `PATCH /cards/:id` setting `archived: true`
- New `GET /cards/archived?workspaceId=xxx` endpoint returns all archived cards for a workspace
- New `PATCH /cards/:id/restore` unarchives a card and appends it to its original column
- Trash icon on the card opens a confirmation → archives instead of deletes
- Archive view accessible from the workspace menu (a drawer or simple list page)

---

## Phase 4 — UX Polish

No new data model changes. Purely frontend work.

### Keyboard Shortcuts
Global shortcuts scoped to the authenticated layout.

| Key       | Action                                      |
|-----------|---------------------------------------------|
| `n`       | Open "add card" modal in the active column  |
| `e`       | Open "edit card" modal for the focused card |
| `←` / `→` | Move focused card to prev / next column     |
| `/`       | Focus the search bar (from Phase 1)         |
| `Escape`  | Close any open modal                        |

- Use a single `keydown` listener in `Board.tsx` or a shared hook
- Track focused card with a `focusedCardId` state
- Cards get a visible focus ring when focused via keyboard

### Card Labels / Colors
Free-form colored labels on cards, separate from the existing type tags (FEAT, FIX, etc.).
- Labels are stored as `Json?` on Card: `[{ text: string, color: string }]`
- Created inline in the modal with a text input + color swatch picker
- Rendered as small pills on the card below the title
- Labels are per-card, not shared across cards (no label library to manage)

**Migration:** `add_card_labels` — adds `labels Json?` to Card

---

## Phase 5 — Calendar View

**Depends on:** Due dates (Phase 2)

A secondary view alongside the board showing cards with due dates on a monthly calendar.

- Toggle between Board view and Calendar view via a button in `TopBar.tsx`
- Calendar renders as a CSS grid (7 columns). No calendar library needed.
- Cards appear as small chips on their due date
- Clicking a chip opens the existing `EditCardModal`
- Cards without a due date don't appear in the calendar view
- The view reads from the same TanStack Query cache — no new API endpoints

---

## Phase 6 — Recurring Cards

**Depends on:** Checklist (Phase 2), Card Archive (Phase 3)

The most complex feature. A card that automatically re-creates itself on a schedule.

**Migration:** `add_card_recurrence`

```
Card
+ recurrence  Json?  -- { frequency: "daily"|"weekly"|"monthly", nextDue: DateTime }
```

- Recurrence config set in the edit modal: frequency + starting date
- A background job (cron on the API) checks for cards where `nextDue <= now`, clones them into the same column, and advances `nextDue`
- When a recurring card is "deleted" (archived), the recurrence stops — the card is just archived, not destroyed
- NestJS `@nestjs/schedule` package handles the cron job

---

## Order Summary

| Phase | Features                                      | DB changes         |
|-------|-----------------------------------------------|--------------------|
| 1     | Card count badge, Search/filter               | None               |
| 2     | Priority, Due dates, Checklist                | 3 new card columns |
| 3     | WIP limit, Card archive                       | 2 migrations       |
| 4     | Keyboard shortcuts, Card labels               | 1 new card column  |
| 5     | Calendar view                                 | None               |
| 6     | Recurring cards                               | 1 new card column  |
