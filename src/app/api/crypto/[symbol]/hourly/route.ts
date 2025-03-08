import { NextRequest, NextResponse } from 'next/server';
import { fetchHourlyData, getCoinIdFromSymbol } from '@/lib/cryptoApi';

export async function GET(
  request: NextRequest,
  context: { params: { symbol: string } }
) {
  try {
    const symbol = context.params.symbol;
    const data = await fetchHourlyData(symbol);

    return NextResponse.json({ data });
  } catch (error) {
    console.error(`Error fetching hourly data:`, error);

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to fetch hourly data: ' + errorMessage },
      { status: 500 }
    );
  }
}
