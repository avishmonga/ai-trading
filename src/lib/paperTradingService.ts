import {
  TradeOrder,
  TradeExecution,
  OrderStatus,
  OrderType,
  Currency,
  TradeFee,
  TradeHistory,
} from '../types';

// Store paper trading data in memory
// In a real app, this would be stored in a database
interface PaperTradingStore {
  trades: TradeExecution[];
  balances: Record<string, number>;
  prices: Record<string, number>;
  tradeHistory: TradeExecution[];
  deposits: DepositRecord[];
  withdrawals: WithdrawalRecord[];
  totalProfitLoss: number;
}

// Interface for deposit records
interface DepositRecord {
  id: string;
  asset: string;
  amount: number;
  timestamp: number;
  currency: Currency;
}

// Interface for withdrawal records
interface WithdrawalRecord {
  id: string;
  asset: string;
  amount: number;
  timestamp: number;
  currency: Currency;
}

// Initialize paper trading store
const paperTradingStore: PaperTradingStore = {
  trades: [],
  balances: {
    USD: 10000, // Start with $10,000
    BTC: 0,
    ETH: 0,
    BNB: 0,
    USDT: 10000, // Start with 10,000 USDT
  },
  prices: {
    BTC: 50000,
    ETH: 3000,
    BNB: 500,
  },
  tradeHistory: [],
  deposits: [],
  withdrawals: [],
  totalProfitLoss: 0,
};

/**
 * Initialize paper trading account
 * This resets the account to default values
 */
export function initializePaperTradingAccount(): void {
  paperTradingStore.balances = {
    USD: 10000,
    BTC: 0,
    ETH: 0,
    BNB: 0,
    USDT: 10000,
  };
  paperTradingStore.trades = [];
  paperTradingStore.tradeHistory = [];
  paperTradingStore.deposits = [];
  paperTradingStore.withdrawals = [];
  paperTradingStore.totalProfitLoss = 0;

  console.log('Paper trading account initialized with default values');
}

/**
 * Execute a paper trade
 */
