require('dotenv').config();
require('express-async-errors');

const app = require('./app');
const { prisma } = require('./prisma');

const PORT = process.env.PORT || 3000;

const defaultAreas = [
  { name: 'Recebimento de Bauxita' },
  { name: 'Digestão' },
  { name: 'Clarificação' },
  { name: 'Filtro Prensa' },
  { name: 'Precipitação' },
  { name: 'Calcinação' },
  { name: 'Vapor e Utilidades' },
  { name: 'Águas e Efluentes' },
  { name: 'Automação e Energia' },
  { name: 'Porto' },
  { name: 'Meio Ambiente' },
];

async function seedAreas() {
  const count = await prisma.area.count();
  if (count === 0) {
    await prisma.area.createMany({ data: defaultAreas });
    console.log('🌱 Áreas padrão inseridas');
  }
}

(async () => {
  try {
    await prisma.$connect();
    console.log('✅ Conexão com banco de dados estabelecida');
    await seedAreas();
    app.listen(PORT, () => {
      console.log(`🚀 Backend rodando na porta ${PORT}`);
      console.log(`🌐 CORS habilitado para: http://localhost:4200`);
    });
  } catch (error) {
    console.error('❌ Erro ao conectar ao banco de dados', error);
    process.exit(1);
  }
})();
