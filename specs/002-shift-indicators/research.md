# Phase 0 — Research: Gestão dedicada de indicadores do turno

Todas as incógnitas do Technical Context foram resolvidas. Não há NEEDS CLARIFICATION pendente (as ambiguidades de produto foram resolvidas em `/speckit-clarify`).

## D1 — Profundidade de persistência: backend vs localStorage

- **Decisão**: Persistir Apontamentos e Marcações de passagem no **backend** (PostgreSQL via Prisma).
- **Rationale**:
  - O Apontamento exige **anexos** (Clarificação Q1). Anexos são binários e seguem o padrão Multer→`Attachment.data Bytes`; localStorage não comporta isso com fidelidade.
  - A ferramenta é de **passagem de turno**: quem registra (turno N) e quem lê (turno N+1) são usuários e estações diferentes. SC-004 exige que ao revisitar o contexto (inclusive turno anterior) os apontamentos apareçam — localStorage é por navegador e tornaria o handover invisível.
  - Consistente com o produto: posts já trafegam pelo backend (princípio VIII).
- **Alternativas consideradas**:
  - *localStorage por contexto*: mais leve, mas quebra handover cross-device e não persiste anexos. Rejeitada.
  - *Semear Indicator/IndicatorValue + regras no banco*: mais pesado, contraria a permissão de valores simulados e o "sem novos cálculos" (fora de escopo). Rejeitada.

## D2 — Como o apontamento referencia o indicador

- **Decisão**: Chavear `IndicatorNote` por `(indicatorCode, areaId, date, shift)`, **sem FK** para a tabela `Indicator`.
- **Rationale**: Indicadores permanecem mock client-side e a tabela `Indicator` não é semeada. O mock já expõe `code` estável por indicador. Chavear por `code + areaId` evita colisão entre áreas e dispensa popular o banco de definições. É o mesmo laxismo deliberado do `ensureUser` placeholder (sem auth real).
- **Alternativas consideradas**:
  - *FK para Indicator (id)*: exigiria semear definições e valores, ampliando escopo sem benefício nesta fase. Rejeitada.
  - *Chave só por `code`*: arriscado se um mesmo código existir em áreas distintas; mitigado incluindo `areaId`. Rejeitada a forma sem área.

## D3 — Anexos do apontamento

- **Decisão**: Reutilizar o model `Attachment` adicionando FK nullable `indicatorNoteId` (além de `postId`/`replyId` já nullable). Download via o endpoint de attachments existente.
- **Rationale**: Princípio VIII (consistência) — nenhum novo mecanismo de anexo; mesmo fluxo de upload (Multer em memória), limites (20MB/arquivo, 50MB total) e tipos (png/jpeg/pdf) do composer.
- **Alternativas**: Tabela de anexo dedicada — duplicação desnecessária. Rejeitada.

## D4 — O "join" status (client) × notas/marcações (backend)

- **Decisão**: Um endpoint de contexto `GET /api/indicator-notes?areaId&date&shift` retorna, por `indicatorCode`: existência/metadados do apontamento (incl. flag `hasContent`), anexos e flag `includedInHandover`. O front calcula o **status** a partir do mock e faz o **merge por código**; resumo, visão dedicada e contadores consomem o resultado merged.
- **Rationale**: Status depende de valor simulado + regra (client); apontamento/marcação são estado persistido (server). Centralizar o merge num único helper evita divergência entre as duas visões e mantém os contadores coerentes (FR-008, SC-002/SC-006).
- **Detalhe**: `hasApontamento` é verdadeiro apenas se o HTML, após remoção de tags/espaços, for **não-vazio** (edge case: apontamento vazio não satisfaz Foco).

## D5 — Modelo de referência de classificação e status

- **Decisão**: Substituir o status atual (`good`/`warning`/`critical`) por **`na_meta`/`atencao`/`foco`** e introduzir uma `ClassificationReference` por indicador com **tipo de regra**:
  - `ideal_band`: faixa ideal `[min, max]` com margens de Atenção e limites de Foco (bilateral).
  - `higher_better`: Na meta ≥ alvo; Atenção entre limiar e alvo; Foco abaixo do limiar.
  - `lower_better`: Na meta ≤ alvo; Atenção entre alvo e limiar; Foco acima do limiar.
  - Cada regra carrega limiares explícitos de Atenção e Foco (não uma "meta simples").
- **Rationale**: FR-011/FR-012 exigem referência rica e visualmente compreensível, com variantes uni/bilaterais. O modelo atual (`target + better + tolerance`) não expressa faixa ideal nem dois limites.
- **Alternativas**: Manter `target+tolerance` — insuficiente para faixa ideal/bilateral. Rejeitada.

## D6 — Dados de demonstração que cobrem todos os cenários

- **Decisão**: Reescrever o gerador do `IndicatorsService` para produzir, em pelo menos uma área, **todos** os cenários da spec: Na meta, Atenção, Foco (com e sem apontamento — "sem" sai naturalmente de não haver nota no backend), Na meta marcado para passagem, e ≥1 indicador de cada tipo de referência (ideal_band, higher_better, lower_better).
- **Rationale**: O gerador atual (±5% do alvo, tolerância 10%) **nunca** gera Foco. SC-007 exige cobertura simultânea. Valores determinísticos por `(code,date,shift)` são mantidos para reprodutibilidade.
- **Alternativas**: Aleatoriedade pura — não garante cobertura nem reprodutibilidade. Rejeitada.

## D7 — Navegação por abas com sincronização de URL

- **Decisão**: A página de Relatório hospeda abas "Passagem"/"Indicadores". A aba ativa é refletida na URL (`?tab=`), coerente com o `AppStateService` (que já persiste `area/date/shift` via `history.replaceState`). Trocar de aba não recarrega a seleção.
- **Rationale**: FR-001 (mesma tela/contexto) + Clarificação Q2 (abas com estado na URL). Reaproveita o padrão de sync existente.
- **Alternativas**: Rota separada (`/relatorio/indicadores`) ou drawer — descartadas na Clarificação Q2.

## D8 — Obrigatoriedade de Foco sem fluxo de fechamento

- **Decisão**: Não criar ação de conclusão/fechamento (Clarificação Q3). A obrigatoriedade vira **alerta forte e persistente** (badge/ícone de alerta + contador "Foco sem apontamento") na visão dedicada e no resumo. A regra de bloqueio fica especificada (FR-019) para acoplamento futuro.
- **Rationale**: Evita workflow fora de escopo; mantém a pendência evidente.

## Backend pattern reuse (referência)

Espelhar `routes/posts.js`: `sanitizeHtml(content)`, `parseNumberParam`/`parseDateParam`, `ensureUser(x-user-id || 1)`, `auditLog` por ação, anexos via Multer com mapeamento de URLs para `/api/attachments/:id`.
