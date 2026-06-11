# Feature Specification: Gestão dedicada de indicadores do turno

**Feature Branch**: `002-shift-indicators`
**Created**: 2026-06-11
**Status**: Draft
**Input**: User description: "Especifique uma nova feature para o projeto Relatório de Turno. Título sugerido: Gestão dedicada de indicadores do turno. Evoluir a tela existente de Relatório de Turno, adicionando uma visão dedicada de indicadores dentro da experiência atual, preservando o fluxo de anotações, urgências e pendências, e transformando a área 'Indicadores do Turno' em um resumo de passagem."

## Clarifications

### Session 2026-06-11

- Q: O apontamento deve seguir qual padrão de edição (texto rico/anexos)? → A: Texto rico (Quill) + anexos, igual aos posts existentes.
- Q: Como a visão dedicada de indicadores deve ser apresentada (aba/rota/painel)? → A: Abas na própria página de Relatório, mesmo contexto, com estado refletido na URL.
- Q: Esta feature deve introduzir uma ação de conclusão/fechamento do relatório? → A: Não; nenhuma ação nova de fechamento agora — obrigatoriedade vira alerta forte/persistente e o bloqueio rígido fica condicionado a um fechamento futuro.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Revisar todos os indicadores do turno (Priority: P1)

No fechamento do turno, o operador abre uma visão dedicada de indicadores e consegue revisar **todos** os indicadores da área, data e turno selecionados — possivelmente dezenas — entendendo rapidamente quais estão Na meta, em Atenção e em Foco, com a referência de classificação visível e contadores que resumem a situação geral.

**Why this priority**: É a base da feature. Sem uma visão que consolide todos os indicadores de forma legível e classificada, o operador não consegue fechar o turno com confiança. Entregue isoladamente, já substitui a área atual minúscula de indicadores por uma ferramenta real de revisão.

**Independent Test**: Selecionar uma área com muitos indicadores, abrir a visão dedicada e verificar que todos os indicadores aparecem com nome, valor, unidade (quando aplicável), status (Na meta / Atenção / Foco), referência de classificação e contadores corretos; aplicar filtros e busca e confirmar que a lista responde corretamente.

**Acceptance Scenarios**:

1. **Given** uma área/data/turno com 25 indicadores selecionada, **When** o operador abre a visão dedicada de indicadores, **Then** todos os 25 indicadores são listados, cada um exibindo nome, valor, unidade (quando aplicável), status e referência de classificação.
2. **Given** a visão dedicada aberta, **When** o operador observa os contadores resumidos, **Then** vê total de indicadores, quantidade Na meta, em Atenção, em Foco e quantidade em Foco sem apontamento, consistentes com a lista.
3. **Given** indicadores de tipos de referência diferentes (faixa ideal, quanto maior melhor, quanto menor melhor), **When** o operador inspeciona um indicador, **Then** a referência exibida deixa claro quais faixas/condições levam a cada status.
4. **Given** a visão dedicada com muitos indicadores, **When** o operador filtra por "Em Foco" (ou Atenção / Na meta / com pendência de apontamento / incluídos na passagem), **Then** apenas os indicadores correspondentes são exibidos e os contadores permanecem coerentes.
5. **Given** a visão dedicada com muitos indicadores, **When** o operador busca por parte do nome de um indicador, **Then** a lista é reduzida aos indicadores que correspondem ao termo buscado.
6. **Given** uma área sem indicadores configurados, **When** o operador abre a visão dedicada, **Then** um estado vazio claro é exibido, sem erro.

---

### User Story 2 - Registrar apontamento por indicador (Priority: P2)

O operador registra um **apontamento** em um indicador para documentar causa provável do desvio, observação operacional, ações tomadas, ações pendentes e orientações para o próximo turno. Indicadores em Foco exigem apontamento; a ausência fica visualmente evidente como pendência.

**Why this priority**: O apontamento é o que transforma a revisão em passagem de turno útil. Depende da existência da visão dedicada (P1), mas agrega o valor central de documentar e comunicar desvios.

**Independent Test**: Em um indicador qualquer, criar um apontamento com texto multilinha, salvar, recarregar/reabrir o contexto e confirmar que o apontamento persiste e pode ser editado e revisado; verificar que um indicador em Foco sem apontamento é destacado como pendência e que o destaque some ao salvar o apontamento.

