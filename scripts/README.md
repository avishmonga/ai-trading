# Scripts Directory

This directory contains utility scripts for testing and maintaining the AI Crypto Trading platform.

## Available Scripts

### Paper Trading Test

**File:** `testPaperTrading.js`

This script tests the paper trading functionality by simulating various trading scenarios. It verifies that the paper trading service is working correctly by:

1. Initializing a paper trading account
2. Executing buy and sell trades
3. Simulating price changes
4. Testing stop loss and take profit triggers
5. Cancelling trades
6. Calculating profit and loss

**Usage:**

```bash
npm run test:paper-trading
```

The script will output detailed information about each test case and the current state of the paper trading account after each operation.

### Trading Mode Toggle

**File:** `toggleTradingMode.js`

This script toggles between paper trading and live trading modes by updating the `.env.local` file. It helps users switch between:

- **Paper Trading Mode**: Practice trading with virtual funds
- **Live Trading Mode**: Execute real trades with real funds

The script includes safety checks and confirmations before enabling live trading, and will prompt for Binance API keys if they are not already set.

**Usage:**

```bash
npm run toggle-trading-mode
# or
node scripts/toggleTradingMode.js
```

**Features:**

- Detects current trading mode
- Prompts for confirmation before enabling live trading
- Collects Binance API keys if needed
- Updates the `.env.local` file with the new configuration

## Adding New Scripts

When adding new scripts to this directory:

1. Create your script file with a descriptive name
2. Add a corresponding npm script in `package.json`
3. Update this README with information about the script
4. Ensure the script has proper error handling and logging
