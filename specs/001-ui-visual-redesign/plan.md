# Implementation Plan: Evolução Visual e Responsiva

**Branch**: `001-ui-visual-redesign` | **Date**: 2026-05-28 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `specs/001-ui-visual-redesign/spec.md`

## Summary

Redesign visual completo da aplicação Relatório de Turno, focado em modernização, consistência
de componentes e aproveitamento inteligente do espaço em monitores ultrawide (3440×1440).

Abordagem técnica:
- **Tokens Tailwind**: Novo breakpoint `3xl` (2560px), tokens de cor adicionais (`surface`, `surface-alt`, `border`), badges e utilitários de componente novos em `styles.css`.
- **Layout ultrawide**: Abaixo de 3xl — coluna única com `max-w-[90rem]`. Em 3xl+ — layout de duas colunas com painel esquerdo sticky (Composer + Indicadores) e painel direito fluido (listas de posts).
- **Biblioteca de ícones**: `lucide-angular` (tree-shakeable, Angular-native, ativa em 2025).
- **Animações de notificação**: `@angular/animations` (já presente como dependência transitiva).
- **Skeleton screens**: Templates Tailwind `animate-pulse` sem dependência nova.
- **Ações destrutivas**: `.btn-danger` visualmente diferenciado de `.btn-ghost`.

## Technical Context

**Language/Version**: TypeScript 4.9, Angular 16.2  
**Primary Dependencies**: Angular 16, Tailwind CSS 3, NGX-Quill 22 (Quill 1.x), DOMPurify 3  
**Storage**: N/A (mudanças puramente no frontend)  
**Testing**: Angular Karma/Jasmine (unit), checklist manual para validação visual de resolução  
**Target Platform**: Web browser moderno (Chrome, Edge, Firefox) — desktop-first  
**Project Type**: Web application frontend (Angular SPA)  
**Performance Goals**: Transições a 60fps, sem layout shift perceptível, sem regressão de carregamento  
**Constraints**: Manter todas as funcionalidades existentes, sem alteração de contratos de API  
**Scale/Scope**: ~10 componentes afetados, ~15 arquivos de template/CSS

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Princípio | Status |
|------|-----------|--------|
| Funcionalidades estão na spec, não neste plano? | I. Escopo da Constitution | ✅ |
| Testes de integração/e2e planejados para fluxos principais? | II. Testes Significativos | ✅ checklist manual + testes de fluxo |
| Critérios de aceite definidos antes da implementação? | III. Critério de Conclusão | ✅ spec.md SC-001~004 + VQ-001~004 |
| Layout validado em 1920×1080 e 3440×1440? | IV. Resoluções-Alvo | ✅ definido em quickstart.md |
| Revisão visual planejada? | V. Qualidade Visual | ✅ checklist manual em quickstart.md |
| Novas bibliotecas avaliadas por adoção/manutenção? | VII. Bibliotecas e Dependências | ✅ research.md Decisão 2 |
| Componentes/serviços existentes verificados antes de criar novos? | VIII. Consistência | ✅ análise de todos os componentes feita |
| Loading states / feedback visual planejados? | IX. Performance Percebida | ✅ skeleton screens + animações de notificação |

**Re-check após Phase 1**: Todos os gates ainda passam. Nenhuma violação identificada.

## Project Structure

### Documentation (this feature)

```text
specs/001-ui-visual-redesign/
├── plan.md              # Este arquivo
├── research.md          # Decisões técnicas: layout, ícones, animações, paleta
├── data-model.md        # Design system: tokens, padrões de componente, layout spec
├── quickstart.md        # Como rodar e validar o redesign (checklist manual)
├── contracts/
│   └── component-api.md # Contratos de componente e APIs de biblioteca
└── checklists/
    └── requirements.md  # Checklist de qualidade da spec
```

### Source Code (arquivos afetados)

```text
frontend/
├── tailwind.config.js           # Novo breakpoint 3xl, tokens de cor adicionais
├── src/
│   ├── styles.css               # Novos utilitários: .btn-ghost, .btn-danger, .badge-*, .skeleton, .empty-state
│   └── app/
│       ├── app.module.ts        # + BrowserAnimationsModule, + LucideAngularModule
│       ├── layout/
│       │   ├── header/
│       │   │   └── header.component.html     # max-w-[90rem], layout 3xl
│       │   ├── footer/
│       │   │   └── footer.component.html     # Ajustes menores
│       │   └── notifications/
│       │       ├── notifications.component.html  # Ícones + animação
│       │       ├── notifications.component.ts    # + trigger Angular animations
│       │       └── notifications.component.css   # (se necessário)
│       └── pages/
│           ├── report/
│           │   ├── report.component.html           # Layout 3xl sidebar
│           │   ├── post-composer/
│           │   │   ├── post-composer.component.html  # Seletor de tipo redesenhado
│           │   │   └── post-composer.component.css   # Ajustes
│           │   ├── area-indicators/
│           │   │   ├── area-indicators.component.html  # Card redesenhado
│           │   │   └── area-indicators.component.css   # Ajustes
│           │   ├── post-list/
│           │   │   ├── post-list.component.html  # Card redesenhado, skeleton, empty state, badges, btn-ghost/danger
│           │   │   └── post-list.component.css   # Ajustes
│           │   └── reply-thread/
│           │       ├── reply-thread.component.html  # Composer redesenhado, btns
│           │       └── reply-thread.component.css   # Ajustes
│           ├── admin/
│           │   ├── admin.component.html   # Placeholder visual digno
│           │   └── admin.component.css    # Estilos
│           └── not-found/
│               └── not-found.component.html  # Corrigir text-primary-600 → tokens corretos
```

**Structure Decision**: Web application — alterações exclusivamente em `frontend/`. Backend não é afetado.

## Complexity Tracking

> Sem violações à Constitution — não há entradas nesta tabela.
