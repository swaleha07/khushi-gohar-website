import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { paymentService } from '@/lib/paymentService';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.PAYMENT_GATEWAY_KEY_SECRET;

    if (webhookSecret && signature) {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(rawBody)
        .digest('hex');

      if (expectedSignature !== signature) {
        console.error('Invalid Razorpay webhook signature');
        return NextResponse.json(
          { success: false, error: 'Invalid webhook signature' },
          { status: 400 }
        );
      }
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;
    const paymentEntity = payload.payload?.payment?.entity;

    if (!paymentEntity) {
      return NextResponse.json({ success: true, message: 'Unhandled webhook structure' });
    }

    // Reference ID or notes containing paymentId / orderNumber
    const paymentId =
      paymentEntity.notes?.paymentId ||
      paymentEntity.order_id ||
      paymentEntity.description;

    const gatewayTransactionId = paymentEntity.id;

    if (event === 'payment.captured' || event === 'order.paid') {
      if (paymentId) {
        await paymentService.handlePaymentSuccess(paymentId, gatewayTransactionId);
      }
    } else if (event === 'payment.failed') {
      if (paymentId) {
        await paymentService.verifyPayment(paymentId, {
          isSimulation: false,
          simulatedSuccess: false,
        });
      }
    }

    return NextResponse.json({ success: true, received: true });
  } catch (err) {
    console.error('Error handling payment webhook:', err);
    return NextResponse.json(
      { success: false, error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
