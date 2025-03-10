import React, { useState, useEffect } from 'react';
import { TradeExecution, OrderStatus, Currency, OrderType } from '../types';
import {
  convertCurrency,
  calculateProfitLossPercentage,
} from '@/lib/tradeExecutionService';

interface ActiveTradesProps {
  trades: TradeExecution[];
  onCancelTrade: (orderId: string) => Promise<void>;
  selectedCurrency: Currency;
}

export default function ActiveTrades({
  trades,
  onCancelTrade,
  selectedCurrency,
}: ActiveTradesProps) {
  const [activeTrades, setActiveTrades] = useState<TradeExecution[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPrices, setCurrentPrices] = useState<Record<string, number>>(
    {}
  );
  const [totalFees, setTotalFees] = useState<number>(0);

  // Filter active trades
  useEffect(() => {
    setActiveTrades(
      trades.filter(
        (trade) =>
          trade.status === OrderStatus.Executed ||
          trade.status === OrderStatus.Pending
      )
    );
  }, [trades]);

  // Calculate total fees
  useEffect(() => {
    let fees = 0;
    activeTrades.forEach((trade) => {
      if (trade.fee) {
        // Convert fee to selected currency if needed
        if (trade.currency !== selectedCurrency) {
          fees += convertCurrency(
            trade.fee.amount,
            trade.currency,
            selectedCurrency
          );
        } else {
          fees += trade.fee.amount;
        }
      }
    });
    setTotalFees(fees);
  }, [activeTrades, selectedCurrency]);

  // Simulate fetching current prices
  useEffect(() => {
    const symbols = [...new Set(activeTrades.map((trade) => trade.symbol))];

    // In a real app, this would fetch actual prices from an API
    const mockPrices: Record<string, number> = {};
    symbols.forEach((symbol) => {
      // Generate a random price near the trade price for demo purposes
      const trade = activeTrades.find((t) => t.symbol === symbol);
      if (trade) {
        const randomFactor = 0.95 + Math.random() * 0.1; // Random between 0.95 and 1.05
        mockPrices[symbol] = trade.price * randomFactor;
      }
    });

    setCurrentPrices(mockPrices);
  }, [activeTrades]);

  // Format currency based on selected currency
  const formatCurrency = (value: number, tradeCurrency: Currency) => {
    const currencySymbol = selectedCurrency === Currency.USD ? '$' : '₹';

    // Convert if currencies don't match
    let convertedValue = value;
    if (tradeCurrency !== selectedCurrency) {
      convertedValue = convertCurrency(value, tradeCurrency, selectedCurrency);
    }

    return `${currencySymbol}${convertedValue.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Calculate profit/loss for a trade
  const calculateProfitLoss = (trade: TradeExecution) => {
    const currentPrice = currentPrices[trade.symbol] || trade.price;

    // Calculate profit/loss based on trade type
    let profitLossInOriginalCurrency = 0;

    if (trade.type === OrderType.Buy) {
      // For BUY orders: Current value - Entry value
      profitLossInOriginalCurrency =
        (currentPrice - trade.price) * trade.quantity;
    } else {
      // For SELL orders: Entry value - Current value
      profitLossInOriginalCurrency =
        (trade.price - currentPrice) * trade.quantity;
    }

    // Subtract fees if available
    let netProfitLoss = profitLossInOriginalCurrency;
    if (trade.fee) {
      netProfitLoss -= trade.fee.amount;
    }

    // Convert to selected currency if needed
    let profitLossValue = netProfitLoss;
    if (trade.currency !== selectedCurrency) {
      profitLossValue = convertCurrency(
        netProfitLoss,
        trade.currency,
        selectedCurrency
      );
    }

    // Calculate percentage based on the original investment
    const originalInvestment = trade.price * trade.quantity;
    const profitLossPercentage = (netProfitLoss / originalInvestment) * 100;

    return {
      value: profitLossValue,
      percentage: profitLossPercentage,
      isProfit: profitLossValue >= 0,
    };
  };

  // Format date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  // Handle cancel trade
  const handleCancelTrade = async (orderId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await onCancelTrade(orderId);
      // Remove the cancelled trade from the active trades list
      setActiveTrades(
        activeTrades.filter((trade) => trade.orderId !== orderId)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel trade');
    } finally {
      setIsLoading(false);
    }
  };

  if (activeTrades.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Active Trades
        </h3>
        <p className="text-gray-500">No active trades found.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Active Trades</h3>
        <div className="text-sm text-amber-600">
          Total Fees: {formatCurrency(totalFees, selectedCurrency)}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Symbol
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Type
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Entry Price
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Current Price
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Quantity
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                P/L
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Fees
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Stop Loss
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Take Profit
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Date
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {activeTrades.map((trade) => {
              const profitLoss = calculateProfitLoss(trade);
              return (
                <tr key={trade.orderId}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {trade.symbol}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        trade.type === OrderType.Buy
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {trade.type === OrderType.Buy ? 'BUY' : 'SELL'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatCurrency(trade.price, trade.currency)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatCurrency(
                      currentPrices[trade.symbol] || trade.price,
                      trade.currency
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {trade.quantity.toFixed(8)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div
                      className={`flex items-center ${
                        profitLoss.isProfit ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      <span className="font-medium">
                        {profitLoss.isProfit ? '+' : ''}
                        {formatCurrency(profitLoss.value, selectedCurrency)}
                      </span>
                      <span className="ml-2 text-xs">
                        ({profitLoss.isProfit ? '+' : ''}
                        {profitLoss.percentage.toFixed(2)}%)
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-amber-600">
                    {trade.fee
                      ? formatCurrency(trade.fee.amount, trade.currency)
                      : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatCurrency(trade.stopLoss, trade.currency)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatCurrency(trade.takeProfit, trade.currency)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(trade.timestamp)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        trade.status === OrderStatus.Executed
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {trade.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleCancelTrade(trade.orderId)}
                      disabled={isLoading}
                      className="text-indigo-600 hover:text-indigo-900 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
