'use client';

import React, { useState, useEffect } from 'react';
import CryptoCard from '@/components/CryptoCard';
import CoinDetailModal from '@/components/CoinDetailModal';
import PaperTradingAccount from '@/components/PaperTradingAccount';
import { CoinAnalysis, CryptoData, Currency } from '@/types';

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shortlistedCoins, setShortlistedCoins] = useState<CoinAnalysis[]>([]);
  const [priceData, setPriceData] = useState<Record<string, number>>({});
  const [selectedCoin, setSelectedCoin] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(
    Currency.USD
  );

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
    <main className="min-h-screen p-4 md:p-8 bg-gray-50">
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
        ) : loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <>
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

      {selectedCoin && (
        <CoinDetailModal
          isOpen={modalOpen}
          onClose={closeModal}
          symbol={selectedCoin}
          currentPrice={priceData[selectedCoin] || 0}
        />
      )}
    </main>
  );
}
