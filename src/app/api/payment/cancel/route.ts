import { NextRequest, NextResponse } from 'next/server';
import { paymentService } from '@/lib/paymentService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const paymentId = body.paymentId;

    if (!paymentId) {
      return NextResponse.json(
        { success: false, error: 'paymentId is required' },
        { status: 400 }
      );
    }

    const cancelled = await paymentService.cancelPayment(paymentId);

    return NextResponse.json({
      success: true,
      cancelled,
      message: cancelled ? 'Payment session cancelled' : 'Payment session could not be cancelled',
    });
  } catch (err) {
    console.error('Failed to cancel payment:', err);
    return NextResponse.json(
      { success: false, error: 'Server error cancelling payment' },
      { status: 500 }
    );
  }
}
