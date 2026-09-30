import { NextRequest, NextResponse } from 'next/server';
import { paymentService } from '@/lib/paymentService';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const order = await paymentService.getOrderById(id);

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (err) {
    console.error('Failed to fetch order by ID:', err);
    return NextResponse.json(
      { success: false, error: 'Server error retrieving order' },
      { status: 500 }
    );
  }
}