export async function executePaperTrade(
  order: TradeOrder
): Promise<TradeExecution> {
  try {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const {
      symbol,
      type,
      price,
      quantity,
      stopLoss,
      takeProfit,
      budget,
      currency,
      useBnbForFees,
    } = order;

    // Validate the trade
    validateTrade(order);

    // Calculate fee
    const fee = calculatePaperTradingFee(
      symbol,
      price,
      quantity,
      useBnbForFees
    );

    // Generate a unique order ID
    const orderId = `PAPER-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Create trade execution
    const trade: TradeExecution = {
      orderId,
      symbol,
      type,
      price,
      quantity,
      status: OrderStatus.Executed,
      timestamp: Date.now(),
      stopLoss,
      takeProfit,
      budget,
      currency,
      message: `Paper ${
        type === OrderType.Buy ? 'Buy' : 'Sell'
      } order executed successfully`,
      fee,
      currentPnL: 0,
      currentPnLPercentage: 0,
    };

    // Update paper trading store
    updatePaperTradingStore(trade);

    // Store the trade
    paperTradingStore.trades.push(trade);

    return trade;
  } catch (error) {
    console.error('Error executing paper trade:', error);
    throw new Error(
      `Failed to execute paper trade: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
}

/**
 * Validate a trade before execution
 */
function validateTrade(order: TradeOrder): void {
  const { symbol, type, price, quantity, budget } = order;

  // Check if the symbol exists
  if (!paperTradingStore.prices[symbol.replace('USDT', '')]) {
    throw new Error(`Invalid symbol: ${symbol}`);
  }

  // For buy orders, check if there's enough USDT
  if (type === OrderType.Buy) {
    const totalCost = price * quantity;
    if (paperTradingStore.balances.USDT < totalCost) {
      throw new Error(
        `Insufficient USDT balance for this trade. Required: ${totalCost}, Available: ${paperTradingStore.balances.USDT}`
      );
    }
  }

  // For sell orders, check if there's enough of the asset
  if (type === OrderType.Sell) {
    const asset = symbol.replace('USDT', '');
    if (
      !paperTradingStore.balances[asset] ||
      paperTradingStore.balances[asset] < quantity
    ) {
      throw new Error(
        `Insufficient ${asset} balance for this trade. Required: ${quantity}, Available: ${
          paperTradingStore.balances[asset] || 0
        }`
      );
    }
  }
}

/**
 * Get paper trading account information
 */
export function getPaperTradingAccount() {
  // Calculate total value in USD
  let totalValueUSD =
    paperTradingStore.balances.USD + paperTradingStore.balances.USDT;

  // Add value of crypto assets
  Object.entries(paperTradingStore.balances).forEach(([asset, amount]) => {
    if (asset !== 'USD' && asset !== 'USDT' && amount > 0) {
      const price = paperTradingStore.prices[asset] || 0;
      if (price > 0) {
        totalValueUSD += amount * price;
      }
    }
  });

  // Update P/L for active trades
  updateActiveTradeProfitLoss();

  return {
    balances: { ...paperTradingStore.balances },
    prices: { ...paperTradingStore.prices },
    activeTrades: getActivePaperTrades(),
    tradeHistory: [...paperTradingStore.tradeHistory],
    deposits: [...paperTradingStore.deposits],
    withdrawals: [...paperTradingStore.withdrawals],
    totalValueUSD,
    totalProfitLoss: paperTradingStore.totalProfitLoss,
  };
}

/**
 * Update profit/loss for active trades
 */
function updateActiveTradeProfitLoss(): void {
  paperTradingStore.trades.forEach((trade) => {
    if (trade.status === OrderStatus.Executed) {
      const currentPrice =
        paperTradingStore.prices[trade.symbol.replace('USDT', '')];
      if (currentPrice) {
        // Calculate P/L
        let pnl = 0;
        if (trade.type === OrderType.Buy) {
          pnl = (currentPrice - trade.price) * trade.quantity;
        } else {
          pnl = (trade.price - currentPrice) * trade.quantity;
        }

        // Subtract fees
        if (trade.fee) {
          pnl -= trade.fee.amount;
        }

        // Calculate percentage
        const investment = trade.price * trade.quantity;
        const pnlPercentage = (pnl / investment) * 100;

        // Update trade
        trade.currentPnL = pnl;
        trade.currentPnLPercentage = pnlPercentage;
      }
    }
  });
}

/**
 * Get active paper trades
 */
export function getActivePaperTrades(): TradeExecution[] {
  return paperTradingStore.trades.filter(
    (trade) =>
      trade.status === OrderStatus.Executed ||
      trade.status === OrderStatus.Pending
  );
}

/**
 * Get paper trading history with optional date range
 */
export function getPaperTradingHistory(
  startDate?: Date,
  endDate?: Date
): TradeHistory {
  let trades = [...paperTradingStore.tradeHistory];

  // Filter by date range if provided
  if (startDate || endDate) {
    trades = trades.filter((trade) => {
      const tradeDate = new Date(trade.timestamp);
      if (startDate && endDate) {
        return tradeDate >= startDate && tradeDate <= endDate;
      } else if (startDate) {
        return tradeDate >= startDate;
      } else if (endDate) {
        return tradeDate <= endDate;
      }
      return true;
    });
  }

  // Calculate metrics
  let totalProfit = 0;
  let totalLoss = 0;
  let totalFees = 0;
  let winCount = 0;
  let totalCount = 0;

  trades.forEach((trade) => {
    if (trade.status === OrderStatus.Cancelled) {
      // For cancelled trades, calculate P/L at cancellation
      if (trade.currentPnL) {
        if (trade.currentPnL > 0) {
          totalProfit += trade.currentPnL;
          winCount++;
        } else {
          totalLoss += Math.abs(trade.currentPnL);
        }
        totalCount++;
      }
    }

    // Add fees
    if (trade.fee) {
      totalFees += trade.fee.amount;
    }
  });

  const winRate = totalCount > 0 ? (winCount / totalCount) * 100 : 0;

  return {
    trades,
    totalProfit,
    totalLoss,
    totalFees,
    winRate,
    currency: Currency.USD,
  };
}

/**
 * Cancel a paper trade
 */
export async function cancelPaperTrade(
  orderId: string
): Promise<TradeExecution> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Find the trade
  const tradeIndex = paperTradingStore.trades.findIndex(
    (trade) => trade.orderId === orderId
  );

  if (tradeIndex === -1) {
    throw new Error(`Trade with order ID ${orderId} not found`);
  }

  // Get the trade
  const trade = { ...paperTradingStore.trades[tradeIndex] };

  // Calculate final P/L for the trade
  const currentPrice =
    paperTradingStore.prices[trade.symbol.replace('USDT', '')];
  let pnl = 0;
  let pnlPercentage = 0;

  if (currentPrice) {
    if (trade.type === OrderType.Buy) {
      pnl = (currentPrice - trade.price) * trade.quantity;
    } else {
      pnl = (trade.price - currentPrice) * trade.quantity;
    }

    // Subtract fees
    if (trade.fee) {
      pnl -= trade.fee.amount;
    }

    // Calculate percentage
    const investment = trade.price * trade.quantity;
    pnlPercentage = (pnl / investment) * 100;
  }

  // Update the trade status
  trade.status = OrderStatus.Cancelled;
  trade.message = 'Paper trade cancelled successfully';
  trade.currentPnL = pnl;
  trade.currentPnLPercentage = pnlPercentage;

  // Update the store
  paperTradingStore.trades[tradeIndex] = trade;

  // Add to trade history
  paperTradingStore.tradeHistory.push(trade);

  // Update total P/L
  paperTradingStore.totalProfitLoss += pnl;

  // Reverse the balance changes
  reverseTradeBalanceChanges(trade);

  return {
    ...trade,
    pnl,
    pnlPercentage,
  };
}

