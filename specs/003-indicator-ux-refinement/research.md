# Research: Refinamento visual e melhoria de usabilidade da experiência de indicadores

## Decision: Reuse existing report and indicator components

**Rationale**: The repository already has a dedicated report page with `Passagem` and `Indicadores` tabs, a handover summary component, a dedicated indicators view, an indicator note editor, services for indicator mock data and note persistence, and unit tests for filtering/merge behavior. Reusing these pieces satisfies the constitution's consistency gate and keeps the feature focused on UX refinement.

**Alternatives considered**:
- Build a new indicators page from scratch: rejected because it duplicates existing behavior and risks breaking preserved workflows.
- Move indicator state into a new shared store: rejected because current RxJS service composition already supports the needed flows.

## Decision: Use a tabular/list-tabular dedicated indicators view

**Rationale**: The spec calls for dense comparison of around 20 indicators. A row-and-column layout provides faster scanning of name, value, status, reference, pointing status, handover inclusion and actions than large cards.

**Alternatives considered**:
- Keep responsive card grid: rejected because it is visually large and weak for many indicators.
- Full spreadsheet-like grid: rejected because it may feel heavier than the product needs and can degrade on smaller widths.

## Decision: Keep the "Passagem" indicators area as a summary subset

**Rationale**: The existing `IndicatorNotesService.merge()` already derives `inHandover` from "Atenção", "Foco" or manual inclusion. The summary should continue using this derived state so it does not become a duplicate full indicator list.

**Alternatives considered**:
- Show all indicators on "Passagem": rejected because it conflicts with the spec and reduces handover focus.
- Require manual inclusion for all statuses: rejected because "Atenção" and "Foco" are operationally relevant by default.

## Decision: Preserve backend API contracts for indicator notes

**Rationale**: The feature is a presentation and usability refinement. Existing endpoints already support listing notes, upserting text and attachments, toggling handover inclusion, deleting notes, and deleting attachments. No new backend capability is required to satisfy the spec.

**Alternatives considered**:
- Add a backend endpoint for filtered indicator rows: rejected because indicator values are currently mock-derived in the frontend and the feature does not require real PI System/AF integration.
- Add new persistence fields for visual status: rejected because status and alert flags can be derived from indicator status and existing notes.

## Decision: Expand or rebalance mock indicator data in the existing indicator service

**Rationale**: The spec requires a demonstrable scenario with many indicators and varied statuses, units, references and names. The current mock service is the right location for demonstration data because it already owns deterministic indicator definitions and status generation.

**Alternatives considered**:
- Seed new backend indicator records: rejected because current active UI reads mock definitions for indicator display.
- Hard-code demo rows in the component: rejected because it would split data rules away from the service.

## Decision: Avoid new dependencies

**Rationale**: Angular, Tailwind CSS, lucide-angular, ngx-quill and existing services are enough for the planned table/list, actions, alerts and editor refinement. Avoiding dependencies satisfies the library gate and reduces implementation risk.

**Alternatives considered**:
- Add a data-grid library: rejected because the feature needs a controlled, product-specific operational list, not advanced grid behavior.
- Add an accessibility/contrast package: rejected for implementation because the acceptance can be validated through visual review and existing browser tooling.

## Decision: Validate via existing automated tests plus visual/browser checklist

**Rationale**: Existing unit tests cover indicator merge rules and filters. This feature also has strong visual requirements, so completion must include browser validation at 1920x1080, 3440x1440 and a smaller notebook width, with screenshots or documented observations.

**Alternatives considered**:
- Only run unit tests: rejected because the constitution treats visual quality and target resolutions as mandatory.
- Add a new e2e dependency before implementation: rejected because the current scope does not require new tooling.
