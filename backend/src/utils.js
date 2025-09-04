const path = require('path');
const { prisma } = require('./prisma');

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

function parsePostType(value, PostType) {
  if (!isValidParam(value)) return undefined;
  return Object.values(PostType).includes(value) ? value : undefined;
}

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

module.exports = {
  parseDate,
  isValidParam,
  parseNumberParam,
  parseDateParam,
  parsePostType,
  sanitizeFilename,
  ensureUser,
};
