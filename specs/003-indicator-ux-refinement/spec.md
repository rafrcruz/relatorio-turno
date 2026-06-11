# Feature Specification: Refinamento visual e melhoria de usabilidade da experiência de indicadores

**Feature Branch**: `003-indicator-ux-refinement`  
**Created**: 2026-06-11  
**Status**: Draft  
**Input**: User description: "Refinar visualmente e melhorar a experiência da tela de Relatório de Turno, especialmente a área de indicadores, preservando a funcionalidade existente e tornando a experiência pronta para demonstração ao cliente."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ler e operar a tela com clareza em tema claro (Priority: P1)

Como operador ou responsável pela passagem de turno, quero distinguir facilmente seções, abas, botões, filtros, alertas e ações para registrar e consultar informações do turno sem esforço visual.

**Why this priority**: A tela principal é a base da jornada. Se contraste, hierarquia e espaçamento forem fracos, todas as demais funções ficam difíceis de usar e a solução não fica adequada para demonstração.

**Independent Test**: Pode ser testado acessando a tela principal em tema claro, alternando entre "Passagem" e "Indicadores" e verificando se todas as áreas, estados ativos, ações e alertas são identificáveis sem depender de tentativa e erro.

**Acceptance Scenarios**:

1. **Given** a tela principal em tema claro, **When** o usuário visualiza cabeçalho, seletor de contexto, abas, registros e indicadores, **Then** as seções ficam visualmente separadas e com hierarquia clara.
2. **Given** ações como "Adicionar apontamento", "Incluir na passagem", "Abrir" e "Ver todos os indicadores", **When** o usuário percorre a tela, **Then** cada ação parece clicável, legível e distinta de textos informativos.
3. **Given** um indicador em "Foco" sem apontamento, **When** ele aparece no resumo ou na visão dedicada, **Then** o alerta fica perceptível, compreensível e visualmente consistente com o produto.

---

### User Story 2 - Revisar o resumo de indicadores na passagem (Priority: P1)

Como usuário responsável pela passagem de turno, quero ver apenas os indicadores relevantes para a passagem para entender rapidamente o que exige atenção no próximo turno.

**Why this priority**: A aba "Passagem" deve apoiar a transferência objetiva de informação, não virar uma lista completa de indicadores.

**Independent Test**: Pode ser testado com uma base de demonstração contendo indicadores em diferentes status, verificando se o resumo exibe somente indicadores em "Atenção", em "Foco" ou marcados manualmente para passagem.

**Acceptance Scenarios**:

1. **Given** indicadores em "Na meta", "Atenção" e "Foco", **When** o usuário acessa a aba "Passagem", **Then** a área "Indicadores do Turno" exibe apenas os itens relevantes para passagem.
2. **Given** um indicador "Na meta" marcado manualmente para passagem, **When** o usuário acessa o resumo, **Then** esse indicador aparece no resumo com indicação clara de inclusão manual.
3. **Given** um indicador em "Foco" sem apontamento, **When** ele aparece no resumo, **Then** o usuário vê nome, valor, unidade, status, ausência de apontamento, alerta e acesso a detalhes.

---

### User Story 3 - Comparar muitos indicadores em visão dedicada (Priority: P1)

Como usuário que acompanha indicadores do turno, quero uma visão dedicada mais tabular e densa para comparar cerca de 20 ou mais indicadores sem navegar por muitos cards grandes.

**Why this priority**: A feature de indicadores só fica útil em cenário real se a visão dedicada suportar muitos itens com leitura rápida e alinhada.

**Independent Test**: Pode ser testado acessando a aba "Indicadores" com cerca de 20 indicadores de demonstração e validando se é possível comparar nome, valor, unidade, status, referência, apontamento, inclusão na passagem e ações em linhas alinhadas.

**Acceptance Scenarios**:

1. **Given** uma lista com cerca de 20 indicadores variados, **When** o usuário acessa a aba "Indicadores", **Then** a apresentação prioriza leitura em linhas e colunas, com densidade adequada para comparação.
2. **Given** indicadores com nomes curtos e longos, unidades e faixas diferentes, **When** a lista é exibida, **Then** as informações permanecem legíveis, alinhadas e sem sobreposição.
3. **Given** um indicador com apontamento existente, **When** o usuário consulta a visão dedicada, **Then** o apontamento fica identificado e a ação de edição fica visível.

---

### User Story 4 - Filtrar, buscar e entender contadores de indicadores (Priority: P2)

Como usuário, quero filtrar e buscar indicadores para localizar rapidamente itens por status, pendência de apontamento ou inclusão na passagem.

**Why this priority**: A navegação por muitos indicadores precisa de filtros claros para reduzir esforço operacional e apoiar decisões rápidas.

**Independent Test**: Pode ser testado aplicando filtros de status, filtro de "Foco sem apontamento", filtro de itens incluídos na passagem e busca por nome, verificando se contadores e resultados são coerentes.