/**
 * Deposit funds to paper trading account
 */
export function depositToPaperTrading(
  asset: string,
  amount: number,
  currency: Currency = Currency.USD
): DepositRecord {
  if (amount <= 0) {
    throw new Error('Deposit amount must be greater than zero');
  }

  // Generate a unique deposit ID
  const id = `DEP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  // Create deposit record
  const deposit: DepositRecord = {
    id,
    asset,
    amount,
    timestamp: Date.now(),
    currency,
  };

  // Update balance
  paperTradingStore.balances[asset] =
    (paperTradingStore.balances[asset] || 0) + amount;

  // Store deposit record
  paperTradingStore.deposits.push(deposit);

  return deposit;
}

/**
 * Withdraw funds from paper trading account
 */
export function withdrawFromPaperTrading(
  asset: string,
  amount: number,
  currency: Currency = Currency.USD
): WithdrawalRecord {
  if (amount <= 0) {
    throw new Error('Withdrawal amount must be greater than zero');
  }

  // Check if there's enough balance
  if (
    !paperTradingStore.balances[asset] ||
    paperTradingStore.balances[asset] < amount
  ) {
    throw new Error(`Insufficient ${asset} balance for withdrawal`);
  }

  // Generate a unique withdrawal ID
  const id = `WD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  // Create withdrawal record
  const withdrawal: WithdrawalRecord = {
    id,
    asset,
    amount,
    timestamp: Date.now(),
    currency,
  };

  // Update balance
  paperTradingStore.balances[asset] -= amount;

  // Store withdrawal record
  paperTradingStore.withdrawals.push(withdrawal);

  return withdrawal;
}

/**
 * Update paper trading prices
 * This simulates market price changes
 */
export function updatePaperTradingPrices(prices: Record<string, number>) {
  // Update prices
  paperTradingStore.prices = { ...paperTradingStore.prices, ...prices };

  // Check for stop loss and take profit triggers
  checkStopLossAndTakeProfit();
}

/**
 * Get current paper trading price for a symbol
 */
export function getPaperTradingPrice(symbol: string): number {
  return paperTradingStore.prices[symbol] || 0;
}

/**
 * Set paper trading balance
 */
export function setPaperTradingBalance(asset: string, amount: number) {
  paperTradingStore.balances[asset] = amount;
}

/**
 * Calculate paper trading fee
 */
function calculatePaperTradingFee(
  symbol: string,
  price: number,
  quantity: number,
  useBnbForFees: boolean = false
): TradeFee {
  // Default fee rate (0.1%)
  let feeRate = 0.001;

  // Apply BNB discount if applicable
  if (useBnbForFees) {
    feeRate = feeRate * 0.75; // 25% discount
  }

  // Calculate fee amount
  const orderValue = price * quantity;
  const feeAmount = orderValue * feeRate;

  // Determine fee asset
  const feeAsset = useBnbForFees ? 'BNB' : 'USDT';

  return {
    amount: feeAmount,
    asset: feeAsset,
    rate: feeRate,
  };
}

/**
 * Update paper trading store with a new trade
 */
function updatePaperTradingStore(trade: TradeExecution) {
  const { symbol, type, price, quantity, fee } = trade;

  if (type === OrderType.Buy) {
    // Deduct the cost from USD/USDT balance
    const cost = price * quantity;
    paperTradingStore.balances['USDT'] -= cost;

    // Add the purchased asset
    paperTradingStore.balances[symbol] =
      (paperTradingStore.balances[symbol] || 0) + quantity;

    // Deduct the fee
    if (fee) {
      paperTradingStore.balances[fee.asset] =
        (paperTradingStore.balances[fee.asset] || 0) - fee.amount;
    }
  } else {
    // Add the proceeds to USD/USDT balance
    const proceeds = price * quantity;
    paperTradingStore.balances['USDT'] += proceeds;

    // Deduct the sold asset
    paperTradingStore.balances[symbol] =
      (paperTradingStore.balances[symbol] || 0) - quantity;

    // Deduct the fee
    if (fee) {
      paperTradingStore.balances[fee.asset] =
        (paperTradingStore.balances[fee.asset] || 0) - fee.amount;
    }
  }
}

/**
 * Reverse balance changes for a cancelled trade
 */
