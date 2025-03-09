import { NextRequest, NextResponse } from 'next/server';
import { getTradeStatus, cancelTradeOrder } from '@/lib/tradeExecutionService';

export async function GET(
  request: NextRequest,
  context: { params: { orderId: string } }
) {
  try {
    const orderId = context.params.orderId;

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Get trade status
    const result = await getTradeStatus(orderId);

    return NextResponse.json({ trade: result });
  } catch (error) {
    console.error('Error getting trade status:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to get trade status: ' + errorMessage },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: { orderId: string } }
) {
  try {
    const orderId = context.params.orderId;

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Cancel trade
    const result = await cancelTradeOrder(orderId);

    return NextResponse.json({ trade: result });
  } catch (error) {
    console.error('Error cancelling trade:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to cancel trade: ' + errorMessage },
      { status: 500 }
    );
  }
}
