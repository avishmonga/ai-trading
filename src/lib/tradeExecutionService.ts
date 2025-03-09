import {
  TradeOrder,
  OrderStatus,
  OrderType,
  TradeExecution,
  Currency,
} from '../types';

/**
 * Execute a trade order
 * In a real application, this would connect to a trading API
 */
export async function executeTradeOrder(
  order: TradeOrder
): Promise<TradeExecution> {
  try {
    // In a real application, this would call an actual trading API
    // For now, we'll simulate a successful trade execution

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Generate a unique order ID
    const orderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    return {
      orderId,
      symbol: order.symbol,
      type: order.type,
      price: order.price,
      quantity: order.quantity,
      status: OrderStatus.Executed,
      timestamp: Date.now(),
      stopLoss: order.stopLoss,
      takeProfit: order.takeProfit,
      budget: order.budget,
      currency: order.currency,
      message: `${
        order.type === OrderType.Buy ? 'Buy' : 'Sell'
      } order executed successfully`,
    };
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
    // In a real application, this would call an actual trading API
    // For now, we'll simulate a successful status check

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // For demo purposes, we'll return a mock response
    return {
      orderId,
      symbol: 'BTC',
      type: OrderType.Buy,
      price: 50000,
      quantity: 0.1,
      status: OrderStatus.Executed,
      timestamp: Date.now() - 3600000, // 1 hour ago
      stopLoss: 48000,
      takeProfit: 55000,
      budget: 5000,
      currency: Currency.USD,
      message: 'Order executed successfully',
    };
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
    // In a real application, this would call an actual trading API
    // For now, we'll simulate a successful cancellation

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
      orderId,
      symbol: 'BTC',
      type: OrderType.Buy,
      price: 50000,
      quantity: 0.1,
      status: OrderStatus.Cancelled,
      timestamp: Date.now(),
      stopLoss: 48000,
      takeProfit: 55000,
      budget: 5000,
      currency: Currency.USD,
      message: 'Order cancelled successfully',
    };
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
 * This function assumes budget is already in the same currency as price (USD)
 */
export function calculateQuantity(budget: number, price: number): number {
  if (price <= 0) return 0;
  return budget / price;
}

/**
 * Calculate potential profit based on entry price, target price, quantity, and currency
 */
export function calculatePotentialProfit(
  entryPrice: number,
  targetPrice: number,
  quantity: number,
  fromCurrency: string = 'USD',
  toCurrency: string = 'USD'
): number {
  // Calculate profit in source currency
  const profitInSourceCurrency = (targetPrice - entryPrice) * quantity;

  // Convert to target currency if needed
  if (fromCurrency !== toCurrency) {
    return convertCurrency(profitInSourceCurrency, fromCurrency, toCurrency);
  }

  return profitInSourceCurrency;
}

/**
 * Calculate potential loss based on entry price, stop loss, quantity, and currency
 */
export function calculatePotentialLoss(
  entryPrice: number,
  stopLoss: number,
  quantity: number,
  fromCurrency: string = 'USD',
  toCurrency: string = 'USD'
): number {
  // Calculate loss in source currency
  const lossInSourceCurrency = (entryPrice - stopLoss) * quantity;

  // Convert to target currency if needed
  if (fromCurrency !== toCurrency) {
    return convertCurrency(lossInSourceCurrency, fromCurrency, toCurrency);
  }

  return lossInSourceCurrency;
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
