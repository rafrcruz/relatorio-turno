const express = require('express');
const sanitizeHtml = require('sanitize-html');
const PDFDocument = require('pdfkit');
const { prisma } = require('../prisma');
const {
  parseNumberParam,
  parseDateParam,
  ensureUser,
} = require('../utils');

const router = express.Router();

// List saved reports (placeholder/simple example)
router.get('/reports', async (req, res) => {
  try {
    const reports = await prisma.report.findMany();
    res.json(reports);
  } catch (error) {
    console.error('Erro ao buscar relatórios', error);
    res.status(500).json({ error: 'Erro ao buscar relatórios' });
  }
});

// Indicator values
router.get('/indicator-values', async (req, res) => {
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

// Post type summary
router.get('/summary', async (req, res) => {
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

// Export PDF (reads attachments from DB)
router.post('/export', async (req, res) => {
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

    const baseUrl = `${req.protocol}://${req.get('host')}`;
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
            if (att.data) {
              try {
                doc.image(att.data, { width: 200 });
              } catch (e) {
                doc.text(`(imagem indisponível: ${att.filename})`);
              }
            } else {
              doc.text(`(imagem indisponível: ${att.filename})`);
            }
          } else {
            const attUrl = `${baseUrl}/api/attachments/${att.id}`;
            doc.fillColor('blue').text(att.filename, { link: attUrl, underline: true });
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
              if (rAtt.data) {
                try {
                  doc.image(rAtt.data, { width: 150, continued: false });
                } catch (e) {
                  doc.fontSize(10).text(`(imagem indisponível: ${rAtt.filename})`, { indent: 20 });
                }
              } else {
                doc.fontSize(10).text(`(imagem indisponível: ${rAtt.filename})`, { indent: 20 });
              }
            } else {
              const rAttUrl = `${baseUrl}/api/attachments/${rAtt.id}`;
              doc.fillColor('blue').fontSize(10).text(rAtt.filename, { link: rAttUrl, underline: true, indent: 20 });
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

module.exports = router;

