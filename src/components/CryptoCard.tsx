import React from 'react';
import { CoinAnalysis } from '@/types';

interface CryptoCardProps {
  analysis: CoinAnalysis;
  onClick: (symbol: string) => void;
}

const CryptoCard: React.FC<CryptoCardProps> = ({ analysis, onClick }) => {
  const { symbol, score, trend, volatility, recommendation } = analysis;

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
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-green-600"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
              clipRule="evenodd"
            />
          </svg>
        );
      case 'bearish':
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-red-600"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M12 13a1 1 0 100 2h5a1 1 0 001-1v-5a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586l-4.293-4.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z"
              clipRule="evenodd"
            />
          </svg>
        );
      default:
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-600"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M7.707 10.293a1 1 0 100 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 12.586V6a1 1 0 10-2 0v6.586l-1.293-1.293a1 1 0 00-1.414 0z"
              clipRule="evenodd"
            />
          </svg>
        );
    }
  };

  return (
    <div
      className={`rounded-lg border-2 p-4 shadow-md cursor-pointer transition-transform hover:scale-105 ${getBgColor()}`}
      onClick={() => onClick(symbol)}
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-bold">{symbol}</h3>
        {getTrendIcon()}
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="font-semibold">Score:</span>{' '}
          <span className="font-mono">{score}</span>
        </div>
        <div>
          <span className="font-semibold">Volatility:</span>{' '}
          <span className="capitalize">{volatility}</span>
        </div>
      </div>

      <div className="mt-3 text-center">
        <span
          className={`inline-block px-3 py-1 rounded-full font-semibold capitalize ${
            recommendation === 'buy'
              ? 'bg-green-500 text-white'
              : recommendation === 'sell'
              ? 'bg-red-500 text-white'
              : 'bg-gray-500 text-white'
          }`}
        >
          {recommendation}
        </span>
      </div>
    </div>
  );
};

export default CryptoCard;
