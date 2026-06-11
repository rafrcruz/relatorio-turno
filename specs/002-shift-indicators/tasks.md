---
description: "Task list — Gestão dedicada de indicadores do turno"
---

# Tasks: Gestão dedicada de indicadores do turno

**Input**: Design documents from `/specs/002-shift-indicators/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/indicator-notes.openapi.yaml, quickstart.md

**Tests**: Testes de integração/e2e são OBRIGATÓRIOS para os fluxos principais (Princípio II — Testes Significativos). O backend **não possui runner hoje** — a Phase 1 adiciona jest+supertest. Frontend usa Karma/Jasmine (default Angular).

**Organization**: Tarefas agrupadas por user story (P1→P5) para implementação e teste independentes. MVP = US1.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependências pendentes)
- **[Story]**: US1..US5 conforme spec.md
- Caminhos de arquivo são explícitos

## Path Conventions

Web app: `backend/src/`, `backend/prisma/`, `backend/tests/`, `frontend/src/app/`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Habilitar a infraestrutura mínima (testes do backend) exigida pelo Princípio II.

- [x] T001 [P] Adicionar infra de teste do backend: devDeps `jest` + `supertest` e script `"test"` em `backend/package.json`, com `backend/jest.config.js` (ambiente node, testMatch em `backend/tests/`)
- [x] T002 [P] Criar utilitário de teste de DB/contexto (cliente Prisma de teste + helpers de limpeza por contexto) em `backend/tests/helpers.js`
- [x] T003 [P] Confirmar que `ng test` (Karma/Jasmine) executa um spec baseline no frontend (sanity check do runner)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Persistência, modelo de classificação, join status×notas e abas — pré-requisitos de TODAS as user stories.

**⚠️ CRITICAL**: Nenhuma user story começa antes desta fase.

- [x] T004 Adicionar model `IndicatorNote` (campos do data-model.md), FK nullable `indicatorNoteId` em `Attachment` e `@@unique([areaId, indicatorCode, date, shift])` em `backend/prisma/schema.prisma`; gerar migração Prisma (schema validado + client gerado; aplicar `prisma migrate` requer DB)
- [x] T005 [P] Reescrever o modelo de classificação em `frontend/src/app/core/indicators.service.ts`: tipo discriminado `ClassificationReference` (`ideal_band` | `higher_better` | `lower_better`), cálculo de status `na_meta`/`atencao`/`foco`/`unknown` e helper de descrição compacta da referência
- [x] T006 Reescrever o gerador de dados de demonstração em `frontend/src/app/core/indicators.service.ts` para produzir deterministicamente, em ≥1 área, todos os status (Na meta, Atenção, Foco) e ≥1 indicador de cada tipo de referência (depende de T005, mesmo arquivo)
- [x] T007 Criar `backend/src/routes/indicator-notes.js` com `GET /api/indicator-notes?areaId&date&shift` (lista notas do contexto, calcula `hasApontamento` = HTML não-vazio após strip, mapeia anexos para `/api/attachments/:id`) e registrar a rota em `backend/src/app.js` (usar `parseDateParam` para canonicalizar `date`)
- [x] T008 [P] Criar `IndicatorNotesService` (cliente HTTP do GET por contexto, tipos `IndicatorNote`) em `frontend/src/app/core/indicator-notes.service.ts`
- [x] T009 [P] Implementar helper de merge (join por `indicatorCode`) que combina `IndicatorData` (status do client) com notas do backend, derivando `inHandover` e `focusWithoutNote`, em `frontend/src/app/core/indicator-notes.service.ts`
- [x] T010 Adicionar abas "Passagem"/"Indicadores" com sincronização de URL (`?tab=`) em `frontend/src/app/pages/report/report.component.ts` e `report.component.html`, mantendo o conteúdo atual sob a aba "Passagem"

**Checkpoint**: Persistência, classificação, join e navegação por abas prontos.

---

## Phase 3: User Story 1 — Revisar todos os indicadores do turno (Priority: P1) 🎯 MVP

**Goal**: Visão dedicada lista TODOS os indicadores do contexto com status, referência, contadores, filtros e busca.

**Independent Test**: Selecionar área com muitos indicadores, abrir aba "Indicadores"; verificar nome/valor/unidade/status/referência por item, contadores corretos, filtros e busca funcionando (quickstart V1–V3).

### Testes para User Story 1 *(integração/e2e obrigatório)* ⚠️

> O teste que DEVE falhar antes da implementação da US1 é o de componente (T012), que cobre a jornada principal (lista completa + status + contadores). T011 é teste de **verificação** do endpoint Foundational (T007) que a US1 consome — não segue TDD fail-first por já existir na Phase 2.

- [x] T011 [P] [US1] Teste de verificação (integração backend) do endpoint Foundational consumido pela US1: `GET /api/indicator-notes` retorna notas do contexto (vazio e populado) e isola por área/data/turno, em `backend/tests/indicator-notes.test.js` — escrito; execução pendente de DB de teste
- [x] T012 [P] [US1] Teste de componente (jornada principal, fail-first): `IndicatorsViewComponent` renderiza todos os indicadores (nome/valor/unidade/status/referência) e contadores coerentes a partir do merge status×notas, em `frontend/src/app/pages/report/indicators-view/indicators-view.component.spec.ts`

### Implementation for User Story 1

- [x] T013 [US1] Criar `IndicatorsViewComponent` (lista completa, badges Na meta/Atenção/Foco, exibição da referência, valor+unidade) em `frontend/src/app/pages/report/indicators-view/indicators-view.component.ts` + `.html` + `.css`, consumindo o merge helper (T009) reativo ao `AppStateService`
- [x] T014 [US1] Adicionar barra de contadores (total, Na meta, Atenção, Foco, Foco sem apontamento) na `indicators-view`
- [x] T015 [US1] Adicionar filtros (Todos / Na meta / Atenção / Foco / com pendência de apontamento / incluídos na passagem) e busca por nome na `indicators-view`
- [x] T016 [US1] Adicionar skeleton de loading e estados vazios distintos (sem indicadores × busca sem resultado) na `indicators-view`
- [x] T017 [US1] Renderizar `IndicatorsViewComponent` na aba "Indicadores" e declará-lo em `frontend/src/app/app.module.ts`

**Checkpoint**: US1 funcional e testável de forma independente (MVP).

---

## Phase 4: User Story 2 — Registrar apontamento por indicador (Priority: P2)

**Goal**: Criar/editar/salvar/revisar apontamento (texto rico + anexos) por indicador; Foco sem apontamento destacado como pendência.

**Independent Test**: Criar apontamento com texto multilinha + anexo, salvar, revisitar contexto e confirmar persistência/edição; Foco sem apontamento destacado e destaque some ao salvar conteúdo não-vazio (quickstart V4–V5).

### Testes para User Story 2 *(integração/e2e obrigatório)* ⚠️

- [x] T018 [P] [US2] Teste de integração backend: `POST` upsert (content + anexo) cria nota com `hasApontamento: true`; reenvio edita; conteúdo vazio NÃO conta como apontamento; total de anexos > 50MB rejeitado — em `backend/tests/indicator-notes.test.js` — escrito; execução pendente de DB de teste
- [x] T019 [P] [US2] Teste de componente: editor salva texto rico + anexo e o destaque de Foco-sem-apontamento limpa após salvar, em `frontend/src/app/pages/report/indicators-view/indicator-note-editor/indicator-note-editor.component.spec.ts`

### Implementation for User Story 2

- [x] T020 [US2] Implementar `POST /api/indicator-notes` (upsert multipart por `(areaId,indicatorCode,date,shift)`: `sanitizeHtml`, `ensureUser`, `auditLog` CREATE/UPDATE_INDICATOR_NOTE, anexos via Multer com limites 20MB/arquivo e 50MB total; aplicar a **regra de persistência única** do data-model — remover o registro se ficar sem conteúdo, sem anexos e sem marcação) em `backend/src/routes/indicator-notes.js`
- [x] T021 [US2] Implementar remoção de anexo individual na edição (suporta FR-013): `DELETE /api/attachments/:id` restrito a anexos vinculados a `IndicatorNote`, com `auditLog`, em `backend/src/routes/attachments.js` (onde já vive o download de anexos)
- [x] T022 [P] [US2] Estender `IndicatorNotesService` com `upsert()` (FormData: content/includedInHandover/anexos) e `deleteAttachment()` em `frontend/src/app/core/indicator-notes.service.ts`
- [x] T023 [US2] Criar `IndicatorNoteEditorComponent` (Quill + anexos drag/drop/paste, `DOMPurify`, mesmos tipos/limites do composer) em `frontend/src/app/pages/report/indicators-view/indicator-note-editor/*` e declarar em `app.module.ts`
- [x] T024 [US2] Integrar o editor na `indicators-view` (abrir/editar/salvar/revisar apontamento por indicador, com toasts e estado de envio)
- [x] T025 [US2] Destaque forte de Foco-sem-apontamento (alerta/ícone) na `indicators-view` e recálculo de `focusWithoutNote`/contador após salvar; garantir que Atenção aceita apontamento opcional **sem** marcar pendência

**Checkpoint**: US1 + US2 funcionam de forma independente.

---

## Phase 5: User Story 3 — Resumo de passagem na visão principal (Priority: P3)

**Goal**: A área "Indicadores do Turno" da aba Passagem vira resumo: só Atenção/Foco/marcados, com acesso ao apontamento e caminho para a visão completa.

**Independent Test**: Em contexto com vários status, confirmar que o resumo mostra só Atenção/Foco/marcados (nunca Na meta não marcado), destaca Foco sem apontamento, dá acesso ao apontamento e oferece "Ver todos os indicadores" (quickstart V6).

### Testes para User Story 3 *(integração/e2e obrigatório)* ⚠️

- [x] T026 [P] [US3] Teste de componente: o resumo exibe apenas Atenção/Foco/marcados (0 Na meta não marcado), destaca Foco-sem-apontamento e a ação "Ver todos" troca para a aba Indicadores, em `frontend/src/app/pages/report/area-indicators/area-indicators.component.spec.ts`

### Implementation for User Story 3

- [x] T027 [US3] Reescrever `AreaIndicatorsComponent` como resumo de passagem: consumir merge helper e filtrar `inHandover`; renomear status para Na meta/Atenção/Foco (corrigir `statusLabel` "Crítico"→"Foco") e exibir referência compacta, em `frontend/src/app/pages/report/area-indicators/area-indicators.component.ts` + `.html`
- [x] T028 [US3] Indicar por item se há apontamento e permitir acesso rápido ao conteúdo (sem exibir texto completo por padrão) no resumo
- [x] T029 [US3] Destaque forte de Foco-sem-apontamento no resumo (coerente com a `indicators-view`)
- [x] T030 [US3] Adicionar ação "Ver todos os indicadores" no resumo que troca para a aba "Indicadores" no mesmo contexto (1 interação)

**Checkpoint**: US1 + US2 + US3 independentes e funcionais.

---

## Phase 6: User Story 4 — Marcar indicadores para passagem (Priority: P4)

**Goal**: Marcar/desmarcar manualmente indicadores (tipicamente Na meta) para entrar na passagem, persistindo por contexto.

**Independent Test**: Marcar um Na meta na visão dedicada → aparece no resumo; desmarcar → some; marcação persiste (quickstart V7).

### Testes para User Story 4 *(integração/e2e obrigatório)* ⚠️

- [x] T031 [P] [US4] Teste de integração backend: `PATCH /api/indicator-notes/{id}/handover` alterna `includedInHandover`; upsert com `includedInHandover` persiste, em `backend/tests/indicator-notes.test.js` — escrito; execução pendente de DB de teste
- [x] T032 [P] [US4] Teste de componente: marcar um Na meta adiciona-o ao resumo e desmarcar remove, em `frontend/src/app/pages/report/indicators-view/indicators-view.component.spec.ts`

### Implementation for User Story 4

- [x] T033 [US4] Implementar `PATCH /api/indicator-notes/{id}/handover` (+ caminho de upsert quando ainda não existe nota, criando registro só com marcação) e `DELETE /api/indicator-notes/{id}` com `auditLog`, honrando a regra de persistência única (desmarcar sem conteúdo/anexo remove o registro), em `backend/src/routes/indicator-notes.js`
- [x] T034 [P] [US4] Estender `IndicatorNotesService` com `toggleHandover()` em `frontend/src/app/core/indicator-notes.service.ts`
- [x] T035 [US4] Adicionar controle de marcação por indicador na `indicators-view` (marcar/desmarcar, persistência, atualização otimista + toast), deixando claro que Atenção/Foco já entram automaticamente
- [x] T036 [US4] Garantir que resumo e filtro "incluídos na passagem" refletem ao vivo as marcações manuais combinadas com as automáticas

**Checkpoint**: US1–US4 independentes e funcionais.

---

## Phase 7: User Story 5 — Histórico por contexto + obrigatoriedade de Foco (Priority: P5)

**Goal**: Notas/marcações isoladas por contexto (inclusive turnos anteriores); pendência de Foco como alerta forte e persistente (sem fluxo de fechamento — Clarificação Q3).

**Independent Test**: Registrar em um contexto, alternar data/turno e voltar; consultar turno anterior e ver suas próprias notas/pendências (quickstart V8); pendências de Foco evidentes.

### Testes para User Story 5 *(integração/e2e obrigatório)* ⚠️

- [x] T037 [P] [US5] Teste de integração backend: notas isoladas por `(areaId,indicatorCode,date,shift)`; revisitar turno anterior retorna apenas as notas daquele contexto, em `backend/tests/indicator-notes.test.js` — escrito; execução pendente de DB de teste

### Implementation for User Story 5

- [x] T038 [US5] Garantir recarga reativa de notas+status ao trocar área/data/turno e isolamento de histórico na `indicators-view` e `area-indicators` (verificar assinatura ao `AppStateService.context$`)
- [x] T039 [US5] Implementar alerta forte e persistente consolidando as pendências de Foco-sem-apontamento (banner/contador destacado) como sinal de obrigatoriedade, na `indicators-view` e no resumo
- [x] T040 [US5] Registrar a regra de bloqueio de FR-019 como ponto de extensão preparado para um fluxo de fechamento futuro (guard/comentário no ponto de consolidação), sem introduzir ação de fechamento

**Checkpoint**: Todas as user stories independentes e funcionais.

---

## Phase 8: Polish & Cross-Cutting Concerns

- [ ] T041 Executar os cenários de validação do `quickstart.md` (V1–V9)
- [ ] T042 [P] Validação visual em 1920×1080 e 3440×1440 com a visão dedicada em ~50 indicadores (Princípios IV e V; VQ-001/VQ-002)
- [x] T043 [P] Verificar loading states, toasts e estados vazios em todas as operações assíncronas (Princípio IX)
- [ ] T044 Regressão: confirmar que anotações/urgências/pendências e o sync de área/data/turno permanecem intactos (SC-009); verificar explicitamente que nenhum caminho cria Urgência a partir de status Foco (FR-027)
- [x] T045 [P] Adicionar anotações Swagger das rotas `indicator-notes` em `backend/src/routes/indicator-notes.js`
- [x] T046 [P] Remover resíduos de terminologia antiga (`good`/`warning`/`critical`, label "Meta:") no frontend

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sem dependências — pode começar já.
- **Foundational (Phase 2)**: depende do Setup — **bloqueia todas as user stories**.
- **User Stories (Phase 3+)**: dependem da Phase 2.
  - US1 é o MVP. US2 depende de US1 (editor vive na visão dedicada). US3 depende do merge (Phase 2) e usa dados de US2 para "tem apontamento". US4 depende de US1 (controle na visão dedicada) e US3 (reflexo no resumo). US5 depende de US2/US3/US4 (consolidação + histórico).
- **Polish (Phase 8)**: depende das user stories desejadas.

### User Story Dependencies

- **US1 (P1)**: após Phase 2. Sem dependência de outras stories. (MVP)
- **US2 (P2)**: após US1 (integra o editor na visão dedicada).
- **US3 (P3)**: após Phase 2; consome dados de apontamento de US2 para indicar pendência/existência.
- **US4 (P4)**: após US1 (controle de marcação) e US3 (reflexo no resumo).
- **US5 (P5)**: após US2/US3/US4 (alerta consolidado + histórico).

### Within Each User Story

- Testes (integração/e2e) primeiro e DEVEM falhar antes da implementação.
- Backend (model/rota) antes do serviço client; serviço antes do componente; componente antes da integração com abas/resumo.

### Parallel Opportunities

- Setup: T001–T003 em paralelo.
- Foundational: T005 (client) ∥ T007 (backend) ∥ T008/T009 (após T005/T007); T004 (schema) independente do front.
- Em cada story, os testes marcados [P] rodam juntos; serviços client [P] em paralelo com rotas backend.

---

## Parallel Example: Foundational (Phase 2)

```text
# Em paralelo (arquivos diferentes):
T004  schema.prisma + migração (backend)
T005  indicators.service.ts — modelo de classificação (frontend)
T007  indicator-notes.js GET + app.js (backend)
# Depois, dependentes:
T006  demo data (após T005)  →  T008/T009 service+merge (após T005/T007)  →  T010 abas
```

## Parallel Example: User Story 1

```text
# Testes juntos:
T011  integração backend GET por contexto
T012  componente indicators-view (render + contadores)
# Implementação: T013 → (T014, T015, T016) → T017
```

---

## Implementation Strategy

### MVP First (US1)

1. Phase 1 (Setup) → 2. Phase 2 (Foundational) → 3. Phase 3 (US1) → **validar US1 isolada** (quickstart V1–V3) → demo.

### Incremental Delivery

1. Setup + Foundational → base pronta.
2. US1 → visão dedicada (MVP) → demo.
3. US2 → apontamento + pendência de Foco → demo.
4. US3 → resumo de passagem → demo.
5. US4 → marcação manual → demo.
6. US5 → histórico + alerta consolidado → demo.

### Notes

- [P] = arquivos diferentes, sem dependências pendentes.
- Verificar testes falhando antes de implementar (Princípio II).
- Commit após cada task ou grupo lógico.
- Parar em cada checkpoint para validar a story isoladamente.
- Sem nova dependência além de jest/supertest (devDeps de teste) — princípio VII.
