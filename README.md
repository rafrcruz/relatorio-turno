# 📊 Relatório de Turno

Sistema de gestão de relatórios de turno desenvolvido para facilitar a comunicação entre equipes e o registro de ocorrências durante os turnos de trabalho.

<div align="center">
  <img src="https://img.shields.io/badge/angular-%23DD0031.svg?style=for-the-badge&logo=angular&logoColor=white" alt="Angular">
  <img src="https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB" alt="Express.js">
  <img src="https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white" alt="Prisma">
</div>

## 🚀 Recursos Principais

- **Registro de Ocorrências**: Crie e gerencie ocorrências por turno
- **Categorização**: Classifique as ocorrências em Anotações, Urgências ou Pendências
- **Anexos**: Adicione arquivos às ocorrências
- **Relatórios em PDF**: Exporte relatórios completos
- **Interface Responsiva**: Acessível em diferentes dispositivos
- **Gestão de Áreas**: Organize por diferentes áreas da empresa

## 🛠️ Tecnologias Utilizadas

### Frontend
- **Angular 16+** - Framework frontend
- **TypeScript** - Linguagem de programação tipada
- **Tailwind CSS** - Framework CSS utilitário
- **RxJS** - Para programação reativa
- **NGX-Quill** - Editor de texto rico
- **Date-fns** - Manipulação de datas

### Backend
- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **Prisma** - ORM para banco de dados
- **JWT** - Autenticação
- **Multer** - Upload de arquivos
- **PDFKit** - Geração de relatórios em PDF

## 📦 Estrutura do Projeto

```
relatorio-turno/
├── backend/               # Código do servidor
│   ├── prisma/           # Schema e migrações do banco de dados
│   ├── src/
│   │   ├── routes/       # Rotas da API
│   │   ├── middleware/   # Middlewares do Express
│   │   └── server.js     # Ponto de entrada do servidor
│   └── .env.example      # Variáveis de ambiente de exemplo
│
├── frontend/             # Aplicação Angular
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/     # Serviços e modelos
│   │   │   ├── layout/   # Componentes de layout
│   │   │   └── pages/    # Páginas da aplicação
│   │   └── assets/       # Recursos estáticos
│   └── angular.json      # Configuração do Angular
│
├── .gitignore
├── package.json          # Scripts e dependências raiz
└── README.md             # Este arquivo
```

## 🚀 Começando

### Pré-requisitos

- Node.js 16+
- npm 8+
- Banco de dados (PostgreSQL/MySQL/SQLite)

### Instalação

1. **Clonar o repositório**
   ```bash
   git clone [URL_DO_REPOSITORIO]
   cd relatorio-turno
   ```

2. **Instalar dependências**
   ```bash
   # Instalar dependências do projeto raiz
   npm install
   
   # Instalar dependências do frontend e backend
   npm run install:all
   ```

3. **Configurar ambiente**
   - Copiar `.env.example` para `.env` no diretório backend
   - Configurar as variáveis de ambiente necessárias

4. **Iniciar o servidor de desenvolvimento**
   ```bash
   # Iniciar frontend e backend em modo de desenvolvimento
   npm run dev
   ```

   O frontend estará disponível em `http://localhost:4200`
   O backend estará disponível em `http://localhost:3000`

## 🏗️ Build para Produção

```bash
# Build para produção
npm run build

# Iniciar servidor em produção
npm start
```

## 🤝 Contribuição

Contribuições são bem-vindas! Siga estes passos:

1. Faça um Fork do projeto
2. Crie uma Branch para sua Feature (`git checkout -b feature/AmazingFeature`)
3. Adicione suas mudanças (`git add .`)
4. Comite suas mudanças (`git commit -m 'Add some AmazingFeature'`)
5. Faça o Push da Branch (`git push origin feature/AmazingFeature`)
6. Abra um Pull Request

## 📄 Licença

Distribuído sob a licença MIT. Veja `LICENSE` para mais informações.

## ✉️ Contato

Equipe de Desenvolvimento - [seu-email@exemplo.com]

Link do Projeto: [https://github.com/seu-usuario/relatorio-turno](https://github.com/seu-usuario/relatorio-turno)
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

## 🗂 Organização do Repositório

Este projeto é mantido na branch principal `main` e utiliza uma estrutura de monorepositório:

- `frontend/` – aplicação Angular.
- `backend/` – API Node.js + Express.

Utilize **Issues** e **Pull Requests** para relatar problemas ou propor melhorias.

## 🤝 Contribuindo

Contribuições são bem-vindas! Para colaborar:

1. Faça um fork do repositório
2. Crie uma branch (`git checkout -b feature/minha-feature`)
3. Faça commit das alterações (`git commit -m 'feat: minha nova feature'`)
4. Faça push para a branch (`git push origin feature/minha-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está licenciado sob a **MIT License**. Consulte o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📫 Contato

Para dúvidas ou sugestões, abra uma issue no repositório.

## 📝 Próximos Passos

- [ ] Adicionar autenticação
- [ ] Implementar banco de dados
- [ ] Criar mais endpoints da API
- [ ] Adicionar testes automatizados
- [ ] Configurar CI/CD

---

**Desenvolvido com ❤️ por Rafael**
