# Implementation Plan: Gestão dedicada de indicadores do turno

**Branch**: `002-shift-indicators` | **Date**: 2026-06-11 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-shift-indicators/spec.md`

## Summary

Evoluir a página de Relatório de Turno para ter **duas abas** no mesmo contexto de área/data/turno: "Passagem" (fluxo atual de anotações/urgências/pendências + resumo de indicadores relevantes) e "Indicadores" (visão dedicada com todos os indicadores). Cada indicador é classificado em **Na meta / Atenção / Foco** por uma **referência de classificação** rica (faixa ideal, quanto maior melhor, quanto menor melhor) calculada no front a partir de valores simulados. O operador registra um **Apontamento** por indicador (texto rico + anexos, reutilizando o padrão de posts) e pode **marcar** indicadores para entrar na passagem. Apontamentos e marcações são **persistidos no backend** por contexto (handover é cross-user/cross-device), enquanto definições e valores dos indicadores permanecem simulados no client. Indicadores em Foco sem apontamento são destacados como pendência forte e persistente; os contadores e o resumo de passagem fazem o **join** entre status (client) e notas/marcações (backend).

## Technical Context

**Language/Version**: TypeScript 5 / Angular 16+ (frontend); Node.js + Express (backend)
**Primary Dependencies**: Angular, RxJS, Tailwind CSS, NGX-Quill + DOMPurify (texto rico), lucide-angular (ícones); Express, Prisma ORM, Multer, sanitize-html (backend) — **todas já presentes; nenhuma nova dependência**
**Storage**: PostgreSQL via Prisma — novo model `IndicatorNote` + extensão de `Attachment`; definições/valores de indicadores permanecem mock client-side (`IndicatorsService`)
**Testing**: Jasmine/Karma (frontend, default Angular). **Backend hoje não possui runner de teste** (`backend/package.json` sem script `test` nem devDeps de teste) — esta feature DEVE adicionar a infra de integração (jest + supertest, devDeps no backend) para cobrir as novas rotas; checklist visual manual nas resoluções-alvo
**Target Platform**: Aplicação web (desktop), navegadores modernos; deploy Vercel
**Project Type**: Web application (frontend Angular + backend Express/Prisma)
**Performance Goals**: Visão dedicada fluida com dezenas de indicadores (≈50); troca de aba sem recarregar contexto; feedback visual em todas as operações assíncronas (loading/skeleton, toasts)
**Constraints**: Layout validado em 1920×1080 e 3440×1440; sem autenticação real (padrão `x-user-id`/`ensureUser`); valores de indicadores simulados de forma determinística
**Scale/Scope**: 11 áreas, dezenas de indicadores por área; 1 apontamento (editável) por indicador/contexto; uso interno

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Princípio | Status |
|------|-----------|--------|
| Funcionalidades estão na spec, não neste plano? | I. Escopo da Constitution | ✅ Comportamentos e critérios estão em `spec.md`; o plano só descreve o "como" |
| Testes de integração/e2e planejados para os fluxos principais? | II. Testes Significativos | ⚠️→✅ Backend sem runner hoje; **a feature inclui setup de jest+supertest no backend** e então integração das rotas `indicator-notes` (criar/editar/marcar/listar por contexto) + fluxo de handover (registrar → revisitar contexto/turno anterior). Tooling em escopo, registrado em Technical Context |
| Critérios de aceite definidos antes da implementação? | III. Critério de Conclusão | ✅ Spec com FR/SC + cenários de aceite; quickstart com validação ponta a ponta |
| Layout validado em 1920×1080 e 3440×1440? | IV. Resoluções-Alvo | ✅ VQ-001/VQ-002 na spec; checklist visual no quickstart cobre a visão dedicada com dezenas de indicadores |
| Revisão visual planejada? | V. Qualidade Visual | ✅ Reutiliza design system (cards, badges de status, skeleton) e prevê revisão visual antes de concluir |
| Novas bibliotecas avaliadas por adoção/manutenção? | VII. Bibliotecas e Dependências | ✅ Zero novas dependências — reúso integral de Quill/DOMPurify/Multer/sanitize-html já no projeto |
| Componentes/serviços existentes verificados antes de criar novos? | VIII. Consistência | ✅ Reúso de `AppStateService`, `Attachment`, padrão de posts (sanitize/ensureUser/auditLog), editor Quill do composer e estilos de status existentes |
| Loading states / feedback visual planejados? | IX. Performance Percebida | ✅ Skeleton na lista, toasts em salvar/marcar, estados vazios distintos (sem indicadores × busca sem resultado) |

**Resultado**: PASS — nenhuma violação. Complexity Tracking não aplicável.

## Project Structure

### Documentation (this feature)

```text
specs/002-shift-indicators/
├── plan.md              # Este arquivo
├── research.md          # Phase 0 — decisões técnicas
├── data-model.md        # Phase 1 — entidades e modelo de dados
├── quickstart.md        # Phase 1 — guia de validação ponta a ponta
├── contracts/
│   └── indicator-notes.openapi.yaml   # Contrato dos endpoints de apontamento/marcação
└── checklists/
    └── requirements.md  # Checklist de qualidade da spec (já existente)
