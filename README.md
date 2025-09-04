# 📊 Relatório de Turno

Aplicação web completa com **frontend Angular** e **backend Node.js + Express**.

## 🚀 Tecnologias Utilizadas

### Frontend
- **Angular 16** - Framework frontend
- **TypeScript** - Linguagem de programação
- **CSS3** - Estilização moderna e responsiva

### Backend
- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **CORS** - Middleware para comunicação cross-origin

## 📁 Estrutura do Projeto

```
relatorio-turno/
├── backend/                 # Backend Node.js + Express
│   ├── src/
│   │   └── server.js       # Servidor principal
│   └── package.json        # Dependências do backend
├── frontend/               # Frontend Angular
│   ├── src/
│   │   ├── app/           # Componentes da aplicação
│   │   │   ├── app.component.*
│   │   │   └── hello/
│   │   ├── environments/  # Configurações de ambiente
│   │   ├── main.ts        # Ponto de entrada
│   │   └── styles.css     # Estilos globais
│   ├── angular.json       # Configuração Angular CLI
│   ├── tsconfig.json      # Configuração TypeScript
│   └── package.json       # Dependências do frontend
├── package.json            # Scripts principais
└── README.md              # Este arquivo
```

## 🎯 Funcionalidades

- ✅ **Página inicial** com design moderno
- ✅ **Endpoint `/api/hello`** que retorna "Hello World"
- ✅ **Comunicação frontend-backend** via HTTP REST
- ✅ **Hot reload** para desenvolvimento
- ✅ **Interface responsiva** e amigável
- ✅ **Tratamento de erros** de conexão

## 🛠️ Como Executar

### 1. Instalar Dependências
```bash
npm run install:all
```

### 2. Executar em Desenvolvimento
```bash
npm run dev
```

Isso irá rodar:
- **Backend**: http://localhost:3000
- **Frontend**: http://localhost:4200

### 3. Executar Separadamente

#### Backend apenas:
```bash
npm run dev:backend
```

#### Frontend apenas:
```bash
npm run dev:frontend
```

## 🌐 Endpoints da API

### GET `/api/hello`
Retorna uma mensagem de saudação personalizada.

**Resposta:**
```json
{
  "message": "Hello World",
  "timestamp": "2025-09-03T22:00:00.000Z",
  "backend": "Node.js + Express"
}
```

## 🔧 Scripts Disponíveis

- `npm run install:all` - Instala todas as dependências
- `npm run dev` - Executa backend e frontend simultaneamente
- `npm run dev:backend` - Executa apenas o backend
- `npm run dev:frontend` - Executa apenas o frontend
- `npm run build` - Constrói o projeto para produção
- `npm start` - Executa o backend em produção

## 📱 Hot Reload

O projeto está configurado com **hot reload** ativo:
- **Frontend**: Alterações no código Angular são refletidas automaticamente
- **Backend**: Alterações no código Node.js reiniciam o servidor automaticamente

## 🎨 Design

- Interface moderna com gradientes
- Cards com sombras e bordas arredondadas
- Animações suaves de entrada
- Layout responsivo para diferentes dispositivos
- Cores harmoniosas e tipografia legível

## 🔍 Debugging

Para verificar se tudo está funcionando:

1. **Backend**: Acesse http://localhost:3000/api/hello
2. **Frontend**: Acesse http://localhost:4200
3. **Console do navegador**: Verifique se há erros de conexão

## 📝 Próximos Passos

- [ ] Adicionar autenticação
- [ ] Implementar banco de dados
- [ ] Criar mais endpoints da API
- [ ] Adicionar testes automatizados
- [ ] Configurar CI/CD

---

**Desenvolvido com ❤️ por Rafael**
