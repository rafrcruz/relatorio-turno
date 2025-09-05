const express = require('express');
const path = require('path');
const sanitizeHtml = require('sanitize-html');
const { prisma, PostType } = require('../prisma');
const { upload } = require('../middleware/upload');
const {
  parseNumberParam,
  parseDateParam,
  parsePostType,
  sanitizeFilename,
  ensureUser,
} = require('../utils');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: Endpoints de gerenciamento de posts e respostas
 */

/**
 * @swagger
 * /api/posts:
 *   post:
 *     summary: Cria um novo post
 *     tags: [Posts]
 *     responses:
 *       201:
 *         description: Post criado com sucesso
 *       400:
 *         description: Parâmetros inválidos
 *   get:
 *     summary: Lista posts
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: areaId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: shift
 *         schema:
 *           type: integer
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de posts
 */

/**
 * @swagger
 * /api/posts/{id}:
 *   get:
 *     summary: Obtém um post específico
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Post encontrado
 *       404:
 *         description: Post não encontrado
 *   delete:
 *     summary: Remove um post
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Post removido
 *       404:
 *         description: Post não encontrado
 */

/**
 * @swagger
 * /api/posts/{id}/replies:
 *   post:
 *     summary: Adiciona uma resposta a um post
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       201:
 *         description: Resposta criada
 *       400:
 *         description: Parâmetros inválidos
 *   get:
 *     summary: Lista respostas de um post
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de respostas
 */

/**
 * @swagger
 * /api/posts/{postId}/replies/{id}:
 *   delete:
 *     summary: Remove uma resposta de um post
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Resposta removida
 *       404:
 *         description: Resposta não encontrada
 */

function buildBaseUrl(req) {
  return `${req.protocol}://${req.get('host')}`;
}

function mapAttachmentUrls(baseUrl, attachments) {
  return attachments.map((a) => ({
    ...a,
    url: `${baseUrl}/api/attachments/${a.id}`,
  }));
}

// Create post
router.post('/', upload.array('attachments'), async (req, res) => {
  try {
    const userId = parseNumberParam(req.header('x-user-id')) || 1;
    const user = await ensureUser(userId);
    const { areaId, date, shift, type, content } = req.body;
    const area = parseNumberParam(areaId);
    const d = parseDateParam(date);
    const s = parseNumberParam(shift);
    const t = parsePostType(type, PostType);
    if (area === undefined || !d || s === undefined || !t) {
      return res.status(400).json({ error: 'Invalid post parameters' });
    }
    const areaExists = await prisma.area.findUnique({ where: { id: area } });
    if (!areaExists) {
      return res.status(400).json({ error: 'Invalid area' });
    }
    const sanitized = sanitizeHtml(content || '');
    const post = await prisma.post.create({
      data: {
        areaId: area,
        date: d,
        shift: s,
        type: t,
        content: sanitized,
        authorId: user.id,
      },
    });

    if (req.files && req.files.length) {
      const totalSize = req.files.reduce((sum, f) => sum + f.size, 0);
      if (totalSize > 50 * 1024 * 1024) {
        return res.status(400).json({ error: 'Total attachments size exceeds 50MB' });
      }

      const attachmentsData = req.files.map((f) => ({
        postId: post.id,
        filename: sanitizeFilename(f.originalname),
        mimeType: f.mimetype,
        size: f.size,
        // url will be computed dynamically; keeping field for backward comp.
        url: `${buildBaseUrl(req)}/api/attachments/temp`,
        data: f.buffer,
      }));
      await prisma.attachment.createMany({ data: attachmentsData });
    }

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'CREATE_POST',
        targetType: 'Post',
        targetId: post.id,
      },
    });

    let fullPost = await prisma.post.findUnique({
      where: { id: post.id },
      include: {
        attachments: true,
        author: true,
        _count: { select: { replies: true } },
      },
    });
    // Map URLs to attachment download endpoints
    const baseUrl = buildBaseUrl(req);
    fullPost = {
      ...fullPost,
      attachments: mapAttachmentUrls(baseUrl, fullPost.attachments),
    };
    res.status(201).json(fullPost);
  } catch (error) {
    console.error('Failed to create post', error);
    res.status(400).json({ error: 'Failed to create post' });
  }
});

// List posts
router.get('/', async (req, res) => {
  try {
    const { areaId, date, shift, type, page, pageSize } = req.query;
    const filters = {};
    const area = parseNumberParam(areaId);
    if (area !== undefined) filters.areaId = area;
    const d = parseDateParam(date);
    if (d) filters.date = d;
    const s = parseNumberParam(shift);
    if (s !== undefined) filters.shift = s;
    const t = parsePostType(type, PostType);
    if (t) filters.type = t;
    const pageNum = parseNumberParam(page) ?? 1;
    const pageSizeNum = parseNumberParam(pageSize) ?? 10;
    const posts = await prisma.post.findMany({
      where: filters,
      orderBy: { createdAt: 'desc' },
      skip: (pageNum - 1) * pageSizeNum,
      take: pageSizeNum,
      include: {
        attachments: true,
        author: true,
        _count: { select: { replies: true } },
      },
    });
    const baseUrl = buildBaseUrl(req);
    const mapped = posts.map((p) => ({
      ...p,
      attachments: mapAttachmentUrls(baseUrl, p.attachments),
    }));
    res.json(mapped);
  } catch (error) {
    console.error('Erro ao listar posts', error);
    res.json([]);
  }
});

