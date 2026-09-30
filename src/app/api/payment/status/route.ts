import { NextRequest, NextResponse } from 'next/server';
import { paymentService } from '@/lib/paymentService';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const paymentId = searchParams.get('paymentId');

    if (!paymentId) {
      return NextResponse.json(
        { success: false, error: 'paymentId query parameter is required' },
        { status: 400 }
      );
    }

    const status = await paymentService.getPaymentStatus(paymentId);

    return NextResponse.json({
      success: status.found,
      paymentStatus: status.paymentStatus,
      orderStatus: status.orderStatus,
      orderNumber: status.orderNumber,
      amount: status.amount,
      gatewayTransactionId: status.gatewayTransactionId,
      paidAt: status.paidAt,
      isExpired: status.isExpired || false,
      orderId: status.orderId,
    });
  } catch (err) {
    console.error('Failed to get payment status:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve payment status' },
      { status: 500 }
    );
  }
}
