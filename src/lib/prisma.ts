import { PrismaClient } from '@prisma/client';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Watchlist operations
export async function fetchWatchlistPrisma(userId: string): Promise<string[]> {
  try {
    const watchlist = await prisma.watchlist.findUnique({
      where: { userId },
      select: { coins: true },
    });

    return watchlist?.coins || [];
  } catch (error) {
    console.error('Error fetching watchlist from Prisma:', error);
    return [];
  }
}

export async function updateWatchlistPrisma(
  userId: string,
  coins: string[]
): Promise<boolean> {
  try {
    await prisma.watchlist.upsert({
      where: { userId },
      update: {
        coins,
        updatedAt: new Date(),
      },
      create: {
        userId,
        coins,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return true;
  } catch (error) {
    console.error('Error updating watchlist in Prisma:', error);
    return false;
  }
}

export async function testPrismaConnection(): Promise<boolean> {
  try {
    // Try to query the database
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Prisma connection test failed:', error);
    return false;
  }
}
