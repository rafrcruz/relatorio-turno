# Feature Specification: Evolução Visual e Responsiva

**Feature Branch**: `001-ui-visual-redesign`
**Created**: 2026-05-28
**Status**: Draft
**Input**: User description: "Melhorar a experiência visual e responsiva da aplicação Relatório de Turno"

## User Scenarios & Testing

### User Story 1 — Orientação Visual Imediata (Priority: P1)

Um operador abre o sistema em seu monitor de trabalho (1920×1080 ou 3440×1440) e se orienta imediatamente:
sabe qual área/data/turno está sendo visualizado, quais seções existem e qual é a hierarquia de informação.
A interface transmite profissionalismo e ordem desde o primeiro acesso.

**Why this priority**: É o primeiro contato com a aplicação. Uma primeira impressão ruim compromete
demonstrações a clientes e reduz adoção pelos operadores.

**Independent Test**: Pode ser testado abrindo a página principal em ambas as resoluções e avaliando
se o header, a hierarquia de seções e o contexto ativo são claros, polidos e consistentes.

**Acceptance Scenarios**:

1. **Given** viewport 1920×1080, **When** o operador acessa a aplicação, **Then** a interface ocupa
   confortavelmente a área visível, sem excesso de scroll horizontal, com hierarquia visual clara.
2. **Given** viewport 3440×1440, **When** o operador acessa, **Then** a interface distribui conteúdo
   horizontalmente — sem áreas brancas mortas nas laterais e sem aparência de coluna estreita centralizada.
3. **Given** qualquer resolução, **When** o operador vê a tela, **Then** todos os componentes visuais
   recorrentes (cards, botões, inputs, seletores, estados) seguem padrões consistentes de espaçamento,
   bordas, sombras e tipografia.
4. **Given** qualquer componente, **When** renderizado, **Then** nenhuma classe de estilo indefinida
   é aplicada (ausência de classes como `text-primary-600` sem definição no tema).

---

### User Story 2 — Criar e Visualizar Posts com Clareza (Priority: P1)

O operador cria uma ocorrência (Urgência, Pendência, Anotação) e a publica. O post aparece na lista
com visual polido: tipo claramente identificado pela cor, autor e data legíveis, conteúdo bem formatado,
ações acessíveis e diferenciadas. O feedback de publicação e os estados intermediários (carregando, vazio,
erro) são visualmente adequados.

**Why this priority**: É o fluxo central da aplicação — qualquer problema visual aqui impacta
diretamente o uso diário e a demonstração a clientes.

**Independent Test**: Pode ser testado criando um post de cada tipo, verificando feedback de envio,
e inspecionando o card resultante na lista — tipo por cor, metadados, ações e hierarquia visual.

**Acceptance Scenarios**:

1. **Given** o composer visível com tipo selecionado, **When** o operador muda o tipo,
   **Then** o tipo ativo tem indicação visual clara, distinta e consistente entre os três tipos
   (não apenas a mesma cor com label diferente).
2. **Given** post publicado na lista, **When** exibido como card, **Then** o badge de tipo tem cor
   correta, o conteúdo é legível, e as ações (Responder, Copiar link, Excluir) têm hierarquia visual —
   com "Excluir" claramente diferenciado visualmente das ações não-destrutivas.
3. **Given** lista carregando posts, **When** a requisição está em andamento, **Then** há feedback visual
   adequado (skeleton screen, spinner ou indicador de progresso) — não apenas texto "Carregando…".
4. **Given** lista sem posts no turno, **When** o operador vê a seção, **Then** o estado vazio tem
   apresentação visual digna com mensagem amigável — não apenas texto cinza simples.
5. **Given** erro ao carregar posts, **When** a requisição falha, **Then** o estado de erro tem visual
   claro com ação de "Tentar novamente" bem apresentada.

---

### User Story 3 — Aproveitamento do Espaço em Ultrawide (Priority: P2)

Um gerente ou supervisor usando monitor 3440×1440 acompanha relatórios sem que o sistema pareça
desproporcional. O layout reorganiza as seções para ocupar o espaço horizontal de forma inteligente:
sidebar de composição e indicadores ao lado das listas de posts, ou arranjo similar que elimine
as grandes áreas vazias nas laterais.

