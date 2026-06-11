# Data Model: Refinamento visual e melhoria de usabilidade da experiência de indicadores

## Entity: Indicador do Turno

Represents an operational indicator for the selected area/date/shift context.

Fields:
- `id`: numeric identifier.
- `code`: stable indicator code used to join notes and values.
- `name`: display name.
- `unit`: unit shown next to the value.
- `reference`: classification reference used to describe "Na meta", "Atenção" and "Foco" bands.
- `value`: numeric value or null when unavailable.
- `status`: one of `na_meta`, `atencao`, `foco`, `unknown`.
- `source`: source marker, currently mock for demonstration data.

Validation rules:
- `code` must be unique within the demonstration list for a selected area.
- `name`, `unit`, `value`, `status` and `reference` must remain displayable in the dedicated indicators view.
- About 20 or more demonstration indicators must be available in a scenario used for validation.
- Demonstration data must include varied statuses, units, references and name lengths.

## Entity: Reference Classification

Represents how a value maps to operational status.

Variants:
- `ideal_band`: ideal interval with attention and focus limits outside the band.
- `higher_better`: values greater than or equal to target are "Na meta"; values below focus are "Foco".
- `lower_better`: values less than or equal to target are "Na meta"; values above focus are "Foco".

Validation rules:
- Each rendered indicator must show a human-readable reference or classification bands.
- Reference text must remain legible in the tabular view.

## Entity: Indicator Note

Represents an operational note and optional handover inclusion for one indicator in one area/date/shift context.

Fields:
- `id`: numeric identifier.
- `areaId`: selected area identifier.
- `indicatorCode`: code of the related indicator.
- `date`: selected report date.
- `shift`: selected shift.
- `content`: rich text note content.
- `hasApontamento`: derived boolean indicating non-empty note content.
- `includedInHandover`: manual handover inclusion marker.
- `author`: optional author summary.
- `attachments`: attached files.
- `createdAt`, `updatedAt`: timestamps.

Validation rules:
- The tuple `areaId`, `indicatorCode`, `date`, `shift` identifies one note record.
- Empty content without attachments and without handover inclusion should not count as an apontamento.
- A "Foco" indicator without `hasApontamento` must be treated as a strong pending item.
- Attachments remain coherent with the existing post/editor pattern.

## Entity: Merged Indicator

Represents an indicator joined with its persisted note state for UI rendering.

Fields:
- All fields from Indicador do Turno.
- `note`: related Indicator Note or null.
- `inHandover`: true when status is "Atenção" or "Foco", or when manually included.
- `focusWithoutNote`: true when status is "Foco" and no apontamento content exists.

Derived rules:
- "Atenção" and "Foco" enter the handover summary automatically.
- "Na meta" enters the handover summary only when manually marked.
- `focusWithoutNote` drives alert presentation in both the summary and dedicated view.

## Entity: Indicator Filter

Represents the active navigation criterion in the dedicated indicators view.

Allowed values:
- `todos`
- `na_meta`
- `atencao`
- `foco`
- `pendencia`
- `passagem`

Validation rules:
- `pendencia` includes only indicators with `focusWithoutNote`.
- `passagem` includes automatic and manually included handover indicators.
- Search by name must compose with the selected filter.

## State Transitions

### Apontamento

```text
No note
  -> add apontamento
With apontamento
  -> edit apontamento
With apontamento
  -> clear content and no attachments/no handover mark
  -> No note
```

### Handover Inclusion

```text
Na meta, not marked
  -> Incluir na passagem
Na meta, manually marked
  -> Na passagem
Atenção or Foco
  -> Na passagem automatico
```

### Focus Pending Alert

```text
Foco without apontamento
  -> focusWithoutNote = true
Foco with saved apontamento
  -> focusWithoutNote = false
Status changes away from Foco
  -> focusWithoutNote = false
```
