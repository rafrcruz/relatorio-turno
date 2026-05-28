---
description: "Task list — Evolução Visual e Responsiva"
---

# Tasks: Evolução Visual e Responsiva

**Input**: Design documents from `specs/001-ui-visual-redesign/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/component-api.md ✅

**Tests**: Testes de integração e/ou e2e são OBRIGATÓRIOS para os fluxos principais de cada user story
(Princípio II — Testes Significativos). Testes unitários de lógica isolada são opcionais.
Os testes DEVEM validar jornadas reais, estados críticos e erros esperados — não servem apenas para cobertura.

Para este feature (visual redesign): validação dos fluxos principais via checklist manual estruturado
(quickstart.md). Fluxos validados: criação de post, exibição de lista, notificações de feedback.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependências incompletas)
- **[Story]**: User story correspondente (US1–US4)
- Todos os caminhos de arquivo são relativos à raiz do repositório

---

## Phase 1: Setup

**Purpose**: Instalação de dependências e configuração da base antes de qualquer mudança de componente.

- [x] T001 Instalar `lucide-angular` no frontend: `cd frontend && npm install lucide-angular`
- [x] T002 [P] Atualizar `frontend/tailwind.config.js` — adicionar breakpoint `'3xl': '2560px'` em `screens` e tokens de cor `surface: '#FFFFFF'`, `surface-alt: '#F9FAFB'`, `border: '#E5E7EB'` em `colors`
- [x] T003 [P] Atualizar `frontend/src/app/app.module.ts` — importar `BrowserAnimationsModule` de `@angular/platform-browser/animations` e `LucideAngularModule` de `lucide-angular` com os ícones: `Inbox, CheckCircle, XCircle, Info, Trash2, Link, MessageSquare, Wrench` via `LucideAngularModule.pick({...})`

**Checkpoint**: Dependências instaladas e configurações de base prontas — componentes podem ser alterados.

---

## Phase 2: Foundational — Design System

**Purpose**: Utilitários CSS reutilizáveis que todos os componentes precisam antes de seus templates serem atualizados.

⚠️ **CRÍTICO**: Nenhuma atualização de template pode usar `.btn-ghost`, `.btn-danger`, `.badge-*`, `.skeleton` ou `.empty-state` antes desta fase estar completa.

- [x] T004 Atualizar `frontend/src/styles.css` — adicionar os seguintes utilitários em `@layer components`:
  - `.btn-ghost`: `@apply bg-transparent text-hydro-blue hover:bg-surface-alt border border-transparent hover:border-border rounded-lg px-2 py-1 text-sm transition-colors;`
  - `.btn-danger`: `@apply bg-transparent text-bauxite hover:bg-bauxite hover:text-white border border-transparent hover:border-bauxite rounded-lg px-2 py-1 text-sm transition-colors;`
  - `.badge`: `@apply inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold;`
  - `.badge-urgency`: `@apply bg-bauxite text-white;`
  - `.badge-pendency`: `@apply bg-warm text-black;`
  - `.badge-annotation`: `@apply bg-hydro-blue text-white;`
  - `.skeleton`: `@apply bg-light-gray animate-pulse rounded;`
  - `.empty-state`: `@apply flex flex-col items-center justify-center gap-3 py-12 text-mid-gray;`
  - Atualizar `.card` para usar `border-border` no lugar de `border-light-gray`

**Checkpoint**: Design system pronto — user stories podem ser implementadas em qualquer ordem.

---

## Phase 3: User Story 1 — Orientação Visual e Consistência (Priority: P1) 🎯 MVP Parcial

**Goal**: Interface visualmente consistente e polida em qualquer resolução padrão (≤ 1920px).
Hierarquia clara, tokens corretos, sem classes de estilo indefinidas.

**Independent Test**: Abrir a aplicação em 1920×1080 e verificar que header, hierarquia de seções
e componentes usam tokens consistentes sem classes indefinidas.

### Implementação para User Story 1

- [x] T005 [US1] Atualizar `frontend/src/app/layout/header/header.component.html` — trocar `max-w-[70rem]` por `max-w-[90rem]`; adicionar `3xl:max-w-none 3xl:px-12` ao container interno para que em ultrawide o header se estenda full-width
- [x] T006 [P] [US1] Corrigir `frontend/src/app/pages/not-found/not-found.component.html` — substituir `text-primary-600` por `text-hydro-blue`, `hover:underline` permanecer, remover `focus:ring-primary-500` substituindo por `focus:ring-hydro-light-blue`; substituir `max-w-7xl` por `max-w-[90rem]`

**Checkpoint**: Header consistente com novo container. Página 404 sem tokens indefinidos.

---

## Phase 4: User Story 2 — Posts com Clareza Visual (Priority: P1) 🎯 MVP Principal

**Goal**: O fluxo central da aplicação tem visual polido: tipos distinguíveis por cor, skeleton loading,
empty states com ícone, ações hierarquizadas com destaque para ação destrutiva.

**Independent Test**: Criar um post de cada tipo, verificar que cada card tem borda colorida, badge correto,
skeleton aparece durante carregamento (DevTools → Network throttle), empty state com ícone, e "Excluir"
visualmente diferente de "Responder".

### Implementação para User Story 2

- [x] T007 [US2] Atualizar `frontend/src/app/pages/report/post-list/post-list.component.html` com todas as seguintes melhorias:
  - Post card: adicionar `border-l-4` com cor por tipo (URGENCY: `border-l-bauxite`, PENDENCY: `border-l-warm`, ANNOTATION: `border-l-hydro-blue`) no elemento `<article>`
  - Badge: substituir o `<span [ngClass]="tagClass()">{{ typeLabel() }}</span>` existente por `<span class="badge" [ngClass]="badgeClass()">{{ typeLabel() }}</span>` (onde `badgeClass()` retorna `.badge-urgency`, `.badge-pendency` ou `.badge-annotation`)
  - Loading state: substituir `<div *ngIf="loading" class="text-aluminium">Carregando...</div>` por skeleton de 3 cards com `<div class="skeleton h-24 w-full rounded-xl"></div>` dentro de um `*ngIf="loading"`
  - Empty state: substituir texto simples por `<div class="empty-state"><lucide-icon name="inbox" [size]="40"></lucide-icon><p class="text-sm font-medium">Sem {{ title.toLowerCase() }} para este turno.</p></div>`
  - Ações: substituir botões de ação por `.btn-ghost` para "Responder" e "Copiar link", `.btn-danger` para "Excluir"
- [x] T008 [P] [US2] Atualizar `frontend/src/app/pages/report/post-list/post-list.component.ts` — adicionar método `badgeClass()` que retorna `'badge-urgency'` / `'badge-pendency'` / `'badge-annotation'` baseado em `this.type`
- [x] T009 [US2] Atualizar `frontend/src/app/pages/report/post-composer/post-composer.component.html` — redesign do seletor de tipo: ativo com cores distintas por tipo em vez de sempre `hydro-blue`:
  - ANNOTATION ativo: `bg-hydro-blue text-white hover:bg-hydro-dark-blue`
  - URGENCY ativo: `bg-bauxite text-white hover:bg-red-700`
  - PENDENCY ativo: `bg-warm text-black hover:bg-warm/80`
  - Inativo: `hover:bg-light-gray`
  - Também atualizar ação "Publicar" para `.btn-primary` e "Anexar arquivos" para `.btn-ghost`
- [x] T010 [P] [US2] Atualizar `frontend/src/app/pages/report/area-indicators/area-indicators.component.html` — substituir `<section class="mt-4 p-4 bg-white border...">` por `.card .card-body`; adicionar skeleton com `animate-pulse` no loading state; aplicar `.card` nos cards de indicador individuais para ter `rounded-xl shadow-sm`

**Checkpoint**: Criar post de cada tipo → cards com identidade visual distinta. Seção vazia → empty state com ícone.

---

## Phase 5: User Story 3 — Layout Ultrawide (Priority: P2)

**Goal**: Em viewport ≥ 2560px, a página usa layout sidebar (painel esquerdo sticky com Composer + Indicadores,
painel direito fluido com listas de posts).

**Independent Test**: Simular viewport 2560×1440 no DevTools e verificar que os dois painéis são visíveis e distribuídos.

### Testes para User Story 3 *(integração/e2e obrigatório para fluxos principais)* ⚠️

- [ ] T011 [P] [US3] Validação manual: abrir DevTools → viewport 2560×1440 → confirmar que layout de 2 colunas está ativo conforme checklist quickstart.md §2.2

### Implementação para User Story 3

- [x] T012 [US3] Atualizar `frontend/src/app/pages/report/report.component.html` — implementar layout sidebar 3xl:
  - Container externo: `class="max-w-[90rem] mx-auto px-2 sm:px-4 lg:px-6 py-4 3xl:max-w-none 3xl:px-12"`
  - Wrapper interno: `class="3xl:flex 3xl:gap-8 3xl:items-start"`
  - Painel esquerdo (title + composer + indicators): `class="space-y-4 3xl:w-[440px] 3xl:flex-shrink-0 3xl:sticky 3xl:top-20 3xl:max-h-[calc(100vh-5rem)] 3xl:overflow-y-auto"`
  - Painel direito (post lists): `class="space-y-4 mt-4 3xl:mt-0 3xl:flex-1"`
  - Mover `app-post-composer` e `app-area-indicators` para o painel esquerdo, os três `app-post-list` para o painel direito

**Checkpoint**: Em 2560px+ o sidebar está ativo. Em < 2560px o layout é coluna única sem quebras.

---

## Phase 6: User Story 4 — Interações de Suporte Polidas (Priority: P2)

**Goal**: Notificações com ícone e animação suave, thread de respostas consistente, admin com visual digno.

**Independent Test**: Publicar post → notificação de sucesso com ícone animado. Acessar /admin → visual digno.

### Testes para User Story 4 *(integração/e2e obrigatório para fluxos principais)* ⚠️

- [ ] T013 [P] [US4] Validação manual: criar post e confirmar notificação de sucesso com ícone check-circle e animação slide-in; aguardar 4s e confirmar fade-out. Simular erro (desconectar backend) e confirmar notificação de erro com ícone x-circle.

### Implementação para User Story 4

- [x] T014 [US4] Atualizar `frontend/src/app/layout/notifications/notifications.component.ts` — importar `trigger, state, style, animate, transition` de `@angular/animations`; adicionar decorator `animations: [trigger('slideNotif', [transition(':enter', [style({opacity:0, transform:'translateX(100%)'}), animate('200ms ease-out', style({opacity:1, transform:'translateX(0)'}))]), transition(':leave', [animate('150ms ease-in', style({opacity:0, transform:'translateX(100%)'}))])])]` ao `@Component`
- [x] T015 [P] [US4] Atualizar `frontend/src/app/layout/notifications/notifications.component.html` — adicionar `[@slideNotif]` ao elemento raiz de cada notificação; adicionar ícone Lucide antes do texto: `<lucide-icon [name]="iconName(m.type)" [size]="16" class="flex-shrink-0"></lucide-icon>` e método `iconName(type)` retornando `'check-circle'` / `'x-circle'` / `'info'`; adicionar `flex items-center gap-2` ao container da notificação
- [x] T016 [P] [US4] Atualizar `frontend/src/app/pages/report/reply-thread/reply-thread.component.html` — substituir `<button (click)="send()" class="px-2 py-1 bg-hydro-blue...">Enviar</button>` e `<button (click)="toggleComposer()">Cancelar</button>` por `.btn-primary` e `.btn-ghost` respectivamente; substituir `<button class="text-sm text-bauxite hover:underline" (click)="deleteReply(r)">Excluir</button>` por `.btn-danger text-xs`
- [x] T017 [P] [US4] Atualizar `frontend/src/app/pages/admin/admin.component.html` — substituir conteúdo por placeholder visual digno usando `.card .card-body` com ícone `<lucide-icon name="wrench">`, título "Administração" e texto "Esta área estará disponível em breve." — usar tokens do projeto, sem `font-semibold` ou `max-w-7xl`

**Checkpoint**: Notificações com ícone e animação. Admin com placeholder digno. Thread de respostas com ações consistentes.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Validação final, consistência e build de produção.

- [ ] T018 [P] Executar checklist manual de validação em 1920×1080 — seguir `specs/001-ui-visual-redesign/quickstart.md §2.1` e confirmar todos os itens
- [ ] T019 [P] Executar checklist manual de validação em 3440×1440 — seguir `specs/001-ui-visual-redesign/quickstart.md §2.2` e confirmar todos os itens
- [ ] T020 [P] Executar checklist de acessibilidade — seguir `specs/001-ui-visual-redesign/quickstart.md §3` (navegação por teclado, aria labels, prefers-reduced-motion)
- [x] T021 Executar `npm run build` a partir da raiz do repositório e confirmar que o build de produção conclui sem erros ou warnings críticos após todas as mudanças desta feature

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependências — pode iniciar imediatamente
- **Foundational (Phase 2)**: Depende de T002 (tokens Tailwind) para referenciar `surface-alt` e `border` nos utilitários
- **User Stories (Phase 3+)**: Dependem de Phase 2 (design system pronto)
  - US1 e US2 são P1 e podem ser desenvolvidas em paralelo (arquivos diferentes) após Phase 2
  - US3 depende de US1 (layout do report.component.html referencia o header atualizado de T005)
  - US4 é independente de US1/US2/US3 (arquivos diferentes: notifications, reply-thread, admin)
- **Polish (Phase 7)**: Depende de todas as user stories estarem completas

### User Story Dependencies

- **US1 (P1)**: Pode iniciar após Phase 2 — arquivos: header, not-found
- **US2 (P1)**: Pode iniciar após Phase 2 — arquivos: post-list, post-composer, area-indicators
- **US3 (P2)**: Pode iniciar após US1 estar completa — arquivo: report.component.html
- **US4 (P2)**: Pode iniciar após Phase 2 — arquivos: notifications, reply-thread, admin

### Within Each User Story

- Templates podem ser atualizados após os utilitários CSS correspondentes estarem em styles.css
- `.ts` + `.html` do mesmo componente devem ser sequenciais (TypeScript define métodos usados no template)
- Validação manual (T011, T013, T018, T019, T020) ao final de cada story

### Parallel Opportunities

- T002 e T003 podem rodar em paralelo (arquivos diferentes)
- T005 e T006 podem rodar em paralelo (US1, arquivos diferentes)
- T007+T008+T009 podem rodar em paralelo dentro de US2 (T008 depende de T007 para badgeClass)
- T014+T015+T016+T017 podem rodar em paralelo dentro de US4 (arquivos diferentes)
- T018, T019, T020 podem rodar em paralelo (são checklists manuais independentes)

---

## Parallel Example: User Story 2

```bash
# T007 e T009 em paralelo (arquivos diferentes):
Task: "Atualizar post-list.component.html (borda, badge, skeleton, empty state, btns)"
Task: "Atualizar post-composer.component.html (seletor de tipo com cores distintas)"