**Acceptance Scenarios**:

1. **Given** a aba "Indicadores" com muitos itens, **When** o usuário seleciona filtros de "Todos", "Na meta", "Atenção", "Foco", "Foco sem apontamento" ou "Na passagem", **Then** a lista e os contadores refletem a seleção de forma clara.
2. **Given** a busca por indicador, **When** o usuário digita parte de um nome, **Then** os resultados são reduzidos mantendo legibilidade, ações disponíveis e indicação do filtro aplicado.

---

### User Story 5 - Registrar apontamento sem desorganizar a tela (Priority: P2)

Como usuário, quero adicionar ou editar apontamentos de indicadores com múltiplas linhas para registrar causa provável, observação operacional, ação tomada, ação pendente e orientação ao próximo turno.

**Why this priority**: Apontamentos são essenciais para indicadores em "Foco" e precisam ser claros sem prejudicar a leitura da lista.

**Independent Test**: Pode ser testado abrindo o editor de apontamento a partir de um indicador, salvando e cancelando alterações, e verificando se a lista continua organizada e se o status de pendência é atualizado.

**Acceptance Scenarios**:

1. **Given** um indicador sem apontamento, **When** o usuário seleciona "Adicionar apontamento", **Then** o editor informa qual indicador está sendo editado e apresenta área adequada para texto de múltiplas linhas.
2. **Given** um apontamento em edição, **When** o usuário salva, **Then** o indicador passa a indicar que possui apontamento e eventuais alertas de pendência obrigatória são removidos.
3. **Given** um apontamento em edição, **When** o usuário cancela, **Then** a lista retorna ao estado anterior sem perda ou alteração indevida.

### Edge Cases

- Indicadores com nomes longos devem permanecer legíveis sem quebrar o alinhamento da visão tabular.
- Indicadores sem apontamento devem deixar claro quando o apontamento é obrigatório por estarem em "Foco".
- A aba "Passagem" deve continuar omitindo indicadores irrelevantes, mesmo quando a base de demonstração contém muitos itens.
- Filtros combinados com busca podem retornar lista vazia; nesse caso, o usuário deve entender que não há resultados para os critérios atuais.
- Em telas menores, a experiência pode abandonar colunas rígidas, desde que preserve acesso a nome, valor, status, referência, apontamento, inclusão na passagem e ações.
- Em monitores ultrawide, áreas de texto e painéis não devem se esticar indefinidamente.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A tela MUST manter tema claro com contraste suficiente para leitura confortável de botões, abas, painéis, inputs, filtros, badges, bordas, divisórias, links, ações secundárias, alertas e textos auxiliares.
- **FR-002**: A tela MUST deixar visualmente claro quais abas, filtros e botões estão ativos, quais elementos são clicáveis e quais informações exigem atenção.
- **FR-003**: A experiência MUST separar visualmente cabeçalho, seletor de contexto, abas, editor de registros, resumo de indicadores, listas de registros, filtros e conteúdo da visão dedicada.
- **FR-004**: A área "Indicadores do Turno" na aba "Passagem" MUST ter espaçamento adequado em relação à seção anterior.
- **FR-005**: O conteúdo principal MUST permanecer centralizado e com largura máxima confortável em monitores ultrawide, sem esticar indefinidamente áreas de texto, painéis ou cards.
- **FR-006**: A aba "Passagem" MUST exibir somente indicadores relevantes para a passagem: indicadores em "Atenção", indicadores em "Foco" e indicadores marcados manualmente para passagem.
- **FR-007**: Cada item do resumo de indicadores MUST apresentar nome, valor, unidade, status, indicação de apontamento, alerta quando aplicável e acesso a detalhes.
- **FR-008**: Indicadores em "Foco" sem apontamento MUST receber destaque claro e consistente, sem parecer visualmente improvisado ou agressivo.
- **FR-009**: A aba "Indicadores" MUST apresentar a visão completa em formato tabular, lista tabular ou padrão equivalente orientado a linhas e colunas.
- **FR-010**: A visão dedicada de indicadores MUST suportar cerca de 20 indicadores de demonstração mantendo comparação rápida e densidade adequada.
- **FR-011**: Cada indicador na visão dedicada MUST exibir nome, valor, unidade, status, referência ou faixas de classificação, apontamento, indicação de inclusão na passagem e ação para adicionar ou editar apontamento.
- **FR-012**: A experiência MUST incluir dados de demonstração variados com indicadores "Na meta", "Atenção", "Foco", "Foco" sem apontamento, "Foco" com apontamento, "Na meta" marcado para passagem, diferentes unidades, diferentes referências e nomes de tamanhos variados.
- **FR-013**: Ações como "Adicionar apontamento", "Editar apontamento", "Salvar apontamento", "Cancelar", "Incluir na passagem", "Na passagem", "Abrir" e "Ver todos os indicadores" MUST ser claramente visíveis e reconhecíveis como interativas.
- **FR-014**: O editor de apontamento MUST permitir texto de múltiplas linhas e deixar claro o indicador editado, onde escrever, como salvar, como cancelar e se há pendência de apontamento obrigatório.
- **FR-015**: Abrir o editor de apontamento MUST preservar a organização da visão de indicadores e não deve deslocar ou ocultar informações essenciais de forma excessiva.
- **FR-016**: A aba "Indicadores" MUST oferecer filtros legíveis para todos os indicadores, "Na meta", "Atenção", "Foco", "Foco sem apontamento" e incluídos na passagem.
- **FR-017**: A aba "Indicadores" MUST oferecer busca por indicador com posicionamento, tamanho e legibilidade adequados.
- **FR-018**: Contadores de indicadores MUST ajudar o usuário a entender a situação geral do turno e refletir corretamente filtros e categorias apresentadas.
- **FR-019**: A experiência MUST funcionar sem sobreposição, ilegibilidade ou elementos espremidos em notebook, desktop comum e monitor ultrawide.
- **FR-020**: A melhoria MUST preservar seleção de área, data e turno; abas "Passagem" e "Indicadores"; editor de registros; anotações; urgências; pendências; resumo de indicadores; visão completa de indicadores; filtros; busca; apontamentos; alerta de "Foco" sem apontamento; marcação para passagem; e exportação PDF quando existente.
- **FR-021**: A feature MUST NOT introduzir fechamento formal do turno, configuração administrativa de turnos, integração real com PI System/AF, novos cálculos de indicadores, workflow de aprovação, reabertura de relatório fechado, mudanças profundas de autenticação ou reformulação completa de anotações, urgências e pendências.

