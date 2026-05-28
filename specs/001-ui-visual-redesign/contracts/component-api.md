# Component API Contracts — Evolução Visual

**Feature**: `001-ui-visual-redesign`
**Date**: 2026-05-28

Este documento registra os contratos de interface dos componentes Angular afetados pelo redesign.
Mudanças de `@Input`/`@Output` são marcadas explicitamente. Mudanças puramente de template/CSS
não afetam os contratos públicos.

---

## Componentes com Contrato Inalterado

Os seguintes componentes têm mudanças apenas de template e CSS — nenhum `@Input` ou `@Output` muda:

| Componente | Localização | Mudanças |
|------------|-------------|----------|
| `HeaderComponent` | `layout/header/` | Template e CSS apenas |
| `FooterComponent` | `layout/footer/` | Template e CSS apenas |
| `ReportComponent` | `pages/report/` | Layout wrapper 3xl |
| `PostComposerComponent` | `pages/report/post-composer/` | Estilo do seletor, ações |
| `AreaIndicatorsComponent` | `pages/report/area-indicators/` | Card redesenhado |
| `AdminComponent` | `pages/admin/` | Placeholder visual |
| `NotFoundComponent` | `pages/not-found/` | Corrigir tokens de cor |

---

## `PostListComponent` — Contrato Inalterado

**Inputs existentes** (preservados sem modificação):
```typescript
@Input() type!: PostType;         // 'URGENCY' | 'PENDENCY' | 'ANNOTATION'
@Input() title!: string;           // Título da seção
@Input() highlightId?: number;     // ID do post a destacar (deep link)
```

**Mudanças de template**:
- Loading state: texto → skeleton de cards
- Empty state: texto → `.empty-state` com ícone Lucide
- Post card: borda esquerda colorida por tipo, badges `.badge-*`, ações com `.btn-ghost`/`.btn-danger`

---

## `ReplyThreadComponent` — Contrato Inalterado

**Inputs existentes** (preservados):
```typescript
@Input() post!: Post;
```

**Mudanças de template**:
- Input de resposta: estilizado com `.card` e ícone de enviar
- Botões de ação: `.btn-ghost` e `.btn-danger`
- Loading/empty state melhorados

---

## `NotificationsComponent` — Nenhum Input/Output (serviço via `NotificationService`)

**Interface do serviço** (preservada sem modificação):
```typescript
NotificationService.success(message: string): void
NotificationService.error(message: string): void
NotificationService.info(message: string): void
```

**Mudanças de template**:
- Adicionar ícone Lucide por tipo de notificação
- Adicionar `@angular/animations` `trigger('slideNotif', ...)` na lista
- Adicionar botão de fechar manual (opcional)

---

## Dependências de Biblioteca Adicionadas

### `lucide-angular`

**Package**: `lucide-angular`
**Versão alvo**: `^0.x.x` (latest compatível com Angular 16)
**Importação**: `LucideAngularModule` importado em `AppModule` com os ícones selecionados

```typescript
// AppModule
import { LucideAngularModule, Inbox, CheckCircle, XCircle, Info, Trash2, Link, MessageSquare } from 'lucide-angular';

@NgModule({
  imports: [
    LucideAngularModule.pick({ Inbox, CheckCircle, XCircle, Info, Trash2, Link, MessageSquare })
  ]
})
```

Uso nos templates:
```html
<lucide-icon name="inbox" [size]="40" class="text-mid-gray opacity-40"></lucide-icon>
```

**Justificativa**: Ver `research.md` Decisão 2.
**Impacto no bundle**: Tree-shakeable — apenas ícones importados via `.pick()` são incluídos.

---

## Contratos de Layout (Breakpoints)

| Breakpoint | Viewport | Comportamento |
|------------|----------|---------------|
| default (mobile) | < 640px | Stack vertical, container full-width com px-4 |
| sm | ≥ 640px | Logo full em header |
| md | ≥ 768px | Indicators: grid 2 colunas |
| lg | ≥ 1024px | Indicators: grid 3 colunas |
| xl | ≥ 1280px | — |
| 2xl | ≥ 1536px | — |
| **3xl (novo)** | **≥ 2560px** | **Layout sidebar: painel esquerdo 440px + painel direito fluido** |

---

## Contrato de Animação de Notificação

```typescript
// Trigger Angular Animations
trigger('slideNotif', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateX(100%)' }),
    animate('200ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
  ]),
  transition(':leave', [
    animate('150ms ease-in', style({ opacity: 0, transform: 'translateX(100%)' }))
  ])
])
```

Requisito: `BrowserAnimationsModule` importado em `AppModule`.
