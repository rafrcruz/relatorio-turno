const express = require('express');
const { ensureUser, parseNumberParam } = require('../utils');

const router = express.Router();

/**
 * @swagger
 * /api/me:
 *   get:
 *     summary: Retorna informações do usuário autenticado
 *     tags: [Perfil]
 *     responses:
 *       200:
 *         description: Dados do usuário
 *       500:
 *         description: Erro ao buscar usuário
 */
router.get('/me', async (req, res) => {
  try {
    const userId = parseNumberParam(req.header('x-user-id')) || 1;
    const user = await ensureUser(userId);
    res.json({ id: user.id, name: user.name, avatar: user.avatar, role: user.role });
  } catch (error) {
    console.error('Erro ao buscar usuário', error);
    res.status(500).json({ error: 'Erro ao buscar usuário' });
  }
});

module.exports = router;