**Why this priority**: Objetivo explícito da feature. Afeta diretamente a percepção de qualidade
em demonstrações e o conforto de uso em estações de trabalho com monitores amplos.

**Independent Test**: Pode ser testado abrindo a aplicação em viewport simulado de 3440×1440 e
verificando que o layout distribui conteúdo horizontalmente, sem que qualquer área ocupe menos
de 50% da largura total com conteúdo vazio ao lado.

**Acceptance Scenarios**:

1. **Given** viewport ≥ 2560px, **When** o operador visualiza a página de relatório, **Then** o layout
   usa composição multi-coluna ou sidebar que distribui conteúdo horizontalmente de forma equilibrada.
2. **Given** viewport ≥ 2560px, **When** as seções são exibidas, **Then** as áreas de conteúdo não
   são simplesmente esticadas — o arranjo é reorganizado de forma que faça sentido semântico e visual.
3. **Given** viewport sendo redimensionado de 1920 para 3440, **When** a janela aumenta,
   **Then** o layout transiciona de forma fluida sem quebras visuais ou sobreposições.

---

### User Story 4 — Interações de Suporte Polidas (Priority: P2)

Notificações, thread de respostas, modal de imagem, página de admin e página de not-found têm visual
consistente com o restante da aplicação. Notificações aparecem com animação suave, têm ícone adequado
e desaparecem após tempo definido. A página de admin não parece abandonada.

**Why this priority**: Completude visual — sem isso, partes da interface parecem inacabadas mesmo
com o restante bem polido, prejudicando demonstrações.

**Independent Test**: Pode ser testado publicando um post (notificação de sucesso), simulando erro
de rede (notificação de erro), acessando a página /admin e a página 404.

**Acceptance Scenarios**:

1. **Given** ação bem-sucedida, **When** a notificação aparece, **Then** ela tem ícone, texto legível,
   transição de entrada visível, e desaparece com transição de saída após tempo adequado.
2. **Given** acesso à página /admin, **When** o operador vê a tela, **Then** a página tem apresentação
   digna — estrutura visual coerente com o restante da aplicação, não apenas um título flutuante.
3. **Given** acesso à página não encontrada, **When** o operador vê a tela, **Then** a página usa
   os tokens de cor e tipografia corretos do projeto (sem classes de estilo indefinidas).
4. **Given** resposta em um post, **When** o thread de respostas é exibido, **Then** a apresentação
   visual do thread é consistente e polida — não apenas texto com indent simples.

---

### Edge Cases

- O que acontece quando uma área tem muitos indicadores (10+) em viewport ultrawide?
- Como o layout multi-coluna se comporta se apenas uma seção de post tiver muitos itens?
- O modal de imagem abre e fecha corretamente em todas as resoluções?
- As animações de notificação respeitam a preferência do usuário por `prefers-reduced-motion`?

## Requirements

### Functional Requirements

- **RF-001**: O sistema DEVE apresentar, em viewports ≥ 2560px, um layout que distribua o conteúdo
  horizontalmente de forma equilibrada (sidebar, multi-coluna ou composição similar), sem confinar
  tudo numa coluna estreita centralizada com áreas mortas ao redor.
- **RF-002**: Todos os componentes visuais recorrentes (cards de post, badges de tipo, botões, inputs,
  seletores de opção, estados de loading/empty/error) DEVEM seguir os mesmos tokens de design:
  espaçamento, bordas, sombras, raio de borda e tipografia consistentes entre si.
- **RF-003**: Os três tipos de post (Urgência, Pendência, Anotação) DEVEM ser visualmente distinguíveis
  por identidades cromáticas distintas e consistentes em todos os contextos onde aparecem
  (seletor de tipo, badge no card, seção da lista).
- **RF-004**: Estados de carregamento DEVEM apresentar feedback visual adequado que vá além de texto
  simples — skeleton screen, spinner ou indicador de progresso visível.
