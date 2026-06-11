# Quickstart: Refinamento visual e melhoria de usabilidade da experiência de indicadores

## Prerequisites

- Dependencies installed at repository root, frontend and backend.
- Database environment available for backend routes that persist notes and attachments.
- Browser available for visual validation.

## Setup

```powershell
npm run install:all
```

## Run the App

```powershell
npm run dev
```

Expected:
- Backend starts through `backend` dev script.
- Frontend starts through Angular dev server.
- The report page is reachable in the browser.

## Automated Validation

Frontend:

```powershell
cd frontend
npm test
```

Backend:

```powershell
cd backend
npm test
```

Build:

```powershell
npm run build
```

Expected:
- Existing indicator filter/merge behavior remains green.
- Existing backend indicator note contract tests remain green.
- Production build completes.

## Functional Scenarios

### Scenario 1: Passagem Summary

1. Open the report page.
2. Select an area/date/shift with varied indicator statuses.
3. Open the `Passagem` tab.
4. Inspect `Indicadores do Turno`.

Expected:
- Only `Atenção`, `Foco` and manually included `Na meta` indicators appear.
- The section is visually separated from previous content.
- Each item shows name, value, unit, status, apontamento state and action to open details.
- `Foco` without apontamento is clearly highlighted.

### Scenario 2: Dedicated Indicators View

1. Open the `Indicadores` tab or use `Ver todos os indicadores`.
2. Validate the list with around 20 indicators in the demonstration scenario.
3. Compare name, value, unit, status, reference, pointing state and handover state.

Expected:
- Layout reads as table/list-tabular on desktop.
- Rows remain aligned and dense enough for many indicators.
- Long names do not break the layout.
- Actions are visible and recognizable as clickable.

### Scenario 3: Filters, Search and Counters

1. Apply each filter: `Todos`, `Na meta`, `Atenção`, `Foco`, `Foco sem apontamento`, `Na passagem`.
2. Search by part of an indicator name.
3. Combine search with a filter.
4. Clear filters/search.

Expected:
- Counts match visible categories.
- Empty results are clear and offer a reset path.
- Filter active states are obvious.
- Search input remains legible and correctly positioned.

### Scenario 4: Apontamento Editor

1. Open `Adicionar apontamento` for a `Foco` indicator without apontamento.
2. Enter multi-line content covering cause, observation, action taken, pending action and next-shift guidance.
3. Save.
4. Reopen and cancel without changes.

Expected:
- The edited indicator is clear.
- Editor does not disorganize the indicator list.
- Save feedback appears.
- The pending `Foco sem apontamento` alert is removed after a valid save.
- Cancel closes without unintended changes.

### Scenario 5: Manual Handover Inclusion

1. Find a `Na meta` indicator not included in handover.
2. Select `Incluir na passagem`.
3. Return to `Passagem`.

Expected:
- The indicator appears in the handover summary.
- The dedicated view shows clear `Na passagem` state.

## Visual Validation

Validate these viewport sizes:
- 1920x1080.
- 3440x1440.
- Smaller notebook width representative of the target user.

Expected:
- Main content is centered with comfortable max width on ultrawide.
- Text areas and panels do not stretch indefinitely.
- No overlapping, clipped critical text or squeezed action controls.
- Theme-light contrast is adequate for buttons, tabs, filters, borders, badges, alerts and secondary actions.
- The final screen looks ready for client demonstration.

## Contract References

- Data model: [data-model.md](./data-model.md)
- Experience/API contract: [contracts/indicator-experience-contract.md](./contracts/indicator-experience-contract.md)
