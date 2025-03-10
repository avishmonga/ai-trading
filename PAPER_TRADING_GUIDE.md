# Paper Trading Guide

This guide explains how to use the paper trading functionality in the AI Crypto Trading application, allowing you to practice trading with simulated funds before risking real money.

## What is Paper Trading?

Paper trading is a simulated trading process where you can practice trading strategies without risking real money. It's like a trading simulator that allows you to:

1. Execute trades with virtual funds
2. Test trading strategies in real market conditions
3. Practice using stop loss and take profit orders
4. Track your performance over time

## Getting Started with Paper Trading

### Initial Setup

The paper trading account is automatically set up with:

- $10,000 USD (or equivalent in INR)
- 10,000 USDT
- 0 BTC, ETH, and BNB

You can view your paper trading account balance at the top of the application dashboard.

### Executing Paper Trades

1. Click on a cryptocurrency card to open the detail modal
2. Review the AI recommendation
3. Click "Execute Trade" to open the trade execution form
4. Set your budget and adjust stop loss/take profit levels if needed
5. Click "Execute Trade" to place the order

### Managing Paper Trades

1. Click "Show Active Trades" in the coin detail modal to view your active trades
2. Monitor the profit/loss of each trade in real-time
3. Cancel trades if needed by clicking the "Cancel" button

## Understanding Paper Trading Features

### Automatic Stop Loss and Take Profit

The paper trading system automatically executes:

- **Stop Loss**: When the price drops to your specified stop loss level, the position is automatically closed to limit losses
- **Take Profit**: When the price reaches your specified take profit level, the position is automatically closed to secure profits

### Trading Fees

Paper trading includes simulated trading fees to provide a realistic trading experience:

- **Standard Fee**: 0.1% of the trade value
- **BNB Discount**: 25% fee discount when paying with BNB (optional)

Fees are displayed in the trade execution form and are deducted from your balance when executing trades.

### Multi-Currency Support

The paper trading system supports both USD and INR:

1. Use the currency selector at the top of the dashboard to switch between currencies
2. All balances, prices, and profit/loss calculations will be displayed in your selected currency

## Paper Trading Account Information

The paper trading account dashboard shows:

1. **Balances**: Your current holdings in each asset (USD, USDT, BTC, ETH, BNB)
2. **Total Value**: The combined value of all your assets in your selected currency
3. **Equivalent Values**: For crypto assets, the equivalent value in your selected currency

## Best Practices for Paper Trading

1. **Treat It Like Real Trading**: Make decisions as if you were trading with real money
2. **Follow Your Strategy**: Use the same strategy you plan to use with real funds
3. **Document Your Trades**: Keep track of why you entered and exited trades
4. **Test Different Approaches**: Experiment with different stop loss and take profit levels
5. **Be Patient**: Allow enough time to see if your strategy works over different market conditions

## Moving from Paper to Real Trading

Before transitioning to real trading, ensure:

1. Your paper trading strategy has been profitable over a significant period
2. You understand the risks involved in real trading
3. You're only investing money you can afford to lose
4. You've researched the regulatory requirements in your jurisdiction

## Technical Implementation

The paper trading functionality is implemented using:

- **In-memory Storage**: All paper trading data is stored in memory and will reset if the application is restarted
- **Simulated Market Prices**: Current prices are simulated based on the last known price with small random variations
- **Automatic Order Execution**: Stop loss and take profit orders are checked and executed automatically

## Limitations

The paper trading implementation has some limitations:

1. **No Order Book**: The system doesn't simulate an order book, so all trades are executed at the current price
2. **Limited Market Depth**: The system doesn't account for slippage or limited liquidity
3. **Simplified Fee Structure**: The fee structure is simplified compared to real exchanges
4. **No Margin Trading**: The system only supports spot trading, not margin or futures

## Troubleshooting

If you encounter issues with paper trading:

1. **Trades Not Executing**: Check that you have sufficient balance in your paper trading account
2. **Stop Loss/Take Profit Not Triggering**: The price checks occur periodically, so there might be a slight delay
3. **Balance Discrepancies**: If you notice any balance issues, refresh the page to reset the paper trading account

Remember that paper trading is for educational purposes only and does not guarantee similar results in real trading.
