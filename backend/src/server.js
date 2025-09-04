require('dotenv').config();
require('express-async-errors'); // Captura erros de rotas assíncronas automaticamente

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const sanitizeHtml = require('sanitize-html');
const PDFDocument = require('pdfkit');
const compression = require('compression');
const errorhandler = require('errorhandler');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const { PrismaClient, PostType } = require('@prisma/client');

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
  // Align backend upload limits with frontend expectations.
  // Each file may be up to 20MB and the total request size is
  // validated later in the route handler (50MB).
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB per file
  fileFilter: (req, file, cb) => {
    const allowed = ['image/png', 'image/jpeg', 'application/pdf'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Invalid file type'));
  },
});

function parseDate(dateStr) {
  return new Date(`${dateStr}T00:00:00-03:00`);
}

function isValidParam(value) {
  return value !== undefined && value !== null && value !== '' && value !== 'undefined' && value !== 'null';
}

function parseNumberParam(value) {
  if (!isValidParam(value)) return undefined;
  const num = Number(value);
  return Number.isFinite(num) ? num : undefined;
}

function parseDateParam(value) {
  if (!isValidParam(value)) return undefined;
  const date = parseDate(value);
  return isNaN(date.getTime()) ? undefined : date;
}

function parsePostType(value) {
  if (!isValidParam(value)) return undefined;
  return Object.values(PostType).includes(value) ? value : undefined;
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
  } catch (error) {
    console.error('❌ Erro ao conectar ao banco de dados', error);
    process.exit(1);
  }
})();

// Configuração de middlewares
app.use(compression()); // Reduz o tamanho das respostas (gzip)
app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static(uploadDir));

// Configuração do Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Relatório de Turno API',
      version: '1.0.0',
    },
  },
  apis: [path.join(__dirname, '*.js')], // Caminho para as anotações
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rota raiz
app.get('/', (req, res) => {
  res.json({ message: 'Backend Node.js + Express funcionando!' });
});

// Endpoint que retorna a mensagem "Hello World"
/**
 * @openapi
 * /api/hello:
 *   get:
 *     summary: Retorna uma saudação de teste
 *     responses:
 *       200:
 *         description: Mensagem de saudação
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Hello World
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 backend:
 *                   type: string
 */
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
    console.error('Erro ao buscar relatórios', error);
    res.status(500).json({ error: 'Erro ao buscar relatórios' });
  }
});

// ----- Areas -----
app.get('/api/areas', async (req, res) => {
  try {
    const areas = await prisma.area.findMany();
    res.json(areas);
  } catch (error) {
    console.error('Erro ao buscar áreas', error);
    res.status(500).json({ error: 'Erro ao buscar áreas' });
  }
});

// ----- Profile -----
app.get('/api/me', async (req, res) => {
  try {
    const userId = parseNumberParam(req.header('x-user-id')) || 1;
    const user = await ensureUser(userId);
    res.json({ id: user.id, name: user.name, avatar: user.avatar, role: user.role });
  } catch (error) {
    console.error('Erro ao buscar usuário', error);
    res.status(500).json({ error: 'Erro ao buscar usuário' });
  }
});

// ----- Posts -----
app.post('/api/posts', upload.array('attachments'), async (req, res) => {
  try {
    const userId = parseNumberParam(req.header('x-user-id')) || 1;
    const user = await ensureUser(userId);
    const { areaId, date, shift, type, content } = req.body;
    const area = parseNumberParam(areaId);
    const d = parseDateParam(date);
    const s = parseNumberParam(shift);
    const t = parsePostType(type);
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
      // Enforce a 50MB total payload size across all attachments.
      const totalSize = req.files.reduce((sum, f) => sum + f.size, 0);
      if (totalSize > 50 * 1024 * 1024) {
        // Remove uploaded files to free disk space before returning.
        for (const f of req.files) {
          fs.unlink(f.path, () => {});
        }
        return res.status(400).json({ error: 'Total attachments size exceeds 50MB' });
      }

      const attachmentsData = req.files.map((f) => ({
        postId: post.id,
        filename: sanitizeFilename(f.originalname),
        mimeType: f.mimetype,
        size: f.size,
        url: `${req.protocol}://${req.get('host')}/uploads/${f.filename}`,
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
      include: {
        attachments: true,
        author: true,
        _count: { select: { replies: true } },
      },
    });
    res.status(201).json(fullPost);
  } catch (error) {
    console.error('Failed to create post', error);
    res.status(400).json({ error: 'Failed to create post' });
  }
});

app.get('/api/posts', async (req, res) => {
  const { areaId, date, shift, type, page, pageSize } = req.query;
  const filters = {};
  const area = parseNumberParam(areaId);
  if (area !== undefined) filters.areaId = area;
  const d = parseDateParam(date);
  if (d) filters.date = d;
  const s = parseNumberParam(shift);
  if (s !== undefined) filters.shift = s;
  const t = parsePostType(type);
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
  res.json(posts);
});

app.get('/api/posts/:id', async (req, res) => {
  const id = parseNumberParam(req.params.id);
  if (id === undefined) {
    return res.status(400).json({ error: 'Invalid post id' });
  }
  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      attachments: true,
      author: true,
      replies: { include: { attachments: true, author: true } },
      _count: { select: { replies: true } },
    },
  });
  if (!post) return res.status(404).json({ error: 'Post not found' });
  res.json(post);
});

