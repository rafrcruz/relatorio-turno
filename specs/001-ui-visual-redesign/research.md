# Research: Evolução Visual e Responsiva

**Feature**: `001-ui-visual-redesign`
**Date**: 2026-05-28

---

## Decisão 1: Estratégia de Layout Ultrawide (3440×1440)

**Problema**: O container `max-w-[70rem]` (1120px) centra o conteúdo numa coluna estreita com
~1160px de espaço vazio em cada lateral num monitor 3440px.

**Alternativas avaliadas**:

| Opção | Descrição | Prós | Contras |
|-------|-----------|------|---------|
| A — Container mais largo | Aumentar para max-w-[90rem] e manter coluna única | Simples, zero mudança de componentes | Não usa o espaço horizontalmente — apenas mais margem |
| B — Layout de duas colunas (sidebar + main) | Acima de 2560px, Post Composer + Indicadores ficam num painel esquerdo fixo; listas de posts ocupam o painel direito | Uso real do espaço horizontal; dashboard-like; semanticamente coerente | Mudança de layout mais profunda; requer que o ReportComponent suporte dois modos |
| C — Post lists em multi-coluna | Manter composição vertical no topo, mas no ultrawide mostrar Urgências + Pendências lado a lado | Menos intrusivo que B | O conteúdo das listas pode ficar muito espremido; Post Composer continua estreito |

**Decisão**: **Combinação de A + B**.
- Em todos os tamanhos: container principal aumenta de `max-w-[70rem]` para `max-w-[90rem]` (1440px). Melhor para 1920×1080.
- A partir de breakpoint `3xl` (2560px+): layout de duas colunas — painel esquerdo sticky (~440px) com Composer e Indicadores, painel direito fluido com as três listas de posts.
- As três listas de posts no painel direito permanecem verticais (não multi-coluna) — melhor para leitura de conteúdo textual.

**Novo breakpoint Tailwind necessário**: `3xl: '2560px'` — adicionado à configuração do Tailwind.

---

## Decisão 2: Biblioteca de Ícones

**Problema**: A aplicação não tem sistema de ícones consistente. Usa um único SVG inline para o botão de PDF. À medida que o redesign adiciona ícones a notificações, empty states, ações de post e badges de tipo, o gerenciamento de SVGs inline se torna verboso e inconsistente.

**Critérios de avaliação** (Princípio VII da Constitution):

| Critério | `lucide-angular` | `@ng-icons` + heroicons | SVG inline (atual) |
|----------|-----------------|------------------------|-------------------|
| Manutenção ativa | ✅ ~200 commits/ano, releases mensais | ✅ Ativo, releases regulares | N/A |
| Popularidade | ✅ Lucide: 13k+ stars, lucide-angular: 400k+ downloads/semana | ✅ ng-icons: 1.5k stars | N/A |
| Documentação | ✅ Excelente | ✅ Boa | N/A |
| Compatibilidade Angular 16+ | ✅ Compatível | ✅ Compatível | ✅ Sempre |
| Bundle impact | ✅ Tree-shakeable (só importa ícones usados) | ✅ Tree-shakeable | ✅ Zero impacto |
| Consistência visual | ✅ Conjunto coeso, 1600+ ícones | ✅ Heroicons: design system consistente | ⚠️ Manual |
| TypeScript-first | ✅ | ✅ | N/A |
| Última release | ✅ 2025 | ✅ 2025 | N/A |

**Decisão**: **`lucide-angular`**.
- Razão: conjunto de ícones moderno e coeso, excelente tree-shaking, TypeScript-first, compatível com Angular 16+, amplamente adotado.
- Uso: ícones em notificações (check, x, info), empty states, ações de post (reply, link, trash), tipo de post no badge.
- Impacto no bundle: desprezível com tree-shaking (cada ícone importado individualmente < 1KB).

---

## Decisão 3: Animações de Notificação

**Problema**: Notificações aparecem e desaparecem abruptamente (sem transição).

**Alternativas avaliadas**:

| Opção | Descrição | Decisão |
|-------|-----------|---------|
| `@angular/animations` (nativo) | `trigger/state/transition` via `BrowserAnimationsModule` | ✅ Escolhido |
| CSS transitions via Tailwind | Classes `transition-all`, `opacity-0/100` com `*ngIf` | ⚠️ Não funciona com `*ngIf` sem hack |
| Biblioteca externa (ngx-toastr etc.) | Substitui o componente atual | ❌ Over-engineering para o caso de uso |

