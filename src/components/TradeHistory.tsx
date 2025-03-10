import React, { useState, useEffect } from 'react';
import { TradeExecution, OrderStatus, Currency, OrderType } from '@/types';
import { getPaperTradingHistory } from '@/lib/paperTradingService';
import { convertCurrency } from '@/lib/tradeExecutionService';

interface TradeHistoryProps {
  selectedCurrency: Currency;
}

export default function TradeHistory({ selectedCurrency }: TradeHistoryProps) {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [tradeHistory, setTradeHistory] = useState(getPaperTradingHistory());
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Format currency based on selected currency
  const formatCurrency = (value: number) => {
    const currencySymbol = selectedCurrency === Currency.USD ? '$' : '₹';
    const convertedValue =
      selectedCurrency === Currency.INR
        ? convertCurrency(value, 'USD', 'INR')
        : value;

    return `${currencySymbol}${convertedValue.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Format date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  // Handle filter change
  const handleFilterChange = () => {
    setIsLoading(true);

    let startDateObj: Date | undefined;
    let endDateObj: Date | undefined;

    if (startDate) {
      startDateObj = new Date(startDate);
      startDateObj.setHours(0, 0, 0, 0);
    }

    if (endDate) {
      endDateObj = new Date(endDate);
      endDateObj.setHours(23, 59, 59, 999);
    }

    setTradeHistory(getPaperTradingHistory(startDateObj, endDateObj));
    setIsLoading(false);
  };

  // Reset filters
  const resetFilters = () => {
    setStartDate('');
    setEndDate('');
    setTradeHistory(getPaperTradingHistory());
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Trade History
      </h3>

      {/* Filters */}
      <div className="mb-6 bg-gray-50 p-4 rounded-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label
              htmlFor="startDate"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Start Date
            </label>
            <input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label
              htmlFor="endDate"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              End Date
            </label>
            <input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="flex items-end space-x-2">
            <button
              onClick={handleFilterChange}
              disabled={isLoading}
              className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {isLoading ? 'Loading...' : 'Apply Filters'}
            </button>
            <button
              onClick={resetFilters}
              className="bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-green-50 p-4 rounded-md border border-green-100">
          <div className="text-sm text-green-600 mb-1">Total Profit</div>
          <div className="text-lg font-semibold text-green-700">
            {formatCurrency(tradeHistory.totalProfit)}
          </div>
        </div>
        <div className="bg-red-50 p-4 rounded-md border border-red-100">
          <div className="text-sm text-red-600 mb-1">Total Loss</div>
          <div className="text-lg font-semibold text-red-700">
            {formatCurrency(tradeHistory.totalLoss)}
          </div>
        </div>
        <div className="bg-amber-50 p-4 rounded-md border border-amber-100">
          <div className="text-sm text-amber-600 mb-1">Total Fees</div>
          <div className="text-lg font-semibold text-amber-700">
            {formatCurrency(tradeHistory.totalFees)}
          </div>
        </div>
        <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
          <div className="text-sm text-blue-600 mb-1">Win Rate</div>
          <div className="text-lg font-semibold text-blue-700">
            {tradeHistory.winRate.toFixed(2)}%
          </div>
        </div>
      </div>

      {/* Trade History Table */}
      {tradeHistory.trades.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No trade history found for the selected period.
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
                  Date
                </th>
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
                  Price
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
                  Status
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
                  Fee
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tradeHistory.trades.map((trade) => (
                <tr key={trade.orderId}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(trade.timestamp)}
                  </td>
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
                    {formatCurrency(trade.price)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {trade.quantity.toFixed(8)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        trade.status === OrderStatus.Executed
                          ? 'bg-green-100 text-green-800'
                          : trade.status === OrderStatus.Cancelled
                          ? 'bg-amber-100 text-amber-800'
                          : trade.status === OrderStatus.Failed
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {trade.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {trade.currentPnL !== undefined ? (
                      <div
                        className={`flex items-center ${
                          trade.currentPnL >= 0
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        <span className="font-medium">
                          {trade.currentPnL >= 0 ? '+' : ''}
                          {formatCurrency(trade.currentPnL)}
                        </span>
                        {trade.currentPnLPercentage !== undefined && (
                          <span className="ml-2 text-xs">
                            ({trade.currentPnL >= 0 ? '+' : ''}
                            {trade.currentPnLPercentage.toFixed(2)}%)
                          </span>
                        )}
                      </div>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-amber-600">
                    {trade.fee ? formatCurrency(trade.fee.amount) : '-'}
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