```

### Source Code (repository root)

```text
backend/
├── prisma/
│   └── schema.prisma                 # + model IndicatorNote; Attachment.indicatorNoteId nullable
└── src/
    ├── routes/
    │   └── indicator-notes.js        # NOVO: GET/POST/PUT/DELETE de apontamentos + marcação por contexto
    ├── app.js                        # registra a nova rota
    └── utils.js                      # reutiliza parseNumberParam/parseDateParam/ensureUser/sanitizeFilename
backend/
├── package.json                      # + devDeps jest, supertest; script "test"
└── tests/
    └── indicator-notes.test.js       # NOVO: integração das rotas (upsert, listar por contexto, handover, delete, anexos)

frontend/src/app/
├── core/
│   ├── indicators.service.ts         # reescreve modelo de referência + status (na_meta/atencao/foco) e demo data
│   └── indicator-notes.service.ts    # NOVO: client HTTP para apontamentos/marcações + join helper
└── pages/report/
    ├── report.component.*            # NOVO: abas "Passagem" / "Indicadores" com sync de URL (tab)
    ├── area-indicators/              # vira RESUMO de passagem (Atenção/Foco/marcados) + acesso a apontamento
    └── indicators-view/              # NOVO: visão dedicada (lista completa, filtros, busca, contadores, apontamento)
        └── indicator-note-editor/    # NOVO: editor de apontamento (Quill + anexos), reutilizando padrão do composer
```

**Structure Decision**: Web application existente (Option 2). Estende `backend/src/routes` e `frontend/src/app/pages/report` sem novos projetos. A visão dedicada é um novo componente irmão do resumo, ambos sob a página de Relatório controlada por estado de aba.

## Architecture Decisions (resumo — detalhes em research.md)

1. **Persistência no backend** (não localStorage): handover é cross-user/cross-device e anexos são binários (Multer→Bytes). Novo model `IndicatorNote` espelha o padrão de `Post` (sanitizeHtml, `x-user-id`/`ensureUser`, `auditLog`).
2. **Chave por código, sem FK ao Indicator**: `IndicatorNote` é chaveada por `(indicatorCode, areaId, date, shift)`. Indicadores permanecem mock; a tabela `Indicator` não é semeada. Laxismo de integridade deliberado, no mesmo espírito do `ensureUser` placeholder.
3. **Anexos reutilizam `Attachment`**: adiciona FK nullable `indicatorNoteId` (já existem `postId`/`replyId` nullable). Sem novo mecanismo de anexo.
4. **Status é calculado no client**; apontamento/marcação vêm do backend. Um **endpoint de contexto** (`GET /api/indicator-notes?areaId&date&shift`) alimenta tanto o resumo quanto a visão dedicada, que fazem o **join por código** com os status calculados.
5. **"Tem apontamento" = HTML não-vazio** após strip de tags (apontamento vazio não satisfaz a obrigatoriedade de Foco — edge case da spec).
6. **Abas com sync de URL**: parâmetro `tab` (passagem|indicadores) gerido coerente com `AppStateService`; troca de aba não recarrega a seleção.

## Complexity Tracking

> Não aplicável — Constitution Check passou sem violações.