**Acceptance Scenarios**:

1. **Given** um indicador na visão dedicada, **When** o operador abre o apontamento, escreve um texto com múltiplas linhas e salva, **Then** o apontamento é persistido e exibido como associado àquele indicador no contexto de área/data/turno atual.
2. **Given** um apontamento já salvo, **When** o operador o edita e salva novamente, **Then** o conteúdo atualizado é persistido e revisável.
3. **Given** um indicador em Foco **sem** apontamento, **When** o operador visualiza a lista, **Then** o indicador é destacado de forma forte (alerta/ícone de exclamação/mensagem) indicando pendência de apontamento, e o contador "Foco sem apontamento" o inclui.
4. **Given** um indicador em Foco sem apontamento destacado, **When** o operador registra e salva o apontamento, **Then** o destaque de pendência desaparece e o contador "Foco sem apontamento" é decrementado.
5. **Given** um indicador em Atenção, **When** o operador opta por registrar um apontamento, **Then** o sistema permite salvá-lo, mas não trata sua ausência como pendência.
6. **Given** que registros do relatório (anotações/urgências/pendências) suportam anexos e/ou formatação rica, **When** o operador edita um apontamento, **Then** a experiência de anexos/formatação é coerente com esse padrão existente do produto.

---

### User Story 3 - Resumo de passagem na visão principal (Priority: P3)

Na visão principal do relatório, a área "Indicadores do Turno" passa a funcionar como um **resumo de passagem**, exibindo automaticamente apenas indicadores em Atenção e em Foco, com acesso rápido ao apontamento e um caminho claro para abrir a visão completa.

**Why this priority**: Conecta a nova visão dedicada ao fluxo de passagem já existente, sem poluir a visão principal com dezenas de indicadores. Depende de P1 (status) e se beneficia de P2 (apontamentos), mas é testável de forma independente quanto à seleção e exibição do resumo.

**Independent Test**: Em um contexto com indicadores em vários status, confirmar que o resumo da visão principal mostra apenas os de Atenção e Foco (não os Na meta), destaca Foco sem apontamento, permite identificar/acessar o apontamento e oferece um caminho claro ("Ver todos os indicadores") para a visão dedicada.

**Acceptance Scenarios**:

1. **Given** um contexto com indicadores Na meta, em Atenção e em Foco, **When** o operador vê o resumo na visão principal, **Then** apenas indicadores em Atenção e em Foco aparecem automaticamente; nenhum indicador Na meta aparece por padrão.
2. **Given** um indicador em Foco sem apontamento, **When** ele aparece no resumo, **Then** é destacado de forma forte como pendência de apontamento.
3. **Given** um indicador do resumo com apontamento, **When** o operador olha o item, **Then** consegue identificar que há apontamento e acessar rapidamente seu conteúdo sem precisar do texto completo inline.
4. **Given** o resumo da visão principal, **When** o operador aciona "Ver todos os indicadores" (ou equivalente), **Then** é levado à visão dedicada no mesmo contexto de área/data/turno, podendo editar/complementar apontamentos.
5. **Given** a visão principal, **When** o operador interage com o resumo de indicadores, **Then** o fluxo de anotações, urgências e pendências permanece inalterado e funcional.

---

### User Story 4 - Marcar indicadores para passagem de turno (Priority: P4)

O operador marca manualmente indicadores relevantes — tipicamente Na meta — para entrarem na passagem de turno, respeitando seu julgamento operacional, complementando o destaque automático de Atenção e Foco.

**Why this priority**: É um refinamento que respeita o julgamento do turno. O resumo já é útil só com seleção automática (P3); a marcação manual adiciona flexibilidade e é claramente complementar.

**Independent Test**: Marcar um indicador Na meta para passagem na visão dedicada, confirmar que ele passa a aparecer no resumo da visão principal; desmarcá-lo e confirmar que sai do resumo; verificar que a marcação persiste por contexto de área/data/turno.

**Acceptance Scenarios**:

