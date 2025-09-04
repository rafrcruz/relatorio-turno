const { PrismaClient, PostType } = require('@prisma/client');

const prisma = new PrismaClient();

module.exports = { prisma, PostType };