// Get single post
router.get('/:id', async (req, res) => {
  const id = parseNumberParam(req.params.id);
  if (id === undefined) {
    return res.status(400).json({ error: 'Invalid post id' });
  }
  let post = await prisma.post.findUnique({
    where: { id },
    include: {
      attachments: true,
      author: true,
      replies: { include: { attachments: true, author: true } },
      _count: { select: { replies: true } },
    },
  });
  if (!post) return res.status(404).json({ error: 'Post not found' });
  const baseUrl = buildBaseUrl(req);
  post = {
    ...post,
    attachments: mapAttachmentUrls(baseUrl, post.attachments),
    replies: post.replies.map((r) => ({
      ...r,
      attachments: mapAttachmentUrls(baseUrl, r.attachments),
    })),
  };
  res.json(post);
});

// Delete post
router.delete('/:id', async (req, res) => {
  const id = parseNumberParam(req.params.id);
  if (id === undefined) {
    return res.status(400).json({ error: 'Invalid post id' });
  }
  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      attachments: true,
      replies: { include: { attachments: true } },
    },
  });
  if (!post) return res.status(404).json({ error: 'Post not found' });

  const userId = parseNumberParam(req.header('x-user-id')) || 1;
  const user = await ensureUser(userId);

  await prisma.attachment.deleteMany({
    where: {
      OR: [{ postId: id }, { reply: { postId: id } }],
    },
  });
  await prisma.reply.deleteMany({ where: { postId: id } });
  await prisma.post.delete({ where: { id } });

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: 'DELETE_POST',
      targetType: 'Post',
      targetId: id,
    },
  });

  res.json({ success: true });
});

// ----- Replies -----
router.post('/:id/replies', upload.array('attachments'), async (req, res) => {
  try {
    const postId = parseNumberParam(req.params.id);
    if (postId === undefined) {
      return res.status(400).json({ error: 'Invalid post id' });
    }
    const userId = parseNumberParam(req.header('x-user-id')) || 1;
    const user = await ensureUser(userId);
    const sanitized = sanitizeHtml(req.body.content || '');
    const reply = await prisma.reply.create({
      data: {
        postId,
        authorId: user.id,
        content: sanitized,
      },
    });

    if (req.files && req.files.length) {
      const totalSize = req.files.reduce((sum, f) => sum + f.size, 0);
      if (totalSize > 50 * 1024 * 1024) {
        return res.status(400).json({ error: 'Total attachments size exceeds 50MB' });
      }

      const attData = req.files.map((f) => ({
        replyId: reply.id,
        filename: sanitizeFilename(f.originalname),
        mimeType: f.mimetype,
        size: f.size,
        url: `${buildBaseUrl(req)}/api/attachments/temp`,
        data: f.buffer,
      }));
      await prisma.attachment.createMany({ data: attData });
    }

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'CREATE_REPLY',
        targetType: 'Reply',
        targetId: reply.id,
      },
    });

    let fullReply = await prisma.reply.findUnique({
      where: { id: reply.id },
      include: { attachments: true },
    });
    const baseUrl = buildBaseUrl(req);
    fullReply = {
      ...fullReply,
      attachments: mapAttachmentUrls(baseUrl, fullReply.attachments),
    };
    res.status(201).json(fullReply);
  } catch (error) {
    console.error('Failed to create reply', error);
    res.status(400).json({ error: 'Failed to create reply' });
  }
});

router.get('/:id/replies', async (req, res) => {
  const postId = parseNumberParam(req.params.id);
  if (postId === undefined) {
    return res.status(400).json({ error: 'Invalid post id' });
  }
  const { page, pageSize } = req.query;
  const pageNum = parseNumberParam(page) ?? 1;
  const pageSizeNum = parseNumberParam(pageSize) ?? 10;
  const skip = (pageNum - 1) * pageSizeNum;

  const [replies, total] = await Promise.all([
    prisma.reply.findMany({
      where: { postId },
      orderBy: { createdAt: 'asc' },
      skip,
      take: pageSizeNum,
      include: { attachments: true, author: true },
    }),
    prisma.reply.count({ where: { postId } }),
  ]);

  const baseUrl = buildBaseUrl(req);
  const mappedReplies = replies.map((r) => ({
    ...r,
    attachments: mapAttachmentUrls(baseUrl, r.attachments),
  }));
  res.json({ replies: mappedReplies, total });
});

router.delete('/:postId/replies/:id', async (req, res) => {
  const postId = parseNumberParam(req.params.postId);
  const id = parseNumberParam(req.params.id);
  if (postId === undefined || id === undefined) {
    return res.status(400).json({ error: 'Invalid ids' });
  }
  const reply = await prisma.reply.findUnique({
    where: { id },
    include: { attachments: true },
  });
  if (!reply || reply.postId !== postId) {
    return res.status(404).json({ error: 'Reply not found' });
  }

  const userId = parseNumberParam(req.header('x-user-id')) || 1;
  const user = await ensureUser(userId);

  await prisma.attachment.deleteMany({ where: { replyId: id } });
  await prisma.reply.delete({ where: { id } });

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: 'DELETE_REPLY',
      targetType: 'Reply',
      targetId: id,
    },
  });

  res.json({ success: true });
});

module.exports = router;
