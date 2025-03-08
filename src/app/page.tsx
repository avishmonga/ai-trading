'use client';

import React, { useState, useEffect } from 'react';
import CryptoCard from '@/components/CryptoCard';
import CoinDetailModal from '@/components/CoinDetailModal';
import { CoinAnalysis, CryptoData } from '@/types';

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shortlistedCoins, setShortlistedCoins] = useState<CoinAnalysis[]>([]);
  const [priceData, setPriceData] = useState<Record<string, number>>({});
  const [selectedCoin, setSelectedCoin] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch data on component mount and when autoRefresh is enabled
  useEffect(() => {
    fetchData();

    // Set up auto-refresh every 5 minutes if enabled
    let intervalId: NodeJS.Timeout | null = null;
    if (autoRefresh) {
      intervalId = setInterval(fetchData, 5 * 60 * 1000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [autoRefresh]);

  const fetchData = async () => {
    setLoading(true);
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

      setShortlistedCoins(analysisData.shortlistedCoins);
      setLastUpdated(new Date());
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

    setShortlistedCoins(sampleCoins);
    setPriceData(samplePrices);
    setLastUpdated(new Date());
  };

  const handleCoinClick = (symbol: string) => {
    setSelectedCoin(symbol);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedCoin(null);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-900">
              AI Crypto Trading Platform
            </h1>
            <div className="flex items-center mt-2 md:mt-0">
              <button
                onClick={fetchData}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 mr-4"
                disabled={loading}
              >
                {loading ? 'Refreshing...' : 'Refresh Data'}
              </button>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="autoRefresh"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="autoRefresh" className="text-sm text-gray-600">
                  Auto-refresh (5m)
                </label>
              </div>
            </div>
          </div>
          <p className="text-gray-600">
            Automatically analyzes crypto coins and shortlists the best trading
            opportunities
          </p>
          {lastUpdated && (
            <p className="text-sm text-gray-500 mt-1">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </header>

        {error ? (
          <div className="bg-red-50 p-6 rounded-lg mb-8">
            <h2 className="text-xl font-semibold text-red-700 mb-2">Error</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={fetchData}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Try Again
              </button>
              {shortlistedCoins.length === 0 && (
                <button
                  onClick={provideSampleData}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Use Sample Data
                </button>
              )}
            </div>
            <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
              <h3 className="font-semibold text-yellow-800">
                Troubleshooting Tips:
              </h3>
              <ul className="list-disc pl-5 mt-2 text-yellow-700">
                <li>Check if Binance API is accessible from your location</li>
                <li>Verify your internet connection</li>
                <li>
                  The application will use sample data if the API is unavailable
                </li>
              </ul>
            </div>
          </div>
        ) : loading && shortlistedCoins.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-600">Analyzing crypto markets...</p>
          </div>
        ) : shortlistedCoins.length === 0 ? (
          <div className="bg-yellow-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-yellow-700 mb-2">
              No Trading Opportunities
            </h2>
            <p className="text-yellow-600">
              No coins meet our trading criteria at the moment. Check back later
              or adjust the analysis parameters.
            </p>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Shortlisted Trading Opportunities ({shortlistedCoins.length})
            </h2>
            <div className="text-black grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {shortlistedCoins.map((coin) => (
                <CryptoCard
                  key={coin.symbol}
                  analysis={coin}
                  onClick={handleCoinClick}
                />
              ))}
            </div>
          </>
        )}

        {/* Refreshing indicator when auto-refresh is on */}
        {loading && shortlistedCoins.length > 0 && (
          <div className="fixed bottom-4 right-4 bg-white rounded-full shadow-lg p-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Coin detail modal */}
        {selectedCoin && (
          <CoinDetailModal
            isOpen={modalOpen}
            onClose={closeModal}
            symbol={selectedCoin}
            currentPrice={priceData[selectedCoin] || 0}
          />
        )}
      </div>
    </main>
  );
}
