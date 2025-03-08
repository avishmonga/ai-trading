import React from 'react';
import {
  TradeRecommendation as TradeRecommendationType,
  AIProvider,
} from '@/types';

interface TradeRecommendationProps {
  recommendation: TradeRecommendationType;
}

const TradeRecommendation: React.FC<TradeRecommendationProps> = ({
  recommendation,
}) => {
  const {
    symbol,
    entryPrice,
    targetPrice,
    stopLoss,
    riskRewardRatio,
    confidence,
    reasoning,
    provider = AIProvider.OpenAI, // Default to OpenAI if not specified
  } = recommendation;

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    }).format(value);
  };

  // Calculate potential profit and loss percentages
  const profitPercentage = ((targetPrice - entryPrice) / entryPrice) * 100;
  const lossPercentage = ((stopLoss - entryPrice) / entryPrice) * 100;

  // Determine confidence level color
  const getConfidenceColor = () => {
    if (confidence >= 0.7) return 'text-green-600';
    if (confidence >= 0.4) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Get provider display name
  const getProviderName = () => {
    return provider === AIProvider.OpenAI ? 'OpenAI' : 'Google Gemini';
  };

  // Get provider model name
  const getModelName = () => {
    return provider === AIProvider.OpenAI ? 'GPT-3.5 Turbo' : 'Gemini 1.5 Pro';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800">
          AI Trade Recommendation for {symbol}
        </h3>
        <div className={`text-sm font-semibold ${getConfidenceColor()}`}>
          Confidence: {Math.round(confidence * 100)}%
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-500 mb-2">
            Entry Price
          </h4>
          <p className="text-lg font-mono">{formatCurrency(entryPrice)}</p>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-500 mb-2">
            Target Price
          </h4>
          <p className="text-lg font-mono text-green-600">
            {formatCurrency(targetPrice)}
            <span className="text-sm ml-2">
              ({profitPercentage.toFixed(2)}%)
            </span>
          </p>
        </div>

        <div className="bg-red-50 p-4 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-500 mb-2">
            Stop Loss
          </h4>
          <p className="text-lg font-mono text-red-600">
            {formatCurrency(stopLoss)}
            <span className="text-sm ml-2">({lossPercentage.toFixed(2)}%)</span>
          </p>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-500 mb-2">
            Risk/Reward Ratio
          </h4>
          <p className="text-lg font-mono text-blue-600">
            1:{riskRewardRatio.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="mt-4">
        <h4 className="text-sm font-semibold text-gray-500 mb-2">
          AI Reasoning
        </h4>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-700">{reasoning}</p>
        </div>
      </div>

      <div className="mt-6 text-xs text-gray-500">
        <p>
          <strong>Note:</strong> This is an AI-generated recommendation for
          intraday trading only. Always do your own research and consider your
          risk tolerance before trading.
        </p>
        <p className="mt-1">
          <strong>Powered by:</strong> {getProviderName()} ({getModelName()})
        </p>
      </div>
    </div>
  );
};

export default TradeRecommendation;