1. **Given** um indicador Na meta na visão dedicada, **When** o operador o marca para entrar na passagem, **Then** o indicador passa a aparecer no resumo da visão principal mesmo estando Na meta, e a marcação persiste no contexto.
2. **Given** um indicador Na meta marcado para passagem, **When** o operador remove a marcação, **Then** o indicador deixa de aparecer no resumo da visão principal.
3. **Given** indicadores em Atenção e Foco, **When** o operador consulta a marcação de passagem, **Then** entende que eles já entram automaticamente, e a marcação manual serve para complementar com outros indicadores.
4. **Given** a visão dedicada, **When** o operador filtra por "incluídos na passagem", **Then** vê tanto os automáticos (Atenção/Foco) quanto os marcados manualmente.

---

### User Story 5 - Consultar relatórios anteriores e bloqueio de conclusão (Priority: P5)

Ao consultar um relatório de um turno anterior, o operador vê os indicadores daquele contexto com seus status, apontamentos, marcações de passagem e pendências como foram registrados. Quando existir um fluxo de conclusão/fechamento definitivo do relatório, a presença de indicador em Foco sem apontamento impede a conclusão ou gera alerta forte o suficiente para evitar fechamento sem justificativa.

**Why this priority**: Garante que a informação tenha valor histórico de passagem e fecha o ciclo de obrigatoriedade. Depende de todo o restante e o componente de bloqueio é condicional à existência de um fluxo de fechamento.

**Independent Test**: Registrar apontamentos e marcações em um contexto, mudar para outra data/turno e voltar, confirmando que tudo aparece como registrado; com um fluxo de conclusão presente, tentar concluir o relatório com um indicador em Foco sem apontamento e confirmar o bloqueio/alerta forte.

**Acceptance Scenarios**:

1. **Given** um relatório anterior com apontamentos e marcações registrados, **When** o operador seleciona aquela área/data/turno, **Then** vê os indicadores daquele contexto com status, apontamentos, marcações de passagem e pendências como foram registrados.
2. **Given** que existe um fluxo de conclusão/fechamento do relatório e há indicador em Foco sem apontamento, **When** o operador tenta concluir, **Then** a conclusão é impedida ou um alerta forte é apresentado, deixando clara a pendência.
3. **Given** que todos os indicadores em Foco têm apontamento, **When** o operador conclui o relatório, **Then** nenhum alerta de pendência de apontamento de indicador é levantado.

---

### Edge Cases

- **Valor ausente/indisponível**: quando um indicador não tem valor para o contexto, o status não pode ser calculado; o indicador é exibido com indicação clara de valor indisponível e não é contabilizado como Na meta/Atenção/Foco.
- **Mudança de status após apontamento**: um indicador que estava em Foco (com apontamento) e passa para Na meta em outro contexto não deve arrastar a pendência; cada contexto de área/data/turno é avaliado isoladamente.
- **Indicador em Foco que deixa de ser Foco**: se o status deixar de ser Foco, a obrigatoriedade de apontamento não se aplica, mas um apontamento já registrado permanece visível.
- **Apontamento vazio salvo**: tentar salvar um apontamento sem conteúdo não deve "satisfazer" a obrigatoriedade de Foco; pendência permanece até haver conteúdo significativo.
- **Muitos indicadores em Foco sem apontamento**: a interface deve manter os destaques legíveis e os contadores corretos mesmo com dezenas de pendências.
- **Sem indicadores na área**: estados vazios claros na visão dedicada e no resumo, sem erro.
- **Marcar para passagem um indicador em Atenção/Foco**: como já entram automaticamente, a marcação manual não os duplica nem altera o comportamento automático.
- **Busca/filtro sem resultados**: exibir estado vazio de busca distinto do estado "sem indicadores configurados".

## Requirements *(mandatory)*

### Functional Requirements

**Organização da experiência**

- **FR-001**: O Relatório de Turno DEVE oferecer duas experiências como **abas** na própria página de Relatório (ex.: "Passagem" e "Indicadores"): uma **visão principal** voltada à passagem de turno e uma **visão dedicada de indicadores** voltada à análise e fechamento. Ambas compartilham a mesma seleção de área/data/turno (sem recarregar a seleção ao trocar de aba) e a aba ativa DEVE ser refletida na URL, coerente com a sincronização de estado já existente.
- **FR-002**: A nova experiência DEVE parecer evolução natural da tela atual, mantendo coerência com a linguagem visual, padrões de interação, navegação por área/data/turno e tratamento de registros/anexos/respostas já existentes.
- **FR-003**: A visão principal DEVE preservar integralmente o fluxo atual de criação e visualização de anotações, urgências e pendências.