app.delete('/api/posts/:id', async (req, res) => {
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

  const allAttachments = [
    ...post.attachments,
    ...post.replies.flatMap((r) => r.attachments),
  ];
  for (const att of allAttachments) {
    const filePath = path.join(uploadDir, path.basename(att.url));
    fs.unlink(filePath, () => {});
  }

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
app.post('/api/posts/:id/replies', upload.array('attachments'), async (req, res) => {
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
        for (const f of req.files) {
          fs.unlink(f.path, () => {});
        }
        return res.status(400).json({ error: 'Total attachments size exceeds 50MB' });
      }

      const attData = req.files.map((f) => ({
        replyId: reply.id,
        filename: sanitizeFilename(f.originalname),
        mimeType: f.mimetype,
        size: f.size,
        url: `${req.protocol}://${req.get('host')}/uploads/${f.filename}`,
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
  console.error('Failed to create reply', error);
  res.status(400).json({ error: 'Failed to create reply' });
}
});

app.get('/api/posts/:id/replies', async (req, res) => {
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

  res.json({ replies, total });
});

app.delete('/api/posts/:postId/replies/:id', async (req, res) => {
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

  for (const att of reply.attachments) {
    const filePath = path.join(uploadDir, path.basename(att.url));
    fs.unlink(filePath, () => {});
  }

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

// ----- Indicators -----
app.get('/api/areas/:areaId/indicators', async (req, res) => {
  const areaId = parseNumberParam(req.params.areaId);
  if (areaId === undefined) {
    return res.status(400).json({ error: 'Invalid area id' });
  }
  const indicators = await prisma.indicator.findMany({ where: { areaId } });
  res.json(indicators);
});

app.get('/api/indicator-values', async (req, res) => {
  const { areaId, date, shift } = req.query;
  const area = parseNumberParam(areaId);
  const d = parseDateParam(date);
  const s = parseNumberParam(shift);
  if (area === undefined || !d || s === undefined) {
    return res.status(400).json({ error: 'Invalid parameters' });
  }
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
  const area = parseNumberParam(areaId);
  const d = parseDateParam(date);
  const s = parseNumberParam(shift);
  if (area === undefined || !d || s === undefined) {
    return res.json([]);
  }
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
  const userId = parseNumberParam(req.header('x-user-id')) || 1;
  const area = parseNumberParam(areaId);
  const d = parseDateParam(date);
  const s = parseNumberParam(shift);
  if (area === undefined || !d || s === undefined) {
    return res.status(400).json({ error: 'Invalid parameters' });
  }
  try {
    const user = await ensureUser(userId);
    const areaInfo = await prisma.area.findUnique({ where: { id: area } });
    const indicators = await prisma.indicator.findMany({ where: { areaId: area } });
    const indicatorValues = await prisma.indicatorValue.findMany({
      where: { areaId: area, date: d, shift: s },
      include: { indicator: true },
    });
    const posts = await prisma.post.findMany({
      where: { areaId: area, date: d, shift: s },
      orderBy: { createdAt: 'asc' },
      include: {
        attachments: true,
        author: true,
        replies: { include: { attachments: true, author: true } },
      },
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="relatorio-turno.pdf"');

    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    doc.pipe(res);

    const formattedDate = new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
    }).format(d);
    const timestamp = new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      dateStyle: 'short',
      timeStyle: 'medium',
    }).format(new Date());

    doc.fontSize(18).text('Relatório de Turno', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Área: ${areaInfo ? areaInfo.name : 'N/A'}`);
    doc.text(`Data: ${formattedDate}`);
    doc.text(`Turno: ${s}`);
    doc.text(`Gerado por: ${user.name} em ${timestamp}`);
    doc.moveDown();

    doc.fontSize(14).text('Indicadores', { underline: true });
    if (indicators.length === 0) {
      doc.fontSize(12).text('Nenhum indicador disponível.');
    } else {
      indicators.forEach((ind) => {
        const v = indicatorValues.find((iv) => iv.indicatorId === ind.id);
        const value = v ? v.value : 'N/A';
        const unit = ind.unit ? ` ${ind.unit}` : '';
        const target = ind.target ?? 'N/A';
        doc.fontSize(12).text(`${ind.name}: ${value}${unit} (meta ${target})`);
      });
    }

    const types = [
      { key: 'URGENCY', label: 'Urgências' },
      { key: 'PENDENCY', label: 'Pendências' },
      { key: 'ANNOTATION', label: 'Anotações' },
    ];

    types.forEach(({ key, label }, idx) => {
      if (idx > 0) doc.addPage();
      doc.fontSize(16).text(label, { underline: true });
      const filtered = posts.filter((p) => p.type === key);
      if (filtered.length === 0) {
        doc.fontSize(12).text(`Sem ${label.toLowerCase()} registradas neste turno.`);
      }
      filtered.forEach((post) => {
        doc.moveDown();
        const created = new Intl.DateTimeFormat('pt-BR', {
          timeZone: 'America/Sao_Paulo',
          dateStyle: 'short',
          timeStyle: 'short',
        }).format(new Date(post.createdAt));
        doc.fontSize(12).text(`${post.author.name} - ${created}`);
        const plain = sanitizeHtml(post.content || '', { allowedTags: [], allowedAttributes: {} });
        doc.text(plain);
        for (const att of post.attachments) {
          if (att.mimeType.startsWith('image/')) {
            const filePath = path.join(uploadDir, path.basename(att.url));
            if (fs.existsSync(filePath)) {
              doc.image(filePath, { width: 200 });
            } else {
              doc.text(`(imagem indisponível: ${att.filename})`);
            }
          } else {
            doc.fillColor('blue').text(att.filename, { link: att.url, underline: true });
            doc.fillColor('black');
          }
        }
        post.replies.forEach((reply) => {
          const replyTime = new Intl.DateTimeFormat('pt-BR', {
            timeZone: 'America/Sao_Paulo',
            dateStyle: 'short',
            timeStyle: 'short',
          }).format(new Date(reply.createdAt));
          doc.moveDown(0.5);
          doc.fontSize(11).text(`↳ ${reply.author.name} - ${replyTime}`);
          const replyPlain = sanitizeHtml(reply.content || '', { allowedTags: [], allowedAttributes: {} });
          doc.fontSize(11).text(replyPlain, { indent: 20 });
          for (const rAtt of reply.attachments) {
            if (rAtt.mimeType.startsWith('image/')) {
              const filePath = path.join(uploadDir, path.basename(rAtt.url));
              if (fs.existsSync(filePath)) {
                doc.image(filePath, { width: 150, continued: false });
              } else {
                doc.fontSize(10).text(`(imagem indisponível: ${rAtt.filename})`, { indent: 20 });
              }
            } else {
              doc.fillColor('blue').fontSize(10).text(rAtt.filename, { link: rAtt.url, underline: true, indent: 20 });
              doc.fillColor('black').fontSize(11);
            }
          }
        });
      });
    });

    doc.end();

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'EXPORT_PDF',
        targetType: 'Report',
        targetId: area,
      },
    });
    console.log('export_pdf_success', { userId: user.id, areaId: area, date: d, shift: s });
  } catch (error) {
    console.error('export_pdf_error', { userId, areaId: area, date: d, shift: s, error: error.message });
    res.status(500).json({ error: 'Failed to export PDF' });
  }
});

// Middleware de tratamento de erros
if (process.env.NODE_ENV !== 'production') {
  // Em desenvolvimento, utiliza o errorhandler para uma resposta amigável
  app.use(errorhandler());
}

// Middleware global que retorna erros em formato JSON
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const response = {
    error: {
      message: err.message,
    },
  };

  // Inclui stack trace apenas em desenvolvimento
  if (process.env.NODE_ENV !== 'production') {
    response.error.stack = err.stack;
  }

  res.status(status).json(response);
});

// Inicializa o servidor
app.listen(PORT, () => {
  console.log(`🚀 Backend rodando na porta ${PORT}`);
  console.log(`🌐 CORS habilitado para: http://localhost:4200`);
  console.log(`📡 Endpoint disponível: http://localhost:${PORT}/api/hello`);
});