**Decisão**: **`@angular/animations`** com `BrowserAnimationsModule`.
- `@angular/animations` já está instalado como dependência transitiva; apenas precisa ser importado.
- Implementar `slideInDown + fadeOut` nas notificações.
- Respeitar `prefers-reduced-motion` via `@media (prefers-reduced-motion: reduce)` no CSS ou verificação em runtime.

---

## Decisão 4: Skeleton Screens (Loading States)

**Problema**: Estados de carregamento exibem apenas texto "Carregando…".

**Decisão**: **Templates de skeleton via Tailwind `animate-pulse`** sem biblioteca adicional.
- O padrão de skeleton com `bg-light-gray animate-pulse rounded` é amplamente reconhecido.
- Implementado diretamente nos templates HTML dos componentes — sem dependência nova.
- Cada componente (post-list, area-indicators) tem seu próprio skeleton correspondente à sua estrutura.

---

## Decisão 5: Refinamento da Paleta de Cores

**Problema**: A paleta atual interpreta os tons "Hydro" como charcoals muito escuros. Os botões primários (`hydro-blue: #444D55`) são muted e pesados. A paleta carece de tokens para superfícies alternativas e estados intermediários.

**Análise atual**:
- `hydro-blue: #444D55` — charcoal escuro, usado como cor de botão primário. Pesado.
- `hydro-light-blue: #768692` — cinza médio, pouco "blue".
- `aluminium: #8C8C8C` — texto secundário. OK.
- `bauxite: #B95946` — vermelho-laranja. Bom para urgência/erro.
- `green: #43807A` — verde teal muted. Bom para sucesso.
- `warm: #C5B9AC` — bege/tan. Bom para pendência.
- `light-gray: #F4F4F4` — background. OK.

**Decisão**: **Manter tokens existentes, adicionar tokens complementares estratégicos**.
- Adicionar `surface: '#FFFFFF'` (explícito, para componentes que precisam de fundo branco explícito)
- Adicionar `surface-alt: '#F9FAFB'` (cinza levemente mais quente para painéis internos, hover states)
- Adicionar `border: '#E5E7EB'` (borda mais clara e sutil que `aluminium` — melhora refinamento visual)
- Considerar adicionar `primary: '#1D4E89'` ou similar como acento mais vivo para elementos interativos — **somente se aprovado visualmente**. Manter `hydro-blue` como cor base da marca.
- Manter toda a paleta existente (não remover tokens — pode quebrar código existente).

---

## Decisão 6: Atualização do Quill (1.x → 2.x)

**Situação atual**: `quill ^1.3.7` (última release 2019), `ngx-quill ^22.0.0`.
**Quill 2.0**: Lançado abril 2024. `ngx-quill 27+` oferece suporte.

**Decisão**: **Fora do escopo desta feature**.
- A migração Quill 1→2 tem breaking changes na configuração de toolbar e na API de módulos.
- Fazer junto com o redesign visual aumenta o risco de regressão no editor.
- Registrado como task separada para próxima feature de manutenção técnica.
- No contexto desta feature: apenas estilizar o container do Quill para consistência visual.

---

## Decisão 7: Organização dos Estilos Globais

**Situação atual**: `styles.css` define `@layer base` e `@layer components` com `.btn`, `.btn-primary`, `.btn-secondary`, `.card`, `.card-header`, `.input`. Adequado, mas sem tokens semânticos de espaçamento, sem variantes de `.btn` além de primary/secondary, sem utilitários para estados de UI.

**Decisão**: **Expandir `styles.css` de forma incremental** — adicionar:
- `.btn-ghost` — botão sem background para ações secundárias
- `.btn-danger` — botão/ação destrutiva com visual de alerta
- `.card-body` — padding padronizado para conteúdo de card
- `.badge` + `.badge-urgency`, `.badge-pendency`, `.badge-annotation` — badges de tipo de post
- `.skeleton` — classe base para elementos skeleton
- `.empty-state` — padrão visual para estados vazios
- Não criar novos arquivos CSS — manter tudo em `styles.css` para simplicidade.
