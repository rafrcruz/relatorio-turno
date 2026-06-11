const express = require('express');
const sanitizeHtml = require('sanitize-html');
const { prisma } = require('../prisma');
const { upload } = require('../middleware/upload');
const {
  parseNumberParam,
  parseDateParam,
  sanitizeFilename,
  ensureUser,
} = require('../utils');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: IndicatorNotes
 *   description: Apontamentos e marcação de passagem por indicador (por contexto área/data/turno)
 */

function buildBaseUrl(req) {
  return `${req.protocol}://${req.get('host')}`;
}

function mapAttachmentUrls(baseUrl, attachments) {
  return (attachments || []).map((a) => ({
    ...a,
    url: `${baseUrl}/api/attachments/${a.id}`,
  }));
}

/** Returns true if the HTML content has non-empty text after stripping tags. */
function hasContent(html) {
  const text = sanitizeHtml(html || '', { allowedTags: [], allowedAttributes: {} }).trim();
  return text.length > 0;
}

/** Serializes a note for the API, computing hasApontamento and attachment URLs. */
function serializeNote(req, note) {
  const baseUrl = buildBaseUrl(req);
  return {
    id: note.id,
    areaId: note.areaId,
    indicatorCode: note.indicatorCode,
    date: note.date,
    shift: note.shift,
    content: note.content,
    hasApontamento: hasContent(note.content),
    includedInHandover: note.includedInHandover,
    author: note.author ? { id: note.author.id, name: note.author.name } : undefined,
    attachments: mapAttachmentUrls(baseUrl, note.attachments),
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
  };
}

/**
 * Removes a note when it carries no content, no attachments and no handover mark.
 * Returns true if the note was removed.
 */
async function pruneIfEmpty(noteId) {
  const note = await prisma.indicatorNote.findUnique({
    where: { id: noteId },
    include: { attachments: true },
  });
  if (!note) return true;
  const empty = !hasContent(note.content) && note.attachments.length === 0 && !note.includedInHandover;
  if (empty) {
    await prisma.attachment.deleteMany({ where: { indicatorNoteId: noteId } });
    await prisma.indicatorNote.delete({ where: { id: noteId } });
    return true;
  }
  return false;
}

/**
 * @swagger
 * /api/indicator-notes:
 *   get:
 *     summary: Lista apontamentos/marcações do contexto
 *     tags: [IndicatorNotes]
 *     parameters:
 *       - in: query
 *         name: areaId
 *         required: true
 *         schema: { type: integer }
 *       - in: query
 *         name: date
 *         required: true
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: shift
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Lista de notas do contexto }
 *       400: { description: Parâmetros inválidos }
 */
router.get('/', async (req, res) => {
  try {
    const areaId = parseNumberParam(req.query.areaId);
    const date = parseDateParam(req.query.date);
    const shift = parseNumberParam(req.query.shift);
    if (areaId === undefined || !date || shift === undefined) {
      return res.status(400).json({ error: 'Invalid context parameters' });
    }
    const notes = await prisma.indicatorNote.findMany({
      where: { areaId, date, shift },
      include: { attachments: true, author: true },
      orderBy: { indicatorCode: 'asc' },
    });
    res.json(notes.map((n) => serializeNote(req, n)));
  } catch (error) {
    console.error('Erro ao listar indicator-notes', error);
    res.json([]);
  }
});

/**
 * @swagger
 * /api/indicator-notes:
 *   post:
 *     summary: Cria ou atualiza (upsert) o apontamento/marcação de um indicador
 *     tags: [IndicatorNotes]
 *     responses:
 *       200: { description: Nota criada/atualizada (ou removida se vazia) }
 *       400: { description: Parâmetros inválidos }
 */