### Key Entities

- **Indicador do Turno**: Representa uma medição acompanhada no turno, com nome, valor, unidade, status, referência ou faixa de classificação, apontamento, inclusão na passagem e necessidade de atenção.
- **Status do Indicador**: Classificação operacional do indicador como "Na meta", "Atenção" ou "Foco".
- **Apontamento do Indicador**: Registro textual associado a um indicador, podendo conter causa provável, observação operacional, ação tomada, ação pendente e orientação para o próximo turno.
- **Resumo de Passagem**: Subconjunto de indicadores exibido na aba "Passagem" por relevância operacional ou inclusão manual.
- **Filtro de Indicadores**: Critério usado para reduzir a visão dedicada por status, pendência de apontamento ou inclusão na passagem.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em validação de uso, um usuário consegue identificar a aba ativa, os filtros ativos e as ações principais da tela em até 5 segundos por área avaliada.
- **SC-002**: A aba "Indicadores" permite revisar e comparar pelo menos 20 indicadores de demonstração sem que a tela pareça improvisada, excessivamente espaçada ou dependente de cards grandes.
- **SC-003**: Um usuário consegue localizar um indicador específico por busca ou filtro em até 15 segundos durante uma avaliação guiada.
- **SC-004**: 100% dos indicadores em "Foco" sem apontamento exibidos no resumo ou na visão dedicada apresentam alerta visível e compreensível.
- **SC-005**: 100% dos indicadores exibidos na visão dedicada mostram nome, valor, unidade, status, referência ou faixa, apontamento, inclusão na passagem e ação de apontamento.
- **SC-006**: A aba "Passagem" exibe apenas indicadores em "Atenção", em "Foco" ou marcados manualmente para passagem em todos os cenários de demonstração.
- **SC-007**: Em avaliação visual, a tela é considerada pronta para demonstração ao cliente por atender contraste, espaçamento, hierarquia, responsividade e consistência com o produto.

### Critérios Visuais e de Resolução *(obrigatório para features com UI)*

- **VQ-001**: Interface validada em 1920×1080 - confortável e legível.
- **VQ-002**: Interface validada em 3440×1440 - espaço bem aproveitado, sem visual vazio, esticado ou mal distribuído.
- **VQ-003**: Design é polido e adequado para demonstração a clientes.
- **VQ-004**: Interface validada em largura menor de notebook, sem sobreposição, truncamento crítico ou perda de acesso às ações principais.
- **VQ-005**: Tema claro apresenta contraste suficiente para distinguir elementos primários, secundários, alertas e textos auxiliares.

## Assumptions

- Os usuários principais são operadores, supervisores ou responsáveis pela passagem de turno que já utilizam a tela atual.
- A feature refina a experiência existente e não altera regras de negócio de cálculo ou classificação de indicadores.
- A visão dedicada pode usar tabela, lista tabular ou padrão equivalente, desde que o resultado seja denso, alinhado e adequado para muitos indicadores.
- Dados de demonstração podem ser mockados quando não houver integração real disponível.
- A experiência deve manter coerência com os padrões visuais já existentes do produto, ajustando contraste, espaçamento e densidade quando necessário para melhorar a demonstração.
- Exportação PDF deve ser preservada caso já exista, mas a feature não exige criação de nova exportação.
