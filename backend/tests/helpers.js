const { prisma } = require('../src/prisma');

/**
 * Test helpers for indicator-notes integration tests.
 * Requires DATABASE_URL pointing at a disposable test database with the
 * migration applied (`prisma migrate deploy`).
 */

async function ensureArea(name = 'Calcinação') {
  const existing = await prisma.area.findFirst({ where: { name } });
  if (existing) return existing;
  return prisma.area.create({ data: { name } });
}

/** Removes indicator notes (and their attachments) for a context, for isolation. */
async function cleanNotes(areaId) {
  const notes = await prisma.indicatorNote.findMany({ where: { areaId }, select: { id: true } });
  const ids = notes.map((n) => n.id);
  if (ids.length) {
    await prisma.attachment.deleteMany({ where: { indicatorNoteId: { in: ids } } });
    await prisma.indicatorNote.deleteMany({ where: { id: { in: ids } } });
  }
}

async function disconnect() {
  await prisma.$disconnect();
}

module.exports = { prisma, ensureArea, cleanNotes, disconnect };
