import React, { useState, useEffect } from 'react';
import {
  TradeRecommendation,
  TradeOrder,
  OrderType,
  Currency,
  TradeExecution,
} from '../types';
import CurrencySelector from './CurrencySelector';
import {
  calculateQuantity,
  convertCurrency,
  calculatePotentialProfit,
  calculatePotentialLoss,
  calculateProfitLossPercentage,
} from '../lib/tradeExecutionService';

interface TradeExecutionFormProps {
  recommendation: TradeRecommendation;
  onExecuteTrade: (order: TradeOrder) => Promise<TradeExecution>;
  defaultCurrency?: Currency;
  defaultBudget?: number;
}

export default function TradeExecutionForm({
  recommendation,
  onExecuteTrade,
  defaultCurrency = Currency.USD,
  defaultBudget = 1000,
}: TradeExecutionFormProps) {
  const [budget, setBudget] = useState<number>(defaultBudget);
  const [currency, setCurrency] = useState<Currency>(defaultCurrency);
  const [quantity, setQuantity] = useState<number>(0);
  const [stopLoss, setStopLoss] = useState<number>(recommendation.stopLoss);
  const [takeProfit, setTakeProfit] = useState<number>(
    recommendation.targetPrice
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<TradeExecution | null>(null);

  // Potential profit and loss calculations
  const [potentialProfit, setPotentialProfit] = useState<number>(0);
  const [potentialLoss, setPotentialLoss] = useState<number>(0);
  const [profitPercentage, setProfitPercentage] = useState<number>(0);
  const [lossPercentage, setLossPercentage] = useState<number>(0);

  // Calculate quantity based on budget and price
  useEffect(() => {
    // Convert budget to USD if needed for calculation
    const budgetInUSD =
      currency === Currency.INR
        ? convertCurrency(budget, 'INR', 'USD')
        : budget;

    const calculatedQuantity = calculateQuantity(
      budgetInUSD,
      recommendation.entryPrice
    );
    setQuantity(parseFloat(calculatedQuantity.toFixed(8))); // Limit to 8 decimal places
  }, [budget, recommendation.entryPrice, currency]);

  // Update stop loss and take profit when recommendation changes
  useEffect(() => {
    setStopLoss(recommendation.stopLoss);
    setTakeProfit(recommendation.targetPrice);
  }, [recommendation]);

  // Calculate potential profit and loss
  useEffect(() => {
    // Calculate base quantity in USD
    const budgetInUSD =
      currency === Currency.INR
        ? convertCurrency(budget, 'INR', 'USD')
        : budget;

    const calculatedQuantity = calculateQuantity(
      budgetInUSD,
      recommendation.entryPrice
    );

    // Calculate profit and loss using helper functions
    const profit = calculatePotentialProfit(
      recommendation.entryPrice,
      takeProfit,
      calculatedQuantity,
      'USD',
      currency
    );

    const loss = calculatePotentialLoss(
      recommendation.entryPrice,
      stopLoss,
      calculatedQuantity,
      'USD',
      currency
    );

    setPotentialProfit(profit);
    setPotentialLoss(loss);

    // Calculate percentages based on budget in selected currency
    const profitPct = calculateProfitLossPercentage(profit, budget);
    const lossPct = calculateProfitLossPercentage(loss, budget);

    setProfitPercentage(profitPct);
    setLossPercentage(lossPct);
  }, [takeProfit, stopLoss, recommendation.entryPrice, currency, budget]);

  // Format currency based on selected currency
  const formatCurrency = (value: number) => {
    const currencySymbol = currency === Currency.USD ? '$' : '₹';
    const convertedValue =
      currency === Currency.INR ? convertCurrency(value, 'USD', 'INR') : value;

    return `${currencySymbol}${convertedValue?.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      // Convert budget to USD if in INR for backend processing
      const budgetInUSD =
        currency === Currency.INR
          ? convertCurrency(budget, 'INR', 'USD')
          : budget;

      // Create trade order
      const order: TradeOrder = {
        symbol: recommendation.symbol,
        type: OrderType.Buy, // Default to buy
        price: recommendation.entryPrice,
        quantity,
        stopLoss,
        takeProfit,
        budget: budgetInUSD, // Use USD value for backend
        currency, // Keep track of user's preferred currency
      };

      // Execute trade
      const result = await onExecuteTrade(order);
      setSuccess(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to execute trade');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle currency change
  const handleCurrencyChange = (newCurrency: Currency) => {
    setCurrency(newCurrency);
    // No need to recalculate budget as the useEffect will handle quantity calculation
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Execute Trade
      </h3>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {success ? (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <h4 className="text-sm font-semibold text-green-800 mb-2">
            Trade Executed Successfully
          </h4>
          <p className="text-sm text-green-700 mb-1">
            Order ID: {success.orderId}
          </p>
          <p className="text-sm text-green-700 mb-1">
            {success.type.toUpperCase()} {success.quantity.toFixed(8)}{' '}
            {success.symbol} at {formatCurrency(success.price)}
          </p>
          <p className="text-sm text-green-700">
            Total: {formatCurrency(success.price * success.quantity)}
          </p>
          <div className="mt-3">
            <button
              type="button"
              onClick={() => setSuccess(null)}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              New Trade
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trading Pair
              </label>
              <div className="bg-gray-50 p-2 rounded-md text-gray-800 font-mono">
                {recommendation.symbol}/USD
              </div>
            </div>

            <div className="flex space-x-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Entry Price
                </label>
                <div className="bg-gray-50 p-2 rounded-md text-gray-800 font-mono">
                  {formatCurrency(recommendation.entryPrice)}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Currency
                </label>
                <CurrencySelector
                  selectedCurrency={currency}
                  onCurrencyChange={handleCurrencyChange}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="budget"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Budget
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="text-gray-500 sm:text-sm">
                    {currency === Currency.USD ? '$' : '₹'}
                  </span>
                </div>
                <input
                  type="number"
                  id="budget"
                  value={budget}
                  onChange={(e) => setBudget(parseFloat(e.target.value) || 0)}
                  className="block w-full rounded-md border-0 py-1.5 pl-7 pr-12 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  placeholder="0.00"
                  min="0"
                  step="100"
                  required
                />
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <span className="text-gray-500 sm:text-sm">{currency}</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity
              </label>
              <div className="bg-gray-50 p-2 rounded-md text-gray-800 font-mono">
                {quantity.toFixed(8)} {recommendation.symbol}
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Estimated value:{' '}
                {formatCurrency(quantity * recommendation.entryPrice)}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="stopLoss"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Stop Loss
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-gray-500 sm:text-sm">
                      {currency === Currency.USD ? '$' : '₹'}
                    </span>
                  </div>
                  <input
                    type="number"
                    id="stopLoss"
                    value={stopLoss}
                    onChange={(e) =>
                      setStopLoss(parseFloat(e.target.value) || 0)
                    }
                    className="block w-full rounded-md border-0 py-1.5 pl-7 pr-12 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <p className="mt-1 text-xs text-red-500">
                  Potential Loss: {formatCurrency(potentialLoss)} (
                  {lossPercentage.toFixed(2)}%)
                </p>
              </div>

              <div>
                <label
                  htmlFor="takeProfit"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Take Profit
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-gray-500 sm:text-sm">
                      {currency === Currency.USD ? '$' : '₹'}
                    </span>
                  </div>
                  <input
                    type="number"
                    id="takeProfit"
                    value={takeProfit}
                    onChange={(e) =>
                      setTakeProfit(parseFloat(e.target.value) || 0)
                    }
                    className="block w-full rounded-md border-0 py-1.5 pl-7 pr-12 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <p className="mt-1 text-xs text-green-500">
                  Potential Profit: {formatCurrency(potentialProfit)} (
                  {profitPercentage.toFixed(2)}%)
                </p>
              </div>
            </div>

            <div className="bg-blue-50 p-3 rounded-md">
              <h4 className="text-sm font-semibold text-blue-800 mb-1">
                Trade Summary
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="text-gray-600">Risk/Reward Ratio:</div>
                <div className="font-medium">
                  1:{(potentialProfit / potentialLoss).toFixed(2)}
                </div>

                <div className="text-gray-600">Investment:</div>
                <div className="font-medium">{formatCurrency(budget)}</div>

                <div className="text-gray-600">Potential Return:</div>
                <div className="font-medium text-green-600">
                  {formatCurrency(budget + potentialProfit)} (
                  {profitPercentage.toFixed(2)}%)
                </div>

                <div className="text-gray-600">Potential Loss:</div>
                <div className="font-medium text-red-600">
                  {formatCurrency(budget - potentialLoss)} (
                  {-lossPercentage.toFixed(2)}%)
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || budget <= 0 || quantity <= 0}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Executing...' : 'Execute Trade'}
            </button>
          </div>
        </form>
      )}

      <div className="mt-4 text-xs text-gray-500">
        <p>
          <strong>Note:</strong> This is a simulated trade execution. In a real
          application, this would connect to a trading API to execute actual
          trades.
        </p>
      </div>
    </div>
  );
}
