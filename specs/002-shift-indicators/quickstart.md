# Quickstart — Validação da feature "Gestão dedicada de indicadores do turno"

Guia de validação ponta a ponta. Referencia [data-model.md](./data-model.md) e [contracts/indicator-notes.openapi.yaml](./contracts/indicator-notes.openapi.yaml). Não contém código de implementação.

## Pré-requisitos

- Backend com `DATABASE_URL` configurado e migração aplicada (`IndicatorNote` + `Attachment.indicatorNoteId`).
- `npm run install:all` executado.
- Dados de demonstração do `IndicatorsService` cobrindo todos os cenários (ver SC-007).

## Setup

```bash
# aplicar a migração do novo model (backend)
npm run dev:backend   # executa migrate/seed de áreas no boot, conforme servidor

# subir tudo
npm run dev
# frontend: http://localhost:4200/relatorio
# backend:  http://localhost:3000  (Swagger em /docs)
```

## Cenários de validação (mapeados a User Stories / FR / SC)

### V1 — Visão dedicada lista todos os indicadores (US1 / FR-004,005,008 / SC-001)
1. Abrir `/relatorio`, selecionar uma área com muitos indicadores.
2. Clicar na aba **Indicadores**.
3. **Esperado**: todos os indicadores listados com nome, valor, unidade (quando aplicável), status (Na meta/Atenção/Foco) e referência de classificação; contadores no topo (total, Na meta, Atenção, Foco, Foco sem apontamento) coerentes com a lista.

### V2 — Filtros e busca (US1 / FR-006,007 / SC-006)
1. Na aba Indicadores, aplicar cada filtro: Todos, Na meta, Atenção, Foco, Com pendência de apontamento, Incluídos na passagem.
2. Buscar por parte do nome de um indicador.
3. **Esperado**: a lista reflete cada filtro/busca; contadores permanecem coerentes; estado vazio de busca difere de "sem indicadores configurados".

### V3 — Referências de tipos diferentes (US1 / FR-011,012 / SC-007)
1. Inspecionar indicadores de tipos `ideal_band`, `higher_better` e `lower_better`.
2. **Esperado**: cada um exibe de forma compacta as faixas/condições que levam a Na meta/Atenção/Foco — não apenas uma "meta" simples.

### V4 — Criar/editar apontamento com texto rico + anexos (US2 / FR-013,014,015 / SC-004)
1. Em um indicador, abrir o **Apontamento**, escrever texto multilinha formatado e anexar uma imagem (png/jpeg) ou PDF.
2. Salvar.
3. Recarregar a página (ou trocar de contexto e voltar).
4. **Esperado**: o apontamento e o anexo persistem (`GET /api/indicator-notes` retorna a nota com `hasApontamento: true` e o anexo). Editar e salvar novamente reflete a alteração.

### V5 — Foco exige apontamento; pendência destacada (US2 / FR-017 / SC-002)
1. Localizar um indicador em **Foco sem apontamento**.
2. **Esperado**: destaque forte (alerta/ícone) na visão dedicada e no resumo da aba Passagem; contador "Foco sem apontamento" inclui o item.
3. Registrar e salvar o apontamento (HTML não-vazio).
4. **Esperado**: destaque some; contador decrementa. (Salvar HTML vazio NÃO remove o destaque.)

### V6 — Resumo de passagem só com Atenção/Foco/marcados (US3 / FR-021,022,023,024 / SC-003,005)
1. Na aba **Passagem**, observar o resumo de indicadores.
2. **Esperado**: aparecem apenas Atenção, Foco e marcados manualmente; nenhum Na meta não marcado. Cada item permite ver se há apontamento e acessá-lo; há caminho claro ("Ver todos os indicadores") que leva à aba Indicadores no mesmo contexto em 1 interação.

### V7 — Marcação manual para passagem (US4 / FR-025,026 / SC-003)
1. Na aba Indicadores, marcar um indicador **Na meta** para entrar na passagem.
2. **Esperado**: ele passa a aparecer no resumo da aba Passagem; a marcação persiste (`includedInHandover: true`). Desmarcar remove-o do resumo.

### V8 — Histórico por contexto (US5 / FR-028,029 / SC-004)
1. Registrar apontamentos/marcações em um contexto; mudar data/turno e voltar; consultar também um turno anterior.
2. **Esperado**: cada contexto mostra suas próprias notas/marcações/pendências, sem mistura.

### V9 — Foco ≠ Urgência (FR-027)
1. Verificar que o status "Foco" não cria urgências nem altera a lista de Urgências.
2. **Esperado**: o fluxo de urgências/pendências/anotações permanece inalterado (SC-009).

## Checklist visual (Constituição IV/V — VQ-001/VQ-002)
- [ ] Aba Indicadores com ~50 indicadores confortável e legível em **1920×1080** (sem rolagem horizontal/aperto).
- [ ] Aba Indicadores aproveita o espaço em **3440×1440** (sem vazio/esticado/mal distribuído).
- [ ] Resumo de passagem, badges de status (Na meta/Atenção/Foco), alerta de pendência e contadores consistentes com o design system existente.
- [ ] Loading (skeleton), toasts de salvar/marcar e estados vazios presentes.

## Verificação de regressão
- [ ] Criar/listar/responder anotações, urgências e pendências continua funcionando (SC-009).
- [ ] Seleção de área/data/turno e sync de URL inalterados; `?tab=` reflete a aba ativa.
