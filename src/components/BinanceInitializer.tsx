'use client';

import { useEffect, useState } from 'react';
import { initBinance } from '../lib/initBinance';
import { TradingMode, getTradingMode } from '../lib/tradeExecutionService';

export default function BinanceInitializer() {
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only run once
    if (initialized) return;

    const tradingMode = getTradingMode();
    console.log(`Current trading mode: ${tradingMode}`);

    try {
      // Initialize Binance when the component mounts
      initBinance();
      setInitialized(true);
    } catch (err) {
      console.error('Error initializing Binance:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Unknown error initializing Binance'
      );
    }
  }, [initialized]);

  // This component doesn't render anything visible
  // But we could render an error message if needed
  if (error) {
    console.error(`Binance initialization error: ${error}`);
    // We don't show the error to the user since we're in paper trading mode anyway
  }

  return null;
}
