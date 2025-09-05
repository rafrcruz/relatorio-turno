const express = require('express');
const { prisma } = require('../prisma');
const { parseNumberParam } = require('../utils');

const router = express.Router();

/**
 * @swagger
 * /api/areas:
 *   get:
 *     summary: Lista todas as áreas disponíveis
 *     tags: [Áreas]
 *     responses:
 *       200:
 *         description: Lista de áreas
 */
router.get('/', async (req, res) => {
  try {
    const areas = await prisma.area.findMany();
    res.json(areas);
  } catch (error) {
    console.error('Erro ao buscar áreas', error);
    res.status(500).json({ error: 'Erro ao buscar áreas' });
  }
});

/**
 * @swagger
 * /api/areas/{areaId}/indicators:
 *   get:
 *     summary: Obtém os indicadores de uma área específica
 *     tags: [Áreas]
 *     parameters:
 *       - in: path
 *         name: areaId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de indicadores
 *       400:
 *         description: Invalid area id
 */
router.get('/:areaId/indicators', async (req, res) => {
  const areaId = parseNumberParam(req.params.areaId);
  if (areaId === undefined) {
    return res.status(400).json({ error: 'Invalid area id' });
  }
  const indicators = await prisma.indicator.findMany({ where: { areaId } });
  res.json(indicators);
});

module.exports = router;
