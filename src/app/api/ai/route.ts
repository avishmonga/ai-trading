import { NextRequest, NextResponse } from 'next/server';
import { fetchHourlyData, getCoinIdFromSymbol } from '@/lib/cryptoApi';
import { generateTradeRecommendation } from '@/lib/aiService';
import { AIAnalysisRequest, HistoricalData, AIProvider } from '@/types';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { symbol, currentPrice, provider = AIProvider.OpenAI } = body;

    if (!symbol || !currentPrice) {
      return NextResponse.json(
        { error: 'Symbol and currentPrice are required' },
        { status: 400 }
      );
    }

    // Check if the required API key is configured
    if (provider === AIProvider.OpenAI && !process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          error:
            'OpenAI API key is not configured. Please add OPENAI_API_KEY to your .env.local file.',
        },
        { status: 500 }
      );
    }

    if (provider === AIProvider.Gemini && !process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        {
          error:
            'Gemini API key is not configured. Please add GEMINI_API_KEY to your .env.local file.',
        },
        { status: 500 }
      );
    }

    // Fetch historical data
    let historicalData: HistoricalData[];

    try {
      historicalData = await fetchHourlyData(symbol);
    } catch (error) {
      console.error(`Error fetching historical data for ${symbol}:`, error);

      // Generate sample data if API call fails
      const now = Date.now();
      historicalData = Array.from({ length: 24 }, (_, i) => {
        const timestamp = now - (23 - i) * 60 * 60 * 1000;
        const basePrice = currentPrice;
        const volatility = 0.01;
        const randomChange = (Math.random() - 0.5) * 2 * volatility;
        const close = basePrice * (1 + randomChange);

        return {
          timestamp,
          open: close * (1 - volatility / 2),
          high: close * (1 + volatility),
          low: close * (1 - volatility),
          close,
          volume: basePrice * 10 * (0.8 + Math.random() * 0.4),
        };
      });
    }

    // Prepare request for AI analysis
    const aiRequest: AIAnalysisRequest = {
      symbol,
      historicalData,
      currentPrice,
      provider, // Include the provider in the request
    };

    // Generate trade recommendation
    const recommendation = await generateTradeRecommendation(aiRequest);

    return NextResponse.json({ recommendation });
  } catch (error) {
    console.error('Error generating AI recommendation:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to generate AI recommendation: ' + errorMessage },
      { status: 500 }
    );
  }
}
