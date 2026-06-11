const express = require('express');
const { prisma } = require('../prisma');
const { parseNumberParam, ensureUser } = require('../utils');

const router = express.Router();

// Download or view an attachment by id
router.get('/attachments/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid id' });
  const att = await prisma.attachment.findUnique({ where: { id } });
  if (!att) return res.status(404).json({ error: 'Attachment not found' });
  if (!att.data) return res.status(404).json({ error: 'Attachment data not available' });

  res.setHeader('Content-Type', att.mimeType || 'application/octet-stream');
  // For non-images, suggest download; for images, show inline
  const disposition = att.mimeType && att.mimeType.startsWith('image/') ? 'inline' : 'attachment';
  res.setHeader('Content-Disposition', `${disposition}; filename="${att.filename}"`);
  // Ensure the response sends a Node.js Buffer
  res.send(Buffer.from(att.data));
});

// Delete a single attachment (restricted to indicator-note attachments).
router.delete('/attachments/:id', async (req, res) => {
  const id = parseNumberParam(req.params.id);
  if (id === undefined) return res.status(400).json({ error: 'Invalid id' });
  const att = await prisma.attachment.findUnique({ where: { id } });
  if (!att) return res.status(404).json({ error: 'Attachment not found' });
  if (att.indicatorNoteId == null) {
    return res.status(403).json({ error: 'Only indicator note attachments can be removed here' });
  }
  const userId = parseNumberParam(req.header('x-user-id')) || 1;
  const user = await ensureUser(userId);
  await prisma.attachment.delete({ where: { id } });
  await prisma.auditLog.create({
    data: { userId: user.id, action: 'DELETE_ATTACHMENT', targetType: 'Attachment', targetId: id },
  });
  res.json({ success: true });
});

module.exports = router;

