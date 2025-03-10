import { TradeOrder, TradeExecution } from '../types';
import {
  executePaperTrade,
  cancelPaperTrade,
  getActivePaperTrades,
} from './paperTradingService';

// Trading mode
export enum TradingMode {
  Paper = 'paper',
  Live = 'live',
}

// Initialize trading mode from environment variables if available
// Default to paper trading for safety
let currentTradingMode: TradingMode = TradingMode.Paper;

// Initialize trading mode when the module is loaded
if (typeof process !== 'undefined' && process.env) {
  const envTradingMode =
    process.env.NEXT_PUBLIC_TRADING_MODE || process.env.TRADING_MODE;
  if (envTradingMode === 'live') {
    currentTradingMode = TradingMode.Live;
  } else {
    currentTradingMode = TradingMode.Paper;
  }
  console.log(
    `Trading mode initialized from environment: ${currentTradingMode}`
  );
} else {
  console.log(`Using default trading mode: ${currentTradingMode}`);
}

/**
 * Set the trading mode
 */
export function setTradingMode(mode: TradingMode): void {
  currentTradingMode = mode;
  console.log(`Trading mode set to: ${mode}`);
}

/**
 * Get the current trading mode
 */
export function getTradingMode(): TradingMode {
  return currentTradingMode;
}

/**
 * Execute a trade order
 * Uses paper trading by default
 */
export async function executeTradeOrder(
  order: TradeOrder
): Promise<TradeExecution> {
  try {
    // Always use paper trading for now
    console.log(`Executing ${currentTradingMode} trade for ${order.symbol}...`);

    // In the future, we can add support for live trading
    // if (currentTradingMode === TradingMode.Live) {
    //   // Execute live trade using Binance API
    // } else {
    //   // Execute paper trade
    // }

    return await executePaperTrade(order);
  } catch (error) {
    console.error('Error executing trade:', error);
    throw new Error(
      `Failed to execute trade: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
}

/**
 * Get the status of a trade order
 */
export async function getTradeStatus(orderId: string): Promise<TradeExecution> {
  try {
    // Get active paper trades
    const activeTrades = getActivePaperTrades();

    // Find the trade
    const trade = activeTrades.find((trade) => trade.orderId === orderId);

    if (!trade) {
      throw new Error(`Trade with order ID ${orderId} not found`);
    }

    return trade;
  } catch (error) {
    console.error('Error getting trade status:', error);
    throw new Error(
      `Failed to get trade status: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
}

/**
 * Cancel a trade order
 */
export async function cancelTradeOrder(
  orderId: string
): Promise<TradeExecution> {
  try {
    // Always use paper trading for now
    console.log(
      `Cancelling ${currentTradingMode} trade with order ID ${orderId}...`
    );
    return await cancelPaperTrade(orderId);
  } catch (error) {
    console.error('Error cancelling trade:', error);
    throw new Error(
      `Failed to cancel trade: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
}

/**
 * Calculate the quantity based on budget and price
 */
export function calculateQuantity(budget: number, price: number): number {
  if (price <= 0) return 0;
  return budget / price;
}

/**
 * Calculate potential profit based on entry price, target price, quantity, and currency
 * Includes trading fees in the calculation
 */
export function calculatePotentialProfit(
  entryPrice: number,
  targetPrice: number,
  quantity: number,
  fromCurrency: string = 'USD',
  toCurrency: string = 'USD',
  feeRate: number = 0.001 // Default 0.1% fee
): number {
  // Calculate profit in source currency
  const entryValue = entryPrice * quantity;
  const targetValue = targetPrice * quantity;

  // Calculate fees
  const entryFee = entryValue * feeRate;
  const targetFee = targetValue * feeRate;

  // Calculate net profit (after fees)
  const profitInSourceCurrency =
    targetValue - entryValue - (entryFee + targetFee);

  // Convert to target currency if needed
  if (fromCurrency !== toCurrency) {
    return convertCurrency(profitInSourceCurrency, fromCurrency, toCurrency);
  }

  return profitInSourceCurrency;
}

/**
 * Calculate potential loss based on entry price, stop loss, quantity, and currency
 * Includes trading fees in the calculation
 */
export function calculatePotentialLoss(
  entryPrice: number,
  stopLoss: number,
  quantity: number,
  fromCurrency: string = 'USD',
  toCurrency: string = 'USD',
  feeRate: number = 0.001 // Default 0.1% fee
): number {
  // Calculate values
  const entryValue = entryPrice * quantity;
  const stopLossValue = stopLoss * quantity;

  // Calculate fees
  const entryFee = entryValue * feeRate;
  const stopLossFee = stopLossValue * feeRate;

  // Calculate net loss (after fees)
  const lossInSourceCurrency =
    entryValue - stopLossValue + (entryFee + stopLossFee);

  // Convert to target currency if needed
  if (fromCurrency !== toCurrency) {
    return convertCurrency(lossInSourceCurrency, fromCurrency, toCurrency);
  }

  return lossInSourceCurrency;
}

/**
 * Calculate trading fees for a given order value
 */
export function calculateTradingFees(
  orderValue: number,
  feeRate: number = 0.001, // Default 0.1% fee
  useBnbForFees: boolean = false
): number {
  // Apply BNB discount if applicable
  const effectiveFeeRate = useBnbForFees ? feeRate * 0.75 : feeRate; // 25% discount with BNB

  return orderValue * effectiveFeeRate;
}

/**
 * Calculate profit/loss percentage based on investment amount
 */
export function calculateProfitLossPercentage(
  profitLoss: number,
  investment: number
): number {
  if (investment === 0) return 0;
  return (profitLoss / investment) * 100;
}

/**
 * Convert currency (USD to INR or INR to USD)
 * In a real application, this would use real-time exchange rates
 */
export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): number {
  // Use a fixed exchange rate for demonstration purposes
  // In a real application, you would fetch the current exchange rate from an API
  const exchangeRates = {
    USD_TO_INR: 83.5, // 1 USD = 83.5 INR (example rate)
    INR_TO_USD: 0.012, // 1 INR = 0.012 USD (example rate)
  };

  if (fromCurrency === 'USD' && toCurrency === 'INR') {
    return amount * exchangeRates.USD_TO_INR;
  } else if (fromCurrency === 'INR' && toCurrency === 'USD') {
    return amount * exchangeRates.INR_TO_USD;
  }

  // If currencies are the same or not supported, return the original amount
  return amount;
}
