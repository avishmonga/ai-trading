import {
  fetchWatchlistPrisma,
  updateWatchlistPrisma,
  testPrismaConnection,
} from './prisma';

// Define the database provider type
export type DbProvider = 'prisma' | 'localStorage';

// Get the current database provider from environment variables or default to localStorage
export function getDbProvider(): DbProvider {
  // Check if DATABASE_URL is set for Prisma
  if (process.env.DATABASE_URL) {
    return 'prisma';
  }

  // Fall back to localStorage if Prisma is not configured
  console.warn('Prisma database URL not configured. Using localStorage.');
  return 'localStorage';
}

// Test the database connection
export async function testDbConnection(): Promise<{
  connected: boolean;
  provider: DbProvider;
}> {
  const provider = getDbProvider();
  let connected = false;

  if (provider === 'prisma') {
    connected = await testPrismaConnection();
  } else {
    // localStorage is always "connected"
    connected = true;
  }

  return { connected, provider };
}

// Fetch watchlist from the current database provider
export async function fetchWatchlist(userId: string): Promise<string[]> {
  const provider = getDbProvider();

  if (provider === 'prisma') {
    return fetchWatchlistPrisma(userId);
  }

  // For localStorage, we return an empty array and let the WatchlistContext handle it
  return [];
}

// Update watchlist in the current database provider
export async function updateWatchlist(
  userId: string,
  coins: string[]
): Promise<boolean> {
  const provider = getDbProvider();

  if (provider === 'prisma') {
    return updateWatchlistPrisma(userId, coins);
  }

  // For localStorage, we return true and let the WatchlistContext handle it
  return true;
}

// Get a demo user ID (in a real app, this would come from authentication)
export function getDemoUserId(): string {
  // For demo purposes, we'll use a fixed ID
  // In a real app, this would come from your authentication system
  return 'demo-user-123';
}
