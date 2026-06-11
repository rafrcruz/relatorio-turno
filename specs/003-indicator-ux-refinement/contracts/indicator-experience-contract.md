# Contract: Indicator Experience

This contract documents the behavior that must remain stable while refining the visual experience.

## UI Contract: Report Tabs

Context:
- Area, date and shift are selected before indicator review.
- The report page exposes two primary tabs: `Passagem` and `Indicadores`.

Required behavior:
- `Passagem` remains the default handover-oriented view.
- `Indicadores` opens the complete dedicated indicator view.
- The "Ver todos os indicadores" action from the summary switches to `Indicadores`.
- Active tab state is visually clear.

## UI Contract: Passagem Indicator Summary

Input:
- A merged indicator list for the selected area/date/shift.

Inclusion rules:
- Include indicators with status `atencao`.
- Include indicators with status `foco`.
- Include indicators with `includedInHandover = true`.
- Do not include other `na_meta` indicators.

Each rendered item must expose:
- Indicator name.
- Value and unit.
- Status label.
- Apontamento state.
- Focus-without-note alert when applicable.
- Action to open details or reach the dedicated indicators view.

## UI Contract: Dedicated Indicators View

Input:
- A merged indicator list for the selected area/date/shift.

Required columns or equivalent aligned row fields:
- Name.
- Value.
- Unit.
- Status.
- Reference/classification bands.
- Apontamento state or excerpt.
- Handover inclusion state.
- Add/edit pointing action.

Filters:
- `todos`: all indicators.
- `na_meta`: only status `na_meta`.
- `atencao`: only status `atencao`.
- `foco`: only status `foco`.
- `pendencia`: only `focusWithoutNote = true`.
- `passagem`: only `inHandover = true`.

Search:
- Search matches indicator name.
- Search composes with the active filter.
- Empty results show a clear empty state and a reset action.

## UI Contract: Indicator Note Editor

Open conditions:
- User selects add/edit action on an indicator row.

Required behavior:
- The edited indicator is clear to the user.
- The editor supports multi-line rich text content.
- Existing attachments and new attachments remain visible when applicable.
- Save shows feedback and refreshes merged indicator state.
- Cancel closes without changing content.
- Saving a valid apontamento clears the focus-without-note pending state.

## Service Contract: Merged Indicator Derivation

Derived fields:
- `inHandover = status == atencao OR status == foco OR note.includedInHandover == true`
- `focusWithoutNote = status == foco AND note.hasApontamento != true`

Consumers:
- `area-indicators` uses `inHandover` for the summary.
- `indicators-view` uses filters, counters and alert states.

## Backend API Contract: Indicator Notes

The feature must preserve these existing endpoints.

### GET `/api/indicator-notes`

Query parameters:
- `areaId`: number, required.
- `date`: date, required.
- `shift`: number, required.

Response:
- Array of Indicator Note objects for the context.
- Invalid context returns a client error.
- Backend failure falls back safely in the frontend to an empty notes list.

### POST `/api/indicator-notes`

Payload:
- `areaId`: number.
- `indicatorCode`: string.
- `date`: date.
- `shift`: number.
- `content`: rich text string.
- `includedInHandover`: optional boolean.
- `attachments`: optional files.

Response:
- Updated Indicator Note object.
- Or removal marker when the note is empty and no longer needs persistence.

### PATCH `/api/indicator-notes/{id}/handover`

Payload:
- `includedInHandover`: boolean.

Response:
- Updated Indicator Note object.
- Or removal marker when clearing the mark makes the note empty.

### DELETE `/api/indicator-notes/{id}`

Behavior:
- Removes note and related attachments.

### DELETE `/api/attachments/{id}`

Behavior:
- Removes one existing attachment during note editing.

## Non-Contracted Behavior

The feature does not add:
- Formal shift closure.
- New PI System/AF integration.
- New indicator calculations.
- Approval workflow.
- Deep authentication/profile changes.
