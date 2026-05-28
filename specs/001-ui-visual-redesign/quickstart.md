# Quickstart — Validação do Redesign Visual

**Feature**: `001-ui-visual-redesign`
**Date**: 2026-05-28

---

## Pré-requisitos

- Node.js 16+
- Banco de dados PostgreSQL com `DATABASE_URL` configurada em `backend/.env`
- Dependências instaladas: `npm run install:all`

---

## 1. Iniciar a aplicação

```bash
# Backend + frontend em paralelo
npm run dev

# Ou separadamente:
npm run dev:backend    # http://localhost:3000
npm run dev:frontend   # http://localhost:4200
```

---

## 2. Checklist de Validação Visual Manual

Execute este checklist após implementar o redesign.

### 2.1 Resolução 1920×1080

Abrir o DevTools (F12) → Device Toolbar → definir viewport 1920×1080.

- [ ] A página principal carrega sem scroll horizontal indesejado
- [ ] O header ocupa a largura confortavelmente (container ~1440px)
- [ ] O Post Composer está visível e bem formatado
- [ ] Os Indicadores de Área exibem grid correto
- [ ] As três seções de post (Urgências, Pendências, Anotações) são claramente distintas
- [ ] Os cards de post têm borda esquerda colorida por tipo
- [ ] Os badges de tipo têm cores corretas (bauxite/warm/hydro-blue)
- [ ] As ações "Responder" e "Copiar link" usam estilo ghost
- [ ] A ação "Excluir" é visualmente diferenciada (btn-danger)
- [ ] Estados vazios têm ícone e mensagem amigável
- [ ] Skeleton loader aparece durante carregamento (simular com throttle no DevTools)

### 2.2 Resolução 3440×1440

Redimensionar viewport para 3440×1440 (ou usar DevTools com valores manuais).

- [ ] Layout de duas colunas está ativo (painel esquerdo ~440px + painel direito fluido)
- [ ] O Post Composer está no painel esquerdo
- [ ] Os Indicadores de Área estão no painel esquerdo
- [ ] As três listas de post estão no painel direito
- [ ] Não há grandes áreas brancas vazias nas laterais
- [ ] O header ocupa a largura total adequada
- [ ] O painel esquerdo fica sticky durante scroll

### 2.3 Responsividade (redimensionamento)

- [ ] Redimensionar de 1920px para 3440px — sem quebras visuais
- [ ] Redimensionar de 3440px para 1920px — layout volta para coluna única
- [ ] Redimensionar para mobile (375px) — interface utilizável sem quebras

### 2.4 Fluxo Principal — Criar Post

1. [ ] Selecionar tipo "Urgência" — seletor ativo com cor bauxite
2. [ ] Selecionar tipo "Pendência" — seletor ativo com cor warm
3. [ ] Selecionar tipo "Anotação" — seletor ativo com cor hydro-blue
4. [ ] Escrever conteúdo e clicar "Publicar"
5. [ ] Notificação de sucesso aparece com ícone check-circle e animação slide-in
6. [ ] Notificação desaparece com animação fade-out após ~4 segundos
7. [ ] Post aparece na lista com borda e badge na cor correta

### 2.5 Fluxo — Interações de Post

1. [ ] Clicar "Responder" → composer de resposta abre
2. [ ] Enviar resposta → notificação de sucesso
3. [ ] Clicar "Excluir" → confirmação aparece → post removido → notificação de sucesso
4. [ ] Clicar "Copiar link" → URL copiada para clipboard

### 2.6 Páginas Periféricas

- [ ] Acessar `/admin` — página tem visual digno (não apenas texto flutuante)
- [ ] Acessar `/qualquer-rota-inexistente` — página 404 usa tokens de cor corretos (sem `text-primary-*`)

---

## 3. Teste de Acessibilidade Básico

- [ ] Navegar pela página apenas com teclado (Tab, Enter, Space, Escape)
- [ ] Todos os botões e inputs são acessíveis via teclado
- [ ] Modal de imagem fecha com Escape
- [ ] Labels e `aria-*` estão presentes nos controles interativos
- [ ] Verificar com `prefers-reduced-motion`: animações reduzem ou são removidas

---

## 4. Build de Produção

```bash
npm run build
```

Verificar que o build completa sem erros após:
- Instalação de `lucide-angular`
- Atualização do `tailwind.config.js`
- Importação do `BrowserAnimationsModule`
