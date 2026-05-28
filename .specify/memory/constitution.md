<!--
SYNC IMPACT REPORT
==================
Version change: [template] → 1.0.0
Type of bump: MINOR (initial ratification — 9 principles + governance established from blank template)

Modified principles: N/A (initial ratification)
Added sections: Core Principles (9), Governança
Removed sections: N/A

Templates updated:
  ✅ .specify/templates/plan-template.md — Constitution Check gates atualizados
  ✅ .specify/templates/spec-template.md — Success Criteria com critérios visuais e de resolução
  ✅ .specify/templates/tasks-template.md — Seção de testes alinhada a Testes Significativos

Follow-up TODOs:
  - Nenhum placeholder deferido.
-->

# Relatório de Turno Constitution

## Princípios Fundamentais

### I. Escopo da Constitution

A constitution define **como** o projeto é construído — padrões de qualidade, restrições
de processo e critérios inegociáveis. Funcionalidades, regras de negócio, fluxos de usuário
e critérios funcionais pertencem às specs de cada feature, não a este documento.

Qualquer princípio que descreva **o que** o sistema faz viola este princípio e DEVE ser
movido para a spec correspondente.

### II. Testes Significativos

Os principais fluxos da aplicação DEVEM ser cobertos por testes significativos,
preferencialmente de integração e/ou ponta a ponta (e2e). Testes DEVEM:

- Validar jornadas reais de usuário (happy path e variantes críticas)
- Cobrir estados críticos e erros esperados pelo sistema
- Proteger contra regressões relevantes em funcionalidades já entregues

Testes que existem apenas para aumentar cobertura de código, sem exercitar
comportamento real, são considerados ruído e NÃO satisfazem este princípio.
Unit tests são bem-vindos para lógica isolada; a cobertura de jornadas DEVE
ser feita em camada mais alta.

### III. Critério de Conclusão

Nenhuma entrega relevante é considerada concluída apenas porque compila,
passa no linter ou funciona superficialmente. Toda entrega DEVE ter:

1. **Critérios de aceite claros** — definidos na spec antes da implementação.
2. **Validação correspondente** — teste automatizado ou, quando inviável,
   checklist manual objetivo registrado e executado.

Itens marcados como concluídos sem evidência de validação DEVEM ser
reabertos. "Funciona na minha máquina" não é critério de conclusão.

### IV. Resoluções-Alvo

A aplicação DEVE ser otimizada e validada nas seguintes resoluções:

| Resolução | Contexto |
|-----------|----------|
| 1920×1080 | Monitor de notebook — interface confortável e legível |
| 3440×1440 | Monitor ultrawide — espaço aproveitado, sem visual vazio, esticado ou mal distribuído |

Entregas DEVEM ser testadas em ambas as resoluções antes de serem consideradas concluídas.
Layouts que degradam visivelmente em qualquer uma dessas resoluções são considerados incompletos.

### V. Qualidade Visual

Design é critério obrigatório de qualidade, com o mesmo peso que corretude funcional.
A aplicação DEVE ser bonita, moderna, polida, consistente e adequada para demonstrações
a clientes.

Entregas com aparência visualmente pobre, genérica, inconsistente ou inacabada são
consideradas incompletas, independentemente de funcionamento técnico correto.

Revisão visual DEVE ocorrer antes da marcação como concluído.

### VI. Identidade Visual

A identidade visual da Hydro (paleta, tipografia, logotipos) PODE servir como referência
e ponto de partida, mas PODE ser flexibilizada quando uma solução mais moderna, mais clara
ou mais impactante melhorar o resultado visual percebido.

Decisões de afastamento da identidade Hydro DEVEM ser deliberadas e documentadas
na spec da feature correspondente, com justificativa de melhoria visual clara.

### VII. Bibliotecas e Dependências

Novas dependências só DEVEM ser adicionadas quando houver necessidade clara e não
suprida pelo que já existe no projeto. Antes de adicionar qualquer biblioteca, DEVE-SE
avaliar:

- Manutenção ativa (commits recentes, releases frequentes)
- Adoção pela comunidade (estrelas, downloads, issues fechadas)
- Qualidade da documentação
- Compatibilidade com a stack atual (Angular, Node.js, TypeScript)
- Estabilidade e risco de abandono

Bibliotecas com sinais fortes de abandono (último commit antigo, issues acumuladas sem
resposta, downloads em declínio) NÃO DEVEM ser adicionadas, salvo justificativa explícita
registrada na spec da feature.

### VIII. Consistência

Antes de criar novos padrões, componentes, estilos, serviços ou estruturas, DEVE-SE
verificar se já existe solução equivalente no projeto e reutilizá-la ou estendê-la.

DEVE-SE preservar:
- Consistência visual (paleta, tipografia, espaçamentos, componentes existentes)
- Consistência arquitetural (padrões Angular/Express estabelecidos)
- Consistência de nomenclatura (convenções existentes de arquivos, variáveis, endpoints)

Novas abstrações só são justificadas quando não há equivalente no projeto e a
necessidade é clara e recorrente.

### IX. Performance Percebida

A aplicação DEVE parecer rápida e fluida para o usuário. Interações relevantes
DEVEM ter feedback visual adequado (loading states, skeleton screens, toasts).
A interface DEVE:

- Evitar travamentos durante operações assíncronas
- Manter responsividade visual mesmo sob carga
- Apresentar estados de erro e vazio de forma clara e útil

Entregas que causem perda perceptível de responsividade ou que omitam feedback
visual em operações com latência DEVEM ser consideradas incompletas.

## Governança

Esta constitution **supera** qualquer outra prática ou convenção informal do projeto.
Amendas requerem:
1. Justificativa explícita (o que muda e por quê)
2. Atualização da versão conforme regras de semantic versioning:
   - **MAJOR**: remoção ou redefinição incompatível de princípio existente
   - **MINOR**: novo princípio adicionado ou seção materialmente expandida
   - **PATCH**: clarificações, reformulações, correções sem mudança de semântica
3. Propagação às templates dependentes (`plan-template.md`, `spec-template.md`, `tasks-template.md`)
4. Atualização de `LAST_AMENDED_DATE`

Toda PR ou revisão relevante DEVE verificar conformidade com os princípios desta constitution,
especialmente os gates do `Constitution Check` em `plan-template.md`.

Complexidade adicional DEVE ser justificada — o ônus da prova é de quem a introduz.

**Version**: 1.0.0 | **Ratified**: 2026-05-28 | **Last Amended**: 2026-05-28
