import { NextResponse } from 'next/server';
import {
  fetchCurrentPrices,
  fetchHourlyData,
  getCoinIdFromSymbol,
} from '@/lib/cryptoApi';
import { analyzeCoin, shortlistCoins } from '@/lib/analysis';
import { CoinAnalysis } from '@/types';

// GET /api/analysis - Analyze all coins and return shortlisted ones
export async function GET() {
  try {
    // Fetch current prices for all monitored coins
    const currentPrices = await fetchCurrentPrices();

    // Analyze each coin
    const analysisPromises = currentPrices.map(async (coin) => {
      try {
        const hourlyData = await fetchHourlyData(coin.symbol);

        // Skip coins with insufficient data
        if (hourlyData.length < 24) {
          return null;
        }

        return analyzeCoin(coin.symbol, hourlyData);
      } catch (error) {
        console.error(`Error analyzing ${coin.symbol}:`, error);
        return null;
      }
    });

    // Wait for all analyses to complete
    const analyses = (await Promise.all(analysisPromises)).filter(
      (analysis): analysis is CoinAnalysis => analysis !== null
    );

    // Shortlist coins for trading
    const shortlistedCoins = shortlistCoins(analyses);

    return NextResponse.json({
      shortlistedCoins,
      totalAnalyzed: analyses.length,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Error analyzing coins:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to analyze coins: ' + errorMessage },
      { status: 500 }
    );
  }
}