**Visão dedicada de indicadores**

- **FR-004**: A visão dedicada DEVE listar **todos** os indicadores da área, data e turno selecionados, adequada para dezenas de indicadores, permitindo leitura rápida e comparação.
- **FR-005**: Cada indicador na visão dedicada DEVE exibir, no mínimo: nome, valor, unidade de medida (quando aplicável), status operacional, referência de classificação, apontamento associado (quando existir) e indicação se entra ou não na passagem de turno.
- **FR-006**: A visão dedicada DEVE oferecer filtros para visualizar rapidamente: todos os indicadores, Na meta, em Atenção, em Foco, com pendência de apontamento e incluídos na passagem.
- **FR-007**: A visão dedicada DEVE permitir localizar indicadores por nome (busca textual).
- **FR-008**: A visão dedicada DEVE apresentar contadores resumidos: total de indicadores, quantidade Na meta, em Atenção, em Foco e quantidade em Foco sem apontamento.

**Status e referência de classificação**

- **FR-009**: A interface DEVE classificar e rotular cada indicador exatamente como **"Na meta"**, **"Atenção"** ou **"Foco"**, usando "Foco" para a situação mais relevante (nunca "Crítico" ou equivalente).
- **FR-010**: O status de cada indicador DEVE ser derivado do valor do indicador no contexto e da sua referência de classificação, segundo o significado: Na meta = dentro da condição esperada; Atenção = condição intermediária; Foco = fora da condição aceitável/relevante o suficiente para exigir acompanhamento.
- **FR-011**: Cada indicador DEVE exibir de forma visual, compacta e compreensível a **referência de classificação** que determina seus status, deixando claras as faixas/condições de Na meta, Atenção e Foco.
- **FR-012**: O modelo de referência DEVE suportar diferentes tipos de regra, no mínimo: faixa ideal (mínimo–máximo), quanto maior melhor, quanto menor melhor, limites de atenção/foco em apenas uma direção e limites inferiores e superiores. A referência NÃO DEVE ser reduzida a uma meta simples.

**Apontamento por indicador**

- **FR-013**: O sistema DEVE permitir criar, editar, salvar e revisar um **apontamento** por indicador, usando o termo "Apontamento" na interface.
- **FR-014**: O apontamento DEVE aceitar texto com múltiplas linhas e conteúdo suficientemente detalhado para documentar causa provável, observação operacional, ação tomada, ação pendente, orientação para o próximo turno e contexto relevante.
- **FR-015**: O apontamento DEVE oferecer edição de **texto rico** (formatação) e suporte a **anexos** (imagens/prints/arquivos), coerente com o padrão já usado nos registros de anotações/urgências/pendências, reutilizando esse padrão existente em vez de criar um novo.
- **FR-016**: O apontamento DEVE estar vinculado ao indicador no contexto de área/data/turno em que foi registrado, de modo que apontamentos de contextos diferentes não se misturem.

**Obrigatoriedade para Foco**

- **FR-017**: Todo indicador em **Foco** DEVE possuir apontamento; quando estiver em Foco e sem apontamento, DEVE ser destacado visualmente de forma forte (alerta, ícone de exclamação ou mensagem equivalente) tanto na visão dedicada quanto no resumo da visão principal, deixando evidente a pendência.
- **FR-018**: A navegação e o preenchimento do relatório NÃO precisam ser bloqueados imediatamente por pendências de apontamento; a pendência DEVE permanecer evidente enquanto existir.
- **FR-019**: Esta feature NÃO introduz uma nova ação de conclusão/fechamento do relatório. A obrigatoriedade de apontamento para Foco manifesta-se como **alerta forte e persistente** de pendência (FR-017). O bloqueio rígido descrito é uma regra preparada para acoplar a um eventual fluxo de fechamento futuro: SE/QUANDO esse fluxo existir, a presença de indicador em Foco sem apontamento DEVE impedir a conclusão ou gerar alerta forte o suficiente para evitar fechamento sem justificativa.

**Atenção e Na meta**

- **FR-020**: Indicadores em **Atenção** DEVEM aceitar apontamento (permitido e incentivado), mas sua ausência NÃO DEVE ser tratada como pendência.
- **FR-021**: Indicadores **Na meta** DEVEM aparecer na visão dedicada, mas NÃO DEVEM aparecer no resumo da visão principal por padrão.

