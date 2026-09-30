import { NextRequest, NextResponse } from 'next/server';
import { paymentService } from '@/lib/paymentService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Checkout requires at least one item' },
        { status: 400 }
      );
    }

    if (!body.customer?.fullName || !body.customer?.phone) {
      return NextResponse.json(
        { success: false, error: 'Customer contact information is required' },
        { status: 400 }
      );
    }

    if (!body.shippingAddress?.address || !body.shippingAddress?.pincode) {
      return NextResponse.json(
        { success: false, error: 'Complete delivery address is required' },
        { status: 400 }
      );
    }

    const intent = await paymentService.createPayment({
      customer: body.customer,
      shippingAddress: body.shippingAddress,
      items: body.items,
      subtotal: Number(body.subtotal) || 0,
      discount: Number(body.discount) || 0,
      couponCode: body.couponCode,
      shippingFee: Number(body.shippingFee) || 0,
      total: Number(body.total) || 0,
      paymentMethod: body.paymentMethod || 'RAZORPAY_UPI',
    });

    return NextResponse.json({
      success: true,
      paymentIntent: {
        paymentId: intent.paymentId,
        orderNumber: intent.orderNumber,
        amount: intent.amount,
        currency: intent.currency,
        upiId: intent.upiId,
        merchantName: intent.merchantName,
        upiUri: intent.upiUri,
        qrCodeDataUrl: intent.qrCodeDataUrl,
        expiresAt: intent.expiresAt,
        paymentStatus: intent.paymentStatus,
        orderStatus: intent.orderStatus,
      },
    });
  } catch (err) {
    console.error('Failed to create payment intent:', err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Server error creating payment' },
      { status: 500 }
    );
  }
}
