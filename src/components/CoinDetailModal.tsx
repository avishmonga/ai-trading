import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import PriceChart from './PriceChart';
import TradeRecommendation from './TradeRecommendation';
import AIProviderSelector from './AIProviderSelector';
import {
  HistoricalData,
  TradeRecommendation as TradeRecommendationType,
  AIProvider,
} from '@/types';

interface CoinDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  symbol: string;
  currentPrice: number;
}

const CoinDetailModal: React.FC<CoinDetailModalProps> = ({
  isOpen,
  onClose,
  symbol,
  currentPrice,
}) => {
  const [loading, setLoading] = useState(true);
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([]);
  const [recommendation, setRecommendation] =
    useState<TradeRecommendationType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [usingSampleData, setUsingSampleData] = useState(false);
  const [aiProvider, setAiProvider] = useState<AIProvider>(AIProvider.Gemini);

  // Fetch historical data and AI recommendation when the modal opens
  useEffect(() => {
    if (isOpen && symbol) {
      fetchData();
    }
  }, [isOpen, symbol]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    setUsingSampleData(false);

    try {
      // Fetch historical data
      const historyResponse = await fetch(`/api/crypto/${symbol}/hourly`);
      if (!historyResponse.ok) {
        const errorData = await historyResponse.json().catch(() => ({}));
        throw new Error(
          `Failed to fetch historical data: ${historyResponse.status} ${
            historyResponse.statusText
          }. ${errorData.error || ''}`
        );
      }
      const historyData = await historyResponse.json();
      setHistoricalData(historyData.data);

      // Get AI recommendation
      const aiResponse = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symbol,
          currentPrice,
          provider: aiProvider,
        }),
      });

      if (!aiResponse.ok) {
        const errorData = await aiResponse.json().catch(() => ({}));
        console.error('AI API error response:', errorData);
        throw new Error(
          `Failed to get AI recommendation: ${aiResponse.status} ${
            aiResponse.statusText
          }. ${errorData.error || ''}`
        );
      }

      const aiData = await aiResponse.json();
      setRecommendation(aiData.recommendation);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(
        err instanceof Error ? err.message : 'An unknown error occurred'
      );

      // If we have historical data but AI recommendation failed, we can still show the chart
      if (historicalData.length === 0) {
        // Generate sample data if we couldn't get historical data
        generateSampleData();
      }
    } finally {
      setLoading(false);
    }
  };

  // Rename useSampleData to generateSampleData to avoid the linter error
  const generateSampleData = () => {
    setUsingSampleData(true);
    setError(null);

    // Generate sample historical data
    const sampleData: HistoricalData[] = [];
    const now = Date.now();
    const basePrice = currentPrice || 50000; // Use provided price or default

    // Generate 24 hours of sample data
    for (let i = 0; i < 24; i++) {
      const timestamp = now - (23 - i) * 60 * 60 * 1000;
      const volatility = 0.02; // 2% volatility
      const randomChange = (Math.random() - 0.5) * 2 * volatility;
      const close = basePrice * (1 + randomChange);

      sampleData.push({
        timestamp,
        open: close * (1 - volatility / 2),
        high: close * (1 + volatility),
        low: close * (1 - volatility),
        close,
        volume: basePrice * 10 * (0.8 + Math.random() * 0.4),
      });
    }

    setHistoricalData(sampleData);

    // Generate a sample recommendation
    setRecommendation({
      symbol,
      entryPrice: basePrice,
      targetPrice: basePrice * 1.05, // 5% target
      stopLoss: basePrice * 0.98, // 2% stop loss
      riskRewardRatio: 2.5,
      confidence: 0.7,
      reasoning:
        'This is a sample recommendation based on generated data. In a real scenario, the AI would analyze actual market data to provide insights.',
      timestamp: Date.now(),
      provider: aiProvider,
    });

    setLoading(false);
  };

  return (
    <Transition show={isOpen} as={React.Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <Dialog.Title
                    as="h3"
                    className="text-xl font-semibold leading-6 text-gray-900"
                  >
                    {symbol} Analysis{' '}
                    {usingSampleData && (
                      <span className="text-sm text-yellow-600">
                        (Sample Data)
                      </span>
                    )}
                  </Dialog.Title>
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                  </div>
                ) : error ? (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                    <h4 className="text-sm font-semibold text-red-800">
                      Error
                    </h4>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                    <div className="mt-3 flex space-x-4">
                      <button
                        type="button"
                        onClick={fetchData}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Try Again
                      </button>
                      <button
                        type="button"
                        onClick={generateSampleData}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Use Sample Data
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-lg font-semibold mb-2">
                        Price Chart
                      </h4>
                      <PriceChart
                        symbol={symbol}
                        data={historicalData}
                        recommendation={recommendation || undefined}
                      />
                    </div>

                    {recommendation && (
                      <div>
                        <h4 className="text-lg font-semibold mb-2">
                          AI Trade Recommendation
                        </h4>
                        <TradeRecommendation recommendation={recommendation} />
                      </div>
                    )}
                  </div>
                )}

                {/* AI Provider Selector */}
                <div className="mt-4 mb-6">
                  <AIProviderSelector
                    selectedProvider={aiProvider}
                    onProviderChange={(provider) => {
                      setAiProvider(provider);
                      // Refetch data with the new provider if we already have data
                      if (historicalData.length > 0) {
                        fetchData();
                      }
                    }}
                  />
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default CoinDetailModal;
