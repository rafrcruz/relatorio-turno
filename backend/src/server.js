require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3000;

(async () => {
  try {
    await prisma.$connect();
    console.log('✅ Conexão com banco de dados estabelecida');
  } catch (error) {
    console.error('❌ Erro ao conectar ao banco de dados', error);
    process.exit(1);
  }
})();

// Configuração de middlewares
app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true
}));
app.use(express.json());

// Rota raiz
app.get('/', (req, res) => {
  res.json({ message: 'Backend Node.js + Express funcionando!' });
});

// Endpoint que retorna a mensagem "Hello World"
app.get('/api/hello', (req, res) => {
  res.json({
    message: 'Hello World',
    timestamp: new Date().toISOString(),
    backend: 'Node.js + Express'
  });
});

// Rota que lista relatórios
app.get('/api/reports', async (req, res) => {
  try {
    const reports = await prisma.report.findMany();
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar relatórios' });
  }
});

// Inicializa o servidor
app.listen(PORT, () => {
  console.log(`🚀 Backend rodando na porta ${PORT}`);
  console.log(`🌐 CORS habilitado para: http://localhost:4200`);
  console.log(`📡 Endpoint disponível: http://localhost:${PORT}/api/hello`);
});
