const express = require('express');
const { prisma } = require('../prisma');
const { parseNumberParam } = require('../utils');

const router = express.Router();

const DEFAULT_AREAS = [
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

// GET /api/areas
router.get('/', async (req, res) => {
  try {
    const count = await prisma.area.count();
    if (count === 0) {
      await prisma.area.createMany({ data: DEFAULT_AREAS });
    }
    const areas = await prisma.area.findMany();
    res.json(areas);
  } catch (error) {
    console.error('Erro ao buscar áreas', error);
    // Fallback para manter o frontend funcionando caso o DB esteja indisponível
    res.json(DEFAULT_AREAS.map((a, i) => ({ id: i + 1, ...a })));
  }
});

// GET /api/areas/:areaId/indicators
router.get('/:areaId/indicators', async (req, res) => {
  const areaId = parseNumberParam(req.params.areaId);
  if (areaId === undefined) {
    return res.status(400).json({ error: 'Invalid area id' });
  }
  const indicators = await prisma.indicator.findMany({ where: { areaId } });
  res.json(indicators);
});

module.exports = router;

