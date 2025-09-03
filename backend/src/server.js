const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true
}));
app.use(express.json());

// Rota principal
app.get('/', (req, res) => {
  res.json({ message: 'Backend Node.js + Express funcionando!' });
});

// Endpoint que retorna "Olá Rafael"
app.get('/api/hello', (req, res) => {
  res.json({
    message: 'Olá Rafael',
    timestamp: new Date().toISOString(),
    backend: 'Node.js + Express'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Backend rodando na porta ${PORT}`);
  console.log(`🌐 CORS habilitado para: http://localhost:4200`);
  console.log(`📡 Endpoint disponível: http://localhost:${PORT}/api/hello`);
});
