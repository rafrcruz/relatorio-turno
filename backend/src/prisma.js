const { PrismaClient, PostType } = require('@prisma/client');

// Reuse PrismaClient in dev to avoid exhausting DB connections on hot reloads
const globalRef = global;
const prisma = globalRef.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalRef.prisma = prisma;

module.exports = { prisma, PostType };