**Resumo de passagem na visão principal**

- **FR-022**: O resumo da visão principal NÃO DEVE listar todos os indicadores; DEVE exibir automaticamente apenas indicadores em Atenção e em Foco, mais os indicadores marcados manualmente para passagem.
- **FR-023**: Para cada indicador no resumo, o operador DEVE conseguir identificar se há apontamento, acessar rapidamente seu conteúdo, identificar quando está em Foco sem apontamento e navegar para a visão dedicada para editar/complementar o apontamento.
- **FR-024**: A visão principal DEVE oferecer um caminho claro e evidente para acessar a visão completa de indicadores — tanto a aba "Indicadores" quanto uma ação direta no resumo (ex.: "Ver todos os indicadores") que leve à aba dedicada no mesmo contexto.

**Marcação para passagem**

- **FR-025**: A visão dedicada DEVE permitir marcar/desmarcar manualmente se um indicador entra na passagem de turno, persistindo a marcação por contexto de área/data/turno.
- **FR-026**: A marcação manual DEVE ser complementar ao destaque automático: indicadores em Atenção e Foco entram automaticamente; a marcação manual serve principalmente para incluir indicadores Na meta ou outros que o operador queira destacar.

**Relação Foco × Urgência**

- **FR-027**: "Foco" DEVE ser uma classificação/seleção aplicada a indicador e NÃO DEVE substituir nem se confundir com o registro manual de **Urgência**, que continua existindo independentemente. O sistema NÃO DEVE criar urgências automaticamente a partir de indicadores em Foco.

**Contexto e histórico**

- **FR-028**: O valor exibido para cada indicador DEVE corresponder ao valor da área, data e turno selecionados (visão de fechamento/passagem, não acompanhamento hora a hora).
- **FR-029**: Ao consultar um relatório anterior, o operador DEVE ver, para aquele contexto, os indicadores, seus status, apontamentos registrados, indicadores incluídos na passagem e pendências de apontamento existentes naquele relatório.

**Dados de demonstração**

- **FR-030**: Enquanto os indicadores usarem dados de demonstração, esses dados DEVEM permitir demonstrar todos os cenários principais: indicadores Na meta, em Atenção, em Foco com apontamento, em Foco sem apontamento, ao menos um Na meta marcado manualmente para passagem, referências diferentes entre indicadores e ao menos um exemplo de cada tipo de referência: faixa ideal, quanto maior melhor e quanto menor melhor.

### Key Entities *(include if feature involves data)*

