import { NextRequest, NextResponse } from 'next/server';
import { executeTradeOrder } from '@/lib/tradeExecutionService';
import { TradeOrder } from '@/types';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const {
      symbol,
      type,
      price,
      quantity,
      stopLoss,
      takeProfit,
      budget,
      currency,
    } = body;

    // Validate required fields
    if (
      !symbol ||
      !type ||
      !price ||
      !quantity ||
      !stopLoss ||
      !takeProfit ||
      !budget ||
      !currency
    ) {
      return NextResponse.json(
        { error: 'Missing required fields for trade execution' },
        { status: 400 }
      );
    }

    // Create trade order
    const order: TradeOrder = {
      symbol,
      type,
      price,
      quantity,
      stopLoss,
      takeProfit,
      budget,
      currency,
    };

    // Execute trade
    const result = await executeTradeOrder(order);

    return NextResponse.json({ trade: result });
  } catch (error) {
    console.error('Error executing trade:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to execute trade: ' + errorMessage },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Get trade history (in a real app, this would fetch from a database)
  // For now, return a mock response
  return NextResponse.json({
    trades: [],
    message: 'Trade history endpoint. Use POST to execute a trade.',
  });
}