- **RF-005**: Estados vazios DEVEM ter apresentação completa com mensagem amigável e, quando aplicável,
  orientação para o primeiro post.
- **RF-006**: Notificações de sistema DEVEM ter ícone adequado ao tipo (sucesso, erro, info), transição
  de entrada e saída visíveis, e desaparecer automaticamente após tempo definido.
- **RF-007**: Ações destrutivas (excluir post, excluir resposta) DEVEM ser visualmente diferenciadas
  das ações comuns — não apenas pela cor do texto.
- **RF-008**: Nenhuma classe de estilo indefinida no tema do projeto DEVE ser aplicada em qualquer
  componente (ex.: `text-primary-600` sem definição correspondente).
- **RF-009**: Qualquer substituição ou adição de biblioteca de UI DEVE ser justificada com análise
  de manutenção ativa, popularidade, documentação, compatibilidade com a stack, impacto no bundle
  e risco de abandono — conforme Princípio VII da Constitution.
- **RF-010**: O redesign NÃO DEVE alterar regras de negócio, contratos de API ou funcionalidades
  existentes — apenas a apresentação visual e o comportamento responsivo.

### Key Entities

- **Layout global**: Estrutura de container responsivo (header, main, footer) e estratégia de largura.
- **Tokens de design**: Paleta de cores, tipografia, espaçamentos, sombras, raios — definidos no tema Tailwind.
- **Componentes utilitários**: `.btn`, `.card`, `.input` e variantes — usados em toda a aplicação.
- **Card de post**: Unidade visual central — badge de tipo, metadados, conteúdo, ações, thread.
- **Estados de UI**: Loading, empty, error — presentes em múltiplos componentes.
- **Notificação**: Toast/snackbar de feedback para ações do sistema.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Em viewport 3440×1440, o conteúdo principal ocupa ao menos 65% da largura visível
  através de uma composição multi-coluna ou sidebar equilibrada.
- **SC-002**: Zero classes de estilo indefinidas aplicadas em qualquer componente visível.
- **SC-003**: Todos os componentes recorrentes são visivelmente consistentes entre si em
  espaçamento, tipografia, bordas e sombras — sem discrepâncias evidentes ao inspeção visual lado a lado.
- **SC-004**: Os três tipos de post são distinguíveis por cor de forma imediata, sem necessidade
  de ler o texto do badge, em qualquer contexto onde aparecem.

### Critérios Visuais e de Resolução

- **VQ-001**: Interface validada em 1920×1080 — confortável, legível, sem scroll horizontal indesejado.
- **VQ-002**: Interface validada em 3440×1440 — espaço horizontal aproveitado, layout inteligente
  sem áreas mortas nas laterais.
- **VQ-003**: Design é moderno, polido e adequado para demonstração a clientes — nenhuma seção
  parece protótipo não finalizado ou trabalho em andamento.
- **VQ-004**: Notificações têm animação de entrada e saída visíveis — sem aparecimento/desaparecimento
  abrupto.

## Assumptions

- A stack permanece Angular 16+ + TypeScript + Tailwind CSS — nenhuma mudança de stack é considerada.
- A identidade visual Hydro (paleta, tipografia Ivar) serve de referência mas pode ser adaptada
  quando isso melhorar o resultado visual.
- Os contratos de API não precisam de modificações para suportar as melhorias visuais.
- O layout multi-coluna/sidebar para ultrawide será implementado via utilitários Tailwind (CSS Grid/Flex)
  sem biblioteca de layout externa.
- O editor de texto rico (Quill) será avaliado na fase de planejamento quanto a possível atualização
  de versão (1.x → 2.x), mas não será substituído por outra solução de editor.
- Para ícones recorrentes (notificações, ações de post, estados de UI), a adição de uma biblioteca
  leve pode ser proposta no plano — mas só se trouxer ganho real de consistência visual e manutenção.
- A página de admin receberá visual adequado mas sem funcionalidades novas.
- Testes de integração validarão os fluxos principais impactados (criação de post, listagem, notificações).
  Para validações puramente visuais de resolução, será registrado e executado um checklist manual objetivo.
