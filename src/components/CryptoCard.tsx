import React from 'react';
import { CoinAnalysis, Currency } from '@/types';
import { convertCurrency } from '@/lib/tradeExecutionService';

interface CryptoCardProps {
  coin: CoinAnalysis;
  price: number;
  onClick: () => void;
  currency: Currency;
}

const CryptoCard: React.FC<CryptoCardProps> = ({
  coin,
  price,
  onClick,
  currency,
}) => {
  const { symbol, score, trend, volatility, recommendation } = coin;

  // Determine color based on recommendation
  const getBgColor = () => {
    switch (recommendation) {
      case 'buy':
        return 'bg-green-100 border-green-500';
      case 'sell':
        return 'bg-red-100 border-red-500';
      default:
        return 'bg-gray-100 border-gray-500';
    }
  };

  // Determine trend icon
  const getTrendIcon = () => {
    switch (trend) {
      case 'bullish':
        return (
          <svg
            className="w-5 h-5 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
            />
          </svg>
        );
      case 'bearish':
        return (
          <svg
            className="w-5 h-5 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6"
            />
          </svg>
        );
      default:
        return (
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 12h14"
            />
          </svg>
        );
    }
  };

  // Format currency
  const formatCurrency = (value: number) => {
    const currencySymbol = currency === Currency.USD ? '$' : '₹';
    const convertedValue =
      currency === Currency.INR ? convertCurrency(value, 'USD', 'INR') : value;

    return `${currencySymbol}${convertedValue.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div
      className={`rounded-lg border p-4 cursor-pointer transition-all hover:shadow-md ${getBgColor()}`}
      onClick={onClick}
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-bold">{symbol}</h3>
        <div className="flex items-center space-x-1">
          <span className="text-sm font-medium">
            {trend.charAt(0).toUpperCase() + trend.slice(1)}
          </span>
          {getTrendIcon()}
        </div>
      </div>

      <div className="mb-3">
        <div className="text-2xl font-bold">{formatCurrency(price)}</div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-gray-600">Score:</span>
          <div className="font-medium">{score.toFixed(2)}</div>
        </div>
        <div>
          <span className="text-gray-600">Volatility:</span>
          <div className="font-medium capitalize">{volatility}</div>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Recommendation:</span>
          <span
            className={`font-medium capitalize px-2 py-1 rounded-full text-xs ${
              recommendation === 'buy'
                ? 'bg-green-200 text-green-800'
                : recommendation === 'sell'
                ? 'bg-red-200 text-red-800'
                : 'bg-gray-200 text-gray-800'
            }`}
          >
            {recommendation}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CryptoCard;
