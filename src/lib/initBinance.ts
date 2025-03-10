import { initializeBinanceClient } from './binanceService';
import { TradingMode, getTradingMode } from './tradeExecutionService';

// This function will be called when the application starts
export function initBinance(): void {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined') {
    console.log('Checking trading mode...');

    // Get the current trading mode
    const tradingMode = getTradingMode();

    // Only initialize Binance client if in live trading mode
    if (tradingMode === TradingMode.Live) {
      console.log('Live trading mode detected. Initializing Binance client...');

      // Get API keys from environment variables
      const apiKey = process.env.NEXT_PUBLIC_BINANCE_API_KEY || '';
      const apiSecret = process.env.NEXT_PUBLIC_BINANCE_API_SECRET || '';

      // Only initialize if API keys are provided
      if (apiKey && apiSecret) {
        try {
          initializeBinanceClient(apiKey, apiSecret);
          console.log('Binance client initialized successfully');
        } catch (error) {
          console.error('Failed to initialize Binance client:', error);
        }
      } else {
        console.error(
          'Binance API keys not provided but live trading mode is enabled. Please provide API keys or switch to paper trading mode.'
        );
      }
    } else {
      console.log(
        'Paper trading mode detected. Skipping Binance client initialization.'
      );
    }
  }
}

// Export a dummy function for server-side rendering
export default function BinanceInit(): null {
  return null;
}
