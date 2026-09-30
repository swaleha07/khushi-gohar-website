import { NextRequest, NextResponse } from 'next/server';
import { paymentService } from '@/lib/paymentService';

/**
 * DEVELOPMENT & SANDBOX ONLY
 * This endpoint allows developers/testers to trigger simulated gateway payment outcomes
 * on the backend, verifying that the frontend polling detects real server state changes.
 * Strictly blocked in production.
 */
export async function POST(req: NextRequest) {
  const isDevOrSandbox =
    process.env.NODE_ENV !== 'production' || process.env.PAYMENT_MODE === 'simulation';

  if (!isDevOrSandbox) {
    return NextResponse.json(
      { success: false, error: 'Forbidden: Simulation endpoint is disabled in production.' },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { paymentId, action } = body;

    if (!paymentId) {
      return NextResponse.json(
        { success: false, error: 'paymentId is required' },
        { status: 400 }
      );
    }

    const simulatedSuccess = action !== 'FAIL';

    const result = await paymentService.verifyPayment(paymentId, {
      isSimulation: true,
      simulatedSuccess,
      razorpay_payment_id: simulatedSuccess
        ? `rzp_test_pay_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
        : undefined,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Simulation failed' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: simulatedSuccess
        ? 'Payment verified by server sandbox. Polling will detect CONFIRMED.'
        : 'Payment marked as failed by server sandbox.',
      orderNumber: result.order?.orderNumber,
    });
  } catch (err) {
    console.error('Error during simulated payment verification:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to process simulated payment' },
      { status: 500 }
    );
  }
}
