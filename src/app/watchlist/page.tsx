'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useWatchlist } from '@/contexts/WatchlistContext';
import { fetchCurrentPrices, getCoinName } from '@/lib/cryptoApi';
import { CryptoData, Currency } from '@/types';
import CoinSearch from '@/components/CoinSearch';

export default function WatchlistPage() {
  const router = useRouter();
  const {
    watchlist,
    removeFromWatchlist,
    isLoading: isWatchlistLoading,
    error: watchlistError,
    dbConnected,
    dbProvider,
  } = useWatchlist();
  const [coinData, setCoinData] = useState<CryptoData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(
    Currency.USD
  );

  // Fetch data for watchlist coins
  useEffect(() => {
    const fetchData = async () => {
      if (watchlist.length === 0) {
        setCoinData([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchCurrentPrices(watchlist);
        setCoinData(data);
      } catch (err) {
        console.error('Error fetching watchlist data:', err);
        setError('Failed to fetch coin data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    if (!isWatchlistLoading) {
      fetchData();
    }

    // Set up interval to refresh data every 30 seconds
    const intervalId = setInterval(async () => {
      if (watchlist.length === 0) return;

      try {
        setIsRefreshing(true);
        const data = await fetchCurrentPrices(watchlist);
        setCoinData(data);
      } catch (err) {
        console.error('Error refreshing watchlist data:', err);
      } finally {
        setIsRefreshing(false);
      }
    }, 30000);

    return () => clearInterval(intervalId);
  }, [watchlist, isWatchlistLoading]);

  // Handle removing a coin from watchlist
  const handleRemoveCoin = (symbol: string) => {
    removeFromWatchlist(symbol);
  };

  // Handle clicking on a coin to view details
  const handleCoinClick = (symbol: string) => {
    router.push(`/?coin=${symbol}`);
  };

  // Retry loading data
  const handleRetry = () => {
    setIsLoading(true);
    setError(null);
    // This will trigger the useEffect to fetch data again
  };

  // Format price based on selected currency
  const formatPrice = (price: number): string => {
    if (selectedCurrency === Currency.INR) {
      // Convert USD to INR (simplified conversion)
      const inrPrice = price * 75; // Example conversion rate
      return `₹${inrPrice.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }

    return `$${price.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              My Watchlist
            </h1>
            <p className="text-gray-600">
              Manage your cryptocurrency watchlist
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center space-x-4">
            <div
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                dbConnected
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              {dbConnected ? 'Database Connected' : 'Using Local Storage'}
            </div>
            <select
              className="bg-white border border-gray-300 rounded-md px-3 py-2 text-sm"
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value as Currency)}
            >
              <option value={Currency.USD}>USD ($)</option>
              <option value={Currency.INR}>INR (₹)</option>
            </select>
            <Link
              href="/"
              className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm hover:bg-indigo-700 transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <h2 className="text-xl font-semibold text-gray-800">Add Coins</h2>
              {isRefreshing && (
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

          {watchlistError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {watchlistError}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {isWatchlistLoading || isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            </div>
          ) : watchlist.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="mb-4">Your watchlist is empty.</p>
              <p className="text-sm">
                Use the search box above to add cryptocurrencies to your
                watchlist.
              </p>
            </div>
          ) : coinData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="mb-4">Unable to fetch data for your watchlist.</p>
              <button
                onClick={handleRetry}
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
                    <tr
                      key={coin.symbol}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleCoinClick(coin.symbol)}
                    >
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
                          {formatPrice(coin.price)}
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
                        {formatPrice(coin.volume)
                          .replace('₹', '')
                          .replace('$', '')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveCoin(`${coin.symbol}USDT`);
                          }}
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
      </div>
    </div>
  );
}
