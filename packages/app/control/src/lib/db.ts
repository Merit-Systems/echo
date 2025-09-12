import { PrismaClient } from '@/generated/prisma';
import { logger } from '@/logger';

declare global {
  var prisma: PrismaClient | undefined;
}

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  logger.emit({
    body: 'Initializing Prisma client in production',
    severityText: 'INFO',
  });
  prisma = new PrismaClient();
} else {
  if (!globalThis.prisma) {
    globalThis.prisma = new PrismaClient();
  }
  prisma = globalThis.prisma;
}

export { prisma as db };
