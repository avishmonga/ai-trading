'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import CryptoCard from '@/components/CryptoCard';
import CoinDetailModal from '@/components/CoinDetailModal';
import PaperTradingAccount from '@/components/PaperTradingAccount';
import { useWatchlist } from '@/contexts/WatchlistContext';
import { CoinAnalysis, CryptoData, Currency } from '@/types';

export default function Home() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shortlistedCoins, setShortlistedCoins] = useState<CoinAnalysis[]>([]);
  const [priceData, setPriceData] = useState<Record<string, number>>({});
  const [selectedCoin, setSelectedCoin] = useState<string | null>(
    searchParams.get('coin')
  );
  const [modalOpen, setModalOpen] = useState(!!selectedCoin);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(
    Currency.USD
  );
  const { watchlist, isLoading: isWatchlistLoading } = useWatchlist();
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Fetch data on component mount and when autoRefresh is enabled
  useEffect(() => {
    if (!isWatchlistLoading) {
      fetchData();
    }

    // Set up auto-refresh every 5 minutes if enabled
    let intervalId: NodeJS.Timeout | null = null;
    if (autoRefresh) {
      intervalId = setInterval(fetchData, 5 * 60 * 1000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [autoRefresh, watchlist, isWatchlistLoading]);

  const fetchData = async () => {
    // Don't set loading to true on subsequent refreshes if we already have data
    if (!initialLoadComplete) {
      setLoading(true);
    }
    setError(null);

    try {
      // Fetch current prices
      const pricesResponse = await fetch('/api/crypto');

      if (!pricesResponse.ok) {
        const errorData = await pricesResponse.json().catch(() => ({}));
        throw new Error(
          `Failed to fetch crypto prices: ${pricesResponse.status} ${
            pricesResponse.statusText
          }. ${errorData.error || ''}`
        );
      }

      const pricesData = await pricesResponse.json();

      // Create a map of symbol to price for easy lookup
      const priceMap: Record<string, number> = {};
      pricesData.data.forEach((coin: CryptoData) => {
        priceMap[coin.symbol] = coin.price;
      });
      setPriceData(priceMap);

      // Fetch analysis results
      const analysisResponse = await fetch('/api/analysis');

      if (!analysisResponse.ok) {
        const errorData = await analysisResponse.json().catch(() => ({}));
        throw new Error(
          `Failed to fetch analysis data: ${analysisResponse.status} ${
            analysisResponse.statusText
          }. ${errorData.error || ''}`
        );
      }

      const analysisData = await analysisResponse.json();

      // Keep previous data until new data is ready
      const previousCoins = [...shortlistedCoins];

      // Filter shortlisted coins based on watchlist
      if (watchlist.length > 0) {
        const watchlistSymbols = watchlist.map((symbol) =>
          symbol.replace('USDT', '')
        );
        const filteredCoins = analysisData.shortlistedCoins.filter(
          (coin: CoinAnalysis) => watchlistSymbols.includes(coin.symbol)
        );

        // Only update if we have new data or if this is the initial load
        if (filteredCoins.length > 0 || !initialLoadComplete) {
          setShortlistedCoins(filteredCoins);
        } else if (previousCoins.length > 0) {
          // Keep previous data if new data is empty but we had data before
          // This prevents the "No coins" message from flashing
        } else {
          setShortlistedCoins(filteredCoins);
        }
      } else {
        setShortlistedCoins(analysisData.shortlistedCoins);
      }

      setLastUpdated(new Date());
      setInitialLoadComplete(true);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching data:', err);

      // If we have no data yet, provide some sample data for better UX
      if (shortlistedCoins.length === 0) {
        provideSampleData();
      }
    } finally {
      setLoading(false);
    }
  };

  // Provide sample data when API calls fail
  const provideSampleData = () => {
    const sampleCoins: CoinAnalysis[] = [
      {
        symbol: 'BTC',
        score: 75,
        trend: 'bullish',
        volatility: 'medium',
        recommendation: 'buy',
        lastUpdated: Date.now(),
      },
      {
        symbol: 'ETH',
        score: 68,
        trend: 'bullish',
        volatility: 'medium',
        recommendation: 'buy',
        lastUpdated: Date.now(),
      },
      {
        symbol: 'SOL',
        score: 30,
        trend: 'bearish',
        volatility: 'high',
        recommendation: 'sell',
        lastUpdated: Date.now(),
      },
    ];

    const samplePrices: Record<string, number> = {
      BTC: 65000,
      ETH: 3500,
      SOL: 150,
    };

    // Filter sample data based on watchlist if available
    if (watchlist.length > 0) {
      const watchlistSymbols = watchlist.map((symbol) =>
        symbol.replace('USDT', '')
      );
      const filteredCoins = sampleCoins.filter((coin) =>
        watchlistSymbols.includes(coin.symbol)
      );
      setShortlistedCoins(filteredCoins);
    } else {
      setShortlistedCoins(sampleCoins);
    }

    setPriceData(samplePrices);
    setLastUpdated(new Date());
    setInitialLoadComplete(true);
  };

  const handleCoinClick = (symbol: string) => {
    setSelectedCoin(symbol);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedCoin(null);
  };

  // Determine if we should show the "No coins" message
  const shouldShowNoCoinsMessage =
    !loading && shortlistedCoins.length === 0 && initialLoadComplete;

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              AI Crypto Trading
            </h1>
            <p className="text-gray-600">
              AI-powered crypto analysis and trading recommendations
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center space-x-4">
            <select
              className="bg-white border border-gray-300 rounded-md px-3 py-2 text-sm"
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value as Currency)}
            >
              <option value={Currency.USD}>USD ($)</option>
              <option value={Currency.INR}>INR (₹)</option>
            </select>
            <button
              onClick={fetchData}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm hover:bg-indigo-700 transition-colors"
            >
              Refresh Data
            </button>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="autoRefresh"
                checked={autoRefresh}
                onChange={() => setAutoRefresh(!autoRefresh)}
                className="mr-2"
              />
              <label htmlFor="autoRefresh" className="text-sm text-gray-600">
                Auto-refresh
              </label>
            </div>
          </div>
        </div>

        {/* Paper Trading Account */}
        <div className="mb-8">
          <PaperTradingAccount selectedCurrency={selectedCurrency} />
        </div>

        {/* Watchlist Link */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Watchlist
            </h2>
            <Link
              href="/watchlist"
              className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm hover:bg-indigo-700 transition-colors"
            >
              Manage Watchlist
            </Link>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            {isWatchlistLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-500 mr-2"></div>
                <span className="text-gray-600">Loading watchlist...</span>
              </div>
            ) : watchlist.length === 0 ? (
              <div className="text-gray-600">
                Your watchlist is empty. Add coins to get personalized
                recommendations.
              </div>
            ) : (
              <div className="text-gray-600">
                You are tracking {watchlist.length} coins. AI recommendations
                are based on your watchlist.
              </div>
            )}
          </div>
        </div>

        {/* Shortlisted Coins */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            AI Recommendations
          </h2>

          {error ? (
            <div className="bg-red-50 p-4 rounded-md mb-8">
              <p className="text-red-600 mb-4">{error}</p>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  onClick={fetchData}
                >
                  Retry
                </button>
                <button
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                  onClick={provideSampleData}
                >
                  Use Sample Data
                </button>
              </div>
            </div>
          ) : loading && !initialLoadComplete ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            </div>
          ) : shouldShowNoCoinsMessage ? (
            <div className="bg-yellow-50 p-4 rounded-md">
              <p className="text-yellow-700">
                No coins from your watchlist have AI recommendations at this
                time. Add more coins to your watchlist or check back later.
              </p>
            </div>
          ) : (
            <>
              {loading && initialLoadComplete && (
                <div className="flex justify-end mb-4">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-500 mr-2"></div>
                  <span className="text-sm text-gray-500">Refreshing...</span>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {shortlistedCoins.map((coin) => (
                  <CryptoCard
                    key={coin.symbol}
                    coin={coin}
                    price={priceData[coin.symbol] || 0}
                    onClick={() => handleCoinClick(coin.symbol)}
                    currency={selectedCurrency}
                  />
                ))}
              </div>

              {lastUpdated && (
                <p className="text-xs text-gray-500 mt-8 text-center">
                  Last updated: {lastUpdated.toLocaleString()}
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {selectedCoin && (
        <CoinDetailModal
          isOpen={modalOpen}
          onClose={closeModal}
          symbol={selectedCoin}
          currentPrice={priceData[selectedCoin] || 0}
        />
      )}
    </div>
  );
}
