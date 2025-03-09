import React, { useState } from 'react';
import {
  TradeRecommendation as TradeRecommendationType,
  AIProvider,
  Currency,
  TradeOrder,
  TradeExecution,
} from '@/types';
import TradeExecutionForm from './TradeExecutionForm';
import CurrencySelector from './CurrencySelector';
import { convertCurrency } from '@/lib/tradeExecutionService';

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

  const [showTradeForm, setShowTradeForm] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(
    Currency.USD
  );

  // Format currency
  const formatCurrency = (value: number) => {
    const currencySymbol = selectedCurrency === Currency.USD ? '$' : '₹';
    const convertedValue =
      selectedCurrency === Currency.INR
        ? convertCurrency(value, 'USD', 'INR')
        : value;

    // Use the currencySymbol directly instead of relying on Intl.NumberFormat
    return `${currencySymbol}${convertedValue?.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    })}`;
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

  // Execute trade
  const executeTrade = async (order: TradeOrder): Promise<TradeExecution> => {
    try {
      const response = await fetch('/api/trade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(order),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Failed to execute trade: ${response.status} ${
            response.statusText
          }. ${errorData.error || ''}`
        );
      }

      const data = await response.json();
      return data.trade;
    } catch (error) {
      console.error('Error executing trade:', error);
      throw error;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800">
          AI Trade Recommendation for {symbol}
        </h3>
        <div className="flex items-center space-x-4">
          <CurrencySelector
            selectedCurrency={selectedCurrency}
            onCurrencyChange={setSelectedCurrency}
          />
          <div className={`text-sm font-semibold ${getConfidenceColor()}`}>
            Confidence: {Math.round(confidence * 100)}%
          </div>
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
            {riskRewardRatio === null
              ? '-'
              : `1: ${riskRewardRatio.toFixed(2)}`}
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

      <div className="mt-6 flex justify-between items-center">
        <div className="text-xs text-gray-500">
          <p>
            <strong>Note:</strong> This is an AI-generated recommendation for
            intraday trading only. Always do your own research and consider your
            risk tolerance before trading.
          </p>
          <p className="mt-1">
            <strong>Powered by:</strong> {getProviderName()} ({getModelName()})
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowTradeForm(!showTradeForm)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {showTradeForm ? 'Hide Trade Form' : 'Execute Trade'}
        </button>
      </div>

      {showTradeForm && (
        <div className="mt-6">
          <TradeExecutionForm
            recommendation={recommendation}
            onExecuteTrade={executeTrade}
            defaultCurrency={selectedCurrency}
          />
        </div>
      )}
    </div>
  );
};

export default TradeRecommendation;