- **Indicador**: definição de uma métrica monitorada por área (nome, unidade quando aplicável, identificador, área a que pertence). Pode existir em quantidade elevada (dezenas) por área.
- **Referência de Classificação**: regra que determina o status de um indicador a partir do valor. Possui um **tipo de regra** (faixa ideal mín–máx, quanto maior melhor, quanto menor melhor, limites unidirecionais, limites bilaterais) e os **limiares** que separam Na meta, Atenção e Foco. Não é uma meta simples.
- **Valor do Indicador (contextual)**: o valor do indicador correspondente a uma combinação de área, data e turno. Origem pode ser simulada nesta fase.
- **Status do Indicador**: classificação derivada (Na meta / Atenção / Foco / valor indisponível) a partir do Valor e da Referência de Classificação, sempre relativa ao contexto.
- **Apontamento**: registro de **texto rico (formatação) + anexos** vinculado a um Indicador em um contexto de área/data/turno, consistente com o padrão de anotações/urgências/pendências; criado/editado/revisado pelo operador; obrigatório para indicadores em Foco.
- **Marcação de Passagem**: indicação (por indicador + contexto) de que o indicador deve entrar na passagem de turno mesmo quando Na meta; complementar ao destaque automático de Atenção/Foco.
- **Contexto de Relatório (Área + Data + Turno)**: chave que organiza valores, status, apontamentos, marcações e pendências, garantindo isolamento histórico entre relatórios.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em uma área com pelo menos 25 indicadores, o operador consegue revisar todos os indicadores do turno e identificar quantos estão em Foco em menos de 30 segundos, sem rolagem confusa ou ambiguidade de status.
- **SC-002**: 100% dos indicadores em Foco sem apontamento são destacados como pendência tanto na visão dedicada quanto no resumo da visão principal, e o contador "Foco sem apontamento" coincide exatamente com a contagem real.
- **SC-003**: O resumo da visão principal contém exclusivamente indicadores em Atenção, em Foco ou marcados manualmente para passagem — 0 indicadores Na meta não marcados aparecem no resumo em qualquer cenário de teste.
- **SC-004**: Após registrar e salvar um apontamento e revisitar o mesmo contexto de área/data/turno (inclusive um turno anterior), 100% dos apontamentos e marcações de passagem aparecem como foram registrados.
- **SC-005**: A partir do resumo da visão principal, o operador alcança a visão dedicada no mesmo contexto em no máximo 1 interação ("Ver todos os indicadores").
- **SC-006**: Os filtros (Todos, Na meta, Atenção, Foco, pendência de apontamento, incluídos na passagem) e a busca por nome retornam resultados corretos em 100% dos casos de teste, com contadores permanecendo coerentes.
- **SC-007**: Os dados de demonstração cobrem, simultaneamente em pelo menos uma área, todos os cenários exigidos (Na meta, Atenção, Foco com e sem apontamento, Na meta marcado para passagem, e os três tipos de referência: faixa ideal, quanto maior melhor, quanto menor melhor).
- **SC-008** *(condicional)*: Esta entrega NÃO cria um fluxo de conclusão/fechamento (ver Assumptions e Clarificação Q3); portanto a obrigatoriedade é verificada como **alerta forte e persistente** de Foco sem apontamento (em 100% dos casos). O bloqueio rígido só se torna testável SE/QUANDO um fluxo de conclusão existir — momento em que concluir silenciosamente com Foco sem apontamento deve ser impossível.
- **SC-009**: O fluxo existente de anotações, urgências e pendências permanece 100% funcional após a introdução da feature (nenhuma regressão nos cenários atuais).

### Critérios Visuais e de Resolução *(obrigatório para features com UI)*

- **VQ-001**: Interface validada em 1920×1080 — visão dedicada com dezenas de indicadores e resumo da visão principal confortáveis e legíveis, sem rolagem horizontal nem aperto.
- **VQ-002**: Interface validada em 3440×1440 — espaço bem aproveitado na visão dedicada (grade/lista de indicadores), sem visual vazio, esticado ou mal distribuído.

## Assumptions

- **Persistência (comportamental)**: apontamentos e marcações de passagem são recuperáveis ao revisitar a mesma área/data/turno, inclusive em relatórios anteriores (exigido por FR-029/SC-004). A escolha do mecanismo de armazenamento é decisão de `/speckit-plan`, não desta spec.
- **Valores dos indicadores**: nesta fase os valores podem permanecer simulados, desde que correspondam ao contexto de área/data/turno e permitam reproduzir os cenários de demonstração (FR-028, FR-030). A feature não exige integração real de valores.
- **Fluxo de conclusão/fechamento**: confirmado que esta feature NÃO cria uma ação de conclusão/fechamento (nem reaproveita a exportação de PDF como fechamento). A obrigatoriedade de FR-019 manifesta-se como destaque forte e persistente de pendência (FR-017). O bloqueio rígido fica especificado e preparado para acoplar a um passo de conclusão futuro, sem introduzir um novo workflow nesta feature.
- **Apontamento como entidade única por indicador/contexto**: assume-se um apontamento (editável) por indicador em cada contexto, e não uma thread de múltiplas respostas como nos posts.
- **Status derivado, não editável manualmente**: o status (Na meta/Atenção/Foco) é calculado a partir do valor e da referência; o operador não o define manualmente. A relevância manual é expressa pela marcação de passagem.
- **Tipos de referência**: assume-se que cada indicador possui um único tipo de regra de referência por vez, suficiente para cobrir os exemplos exigidos.

## Out of Scope

- Integração real com PI System/AF.
- Criação de novos cálculos de indicadores.
- Acompanhamento hora a hora e visualização em tempo real.
- Gráficos de tendência histórica / série temporal.
- Workflow complexo de aprovação.
- Criação automática de urgências a partir de indicadores em Foco.
- Reformulação completa do fluxo de anotações, urgências e pendências.
