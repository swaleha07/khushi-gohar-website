import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // Simulate Razorpay server-side verification
    return NextResponse.json({
      success: true,
      verified: true,
      transactionId: `rzp_pay_${Date.now()}`,
      orderId: body.orderId,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Payment verification failed' },
      { status: 400 }
    );
  }
}
