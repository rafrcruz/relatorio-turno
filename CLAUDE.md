<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan at
`specs/001-ui-visual-redesign/plan.md`
<!-- SPECKIT END -->

# Relatório de Turno — CLAUDE.md

## O que é este projeto

Sistema web de gestão de relatórios de turno para uma planta industrial de alumina (Hydro). Permite que operadores registrem ocorrências por área/data/turno, com categorização (Urgência, Pendência, Anotação), anexos, respostas e exportação em PDF.

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Angular 16+, TypeScript, Tailwind CSS, RxJS, NGX-Quill |
| Backend | Node.js, Express, Prisma ORM, PostgreSQL |
| Deploy | Vercel (backend via `api/index.js`, frontend independente) |
| PDF | PDFKit |
| Upload | Multer (buffer em memória → Bytes no banco) |

## Estrutura

```
relatorio-turno/
├── frontend/src/app/
│   ├── core/               # Serviços (AppStateService, PostsService, AreasService, ...)
│   ├── layout/             # Header, Footer, Notifications
│   └── pages/
│       ├── report/         # Página principal (/relatorio)
│       │   ├── post-composer/   # Formulário de criação de post
│       │   ├── post-list/       # Lista de posts por tipo
│       │   ├── reply-thread/    # Respostas a um post
│       │   └── area-indicators/ # Indicadores da área
│       ├── admin/          # Página admin (vazia por enquanto)
│       └── not-found/
├── backend/src/
│   ├── app.js              # Configuração Express (CORS, rotas, Swagger)
│   ├── server.js           # Entry point (conecta DB, seed de áreas)
│   ├── prisma.js           # Cliente Prisma
│   ├── utils.js            # Helpers (parseNumberParam, parseDateParam, ensureUser...)
│   ├── routes/
│   │   ├── posts.js        # CRUD de posts + respostas
│   │   ├── areas.js        # Listagem de áreas
│   │   ├── reports.js      # PDF export, summary, indicator-values
│   │   ├── attachments.js  # Download de anexos
│   │   └── profile.js      # Perfil de usuário
│   └── middleware/
│       └── upload.js       # Multer (memória)
└── backend/prisma/
    └── schema.prisma       # Models: Area, Post, Reply, Attachment, Indicator, IndicatorValue, AuditLog, User
```

## Comandos essenciais

```bash
# Instalar tudo
npm run install:all

# Dev (frontend + backend simultâneos)
npm run dev
# frontend: http://localhost:4200
# backend:  http://localhost:3000

# Só frontend
npm run dev:frontend

# Só backend
npm run dev:backend

# Build produção
npm run build
```

## Domínio / Áreas da planta

As áreas fixas são (seed automático no servidor):
Recebimento de Bauxita, Digestão, Clarificação, Filtro Prensa, Precipitação, Calcinação, Vapor e Utilidades, Águas e Efluentes, Automação e Energia, Porto, Meio Ambiente

## Turnos

- Turno 1: 06h–14h
- Turno 2: 14h–22h
- Turno 3: 22h–06h
- Timezone: America/Sao_Paulo

## Tipos de post

- `URGENCY` — Urgências (vermelho/bauxite)
- `PENDENCY` — Pendências (amarelo/warm)
- `ANNOTATION` — Anotações (azul/hydro-blue)

## Autenticação

Sem autenticação real ainda. O `x-user-id` header identifica o usuário; `ensureUser()` cria o usuário se não existir. Usuário padrão id=1.

## Indicadores

Por enquanto, o frontend usa dados mockados (`IndicatorsService` gera valores pseudo-aleatórios deterministicamente). O backend tem a infraestrutura de banco pronta (`Indicator`, `IndicatorValue`).

## Variáveis de ambiente (backend)

```
DATABASE_URL=postgresql://...
CORS_ORIGINS=             # origens adicionais separadas por vírgula
FRONTEND_URL=             # URL do frontend em produção
VERCEL_URL=               # setado automaticamente pelo Vercel
PUBLIC_BASE_URL=          # base URL pública para o Swagger
PORT=3000
```

## Deploy (Vercel)

- Backend: `backend/vercel.json` + `backend/api/index.js`
- Frontend: deploy separado em `relatorio-turno-frontend.vercel.app`
- O Prisma usa `DATABASE_URL` via variável de ambiente na Vercel

## Documentação da API

- Swagger UI: `http://localhost:3000/docs`
- JSON spec: `http://localhost:3000/swagger.json`
