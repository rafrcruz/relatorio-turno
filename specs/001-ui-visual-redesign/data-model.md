# Design System — Tokens e Padrões de Componente

**Feature**: `001-ui-visual-redesign`
**Date**: 2026-05-28

Este documento define o "data model" desta feature: os tokens de design, padrões de componente
e contratos visuais que guiam a implementação.

---

## 1. Tailwind Config — Extensões

### 1.1 Novo Breakpoint

```js
screens: {
  '3xl': '2560px',   // Monitor ultrawide (≥ 2560px)
}
```

### 1.2 Tokens de Cor Adicionais

Manter todos os tokens existentes. Adicionar:

| Token | Valor | Uso |
|-------|-------|-----|
| `surface` | `#FFFFFF` | Fundo explícito de componentes em branco |
| `surface-alt` | `#F9FAFB` | Fundo alternativo (panels aninhados, hover, zebra) |
| `border` | `#E5E7EB` | Bordas sutis (mais leve que `aluminium` #8C8C8C) |

Nota: Os tokens existentes (`hydro-blue`, `bauxite`, `green`, `warm`, etc.) são preservados.

### 1.3 Breakpoints de Container

| Breakpoint | Viewport | max-width do container |
|------------|----------|----------------------|
| default | qualquer | 90rem (1440px) |
| 3xl | ≥ 2560px | layout de duas colunas (painel 440px + painel fluido) |

---

## 2. Design Tokens de Tipo de Post

Cada tipo de post tem uma identidade cromática consistente em todos os contextos.

| Tipo | Cor primária | Cor de texto | Uso |
|------|-------------|-------------|-----|
| `URGENCY` | `bauxite` (#B95946) | `white` | Badge, seletor ativo, borda esquerda do card |
| `PENDENCY` | `warm` (#C5B9AC) | `black` | Badge, seletor ativo, borda esquerda do card |
| `ANNOTATION` | `hydro-blue` (#444D55) | `white` | Badge, seletor ativo, borda esquerda do card |

**Identificação visual adicional**: Cards de post terão uma borda esquerda colorida (`border-l-4`) 
correspondente ao tipo — além do badge — para identificação imediata sem leitura do texto.

---

## 3. Padrões de Componente

### 3.1 Card

```
.card = bg-white rounded-xl border border-border shadow-sm overflow-hidden
.card-body = p-4 (padding interno padrão)
.card-header = bg-gradient border-b border-border px-4 py-3
```

Obs: Migrar `border-light-gray` → `border-border` nos cards para uniformidade.

### 3.2 Botões

```
.btn = base (existente: inline-flex, gap, px-3 py-1.5, rounded-lg, shadow-sm, transitions)
.btn-primary = bg-hydro-blue text-white hover:bg-hydro-dark-blue (existente)
.btn-secondary = bg-green text-white hover:bg-hydro-light-blue (existente)
.btn-ghost = bg-transparent text-hydro-blue hover:bg-surface-alt border border-transparent hover:border-border
.btn-danger = bg-transparent text-bauxite hover:bg-bauxite hover:text-white border border-transparent hover:border-bauxite
```

Ações de post:
- Responder → `.btn-ghost` (pequeno)
- Copiar link → `.btn-ghost` (pequeno)
- Excluir → `.btn-danger` (pequeno) — diferenciado visualmente

### 3.3 Badges de Tipo de Post

```
.badge = inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold
.badge-urgency = bg-bauxite text-white
.badge-pendency = bg-warm text-black
.badge-annotation = bg-hydro-blue text-white
```

### 3.4 Skeleton (Loading State)

```
.skeleton = bg-light-gray animate-pulse rounded
```

Variantes (aplicadas ao elemento filho):
- `skeleton-text` = h-4 w-full rounded (linha de texto)
- `skeleton-title` = h-6 w-1/2 rounded (título)
- `skeleton-card` = h-32 w-full rounded-xl (card completo)

### 3.5 Empty State

```
.empty-state = flex flex-col items-center justify-center gap-3 py-12 text-mid-gray
```

Estrutura padrão:
```html
<div class="empty-state">
  <lucide-icon name="inbox" [size]="40" class="opacity-40" />
  <p class="text-sm font-medium">Sem [tipo] para este turno.</p>
  <p class="text-xs opacity-70">[Dica ou call-to-action opcional]</p>
</div>
```

### 3.6 Notificações

Estado atual: div colorido sem ícone, sem animação.

Novo modelo:
```
Estrutura: icon + texto + (opcional) botão de fechar
Animação: slideInDown (entrada) + fadeOut (saída) via @angular/animations
Cores: mantém bg-green/bg-bauxite/bg-hydro-blue
Ícone por tipo:
  success → lucide: check-circle
  error   → lucide: x-circle
  info    → lucide: info
Auto-dismiss: 4000ms
```

---

## 4. Layout da Página de Relatório

### 4.1 Layout Padrão (< 2560px)

```
┌─────────────────────────────────────────┐  max-w-[90rem] mx-auto
│ Título + contexto                       │
│ Post Composer                           │
│ Area Indicators                         │
│ Urgências                               │
│ Pendências                              │
│ Anotações                               │
└─────────────────────────────────────────┘
```

### 4.2 Layout Ultrawide (≥ 2560px — breakpoint 3xl)

```
┌──────────────────────────────────────────────────────────────┐
│ HEADER (max-w-[90rem] → sem max-width fixo em 3xl)           │
└──────────────────────────────────────────────────────────────┘

┌─── Painel Esquerdo ───┬─── Painel Direito (fluido) ──────────┐
│ sticky top-[header]   │                                       │
│ w-[440px] flex-shrink │                                       │
│                       │ Urgências (N)                         │
│ Título + contexto     │ [posts...]                            │
│                       │                                       │
│ Post Composer         │ Pendências (N)                        │
│                       │ [posts...]                            │
│ Area Indicators       │                                       │
│                       │ Anotações (N)                         │
│                       │ [posts...]                            │
└───────────────────────┴───────────────────────────────────────┘
```

Implementação em Angular (report.component.html):
```html
<div class="max-w-[90rem] mx-auto px-4 py-4 3xl:max-w-none 3xl:px-8">
  <div class="3xl:flex 3xl:gap-8 3xl:items-start">
    <!-- Painel esquerdo (sticky em 3xl) -->
    <div class="3xl:w-[440px] 3xl:flex-shrink-0 3xl:sticky 3xl:top-[header-height] space-y-4">
      <!-- título, composer, indicators -->
    </div>
    <!-- Painel direito -->
    <div class="mt-4 3xl:mt-0 3xl:flex-1 space-y-4">
      <!-- post lists -->
    </div>
  </div>
</div>
```

### 4.3 Header

O header atualmente tem `max-w-[70rem]` interno. Deve:
- Aumentar para `max-w-[90rem]`
- Em `3xl`: remover limite de max-width (usar `3xl:max-w-none`) para que o header se estenda full-width com padding adequado

---

## 5. Estrutura de Card de Post (Redesenhada)

```
┌──────────────────────────────────────────────────────────┐
│ ← Borda esquerda colorida (4px, cor do tipo)             │
│                                                           │
│ [badge tipo] [autor — data e hora]                        │
│ ──────────────────────────────────────────────────────── │
│ Conteúdo do post (prose)                                  │
│                                                           │
│ [Imagens/anexos se houver]                                │
│ ──────────────────────────────────────────────────────── │
│ [Responder] [Copiar link]           [N respostas] [Excluir] │
└──────────────────────────────────────────────────────────┘
  [Thread de respostas — expansível]
```

Nota: "Excluir" movido para a direita, com `.btn-danger` visual.

---

## 6. Página Admin (Placeholder Digno)

Em vez de apenas "Admin — placeholder", deve exibir:
```
┌──────────────────────────────────────────────┐
│ Admin                                         │
│ Configurações e administração do sistema      │
│                                               │
│ ┌──────────────────────────────────────────┐ │
│ │ 🔧 Em desenvolvimento                    │ │
│ │ Esta área estará disponível em breve.    │ │
│ └──────────────────────────────────────────┘ │
└──────────────────────────────────────────────┘
```

Usando tokens corretos do projeto (não `text-primary-600`).
