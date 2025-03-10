'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useWatchlist } from '@/contexts/WatchlistContext';
import { fetchCurrentPrices, getCoinName } from '@/lib/cryptoApi';
import { CryptoData } from '@/types';
import CoinSearch from './CoinSearch';

export default function Watchlist() {
  const { watchlist, removeFromWatchlist } = useWatchlist();
  const [coinData, setCoinData] = useState<CryptoData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Memoize the fetchData function to prevent unnecessary re-renders
  const fetchData = useCallback(
    async (isInitialLoad = false) => {
      if (watchlist.length === 0) {
        setCoinData([]);
        setIsLoading(false);
        setInitialLoadComplete(true);
        return;
      }

      try {
        // Only set full loading state on initial load
        if (isInitialLoad) {
          setIsLoading(true);
        } else {
          setIsRefreshing(true);
        }

        setError(null);
        const data = await fetchCurrentPrices(watchlist);

        // Keep previous data if new data is empty
        if (data.length > 0 || !initialLoadComplete) {
          setCoinData(data);
        }

        setInitialLoadComplete(true);
      } catch (err) {
        console.error('Error fetching watchlist data:', err);
        setError('Failed to fetch coin data. Please try again later.');

        // Don't clear existing data on refresh error
        if (!initialLoadComplete) {
          setCoinData([]);
        }
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [watchlist, initialLoadComplete]
  );

  // Fetch data for watchlist coins
  useEffect(() => {
    fetchData(true);

    // Set up interval to refresh data every 30 seconds
    const intervalId = setInterval(() => fetchData(false), 30000);

    return () => clearInterval(intervalId);
  }, [fetchData]);

  // Handle removing a coin from watchlist
  const handleRemoveCoin = (symbol: string) => {
    removeFromWatchlist(symbol);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <h2 className="text-xl font-semibold text-gray-800">My Watchlist</h2>
          {isRefreshing && !isLoading && (
            <div className="ml-3 flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-500 mr-1"></div>
              <span className="text-xs text-gray-500">Refreshing...</span>
            </div>
          )}
        </div>
        <div className="w-64">
          <CoinSearch />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        </div>
      ) : watchlist.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="mb-4">Your watchlist is empty.</p>
          <p className="text-sm">
            Use the search box above to add cryptocurrencies to your watchlist.
          </p>
        </div>
      ) : coinData.length === 0 && initialLoadComplete ? (
        <div className="text-center py-8 text-gray-500">
          <p className="mb-4">Unable to fetch data for your watchlist.</p>
          <button
            onClick={() => fetchData(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Coin
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Price
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  24h Change
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Volume
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {coinData.map((coin) => (
                <tr key={coin.symbol} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {coin.symbol}
                        </div>
                        <div className="text-sm text-gray-500">
                          {getCoinName(coin.symbol)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      $
                      {coin.price.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        coin.change24h >= 0
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {coin.change24h >= 0 ? '+' : ''}
                      {coin.change24h.toFixed(2)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    $
                    {coin.volume.toLocaleString(undefined, {
                      maximumFractionDigits: 0,
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleRemoveCoin(`${coin.symbol}USDT`)}
                      className="text-red-600 hover:text-red-900"
                      data-testid={`remove-${coin.symbol}USDT`}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
