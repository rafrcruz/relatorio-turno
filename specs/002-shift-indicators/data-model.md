# Phase 1 — Data Model: Gestão dedicada de indicadores do turno

Distinção central: **definições e valores de indicadores são client-side (mock)**; **apontamentos e marcações são persistidos (backend)**. O status é derivado no client e unido às notas por `indicatorCode`.

## Persistido (backend / Prisma)

### IndicatorNote (NOVO)

Um registro por indicador por contexto (área/data/turno). Guarda o apontamento (texto rico) e a marcação de passagem.

| Campo | Tipo | Regras |
|-------|------|--------|
| `id` | Int PK | autoincremento |
| `areaId` | Int FK→Area | obrigatório |
| `indicatorCode` | String | obrigatório; identifica o indicador no mock |
| `date` | DateTime | obrigatório; normalizada por dia (como em Post) |
| `shift` | Int | 1, 2 ou 3 |
| `content` | String | HTML sanitizado (`sanitizeHtml`); pode ser vazio se só houver marcação |
| `includedInHandover` | Boolean | default `false`; marcação manual para passagem |
| `authorId` | Int FK→User | via `ensureUser(x-user-id || 1)` |
| `createdAt` | DateTime | default now |
| `updatedAt` | DateTime | `@updatedAt` |
| `attachments` | Attachment[] | relação reversa |

- **Unicidade**: no máximo um `IndicatorNote` por `(areaId, indicatorCode, date, shift)` → `@@unique([areaId, indicatorCode, date, shift])`. Operações de salvar fazem **upsert**.
  - **Canonicalização de `date` (importante para o upsert)**: `date` DEVE ser gravada e consultada via o `parseDateParam` existente, que produz `new Date(\`${dateStr}T00:00:00-03:00\`)` — meia-noite canônica em America/Sao_Paulo (instante fixo). Como escrita e leitura usam a mesma normalização, a busca da chave única casa de forma determinística e não gera notas duplicadas. Não usar `new Date()` cru nem timestamps com hora variável.
- **Derivado (não armazenado)**: `hasApontamento` = `content` não-vazio após strip de HTML/espaços.
- **Sem FK para Indicator** (decisão D2): integridade do código é responsabilidade do client/mock.

### Attachment (ESTENDIDO)

Adiciona vínculo opcional ao apontamento, mantendo os existentes.

| Campo | Mudança |
|-------|---------|
| `indicatorNote` | `IndicatorNote?` relation (NOVO) |
| `indicatorNoteId` | `Int?` (NOVO, nullable) |

Demais campos (`filename`, `mimeType`, `size`, `url`, `data Bytes?`) inalterados. Upload, limites e tipos idênticos ao composer (png/jpeg/pdf; 20MB/arquivo; 50MB total).

### AuditLog (reuso)

Novas ações: `CREATE_INDICATOR_NOTE`, `UPDATE_INDICATOR_NOTE`, `DELETE_INDICATOR_NOTE`, `TOGGLE_HANDOVER` (`targetType = 'IndicatorNote'`).

### Migração Prisma

`prisma migrate` adicionando `IndicatorNote`, a coluna `indicatorNoteId` em `Attachment` e o índice único. Não há seed de indicadores.

## Client-side (mock / Angular)

### IndicatorDefinition (REVISADO)

| Campo | Tipo | Notas |
|-------|------|-------|
| `id` | number | mantido |
| `code` | string | chave de junção com `IndicatorNote` |
| `name` | string | |
| `unit` | string | pode ser vazio (sem unidade aplicável) |
| `reference` | `ClassificationReference` | substitui `target`/`better`/`tolerance` simples |

### ClassificationReference (NOVO)

Descreve as condições de Na meta / Atenção / Foco. Tipo discriminado:

- `kind: 'ideal_band'` → `{ min, max, attentionMargin | attentionMin/attentionMax, ... }`: dentro de `[min,max]` = Na meta; em faixa de margem = Atenção; fora dos limites externos = Foco. Bilateral.
- `kind: 'higher_better'` → `{ target, attentionThreshold, focusThreshold }`: `≥ target` Na meta; `[focusThreshold, target)` Atenção; `< focusThreshold` Foco (com `attentionThreshold` separando, conforme regra).
- `kind: 'lower_better'` → `{ target, attentionThreshold, focusThreshold }`: `≤ target` Na meta; faixa intermediária Atenção; acima do limite Foco.

Cada referência produz uma descrição compacta e legível para exibição (faixas por status).

### IndicatorData (REVISADO)

Definição + estado calculado + estado unido do backend:

| Campo | Origem | Notas |
|-------|--------|-------|
| `...IndicatorDefinition` | mock | |
| `value` | mock (determinístico por `code,date,shift`) | pode ser `null` (valor indisponível) |
| `status` | derivado | `'na_meta' \| 'atencao' \| 'foco' \| 'unknown'` |
| `note` | backend (join) | `{ id, hasApontamento, includedInHandover, attachments[] }` ou `null` |
| `inHandover` | derivado | `status ∈ {atencao,foco}` **ou** `note.includedInHandover` |
| `focusWithoutNote` | derivado | `status === 'foco' && !note?.hasApontamento` |

## Regras de classificação e contagem (derivadas)

- **Status**: calculado por `ClassificationReference` sobre `value`. `value == null` → `unknown` (não conta como na_meta/atencao/foco).
- **Resumo de passagem (aba Passagem)**: indicadores com `inHandover === true`.
- **Contadores (aba Indicadores)**: `total`, `na_meta`, `atencao`, `foco`, `focoSemApontamento` (= count de `focusWithoutNote`).
- **Filtros**: Todos / Na meta / Atenção / Foco / Com pendência de apontamento (`focusWithoutNote`) / Incluídos na passagem (`inHandover`).
- **Busca**: por `name` (case-insensitive, substring).

## Ciclo de vida

- **Apontamento**: criar (upsert) → editar (upsert sobre o mesmo contexto) → revisar.
  - **Regra de persistência do registro (única)**: um `IndicatorNote` persiste enquanto tiver **pelo menos um** entre: conteúdo não-vazio, ao menos um anexo, ou `includedInHandover = true`. Se uma operação de salvar deixar os três vazios/falsos simultaneamente, o registro é **removido** (no-op se não existia). Salvar HTML vazio NUNCA satisfaz a obrigatoriedade de Foco (`hasApontamento` permanece falso).
  - **Remoção de anexo na edição**: o POST de upsert apenas **adiciona** anexos (espelha o create de posts, que não tem update). Para permitir remover um anexo individual ao editar, prever um endpoint de exclusão de anexo (`DELETE /api/attachments/:id` ou equivalente sob a nota). Marcado como lacuna a tratar em `/speckit-tasks` — não é cenário de aceite explícito da US2, mas é necessário para "editar" plenamente.
- **Marcação de passagem**: toggle por indicador/contexto (upsert do `includedInHandover`). Indicadores em Atenção/Foco já entram automaticamente; a marcação é complementar (tipicamente Na meta).
- **Histórico**: cada `(areaId, indicatorCode, date, shift)` é isolado; revisitar um contexto anterior lê suas próprias notas/marcações.
