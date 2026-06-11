# Implementation Plan: Refinamento visual e melhoria de usabilidade da experiência de indicadores

**Branch**: `003-indicator-ux-refinement` | **Date**: 2026-06-11 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/003-indicator-ux-refinement/spec.md`

## Summary

Refinar a experiência de indicadores do Relatório de Turno para tema claro, melhor contraste, espaçamento consistente, comportamento adequado em ultrawide e uma aba "Indicadores" mais tabular e densa para cerca de 20 indicadores. A implementação deve preservar seleção de contexto, registros, filtros, busca, apontamentos, marcação para passagem e exportação PDF existente, priorizando alterações nos componentes Angular já existentes de relatório/indicadores e mantendo os contratos backend atuais de apontamentos.

## Technical Context

**Language/Version**: TypeScript 5.1.6 no frontend; JavaScript/Node.js no backend  
**Primary Dependencies**: Angular 16.2, RxJS, Tailwind CSS, lucide-angular, ngx-quill/Quill, DOMPurify, Express 4, Prisma, PDFKit  
**Storage**: PostgreSQL via Prisma para apontamentos, anexos, posts, áreas e exportação; dados mockados determinísticos para indicadores operacionais no frontend  
**Testing**: Karma/Jasmine no frontend; Jest/Supertest no backend; validação visual manual/browser nas resoluções alvo  
**Target Platform**: Aplicação web operacional em navegador desktop/notebook  
**Project Type**: Web application com frontend Angular e backend Express  
**Performance Goals**: Revisão de 20+ indicadores sem travamento perceptível; filtros/busca e abertura do editor devem responder imediatamente em uso local de demonstração  
**Constraints**: Preservar API e persistência atuais de apontamentos; evitar novas dependências sem necessidade; validar 1920x1080 e 3440x1440; manter tema claro e coerência visual do produto  
**Scale/Scope**: Tela principal de Relatório de Turno, resumo de indicadores da aba "Passagem", visão dedicada da aba "Indicadores", editor de apontamento e dados mockados suficientes para demonstração

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Princípio | Status |
|------|-----------|--------|
| Funcionalidades estão na spec, não neste plano? | I. Escopo da Constitution | PASS - requisitos funcionais permanecem em `spec.md`; este plano define abordagem, artefatos e validação |
| Testes de integração/e2e planejados para os fluxos principais? | II. Testes Significativos | PASS - quickstart prevê validação funcional de filtros, busca, resumo, apontamentos e regressões automatizadas existentes |
| Critérios de aceite definidos antes da implementação? | III. Critério de Conclusão | PASS - `spec.md` e checklist de requisitos estão completos |
| Layout validado em 1920x1080 e 3440x1440? | IV. Resoluções-Alvo | PASS - quickstart inclui validação obrigatória nas duas resoluções e largura menor de notebook |
| Revisão visual planejada? | V. Qualidade Visual | PASS - quickstart inclui revisão visual de contraste, hierarquia, densidade, estados e prontidão para demonstração |
| Novas bibliotecas avaliadas por adoção/manutenção? | VII. Bibliotecas e Dependências | PASS - pesquisa decide não adicionar dependências para esta feature |
| Componentes/serviços existentes verificados antes de criar novos? | VIII. Consistência | PASS - plano usa `report`, `area-indicators`, `indicators-view`, `indicator-note-editor`, `IndicatorsService` e `IndicatorNotesService` existentes |
| Loading states / feedback visual planejados? | IX. Performance Percebida | PASS - manter skeletons, estados vazios, alertas e feedback de salvar/cancelar apontamento |

## Project Structure

### Documentation (this feature)

```text
specs/003-indicator-ux-refinement/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── indicator-experience-contract.md
└── tasks.md
```

### Source Code (repository root)

```text
frontend/
├── package.json
└── src/app/
    ├── core/
    │   ├── indicators.service.ts
    │   ├── indicator-notes.service.ts
    │   └── indicator-notes.service.spec.ts
    └── pages/report/
        ├── report.component.html
        ├── report.component.css
        ├── report.component.ts
        ├── area-indicators/
        │   ├── area-indicators.component.html
        │   ├── area-indicators.component.css
        │   └── area-indicators.component.ts
        └── indicators-view/
            ├── indicators-view.component.html
            ├── indicators-view.component.spec.ts
            ├── indicators-view.component.ts
            └── indicator-note-editor/
                ├── indicator-note-editor.component.html
                └── indicator-note-editor.component.ts

backend/
├── package.json
├── prisma/schema.prisma
├── src/routes/
│   ├── indicator-notes.js
│   └── reports.js
└── tests/
    ├── indicator-notes.test.js
    └── helpers.js
```

**Structure Decision**: Implementar a feature como refinamento de UI e estado nos componentes Angular existentes de relatório/indicadores, com possível ajuste nos dados mockados do `IndicatorsService`. O backend deve permanecer sem mudança funcional salvo se a implementação revelar regressão de contrato; os endpoints de apontamento e exportação existentes são preservados.

## Phase 0: Research

Research output: [research.md](./research.md)

Decisões principais:
- Manter os contratos backend atuais de `IndicatorNote`, anexos e marcação para passagem.
- Converter a visão dedicada de cards grandes para tabela/lista tabular responsiva.
- Preservar o resumo de passagem como subconjunto relevante, sem listar todos os indicadores.
- Usar componentes, serviços, estilos utilitários e ícones existentes, sem novas dependências.
- Validar visualmente em 1920x1080, 3440x1440 e largura menor de notebook.

## Phase 1: Design & Contracts

Design outputs:
- [data-model.md](./data-model.md)
- [contracts/indicator-experience-contract.md](./contracts/indicator-experience-contract.md)
- [quickstart.md](./quickstart.md)

### Post-Design Constitution Check

| Gate | Princípio | Status |
|------|-----------|--------|
| Funcionalidades estão na spec, não neste plano? | I. Escopo da Constitution | PASS |
| Testes de integração/e2e planejados para os fluxos principais? | II. Testes Significativos | PASS - quickstart cobre jornada funcional e visual; specs existentes cobrem filtros/merge |
| Critérios de aceite definidos antes da implementação? | III. Critério de Conclusão | PASS |
| Layout validado em 1920x1080 e 3440x1440? | IV. Resoluções-Alvo | PASS |
| Revisão visual planejada? | V. Qualidade Visual | PASS |
| Novas bibliotecas avaliadas por adoção/manutenção? | VII. Bibliotecas e Dependências | PASS - nenhuma nova biblioteca planejada |
| Componentes/serviços existentes verificados antes de criar novos? | VIII. Consistência | PASS |
| Loading states / feedback visual planejados? | IX. Performance Percebida | PASS |

## Complexity Tracking

No constitution violations identified. No additional complexity waiver required.
