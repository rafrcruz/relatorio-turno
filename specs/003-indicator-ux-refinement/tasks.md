# Tasks: Refinamento visual e melhoria de usabilidade da experiencia de indicadores

**Input**: Design documents from `/specs/003-indicator-ux-refinement/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/indicator-experience-contract.md, quickstart.md

**Tests**: Testes significativos sao obrigatorios para os fluxos principais pela constitution do projeto. Esta lista inclui testes automatizados onde o comportamento e testavel por estado/contrato e validacao visual manual/browser para contraste, hierarquia, densidade e resolucoes alvo.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel because it touches different files or does not depend on incomplete tasks
- **[Story]**: User story label for story phases only
- Every task includes an exact file path

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm current implementation boundaries and prepare validation artifacts without changing behavior.

- [X] T001 Review existing indicator UX contracts and record implementation notes in specs/003-indicator-ux-refinement/tasks.md
- [X] T002 [P] Create visual validation log scaffold in specs/003-indicator-ux-refinement/visual-qa.md
- [X] T003 [P] Confirm no new frontend dependencies are required by reviewing frontend/package.json
- [X] T004 [P] Confirm backend indicator-note contracts remain unchanged by reviewing backend/src/routes/indicator-notes.js

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared prerequisites that must be ready before the user stories are implemented.

**CRITICAL**: No user story work should begin until this phase is complete.

- [X] T005 Add a shared report page width and spacing baseline in frontend/src/app/pages/report/report.component.css
- [X] T006 Update the report tab and page shell spacing to support centered ultrawide layout in frontend/src/app/pages/report/report.component.html
- [X] T007 Expand or rebalance deterministic demo indicators to support 20+ varied rows in frontend/src/app/core/indicators.service.ts
- [X] T008 [P] Add indicator demo-data coverage tests for status/unit/reference/name variety in frontend/src/app/core/indicators.service.spec.ts
- [X] T009 [P] Add shared visual QA checklist entries for 1920x1080, 3440x1440, and notebook width in specs/003-indicator-ux-refinement/visual-qa.md

**Checkpoint**: Foundation ready - user story implementation can now begin.

---

## Phase 3: User Story 1 - Ler e operar a tela com clareza em tema claro (Priority: P1) MVP

**Goal**: Improve contrast, spacing, hierarchy, active states, click affordances and alert visibility across the report screen in light theme.

**Independent Test**: Open the report page in light theme, switch between `Passagem` and `Indicadores`, and verify sections, active states, actions and alerts are identifiable without trial and error.

### Tests for User Story 1

- [X] T010 [P] [US1] Add component test coverage for active tab switching and "Ver todos os indicadores" navigation in frontend/src/app/pages/report/report.component.spec.ts
- [X] T011 [P] [US1] Add manual contrast and hierarchy validation steps for report shell, tabs, buttons, links and alerts in specs/003-indicator-ux-refinement/visual-qa.md

### Implementation for User Story 1

- [X] T012 [US1] Refine report page header, context selector spacing, tab active states and section separation in frontend/src/app/pages/report/report.component.html
- [X] T013 [US1] Refine report page layout, max-width, light-theme contrast and responsive spacing in frontend/src/app/pages/report/report.component.css
- [X] T014 [US1] Strengthen visual affordance of `Anotacao`, `Urgencia` and `Pendencia` controls in frontend/src/app/pages/report/post-composer/post-composer.component.html
- [X] T015 [P] [US1] Adjust post composer button/input contrast and spacing in frontend/src/app/pages/report/post-composer/post-composer.component.css
- [X] T016 [P] [US1] Adjust post list panel boundaries, empty states and secondary action contrast in frontend/src/app/pages/report/post-list/post-list.component.html

**Checkpoint**: US1 is usable independently as a clearer light-theme report shell.

---

## Phase 4: User Story 2 - Revisar o resumo de indicadores na passagem (Priority: P1)

**Goal**: Keep the `Passagem` indicator area as a focused handover summary and improve readability of relevant indicators and focus-without-note alerts.

**Independent Test**: With varied demo indicators, open `Passagem` and verify only `Atencao`, `Foco` and manually included `Na meta` items appear with name, value, unit, status, note state, alert state and details action.

### Tests for User Story 2

- [X] T017 [P] [US2] Add summary inclusion and exclusion tests for `Atencao`, `Foco`, manual `Na meta`, and irrelevant `Na meta` in frontend/src/app/pages/report/area-indicators/area-indicators.component.spec.ts
- [X] T018 [P] [US2] Add manual validation steps for `Passagem` summary content, spacing and focus-without-note alert in specs/003-indicator-ux-refinement/visual-qa.md

### Implementation for User Story 2

- [X] T019 [US2] Preserve summary filtering by `inHandover` and add any missing display helpers in frontend/src/app/pages/report/area-indicators/area-indicators.component.ts
- [X] T020 [US2] Refine handover summary item layout, status badges, note state, focus alert and `Abrir` action in frontend/src/app/pages/report/area-indicators/area-indicators.component.html
- [X] T021 [US2] Refine handover summary spacing, borders, responsive grid/list behavior and alert contrast in frontend/src/app/pages/report/area-indicators/area-indicators.component.css

**Checkpoint**: US2 is independently testable as a focused `Passagem` indicator summary.

---

## Phase 5: User Story 3 - Comparar muitos indicadores em visao dedicada (Priority: P1)

**Goal**: Replace the large-card dedicated indicators layout with a tabular/list-tabular experience that supports fast comparison of about 20 indicators.

**Independent Test**: Open the `Indicadores` tab with 20+ varied demo indicators and verify aligned rows expose name, value, unit, status, reference, pointing state, handover state and actions without oversized cards.

### Tests for User Story 3

- [X] T022 [P] [US3] Extend dedicated indicators component tests for row ordering, long names and required row fields in frontend/src/app/pages/report/indicators-view/indicators-view.component.spec.ts
- [X] T023 [P] [US3] Add manual desktop density and row/column comparison validation steps in specs/003-indicator-ux-refinement/visual-qa.md

### Implementation for User Story 3

- [X] T024 [US3] Add display helpers for compact value, reference and note-state rendering in frontend/src/app/pages/report/indicators-view/indicators-view.component.ts
- [X] T025 [US3] Convert the dedicated indicator grid into a desktop table/list-tabular layout with responsive fallback in frontend/src/app/pages/report/indicators-view/indicators-view.component.html
- [X] T026 [US3] Add or adjust dedicated indicators view styles for table density, long-name handling, stable actions and mobile fallback in frontend/src/app/pages/report/indicators-view/indicators-view.component.css
- [X] T027 [US3] Ensure every row exposes name, value, unit, status, reference, apontamento state, handover state and add/edit action in frontend/src/app/pages/report/indicators-view/indicators-view.component.html

**Checkpoint**: US3 is independently testable as a dense dedicated indicator comparison view.

---

## Phase 6: User Story 4 - Filtrar, buscar e entender contadores de indicadores (Priority: P2)

**Goal**: Make filters, search and counters legible and reliable for many indicators.

**Independent Test**: Apply each filter, combine search with filters, validate counts, and verify empty results are clear with a reset path.

### Tests for User Story 4

- [X] T028 [P] [US4] Extend filter, search and counter tests for all filter modes and combined search in frontend/src/app/pages/report/indicators-view/indicators-view.component.spec.ts
- [X] T029 [P] [US4] Add manual validation steps for filter active states, search placement, counters and empty results in specs/003-indicator-ux-refinement/visual-qa.md

### Implementation for User Story 4

- [X] T030 [US4] Refine filter labels, active states, counters and search metadata in frontend/src/app/pages/report/indicators-view/indicators-view.component.ts
- [X] T031 [US4] Refine filter bar, search input, counters and empty result affordances in frontend/src/app/pages/report/indicators-view/indicators-view.component.html
- [X] T032 [US4] Ensure filter and search controls wrap cleanly without overlap at desktop and notebook widths in frontend/src/app/pages/report/indicators-view/indicators-view.component.css

**Checkpoint**: US4 is independently testable as efficient navigation for many indicators.

---

## Phase 7: User Story 5 - Registrar apontamento sem desorganizar a tela (Priority: P2)

**Goal**: Clarify add/edit apontamento flow, preserve rich text and attachments, and prevent the editor from disrupting the tabular indicator view.

**Independent Test**: Open the editor from a `Foco` indicator without apontamento, enter multi-line content, save, confirm pending alert clears, reopen and cancel without unintended changes.

### Tests for User Story 5

- [X] T033 [P] [US5] Add indicator note editor save/cancel state tests in frontend/src/app/pages/report/indicators-view/indicator-note-editor/indicator-note-editor.component.spec.ts
- [X] T034 [P] [US5] Add merged-state regression test proving saved apontamento clears `focusWithoutNote` in frontend/src/app/core/indicator-notes.service.spec.ts
- [X] T035 [P] [US5] Add manual validation steps for editor placement, multi-line content, save/cancel feedback and alert clearing in specs/003-indicator-ux-refinement/visual-qa.md

### Implementation for User Story 5

- [X] T036 [US5] Add selected-indicator context and editor state helpers for stable inline editing in frontend/src/app/pages/report/indicators-view/indicators-view.component.ts
- [X] T037 [US5] Integrate the editor into the tabular layout without hiding essential row fields in frontend/src/app/pages/report/indicators-view/indicators-view.component.html
- [X] T038 [US5] Refine editor heading, placeholder, action buttons, attachment area and pending-warning messaging in frontend/src/app/pages/report/indicators-view/indicator-note-editor/indicator-note-editor.component.html
- [X] T039 [US5] Preserve sanitized save/cancel behavior and feedback states in frontend/src/app/pages/report/indicators-view/indicator-note-editor/indicator-note-editor.component.ts

**Checkpoint**: US5 is independently testable as a clear apontamento editing flow.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Validate the complete feature, protect preserved behavior and record evidence.

- [X] T040 [P] Run frontend unit tests and record result in specs/003-indicator-ux-refinement/visual-qa.md using command `cd frontend && npm test`
- [X] T041 [P] Run backend contract tests and record result in specs/003-indicator-ux-refinement/visual-qa.md using command `cd backend && npm test`
- [X] T042 Run production build and record result in specs/003-indicator-ux-refinement/visual-qa.md using command `npm run build`
- [X] T043 Validate quickstart functional scenarios 1 through 5 and record evidence in specs/003-indicator-ux-refinement/visual-qa.md
- [X] T044 [P] Validate visual layout at 1920x1080 and record screenshot/notes in specs/003-indicator-ux-refinement/visual-qa.md
- [X] T045 [P] Validate visual layout at 3440x1440 and record screenshot/notes in specs/003-indicator-ux-refinement/visual-qa.md
- [X] T046 [P] Validate smaller notebook responsive layout and record screenshot/notes in specs/003-indicator-ux-refinement/visual-qa.md
- [X] T047 Verify preserved behaviors for context selection, records, filters, search, notes, handover mark and PDF export in specs/003-indicator-ux-refinement/visual-qa.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup completion and blocks all user stories.
- **US1 (Phase 3)**: Starts after Foundational; MVP scope.
- **US2 (Phase 4)**: Starts after Foundational; can run after or alongside US1 if style baseline is stable.
- **US3 (Phase 5)**: Starts after Foundational; depends on demo data from T007.
- **US4 (Phase 6)**: Best after US3 because it refines controls around the tabular view.
- **US5 (Phase 7)**: Best after US3 because editor placement depends on the tabular layout.
- **Polish (Phase 8)**: Depends on all desired user stories being complete.

### User Story Dependencies

- **US1 (P1)**: No dependency on other stories after Foundational.
- **US2 (P1)**: No dependency on US3/US4/US5; uses shared merged indicator state.
- **US3 (P1)**: No dependency on US1/US2, but uses shared data and visual baseline.
- **US4 (P2)**: Depends on or should follow US3 for final layout integration.
- **US5 (P2)**: Depends on or should follow US3 for stable editor placement.

### Parallel Opportunities

- T002, T003 and T004 can run in parallel.
- T008 and T009 can run in parallel after T007 is understood.
- US1 test/manual-validation tasks T010 and T011 can run in parallel.
- US2 test/manual-validation tasks T017 and T018 can run in parallel.
- US3 test/manual-validation tasks T022 and T023 can run in parallel.
- US4 test/manual-validation tasks T028 and T029 can run in parallel.
- US5 test/manual-validation tasks T033, T034 and T035 can run in parallel.
- Final validation tasks T040, T041, T044, T045 and T046 can run in parallel when the app/build environment supports it.

---

## Parallel Example: User Story 3

```text
Task: "T022 Extend dedicated indicators component tests for row ordering, long names and required row fields in frontend/src/app/pages/report/indicators-view/indicators-view.component.spec.ts"
Task: "T023 Add manual desktop density and row/column comparison validation steps in specs/003-indicator-ux-refinement/visual-qa.md"
```

After T022 and T023:

```text
Task: "T024 Add display helpers for compact value, reference and note-state rendering in frontend/src/app/pages/report/indicators-view/indicators-view.component.ts"
Task: "T025 Convert the dedicated indicator grid into a desktop table/list-tabular layout with responsive fallback in frontend/src/app/pages/report/indicators-view/indicators-view.component.html"
Task: "T026 Add or adjust dedicated indicators view styles for table density, long-name handling, stable actions and mobile fallback in frontend/src/app/pages/report/indicators-view/indicators-view.component.css"
```

---

## Implementation Strategy

### MVP First

1. Complete Phase 1 and Phase 2.
2. Complete US1 to make the screen clear and demo-safe at the shell level.
3. Stop and validate US1 independently with visual checks before deeper indicator layout work.

### Priority Delivery

1. Deliver P1 stories first: US1, US2 and US3.
2. Add P2 operational refinements: US4 and US5.
3. Complete Phase 8 validation and record evidence before marking the feature done.

### Risk Controls

- Do not add dependencies unless a task is explicitly revised with justification.
- Do not change backend contracts unless an existing contract test reveals a regression.
- Keep `Passagem` summary behavior separate from the full `Indicadores` view.
- Record visual validation evidence because resolution and visual quality are completion gates.

