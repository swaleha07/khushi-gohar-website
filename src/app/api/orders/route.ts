import { NextRequest, NextResponse } from 'next/server';
import { paymentService } from '@/lib/paymentService';

export async function GET() {
  try {
    const orders = await paymentService.getAllOrders();
    return NextResponse.json({
      success: true,
      orders,
    });
  } catch (err) {
    console.error('Failed to fetch orders:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // If this is a direct COD order creation
    if (body.paymentMethod === 'COD') {
      const intent = await paymentService.createPayment({
        customer: body.customer,
        shippingAddress: body.shippingAddress,
        items: body.items,
        subtotal: Number(body.subtotal) || 0,
        discount: Number(body.discount) || 0,
        couponCode: body.couponCode,
        shippingFee: Number(body.shippingFee) || 0,
        total: Number(body.total) || 0,
        paymentMethod: 'COD',
      });

      // For COD, payment is collected on delivery, so order status is CONFIRMED with paymentStatus PENDING
      const order = await paymentService.handlePaymentSuccess(
        intent.paymentId,
        `cod_${Date.now()}`
      );

      return NextResponse.json({
        success: true,
        order,
      });
    }

    return NextResponse.json(
      {
        success: false,
        error:
          'Online payments must be initiated via /api/payment/create-intent and verified by payment gateway.',
      },
      { status: 400 }
    );
  } catch (err) {
    console.error('Failed to record order:', err);
    return NextResponse.json(
      { success: false, error: 'Invalid order payload' },
      { status: 400 }
    );
  }
}
