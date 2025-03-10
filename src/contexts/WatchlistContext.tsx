'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useMemo,
} from 'react';
import { DEFAULT_WATCHLIST } from '@/lib/cryptoApi';
import {
  fetchWatchlist,
  updateWatchlist,
  getDemoUserId,
  testDbConnection,
  getDbProvider,
  type DbProvider,
} from '@/lib/dbProvider';

interface WatchlistContextType {
  watchlist: string[];
  addToWatchlist: (symbol: string) => void;
  removeFromWatchlist: (symbol: string) => void;
  isInWatchlist: (symbol: string) => boolean;
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  dbConnected: boolean;
  dbProvider: DbProvider;
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(
  undefined
);

interface WatchlistProviderProps {
  children: ReactNode;
}

export function WatchlistProvider({ children }: WatchlistProviderProps) {
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dbConnected, setDbConnected] = useState(false);
  const [dbProvider, setDbProvider] = useState<DbProvider>('localStorage');
  const userId = getDemoUserId();

  // Test database connection on mount and when provider changes
  useEffect(() => {
    async function checkConnection() {
      const { connected, provider } = await testDbConnection();
      setDbConnected(connected);
      setDbProvider(provider);
      console.log(
        'Database connection status:',
        connected ? 'Connected' : 'Disconnected'
      );
      console.log('Database provider:', provider);

      // If provider changed, we need to reload the watchlist
      if (provider !== dbProvider && isInitialized) {
        console.log('Database provider changed. Reloading watchlist...');
        loadWatchlist();
      }
    }

    checkConnection();

    // Set up interval to check connection every 5 minutes
    const intervalId = setInterval(checkConnection, 5 * 60 * 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  // Load watchlist from database or localStorage on mount
  useEffect(() => {
    async function loadWatchlist() {
      try {
        setIsLoading(true);
        setError(null);

        // Try to fetch from database first
        let coins: string[] = [];
        let dbError = false;

        if (userId && dbConnected) {
          try {
            console.log(
              `Attempting to fetch watchlist from ${dbProvider} for user:`,
              userId
            );
            coins = await fetchWatchlist(userId);
            console.log(`Fetched watchlist from ${dbProvider}:`, coins);
          } catch (err) {
            console.error(`Error fetching from ${dbProvider}:`, err);
            dbError = true;
          }
        } else {
          console.log('Skipping database fetch, using localStorage instead');
          dbError = true;
        }

        // If no coins in database or error, try localStorage as fallback
        if (coins.length === 0 || dbError) {
          try {
            console.log('Attempting to load watchlist from localStorage');
            const storedWatchlist = localStorage.getItem('watchlist');
            if (storedWatchlist) {
              const parsedWatchlist = JSON.parse(storedWatchlist);
              if (
                Array.isArray(parsedWatchlist) &&
                parsedWatchlist.length > 0
              ) {
                coins = parsedWatchlist;
                console.log('Loaded watchlist from localStorage:', coins);

                // If we got coins from localStorage and database is working, sync them
                if (userId && dbConnected && !dbError) {
                  try {
                    console.log(
                      `Syncing localStorage watchlist to ${dbProvider}`
                    );
                    await updateWatchlist(userId, coins);
                  } catch (err) {
                    console.error(`Error syncing to ${dbProvider}:`, err);
                  }
                }
              }
            }
          } catch (e) {
            console.error('Error parsing watchlist from localStorage:', e);
          }
        }

        // If still no coins, use default watchlist
        if (coins.length === 0) {
          coins = DEFAULT_WATCHLIST;
          console.log('Using default watchlist:', coins);

          // Save default watchlist to localStorage as fallback
          try {
            localStorage.setItem('watchlist', JSON.stringify(coins));
          } catch (err) {
            console.error('Error saving to localStorage:', err);
          }

          // Try to save to database if available
          if (userId && dbConnected && !dbError) {
            try {
              console.log(`Saving default watchlist to ${dbProvider}`);
              await updateWatchlist(userId, coins);
            } catch (err) {
              console.error(
                `Error saving default watchlist to ${dbProvider}:`,
                err
              );
            }
          }
        }

        setWatchlist(coins);
      } catch (err) {
        console.error('Error loading watchlist:', err);
        setError('Failed to load watchlist. Using default coins.');

        // Use default watchlist on error
        setWatchlist(DEFAULT_WATCHLIST);

        // Save to localStorage as fallback
        try {
          localStorage.setItem('watchlist', JSON.stringify(DEFAULT_WATCHLIST));
        } catch (storageErr) {
          console.error('Error saving to localStorage:', storageErr);
        }
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    }

    loadWatchlist();
  }, [userId, dbConnected, dbProvider]);

  // Add a coin to the watchlist
  const addToWatchlist = async (symbol: string) => {
    // Ensure symbol ends with USDT
    const formattedSymbol = symbol.endsWith('USDT') ? symbol : `${symbol}USDT`;

    // Only add if not already in watchlist
    if (!watchlist.includes(formattedSymbol)) {
      const newWatchlist = [...watchlist, formattedSymbol];
      setWatchlist(newWatchlist);

      // Save to localStorage first as fallback
      try {
        localStorage.setItem('watchlist', JSON.stringify(newWatchlist));
        console.log('Saved new watchlist to localStorage:', newWatchlist);
      } catch (err) {
        console.error('Error saving to localStorage:', err);
      }

      // Try to save to database if connected
      if (userId && dbConnected) {
        try {
          console.log(`Saving updated watchlist to ${dbProvider}`);
          const success = await updateWatchlist(userId, newWatchlist);
          if (success) {
            console.log(`Successfully updated watchlist in ${dbProvider}`);
          } else {
            console.error(`Failed to update watchlist in ${dbProvider}`);
          }
        } catch (err) {
          console.error(`Error updating watchlist in ${dbProvider}:`, err);
          // Already saved to localStorage, so no need for additional fallback
        }
      } else {
        console.log('Skipping database update, database not connected');
      }
    }
  };

  // Remove a coin from the watchlist
  const removeFromWatchlist = async (symbol: string) => {
    // Ensure symbol ends with USDT
    const formattedSymbol = symbol.endsWith('USDT') ? symbol : `${symbol}USDT`;

    const newWatchlist = watchlist.filter((item) => item !== formattedSymbol);

    // Don't allow empty watchlist - use default if removing last coin
    const finalWatchlist =
      newWatchlist.length === 0 ? DEFAULT_WATCHLIST : newWatchlist;

    setWatchlist(finalWatchlist);

    // Save to localStorage first as fallback
    try {
      localStorage.setItem('watchlist', JSON.stringify(finalWatchlist));
      console.log('Saved updated watchlist to localStorage:', finalWatchlist);
    } catch (err) {
      console.error('Error saving to localStorage:', err);
    }

    // Try to save to database if connected
    if (userId && dbConnected) {
      try {
        console.log(`Saving updated watchlist to ${dbProvider} after removal`);
        const success = await updateWatchlist(userId, finalWatchlist);
        if (success) {
          console.log(
            `Successfully updated watchlist in ${dbProvider} after removal`
          );
        } else {
          console.error(
            `Failed to update watchlist in ${dbProvider} after removal`
          );
        }
      } catch (err) {
        console.error(
          `Error updating watchlist in ${dbProvider} after removal:`,
          err
        );
        // Already saved to localStorage, so no need for additional fallback
      }
    } else {
      console.log(
        'Skipping database update after removal, database not connected'
      );
    }
  };

  // Check if a coin is in the watchlist
  const isInWatchlist = (symbol: string) => {
    // Ensure symbol ends with USDT
    const formattedSymbol = symbol.endsWith('USDT') ? symbol : `${symbol}USDT`;

    return watchlist.includes(formattedSymbol);
  };

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      watchlist,
      addToWatchlist,
      removeFromWatchlist,
      isInWatchlist,
      isInitialized,
      isLoading,
      error,
      dbConnected,
      dbProvider,
    }),
    [watchlist, isInitialized, isLoading, error, dbConnected, dbProvider]
  );

  return (
    <WatchlistContext.Provider value={contextValue}>
      {children}
    </WatchlistContext.Provider>
  );
}

// Custom hook to use the watchlist context
export function useWatchlist() {
  const context = useContext(WatchlistContext);
  if (context === undefined) {
    throw new Error('useWatchlist must be used within a WatchlistProvider');
  }
  return context;
}