router.post('/', upload.array('attachments'), async (req, res) => {
  try {
    const userId = parseNumberParam(req.header('x-user-id')) || 1;
    const user = await ensureUser(userId);
    const { indicatorCode } = req.body;
    const areaId = parseNumberParam(req.body.areaId);
    const date = parseDateParam(req.body.date);
    const shift = parseNumberParam(req.body.shift);
    if (areaId === undefined || !indicatorCode || !date || shift === undefined) {
      return res.status(400).json({ error: 'Invalid indicator note parameters' });
    }
    const areaExists = await prisma.area.findUnique({ where: { id: areaId } });
    if (!areaExists) {
      return res.status(400).json({ error: 'Invalid area' });
    }

    const sanitized = sanitizeHtml(req.body.content || '');
    const handoverProvided = req.body.includedInHandover !== undefined;
    const includedInHandover = String(req.body.includedInHandover) === 'true';

    const key = { areaId_indicatorCode_date_shift: { areaId, indicatorCode, date, shift } };
    const existing = await prisma.indicatorNote.findUnique({ where: key });
    const isCreate = !existing;

    const note = await prisma.indicatorNote.upsert({
      where: key,
      create: {
        areaId,
        indicatorCode,
        date,
        shift,
        content: sanitized,
        includedInHandover: handoverProvided ? includedInHandover : false,
        authorId: user.id,
      },
      update: {
        content: sanitized,
        ...(handoverProvided ? { includedInHandover } : {}),
      },
    });

    if (req.files && req.files.length) {
      const totalSize = req.files.reduce((sum, f) => sum + f.size, 0);
      if (totalSize > 50 * 1024 * 1024) {
        return res.status(400).json({ error: 'Total attachments size exceeds 50MB' });
      }
      const attData = req.files.map((f) => ({
        indicatorNoteId: note.id,
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
        action: isCreate ? 'CREATE_INDICATOR_NOTE' : 'UPDATE_INDICATOR_NOTE',
        targetType: 'IndicatorNote',
        targetId: note.id,
      },
    });

    // Persistence rule: drop the record if it ended up empty.
    const removed = await pruneIfEmpty(note.id);
    if (removed) return res.json({ removed: true });

    const full = await prisma.indicatorNote.findUnique({
      where: { id: note.id },
      include: { attachments: true, author: true },
    });
    res.json(serializeNote(req, full));
  } catch (error) {
    console.error('Failed to upsert indicator note', error);
    res.status(400).json({ error: 'Failed to save indicator note' });
  }
});

/**
 * @swagger
 * /api/indicator-notes/{id}/handover:
 *   patch:
 *     summary: Alterna a marcação de passagem de uma nota
 *     tags: [IndicatorNotes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Nota atualizada (ou removida se vazia) }
 *       404: { description: Nota não encontrada }
 */
router.patch('/:id/handover', async (req, res) => {
  const id = parseNumberParam(req.params.id);
  if (id === undefined) {
    return res.status(400).json({ error: 'Invalid note id' });
  }
  const note = await prisma.indicatorNote.findUnique({ where: { id } });
  if (!note) return res.status(404).json({ error: 'Note not found' });

  const userId = parseNumberParam(req.header('x-user-id')) || 1;
  const user = await ensureUser(userId);
  const includedInHandover = req.body.includedInHandover === true || String(req.body.includedInHandover) === 'true';

  await prisma.indicatorNote.update({ where: { id }, data: { includedInHandover } });
  await prisma.auditLog.create({
    data: { userId: user.id, action: 'TOGGLE_HANDOVER', targetType: 'IndicatorNote', targetId: id },
  });

  const removed = await pruneIfEmpty(id);
  if (removed) return res.json({ removed: true });

  const full = await prisma.indicatorNote.findUnique({
    where: { id },
    include: { attachments: true, author: true },
  });
  res.json(serializeNote(req, full));
});

/**
 * @swagger
 * /api/indicator-notes/{id}:
 *   delete:
 *     summary: Remove o apontamento/marcação e seus anexos
 *     tags: [IndicatorNotes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Removido }
 *       404: { description: Nota não encontrada }
 */
router.delete('/:id', async (req, res) => {
  const id = parseNumberParam(req.params.id);
  if (id === undefined) {
    return res.status(400).json({ error: 'Invalid note id' });
  }
  const note = await prisma.indicatorNote.findUnique({ where: { id } });
  if (!note) return res.status(404).json({ error: 'Note not found' });

  const userId = parseNumberParam(req.header('x-user-id')) || 1;
  const user = await ensureUser(userId);

  await prisma.attachment.deleteMany({ where: { indicatorNoteId: id } });
  await prisma.indicatorNote.delete({ where: { id } });
  await prisma.auditLog.create({
    data: { userId: user.id, action: 'DELETE_INDICATOR_NOTE', targetType: 'IndicatorNote', targetId: id },
  });

  res.json({ success: true });
});

module.exports = router;
