import axios from 'axios';
import { CryptoData, HistoricalData } from '../types';

// We'll use Binance API instead of CoinGecko
const API_BASE_URL = 'https://api.binance.com/api/v3';

// List of top cryptocurrencies to monitor (using Binance trading pairs with USDT)
const TOP_COINS = [
  'BTCUSDT',
  'ETHUSDT',
  'XRPUSDT',
  'ADAUSDT',
  'SOLUSDT',
  'DOTUSDT',
  'DOGEUSDT',
  'AVAXUSDT',
  'LINKUSDT',
  'MATICUSDT',
  'LTCUSDT',
  'UNIUSDT',
  'XLMUSDT',
  'ATOMUSDT',
  'TRXUSDT',
  'SHIBUSDT',
];

// Map of symbols to their full names for better display
const COIN_NAMES: Record<string, string> = {
  BTC: 'Bitcoin',
  ETH: 'Ethereum',
  XRP: 'Ripple',
  ADA: 'Cardano',
  SOL: 'Solana',
  DOT: 'Polkadot',
  DOGE: 'Dogecoin',
  AVAX: 'Avalanche',
  LINK: 'Chainlink',
  MATIC: 'Polygon',
  LTC: 'Litecoin',
  UNI: 'Uniswap',
  XLM: 'Stellar',
  ATOM: 'Cosmos',
  TRX: 'Tron',
  SHIB: 'Shiba Inu',
};

/**
 * Fetch current price data for multiple coins
 */
export async function fetchCurrentPrices(): Promise<CryptoData[]> {
  try {
    // Fetch 24hr ticker price change statistics for all symbols
    const response = await axios.get(`${API_BASE_URL}/ticker/24hr`);

    // Filter for our top coins and map to our data structure
    const allSymbols = response.data;
    const topCoinsData = allSymbols.filter((ticker: any) =>
      TOP_COINS.includes(ticker.symbol)
    );

    return topCoinsData.map((ticker: any) => {
      const symbol = ticker.symbol.replace('USDT', '');
      return {
        symbol: symbol,
        price: parseFloat(ticker.lastPrice),
        volume: parseFloat(ticker.volume),
        change24h: parseFloat(ticker.priceChangePercent),
        high: parseFloat(ticker.highPrice),
        low: parseFloat(ticker.lowPrice),
        timestamp: Date.now(),
      };
    });
  } catch (error) {
    console.error('Error fetching current prices:', error);
    throw error;
  }
}

/**
 * Fetch historical hourly data for a specific coin
 */
export async function fetchHourlyData(
  symbol: string,
  interval = '1h',
  limit = 24
): Promise<HistoricalData[]> {
  try {
    // Add USDT to symbol if not already present
    const tradingPair = symbol.endsWith('USDT') ? symbol : `${symbol}USDT`;

    // Fetch kline/candlestick data
    const response = await axios.get(`${API_BASE_URL}/klines`, {
      params: {
        symbol: tradingPair,
        interval: interval,
        limit: limit,
      },
    });

    // Binance returns an array of arrays with the following structure:
    // [
    //   [
    //     1499040000000,      // Open time
    //     "0.01634790",       // Open
    //     "0.80000000",       // High
    //     "0.01575800",       // Low
    //     "0.01577100",       // Close
    //     "148976.11427815",  // Volume
    //     ...                 // Other fields we don't need
    //   ],
    //   ...
    // ]

    return response.data.map((kline: any[]) => ({
      timestamp: kline[0],
      open: parseFloat(kline[1]),
      high: parseFloat(kline[2]),
      low: parseFloat(kline[3]),
      close: parseFloat(kline[4]),
      volume: parseFloat(kline[5]),
    }));
  } catch (error) {
    console.error(`Error fetching hourly data for ${symbol}:`, error);
    throw error;
  }
}

/**
 * Get the trading pair symbol for Binance
 */
export function getCoinIdFromSymbol(symbol: string): string {
  // Remove USDT if it's already there
  const baseSymbol = symbol.replace('USDT', '');
  // Return the trading pair
  return `${baseSymbol}USDT`;
}

/**
 * Get the full name of a coin from its symbol
 */
export function getCoinName(symbol: string): string {
  // Remove USDT if it's there
  const baseSymbol = symbol.replace('USDT', '');
  return COIN_NAMES[baseSymbol] || baseSymbol;
}
