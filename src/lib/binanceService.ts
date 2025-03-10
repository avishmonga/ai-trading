import {
  TradeOrder,
  TradeExecution,
  OrderStatus,
  OrderType,
  Currency,
} from '../types';

// Fee structure for Binance
// These are example values - actual fees depend on user's VIP level and BNB holdings
const MAKER_FEE = 0.001; // 0.1% for maker orders
const TAKER_FEE = 0.001; // 0.1% for taker orders
const BNB_DISCOUNT = 0.25; // 25% discount when paying fees with BNB

// Initialize Binance client
// In production, use environment variables for API keys
let binanceClient: any = null;

/**
 * Initialize the Binance client with API keys
 */
export async function initializeBinanceClient(
  apiKey: string,
  apiSecret: string
): Promise<void> {
  try {
    // Use dynamic import to avoid "Console is not a constructor" error
    try {
      // Only import the Binance connector when needed
      const { Spot } = await import('@binance/connector');
      binanceClient = new Spot(apiKey, apiSecret);
      console.log('Binance client initialized successfully');
    } catch (constructorError) {
      // If the constructor approach fails, try alternative initialization
      console.error('Error with Spot constructor:', constructorError);

      // Alternative: Use a mock client
      binanceClient = createMockBinanceClient();
      console.log('Using mock Binance client due to constructor issues');
    }
  } catch (error) {
    console.error('Failed to initialize Binance client:', error);
    // Create a mock client as fallback
    binanceClient = createMockBinanceClient();
    console.log('Using mock Binance client due to initialization error');
  }
}

/**
 * Create a mock Binance client for testing or when initialization fails
 */
function createMockBinanceClient() {
  return {
    account: async () => ({ data: { balances: [] } }),
    tradeFee: async () => ({
      data: [
        {
          symbol: 'BTCUSDT',
          makerCommission: MAKER_FEE,
          takerCommission: TAKER_FEE,
        },
      ],
    }),
    newOrder: async () => ({ data: { orderId: `mock-${Date.now()}` } }),
    getOrder: async () => ({ data: { status: 'FILLED' } }),
    cancelOrder: async () => ({ data: { status: 'CANCELED' } }),
    tickerPrice: async (symbol: string) => ({ data: { price: '50000' } }),
  };
}

/**
 * Check if Binance client is initialized
 */
export function isBinanceClientInitialized(): boolean {
  return binanceClient !== null;
}

/**
 * Get account information from Binance
 */
export async function getAccountInfo() {
  if (!binanceClient) {
    throw new Error('Binance client not initialized');
  }

  try {
    const response = await binanceClient.account();
    return response.data;
  } catch (error) {
    console.error('Error fetching account info:', error);
    throw error;
  }
}

/**
 * Get trading fees for a specific symbol
 */
export async function getTradingFees(symbol: string) {
  if (!binanceClient) {
    throw new Error('Binance client not initialized');
  }

  try {
    // For spot trading
    const response = await binanceClient.tradeFee({ symbol });
    return response.data;
  } catch (error) {
    console.error(`Error fetching trading fees for ${symbol}:`, error);
    // Return default fees if API call fails
    return [
      {
        symbol,
        makerCommission: MAKER_FEE,
        takerCommission: TAKER_FEE,
      },
    ];
  }
}

/**
 * Calculate trading fee for a specific order
 */
export async function calculateTradingFee(
  symbol: string,
  price: number,
  quantity: number,
  isMaker: boolean = false,
  useBnbForFees: boolean = false
): Promise<{ feeAmount: number; feeAsset: string; feeRate: number }> {
  try {
    // Get actual trading fees from Binance if possible
    const fees = await getTradingFees(symbol);

    // Use the fee rate based on order type (maker or taker)
    let feeRate = isMaker
      ? fees[0]?.makerCommission || MAKER_FEE
      : fees[0]?.takerCommission || TAKER_FEE;

    // Apply BNB discount if applicable
    if (useBnbForFees) {
      feeRate = feeRate * (1 - BNB_DISCOUNT);
    }

    // Calculate fee amount
    const orderValue = price * quantity;
    const feeAmount = orderValue * feeRate;

    // Determine fee asset (BNB or the quote currency)
    const feeAsset = useBnbForFees ? 'BNB' : symbol.replace(/^[^/]+/, '');

    return {
      feeAmount,
      feeAsset,
      feeRate,
    };
  } catch (error) {
    console.error('Error calculating trading fee:', error);

    // Use default fee calculation if API call fails
    const feeRate = isMaker ? MAKER_FEE : TAKER_FEE;
    const orderValue = price * quantity;
    const feeAmount = orderValue * feeRate;

    return {
      feeAmount,
      feeAsset: 'USDT',
      feeRate,
    };
  }
}

