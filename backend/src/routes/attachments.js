const express = require('express');
const { prisma } = require('../prisma');

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
  res.send(att.data);
});

module.exports = router;

