import '@testing-library/jest-dom';
import {
  initializePaperTradingAccount,
  getPaperTradingAccount,
  executePaperTrade,
  cancelPaperTrade,
  depositToPaperTrading,
  withdrawFromPaperTrading,
  updatePaperTradingPrices,
} from '../paperTradingService';
import { OrderType, Currency } from '@/types';

// Increase the default timeout for all tests
jest.setTimeout(30000);

describe('Paper Trading Service', () => {
  beforeEach(() => {
    // Reset the paper trading account before each test
    initializePaperTradingAccount();
    jest.clearAllTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  test('should initialize paper trading account with default values', () => {
    const account = getPaperTradingAccount();
    expect(account.balances.USD).toBe(10000);
    expect(account.balances.USDT).toBe(10000);
    expect(account.balances.BTC).toBe(0);
    expect(account.balances.ETH).toBe(0);
    expect(account.balances.BNB).toBe(0);
    expect(account.activeTrades.length).toBe(0);
    expect(account.tradeHistory.length).toBe(0);
    expect(account.deposits.length).toBe(0);
    expect(account.withdrawals.length).toBe(0);
    expect(account.totalProfitLoss).toBe(0);
  });

  test('should execute a buy trade successfully', async () => {
    const trade = await executePaperTrade({
      symbol: 'BTC',
      type: OrderType.Buy,
      price: 50000,
      quantity: 0.1,
      stopLoss: 45000,
      takeProfit: 55000,
      budget: 5000,
      currency: Currency.USD,
    });

    expect(trade.orderId).toContain('PAPER-');
    expect(trade.symbol).toBe('BTC');
    expect(trade.type).toBe(OrderType.Buy);
    expect(trade.price).toBe(50000);
    expect(trade.quantity).toBe(0.1);

    // Check account balances
    const account = getPaperTradingAccount();
    expect(account.balances.USDT).toBeLessThan(10000); // USDT should be reduced
    expect(account.balances.BTC).toBe(0.1); // BTC should be increased
    expect(account.activeTrades.length).toBe(1);
  });

  test('should execute a sell trade successfully', async () => {
    // First buy some BTC
    await executePaperTrade({
      symbol: 'BTC',
      type: OrderType.Buy,
      price: 50000,
      quantity: 0.1,
      stopLoss: 45000,
      takeProfit: 55000,
      budget: 5000,
      currency: Currency.USD,
    });

    // Then sell half of it
    const trade = await executePaperTrade({
      symbol: 'BTC',
      type: OrderType.Sell,
      price: 52000,
      quantity: 0.05,
      stopLoss: 0,
      takeProfit: 0,
      budget: 0,
      currency: Currency.USD,
    });

    expect(trade.type).toBe(OrderType.Sell);

    // Check account balances
    const account = getPaperTradingAccount();
    expect(account.balances.BTC).toBe(0.05); // BTC should be reduced
    expect(account.activeTrades.length).toBe(2);
  });

  test('should cancel a trade successfully', async () => {
    // Execute a trade
    const trade = await executePaperTrade({
      symbol: 'ETH',
      type: OrderType.Buy,
      price: 3000,
      quantity: 1,
      stopLoss: 2800,
      takeProfit: 3200,
      budget: 3000,
      currency: Currency.USD,
    });

    // Cancel the trade
    await cancelPaperTrade(trade.orderId);

    // Check account balances
    const account = getPaperTradingAccount();
    expect(account.balances.USDT).toBeCloseTo(10000); // USDT should be restored
    expect(account.balances.ETH).toBe(0); // ETH should be zero
    expect(account.activeTrades.length).toBe(0);
    expect(account.tradeHistory.length).toBe(1);
  });

  test('should deposit funds successfully', () => {
    const deposit = depositToPaperTrading('BTC', 0.5, Currency.USD);

    expect(deposit.id).toContain('DEP-');
    expect(deposit.asset).toBe('BTC');
    expect(deposit.amount).toBe(0.5);

    // Check account balances
    const account = getPaperTradingAccount();
    expect(account.balances.BTC).toBe(0.5);
    expect(account.deposits.length).toBe(1);
  });

  test('should withdraw funds successfully', () => {
    // First deposit some funds
    depositToPaperTrading('ETH', 2, Currency.USD);

    // Then withdraw some
    const withdrawal = withdrawFromPaperTrading('ETH', 1, Currency.USD);

    expect(withdrawal.id).toContain('WD-');
    expect(withdrawal.asset).toBe('ETH');
    expect(withdrawal.amount).toBe(1);

    // Check account balances
    const account = getPaperTradingAccount();
    expect(account.balances.ETH).toBe(1);
    expect(account.withdrawals.length).toBe(1);
  });

  test('should throw error when withdrawing more than available', () => {
    expect(() => {
      withdrawFromPaperTrading('BTC', 1, Currency.USD);
    }).toThrow('Insufficient BTC balance for withdrawal');
  });

  test('should update prices and trigger stop loss', async () => {
    // Execute a buy trade
    await executePaperTrade({
      symbol: 'BTC',
      type: OrderType.Buy,
      price: 50000,
      quantity: 0.1,
      stopLoss: 45000,
      takeProfit: 55000,
      budget: 5000,
      currency: Currency.USD,
    });

    // Update prices to trigger stop loss
    updatePaperTradingPrices({
      BTC: 44000,
    });

    // Fast-forward timers to allow stop loss to trigger
    jest.runAllTimers();

    // Check account
    const account = getPaperTradingAccount();
    expect(account.activeTrades.length).toBe(0);
    expect(account.tradeHistory.length).toBe(1);
    expect(account.balances.BTC).toBe(0);
  });

  test('should update prices and trigger take profit', async () => {
    // Execute a buy trade
    await executePaperTrade({
      symbol: 'ETH',
      type: OrderType.Buy,
      price: 3000,
      quantity: 1,
      stopLoss: 2800,
      takeProfit: 3200,
      budget: 3000,
      currency: Currency.USD,
    });

    // Update prices to trigger take profit
    updatePaperTradingPrices({
      ETH: 3300,
    });

    // Fast-forward timers to allow take profit to trigger
    jest.runAllTimers();

    // Check account
    const account = getPaperTradingAccount();
    expect(account.activeTrades.length).toBe(0);
    expect(account.tradeHistory.length).toBe(1);
    expect(account.balances.ETH).toBe(0);
  });
});