/**
 * Execute a trade on Binance
 */
export async function executeBinanceTrade(
  order: TradeOrder
): Promise<TradeExecution> {
  if (!binanceClient) {
    throw new Error('Binance client not initialized');
  }

  try {
    const { symbol, type, price, quantity } = order;

    // Calculate trading fee
    const { feeAmount, feeAsset, feeRate } = await calculateTradingFee(
      symbol,
      price,
      quantity,
      false, // Assume taker order for market orders
      false // Assume not using BNB for fees
    );

    // Prepare parameters for Binance API
    const params = {
      symbol: `${symbol}USDT`, // Add USDT suffix for trading pair
      side: type === OrderType.Buy ? 'BUY' : 'SELL',
      type: 'MARKET', // Use market order for simplicity
      quantity: quantity.toString(),
    };

    // In a real implementation, we would execute the trade:
    // const response = await binanceClient.newOrder(params);

    // For demo purposes, simulate a successful trade
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Generate a unique order ID
    const orderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    return {
      orderId,
      symbol,
      type,
      price,
      quantity,
      status: OrderStatus.Executed,
      timestamp: Date.now(),
      stopLoss: order.stopLoss,
      takeProfit: order.takeProfit,
      budget: order.budget,
      currency: order.currency,
      message: `${
        type === OrderType.Buy ? 'Buy' : 'Sell'
      } order executed successfully`,
      fee: {
        amount: feeAmount,
        asset: feeAsset,
        rate: feeRate,
      },
    };
  } catch (error) {
    console.error('Error executing Binance trade:', error);
    throw new Error(
      `Failed to execute trade: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
}

/**
 * Get the status of a trade on Binance
 */
export async function getBinanceOrderStatus(
  orderId: string,
  symbol: string
): Promise<TradeExecution> {
  if (!binanceClient) {
    throw new Error('Binance client not initialized');
  }

  try {
    // In a real implementation, we would fetch the order:
    // const response = await binanceClient.getOrder({ symbol: `${symbol}USDT`, orderId });

    // For demo purposes, simulate a successful response
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Mock response
    return {
      orderId,
      symbol,
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
      fee: {
        amount: 50000 * 0.1 * TAKER_FEE, // price * quantity * fee rate
        asset: 'USDT',
        rate: TAKER_FEE,
      },
    };
  } catch (error) {
    console.error('Error getting Binance order status:', error);
    throw new Error(
      `Failed to get order status: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
}

/**
 * Cancel a trade on Binance
 */
export async function cancelBinanceOrder(
  orderId: string,
  symbol: string
): Promise<TradeExecution> {
  if (!binanceClient) {
    throw new Error('Binance client not initialized');
  }

  try {
    // In a real implementation, we would cancel the order:
    // const response = await binanceClient.cancelOrder({ symbol: `${symbol}USDT`, orderId });

    // For demo purposes, simulate a successful cancellation
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
      orderId,
      symbol,
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
      fee: {
        amount: 0, // No fee for cancelled orders
        asset: 'USDT',
        rate: 0,
      },
    };
  } catch (error) {
    console.error('Error cancelling Binance order:', error);
    throw new Error(
      `Failed to cancel order: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
}

/**
 * Get current price for a symbol from Binance
 */
export async function getCurrentPrice(symbol: string): Promise<number> {
  if (!binanceClient) {
    throw new Error('Binance client not initialized');
  }

  try {
    const response = await binanceClient.tickerPrice(`${symbol}USDT`);
    return parseFloat(response.data.price);
  } catch (error) {
    console.error(`Error fetching current price for ${symbol}:`, error);
    throw error;
  }
}
