# Trade Execution Guide

This guide explains how to use the trade execution functionality in the AI Crypto Trading application, including the multi-currency support and profit/loss calculations.

## Overview

The trade execution feature allows you to:

1. Execute trades based on AI recommendations
2. Set your budget for each trade in your preferred currency
3. Automatically apply stop loss and take profit levels
4. View and manage your active trades
5. Switch between USD and INR currencies
6. See potential profit and loss calculations in real-time based on your selected currency

## Using the Trade Execution Feature

### Step 1: Get an AI Recommendation

1. Open the coin detail modal by clicking on a cryptocurrency
2. Wait for the AI to generate a trading recommendation
3. Review the recommendation details (entry price, target price, stop loss, etc.)

### Step 2: Execute a Trade

1. Click the "Execute Trade" button below the recommendation
2. The trade execution form will appear with pre-filled values based on the AI recommendation
3. Set your budget for the trade in your preferred currency
4. Adjust the stop loss and take profit levels if needed
5. Review the potential profit and loss calculations in your selected currency
6. Click "Execute Trade" to place the order

### Step 3: Monitor Your Trades

1. Click "Show Active Trades" to view your current positions
2. Monitor the status of each trade and current profit/loss in your selected currency
3. Cancel trades if needed by clicking the "Cancel" button

## Currency Support

The application supports both USD and INR currencies:

### Switching Currencies

1. Use the currency selector dropdown in the coin detail modal
2. All prices, budgets, and profit/loss calculations will automatically convert to the selected currency
3. Your budget and trade values will be displayed in the selected currency

### Currency Handling

- All calculations are performed in USD internally
- Values are converted to the selected currency for display
- When executing trades with INR budget, the system automatically converts to USD for processing
- Profit and loss calculations are properly converted to your selected currency

## Profit and Loss Calculations

### Real-time Calculations

The application provides real-time profit and loss calculations in your selected currency:

1. **Potential Profit**:

   - Calculated based on your take profit level, quantity, and selected currency
   - Shows both the monetary value and percentage gain relative to your budget
   - Updates as you adjust your take profit level or budget
   - Automatically converts between currencies when you change your currency preference

2. **Potential Loss**:

   - Calculated based on your stop loss level, quantity, and selected currency
   - Shows both the monetary value and percentage loss relative to your budget
   - Updates as you adjust your stop loss level or budget
   - Automatically converts between currencies when you change your currency preference

3. **Risk/Reward Ratio**:
   - Automatically calculated based on potential profit and loss
   - Helps you evaluate if the trade meets your risk management criteria
   - Consistent across currencies

### Active Trade P/L

For active trades, the application:

1. Simulates current market prices (in a real app, these would be real-time prices)
2. Calculates current profit/loss based on entry price vs. current price
3. Displays both monetary value and percentage gain/loss in your selected currency
4. Automatically converts profit/loss values when you change your currency preference

## Trade Summary

Before executing a trade, you can review a comprehensive trade summary that includes:

1. Risk/Reward Ratio
2. Total Investment in your selected currency
3. Potential Return (monetary value and percentage) in your selected currency
4. Potential Loss (monetary value and percentage) in your selected currency

This summary helps you make informed trading decisions based on your risk tolerance and preferred currency.

## Important Notes

1. **Simulated Trading**: This is a simulated trading environment. No real trades are executed.

2. **Risk Warning**: Cryptocurrency trading involves significant risk. Always do your own research and consider your risk tolerance before trading.

3. **AI Recommendations**: The AI recommendations are based on historical data analysis and should be used as one of many inputs for trading decisions, not as the sole basis for trades.

4. **Currency Rates**: The application uses fixed exchange rates for demonstration purposes. In a real application, these would be updated in real-time.

## Technical Implementation

The trade execution functionality is implemented using the following components:

- `TradeExecutionForm.tsx`: Handles the trade execution form UI and profit/loss calculations
- `ActiveTrades.tsx`: Displays active trades with real-time P/L information
- `tradeExecutionService.ts`: Contains the logic for executing trades and currency conversion
- `CurrencySelector.tsx`: Allows switching between currencies

### Helper Functions

The application includes several helper functions for accurate calculations:

- `calculateQuantity()`: Calculates quantity based on budget and price
- `convertCurrency()`: Converts values between USD and INR
- `calculatePotentialProfit()`: Calculates potential profit with currency conversion
- `calculatePotentialLoss()`: Calculates potential loss with currency conversion
- `calculateProfitLossPercentage()`: Calculates percentage gain/loss relative to investment

## Future Enhancements

1. **Real-time Price Updates**: Add WebSocket connections for real-time price updates
2. **Trade History**: Implement a trade history view to track past performance
3. **Portfolio Analysis**: Add portfolio performance metrics
4. **Additional Currencies**: Support more currencies beyond USD and INR
5. **Advanced Order Types**: Add support for limit orders, market orders, etc.
6. **Trailing Stop Loss**: Implement trailing stop loss functionality
