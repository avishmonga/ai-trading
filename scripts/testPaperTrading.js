/**
 * Paper Trading Test Script
 *
 * This script tests the paper trading functionality by simulating various trading scenarios.
 * Run this script to verify that the paper trading service is working correctly.
 */

// Import the paper trading service
const {
  initializePaperTradingAccount,
  getPaperTradingAccount,
  executePaperTrade,
  updatePaperTradingPrices,
  cancelPaperTrade,
} = require('../src/lib/paperTradingService');

// Initialize the paper trading account
initializePaperTradingAccount();

// Helper function to log the account state
function logAccountState() {
  const account = getPaperTradingAccount();
  console.log('\nCurrent Account State:');
  console.log('=====================');
  console.log(`USD: $${account.balances.USD.toFixed(2)}`);
  console.log(`USDT: ${account.balances.USDT.toFixed(2)}`);
  console.log(
    `BTC: ${account.balances.BTC.toFixed(8)} (≈ $${(
      account.balances.BTC * account.prices.BTC
    ).toFixed(2)})`
  );
  console.log(
    `ETH: ${account.balances.ETH.toFixed(8)} (≈ $${(
      account.balances.ETH * account.prices.ETH
    ).toFixed(2)})`
  );
  console.log(
    `BNB: ${account.balances.BNB.toFixed(8)} (≈ $${(
      account.balances.BNB * account.prices.BNB
    ).toFixed(2)})`
  );
  console.log(`Total Value: $${account.totalValueUSD.toFixed(2)}`);

  if (account.activeTrades.length > 0) {
    console.log('\nActive Trades:');
    console.log('=============');
    account.activeTrades.forEach((trade, index) => {
      console.log(`Trade #${index + 1}:`);
      console.log(`  Symbol: ${trade.symbol}`);
      console.log(`  Side: ${trade.side}`);
      console.log(
        `  Amount: ${trade.amount} ${trade.symbol.replace('USDT', '')}`
      );
      console.log(`  Entry Price: $${trade.entryPrice.toFixed(2)}`);
      console.log(
        `  Current Price: $${account.prices[trade.symbol.replace('USDT', '')]}`
      );
      console.log(`  Stop Loss: $${trade.stopLoss?.toFixed(2) || 'None'}`);
      console.log(`  Take Profit: $${trade.takeProfit?.toFixed(2) || 'None'}`);
      console.log(
        `  P/L: $${trade.currentPnL.toFixed(
          2
        )} (${trade.currentPnLPercentage.toFixed(2)}%)`
      );
    });
  }
}

// Test 1: Log initial account state
console.log('Test 1: Initial Account State');
logAccountState();

// Test 2: Execute a BTC buy trade
console.log('\n\nTest 2: Execute BTC Buy Trade');
const btcTrade = executePaperTrade({
  symbol: 'BTCUSDT',
  side: 'BUY',
  budget: 1000,
  stopLoss: 25000,
  takeProfit: 35000,
});
console.log(`Trade executed: ${btcTrade.success ? 'Success' : 'Failed'}`);
if (btcTrade.success) {
  console.log(`Bought ${btcTrade.amount} BTC at $${btcTrade.price}`);
  console.log(`Fee: $${btcTrade.fee}`);
}
logAccountState();

// Test 3: Execute an ETH buy trade
console.log('\n\nTest 3: Execute ETH Buy Trade');
const ethTrade = executePaperTrade({
  symbol: 'ETHUSDT',
  side: 'BUY',
  budget: 1000,
  stopLoss: 1500,
  takeProfit: 2500,
});
console.log(`Trade executed: ${ethTrade.success ? 'Success' : 'Failed'}`);
if (ethTrade.success) {
  console.log(`Bought ${ethTrade.amount} ETH at $${ethTrade.price}`);
  console.log(`Fee: $${ethTrade.fee}`);
}
logAccountState();

// Test 4: Simulate price changes
console.log('\n\nTest 4: Simulate Price Changes');
console.log(
  'Simulating 10% increase in BTC price and 5% decrease in ETH price'
);
const account = getPaperTradingAccount();
const newPrices = {
  BTC: account.prices.BTC * 1.1,
  ETH: account.prices.ETH * 0.95,
  BNB: account.prices.BNB,
};
updatePaperTradingPrices(newPrices);
console.log(`New BTC price: $${newPrices.BTC.toFixed(2)}`);
console.log(`New ETH price: $${newPrices.ETH.toFixed(2)}`);
logAccountState();

// Test 5: Cancel the ETH trade
console.log('\n\nTest 5: Cancel ETH Trade');
if (account.activeTrades.length > 1) {
  const tradeId = account.activeTrades[1].id;
  const cancelResult = cancelPaperTrade(tradeId);
  console.log(
    `Trade cancellation: ${cancelResult.success ? 'Success' : 'Failed'}`
  );
  if (cancelResult.success) {
    console.log(`Sold ${cancelResult.amount} ETH at $${cancelResult.price}`);
    console.log(`Fee: $${cancelResult.fee}`);
    console.log(
      `P/L: $${cancelResult.pnl.toFixed(
        2
      )} (${cancelResult.pnlPercentage.toFixed(2)}%)`
    );
  }
}
logAccountState();

// Test 6: Simulate take profit trigger for BTC
console.log('\n\nTest 6: Simulate Take Profit Trigger');
if (account.activeTrades.length > 0) {
  const btcTrade = account.activeTrades[0];
  if (btcTrade && btcTrade.takeProfit) {
    console.log(
      `Simulating BTC price reaching take profit level: $${btcTrade.takeProfit}`
    );
    const triggerPrices = {
      BTC: btcTrade.takeProfit,
      ETH: account.prices.ETH,
      BNB: account.prices.BNB,
    };
    updatePaperTradingPrices(triggerPrices);
    console.log(`New BTC price: $${triggerPrices.BTC.toFixed(2)}`);
  }
}
logAccountState();

// Test 7: Execute a sell trade directly
console.log('\n\nTest 7: Execute Direct Sell Trade');
const bnbTrade = executePaperTrade({
  symbol: 'BNBUSDT',
  side: 'BUY',
  budget: 500,
  stopLoss: null,
  takeProfit: null,
});
console.log(`BNB Buy executed: ${bnbTrade.success ? 'Success' : 'Failed'}`);
if (bnbTrade.success) {
  console.log(`Bought ${bnbTrade.amount} BNB at $${bnbTrade.price}`);
}

// Now sell half of the BNB
const bnbSellTrade = executePaperTrade({
  symbol: 'BNBUSDT',
  side: 'SELL',
  amount: bnbTrade.amount / 2,
  stopLoss: null,
  takeProfit: null,
});
console.log(
  `BNB Sell executed: ${bnbSellTrade.success ? 'Success' : 'Failed'}`
);
if (bnbSellTrade.success) {
  console.log(`Sold ${bnbSellTrade.amount} BNB at $${bnbSellTrade.price}`);
  console.log(`Fee: $${bnbSellTrade.fee}`);
}
logAccountState();

console.log('\n\nPaper Trading Test Complete!');
