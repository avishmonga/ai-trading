import { NextResponse } from 'next/server';
import {
  fetchCurrentPrices,
  fetchHourlyData,
  getCoinIdFromSymbol,
} from '@/lib/cryptoApi';

// GET /api/crypto - Get current prices for all monitored coins
export async function GET() {
  try {
    const data = await fetchCurrentPrices();
    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error fetching crypto data:', error);

    // Determine error type
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to fetch crypto data: ' + errorMessage },
      { status: 500 }
    );
  }
}

// GET /api/crypto/[symbol]/hourly - Get hourly data for a specific coin
export async function fetchHourlyDataForSymbol(symbol: string) {
  try {
    const data = await fetchHourlyData(symbol);
    return { data };
  } catch (error) {
    console.error(`Error fetching hourly data for ${symbol}:`, error);
    throw error;
  }
}
