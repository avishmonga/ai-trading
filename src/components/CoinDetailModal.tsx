import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import PriceChart from './PriceChart';
import TradeRecommendation from './TradeRecommendation';
import AIProviderSelector from './AIProviderSelector';
import ActiveTrades from './ActiveTrades';
import CurrencySelector from './CurrencySelector';
import {
  HistoricalData,
  TradeRecommendation as TradeRecommendationType,
  AIProvider,
  Currency,
  TradeExecution,
  OrderType,
  OrderStatus,
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
  const [currency, setCurrency] = useState<Currency>(Currency.USD);
  const [activeTrades, setActiveTrades] = useState<TradeExecution[]>([]);
  const [showActiveTrades, setShowActiveTrades] = useState(false);

  // Fetch historical data and AI recommendation when the modal opens
  useEffect(() => {
    if (isOpen && symbol) {
      fetchData();
      fetchActiveTrades();
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

  // Fetch active trades for the current symbol
  const fetchActiveTrades = async () => {
    try {
      // In a real app, this would fetch from an API
      // For now, we'll use a mock response

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Mock active trades for demo purposes
      const mockTrades: TradeExecution[] = [
        {
          orderId: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          symbol,
          type: Math.random() > 0.5 ? OrderType.Buy : OrderType.Sell,
          price: currentPrice,
          quantity: 0.1,
          status: OrderStatus.Executed,
          timestamp: Date.now() - 3600000, // 1 hour ago
          stopLoss: currentPrice * 0.95,
          takeProfit: currentPrice * 1.05,
          budget: 1000,
          currency: Currency.USD,
          message: 'Order executed successfully',
        },
      ];

      setActiveTrades(mockTrades);
    } catch (error) {
      console.error('Error fetching active trades:', error);
    }
  };

  // Cancel a trade
  const cancelTrade = async (orderId: string): Promise<void> => {
    try {
      const response = await fetch(`/api/trade/${orderId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Failed to cancel trade: ${response.status} ${response.statusText}. ${
            errorData.error || ''
          }`
        );
      }

      // Remove the cancelled trade from the active trades list
      setActiveTrades(
        activeTrades.filter((trade) => trade.orderId !== orderId)
      );
    } catch (error) {
      console.error('Error cancelling trade:', error);
      throw error;
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
    <Transition.Root show={isOpen} as={React.Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl sm:p-6">
                <div className="absolute right-0 top-0 pr-4 pt-4">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                    <Dialog.Title
                      as="h3"
                      className="text-xl font-semibold leading-6 text-gray-900"
                    >
                      {symbol} Analysis
                      {usingSampleData && (
                        <span className="text-sm text-yellow-600 ml-2">
                          (Sample Data)
                        </span>
                      )}
                    </Dialog.Title>

                    <div className="mt-4 flex flex-wrap gap-4 items-center">
                      {/* AI Provider Selector */}
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

                      {/* Currency Selector */}
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-700 mr-2">
                          Currency:
                        </span>
                        <CurrencySelector
                          selectedCurrency={currency}
                          onCurrencyChange={setCurrency}
                        />
                      </div>

                      {/* Active Trades Toggle */}
                      <div className="flex items-center ml-auto">
                        <button
                          type="button"
                          onClick={() => setShowActiveTrades(!showActiveTrades)}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          {showActiveTrades
                            ? 'Hide Active Trades'
                            : 'Show Active Trades'}
                        </button>
                      </div>
                    </div>

                    {loading ? (
                      <div className="mt-6 flex justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
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
                      <div className="mt-6 space-y-6">
                        {showActiveTrades && (
                          <ActiveTrades
                            trades={activeTrades}
                            onCancelTrade={cancelTrade}
                            selectedCurrency={currency}
                          />
                        )}

                        <div>
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
                            <TradeRecommendation
                              recommendation={recommendation}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default CoinDetailModal;
