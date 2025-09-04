require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const sanitizeHtml = require('sanitize-html');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3000;

// ensure upload directory exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  dest: uploadDir,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/png', 'image/jpeg', 'application/pdf'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Invalid file type'));
  },
});

function parseDate(dateStr) {
  return new Date(`${dateStr}T00:00:00-03:00`);
}

// Replace potentially dangerous characters from original file names.
function sanitizeFilename(name) {
  return path.basename(name).replace(/[^a-zA-Z0-9._-]/g, '_');
}

async function ensureUser(id) {
  return prisma.user.upsert({
    where: { id },
    update: {},
    create: {
      id,
      name: `User ${id}`,
      email: `user${id}@example.com`,
      role: 'OPERATOR',
    },
  });
}

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
app.use('/uploads', express.static(uploadDir));

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

// ----- Areas -----
app.get('/api/areas', async (req, res) => {
  const areas = await prisma.area.findMany();
  res.json(areas);
});

// ----- Profile -----
app.get('/api/me', async (req, res) => {
  const userId = Number(req.header('x-user-id')) || 1;
  const user = await ensureUser(userId);
  res.json({ id: user.id, name: user.name, avatar: user.avatar, role: user.role });
});

// ----- Posts -----
app.post('/api/posts', upload.array('attachments'), async (req, res) => {
  try {
    const userId = Number(req.header('x-user-id')) || 1;
    const user = await ensureUser(userId);
    const { areaId, date, shift, type, content } = req.body;
    const sanitized = sanitizeHtml(content || '');
    const post = await prisma.post.create({
      data: {
        areaId: Number(areaId),
        date: parseDate(date),
        shift: Number(shift),
        type,
        content: sanitized,
        authorId: user.id,
      },
    });

    if (req.files && req.files.length) {
      const attachmentsData = req.files.map((f) => ({
        postId: post.id,
        filename: sanitizeFilename(f.originalname),
        mimeType: f.mimetype,
        size: f.size,
        url: `/uploads/${f.filename}`,
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

    const fullPost = await prisma.post.findUnique({
      where: { id: post.id },
      include: { attachments: true },
    });
    res.status(201).json(fullPost);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create post' });
  }
});

app.get('/api/posts', async (req, res) => {
  const { areaId, date, shift, type, page = 1, pageSize = 10 } = req.query;
  const filters = {};
  if (areaId) filters.areaId = Number(areaId);
  if (date) filters.date = parseDate(date);
  if (shift) filters.shift = Number(shift);
  if (type) filters.type = type;
  const posts = await prisma.post.findMany({
    where: filters,
    orderBy: { createdAt: 'desc' },
    skip: (Number(page) - 1) * Number(pageSize),
    take: Number(pageSize),
    include: { attachments: true },
  });
  res.json(posts);
});

app.get('/api/posts/:id', async (req, res) => {
  const id = Number(req.params.id);
  const post = await prisma.post.findUnique({
    where: { id },
    include: { attachments: true, replies: { include: { attachments: true } } },
  });
  if (!post) return res.status(404).json({ error: 'Post not found' });
  res.json(post);
});

// ----- Replies -----
app.post('/api/posts/:id/replies', upload.array('attachments'), async (req, res) => {
  try {
    const postId = Number(req.params.id);
    const userId = Number(req.header('x-user-id')) || 1;
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
      const attData = req.files.map((f) => ({
        replyId: reply.id,
        filename: sanitizeFilename(f.originalname),
        mimeType: f.mimetype,
        size: f.size,
        url: `/uploads/${f.filename}`,
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

    const fullReply = await prisma.reply.findUnique({
      where: { id: reply.id },
      include: { attachments: true },
    });
    res.status(201).json(fullReply);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create reply' });
  }
});

app.get('/api/posts/:id/replies', async (req, res) => {
  const postId = Number(req.params.id);
  const replies = await prisma.reply.findMany({
    where: { postId },
    orderBy: { createdAt: 'asc' },
    include: { attachments: true },
  });
  res.json(replies);
});

// ----- Indicators -----
app.get('/api/areas/:areaId/indicators', async (req, res) => {
  const areaId = Number(req.params.areaId);
  const indicators = await prisma.indicator.findMany({ where: { areaId } });
  res.json(indicators);
});

app.get('/api/indicator-values', async (req, res) => {
  const { areaId, date, shift } = req.query;
  const area = Number(areaId);
  const d = parseDate(date);
  const s = Number(shift);
  const values = await prisma.indicatorValue.findMany({
    where: { areaId: area, date: d, shift: s },
    include: { indicator: true },
  });
  if (values.length === 0) {
    const indicators = await prisma.indicator.findMany({ where: { areaId: area } });
    const mock = indicators.map((ind) => ({
      indicator: ind,
      value: 0,
      source: 'mock',
    }));
    return res.json(mock);
  }
  res.json(values);
});

// ----- Summary -----
app.get('/api/summary', async (req, res) => {
  const { areaId, date, shift } = req.query;
  const area = Number(areaId);
  const d = parseDate(date);
  const s = Number(shift);
  const counts = await prisma.post.groupBy({
    where: { areaId: area, date: d, shift: s },
    by: ['type'],
    _count: { _all: true },
  });
  res.json(counts);
});

// ----- Export -----
app.post('/api/export', async (req, res) => {
  const { areaId, date, shift } = req.body;
  res.json({
    status: 'queued',
    areaId: Number(areaId),
    date,
    shift: Number(shift),
    message: 'PDF export not implemented in MVP',
  });
});

// Inicializa o servidor
app.listen(PORT, () => {
  console.log(`🚀 Backend rodando na porta ${PORT}`);
  console.log(`🌐 CORS habilitado para: http://localhost:4200`);
  console.log(`📡 Endpoint disponível: http://localhost:${PORT}/api/hello`);
});