function reverseTradeBalanceChanges(trade: TradeExecution) {
  const { symbol, type, price, quantity, fee } = trade;

  if (type === OrderType.Buy) {
    // Add back the cost to USD/USDT balance
    const cost = price * quantity;
    paperTradingStore.balances['USDT'] += cost;

    // Remove the purchased asset
    paperTradingStore.balances[symbol] =
      (paperTradingStore.balances[symbol] || 0) - quantity;

    // Add back the fee
    if (fee) {
      paperTradingStore.balances[fee.asset] =
        (paperTradingStore.balances[fee.asset] || 0) + fee.amount;
    }
  } else {
    // Remove the proceeds from USD/USDT balance
    const proceeds = price * quantity;
    paperTradingStore.balances['USDT'] -= proceeds;

    // Add back the sold asset
    paperTradingStore.balances[symbol] =
      (paperTradingStore.balances[symbol] || 0) + quantity;

    // Add back the fee
    if (fee) {
      paperTradingStore.balances[fee.asset] =
        (paperTradingStore.balances[fee.asset] || 0) + fee.amount;
    }
  }
}

/**
 * Check for stop loss and take profit triggers
 */
function checkStopLossAndTakeProfit() {
  // Get active trades
  const activeTrades = getActivePaperTrades();

  // Check each trade
  activeTrades.forEach((trade) => {
    const currentPrice = paperTradingStore.prices[trade.symbol] || trade.price;

    // Check stop loss
    if (trade.type === OrderType.Buy && currentPrice <= trade.stopLoss) {
      // Trigger stop loss
      executePaperStopLoss(trade, currentPrice);
    }
    // Check take profit
    else if (trade.type === OrderType.Buy && currentPrice >= trade.takeProfit) {
      // Trigger take profit
      executePaperTakeProfit(trade, currentPrice);
    }
    // For sell orders, the logic is reversed
    else if (trade.type === OrderType.Sell && currentPrice >= trade.stopLoss) {
      // Trigger stop loss
      executePaperStopLoss(trade, currentPrice);
    } else if (
      trade.type === OrderType.Sell &&
      currentPrice <= trade.takeProfit
    ) {
      // Trigger take profit
      executePaperTakeProfit(trade, currentPrice);
    }
  });
}

/**
 * Execute paper stop loss
 */
function executePaperStopLoss(trade: TradeExecution, currentPrice: number) {
  // Find the trade in the store
  const tradeIndex = paperTradingStore.trades.findIndex(
    (t) => t.orderId === trade.orderId
  );

  if (tradeIndex === -1) return;

  // Create a new sell trade to close the position
  const closeTrade: TradeExecution = {
    orderId: `PAPER-SL-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    symbol: trade.symbol,
    type: trade.type === OrderType.Buy ? OrderType.Sell : OrderType.Buy, // Opposite of original trade
    price: currentPrice,
    quantity: trade.quantity,
    status: OrderStatus.Executed,
    timestamp: Date.now(),
    stopLoss: 0,
    takeProfit: 0,
    budget: trade.budget,
    currency: trade.currency,
    message: `Paper stop loss executed at ${currentPrice}`,
    fee: calculatePaperTradingFee(
      trade.symbol,
      currentPrice,
      trade.quantity,
      false
    ),
  };

  // Update the original trade
  paperTradingStore.trades[tradeIndex] = {
    ...paperTradingStore.trades[tradeIndex],
    status: OrderStatus.Executed,
    message: `Position closed by stop loss at ${currentPrice}`,
  };

  // Add the close trade
  paperTradingStore.trades.push(closeTrade);

  // Update balances
  updatePaperTradingStore(closeTrade);
}

/**
 * Execute paper take profit
 */
function executePaperTakeProfit(trade: TradeExecution, currentPrice: number) {
  // Find the trade in the store
  const tradeIndex = paperTradingStore.trades.findIndex(
    (t) => t.orderId === trade.orderId
  );

  if (tradeIndex === -1) return;

  // Create a new sell trade to close the position
  const closeTrade: TradeExecution = {
    orderId: `PAPER-TP-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    symbol: trade.symbol,
    type: trade.type === OrderType.Buy ? OrderType.Sell : OrderType.Buy, // Opposite of original trade
    price: currentPrice,
    quantity: trade.quantity,
    status: OrderStatus.Executed,
    timestamp: Date.now(),
    stopLoss: 0,
    takeProfit: 0,
    budget: trade.budget,
    currency: trade.currency,
    message: `Paper take profit executed at ${currentPrice}`,
    fee: calculatePaperTradingFee(
      trade.symbol,
      currentPrice,
      trade.quantity,
      false
    ),
  };

  // Update the original trade
  paperTradingStore.trades[tradeIndex] = {
    ...paperTradingStore.trades[tradeIndex],
    status: OrderStatus.Executed,
    message: `Position closed by take profit at ${currentPrice}`,
  };

  // Add the close trade
  paperTradingStore.trades.push(closeTrade);

  // Update balances
  updatePaperTradingStore(closeTrade);
}