# Depois de T007, em paralelo:
Task: "Atualizar post-list.component.ts (badgeClass method)"    # T008
Task: "Atualizar area-indicators.component.html (card pattern)" # T010
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 Only)

1. Complete Phase 1: Setup (T001–T003)
2. Complete Phase 2: Foundational (T004)
3. Complete Phase 3: US1 — header e not-found (T005–T006)
4. Complete Phase 4: US2 — posts com clareza (T007–T010)
5. **STOP e VALIDAR**: criar post de cada tipo, verificar visual em 1920×1080
6. Demonstrável: interface visivelmente mais polida para o fluxo principal

### Incremental Delivery

1. Setup + Foundational → design system pronto
2. US1 → header e consistência básica → testável independentemente
3. US2 → posts com clareza visual → testável independentemente → **Demo-ready**
4. US3 → ultrawide layout → testável independentemente
5. US4 → notificações + admin polidos → testável independentemente
6. Polish → validação completa e build

---

## Notes

- [P] = arquivos diferentes, sem dependências incompletas
- Caminhos são relativos à raiz do repositório
- Cada user story entrega valor independente e pode ser demonstrada sozinha
- A validação visual (checklist manual) é o critério de conclusão para esta feature — compila não é suficiente
- Respeitar `prefers-reduced-motion` nas animações de notificação (T014)
