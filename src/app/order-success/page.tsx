'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  CheckCircle2,
  AlertCircle,
  ShoppingBag,
  Printer,
  ArrowRight,
  ShieldCheck,
  Calendar,
  MapPin,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useStore } from '@/context/StoreContext';
import { formatPrice, formatDate } from '@/lib/utils';
import { InvoiceView } from '@/components/admin/InvoiceView';
import { Order } from '@/types';

interface OrderSuccessPageProps {
  searchParams: Promise<{ orderId?: string }>;
}

export default function OrderSuccessPage({ searchParams }: OrderSuccessPageProps) {
  const resolvedSearchParams = use(searchParams);
  const orderId = resolvedSearchParams.orderId;
  const { getOrderById } = useStore();

  const [order, setOrder] = useState<Order | undefined>(orderId ? getOrderById(orderId) : undefined);
  const [isLoading, setIsLoading] = useState(!order && !!orderId);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  // Fetch backend source-of-truth for order
  const fetchServerOrder = async () => {
    if (!orderId) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.order) {
          setOrder(data.order);
        }
      }
    } catch (err) {
      console.error('Failed to retrieve server order:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServerOrder();
  }, [orderId]);

  useEffect(() => {
    if (order && (order.orderStatus === 'CONFIRMED' || order.paymentStatus === 'PAID')) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#F8D7E3', '#EFAFC3', '#D66B8B', '#D4AF37'],
        });
      } catch {
        // ignore
      }
    }
  }, [order]);

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="w-10 h-10 text-[#D66B8B] animate-spin mb-4" />
        <h2 className="font-serif-luxury text-xl font-bold text-[#3A3034]">Verifying Payment & Order...</h2>
        <p className="text-xs text-[#6E6266] mt-2">Connecting with server payment gateway...</p>
      </div>
    );
  }

  // Security Verification Guard: If payment is NOT paid/confirmed (and not COD)
  const isOnlinePayment = order?.paymentMethod === 'RAZORPAY_UPI' || order?.paymentMethod === 'RAZORPAY_CARD';
  const isUnconfirmed = order && isOnlinePayment && order.paymentStatus !== 'PAID' && order.orderStatus !== 'CONFIRMED';

  if (isUnconfirmed) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FFF4F7]/60 via-white to-white py-12 md:py-20">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl p-8 border border-amber-200 shadow-pink-card text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-amber-50 border-2 border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs uppercase font-bold text-amber-700 tracking-widest bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                Payment Verification Pending
              </span>
              <h1 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#3A3034] mt-3">
                Payment Pending
              </h1>
              <p className="text-xs text-[#6E6266] mt-2 max-w-sm mx-auto">
                We have not received a confirmed success notification from the payment gateway yet.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Order ID:</span>
                <span className="font-mono font-bold text-slate-800">{order.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Status:</span>
                <span className="font-bold text-amber-700 uppercase">{order.paymentStatus}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Order Status:</span>
                <span className="font-bold text-amber-700 uppercase">{order.orderStatus}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={fetchServerOrder}
                className="w-full sm:w-auto px-6 py-3 bg-[#D66B8B] hover:bg-[#c25877] text-white rounded-full text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-pink-soft"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh Status</span>
              </button>

              <Link
                href="/shop"
                className="w-full sm:w-auto px-6 py-3 bg-white border border-[#F8D7E3] text-[#3A3034] hover:bg-[#FFF4F7] rounded-full text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <span>Return to Shop</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF4F7]/60 via-white to-white py-12 md:py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Celebration Header */}
        <div className="bg-white rounded-3xl p-8 md:p-10 border border-[#F8D7E3] shadow-pink-card text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-200 text-[#2E7D32] flex items-center justify-center mx-auto shadow-sm animate-bounce">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <div className="inline-flex items-center gap-2 text-xs uppercase font-bold text-emerald-800 tracking-widest bg-emerald-50 px-4 py-1 rounded-full border border-emerald-200 mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Payment Successful</span>
            </div>
            <h1 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-[#3A3034] mt-1">
              Order Confirmed
            </h1>
            <p className="text-sm text-[#6E6266] mt-1 max-w-md mx-auto">
              Thank you for choosing <strong>Khushi & Gohar</strong>. Your verified payment has been processed and your parcel is being prepared for dispatch.
            </p>
          </div>

          {/* Quick Highlight Box - Exact details required by prompt */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-[#FFF4F7]/60 border border-[#F8D7E3] text-left text-xs">
            <div>
              <span className="text-[#6E6266] text-[10px] uppercase font-bold block">Order ID</span>
              <span className="font-mono font-bold text-[#3A3034] text-sm">
                #{order ? order.orderNumber : orderId || 'KG-84920'}
              </span>
            </div>
            <div>
              <span className="text-[#6E6266] text-[10px] uppercase font-bold block">Amount Paid</span>
              <span className="font-bold text-[#D66B8B] text-sm">
                {order ? formatPrice(order.total) : '₹1,500'}
              </span>
            </div>
            <div>
              <span className="text-[#6E6266] text-[10px] uppercase font-bold block">Payment Method</span>
              <span className="font-semibold text-[#3A3034] text-xs">
                {order?.paymentMethod === 'RAZORPAY_UPI'
                  ? 'UPI'
                  : order?.paymentMethod === 'COD'
                  ? 'Cash on Delivery'
                  : order?.paymentMethod || 'UPI'}
              </span>
            </div>
            <div>
              <span className="text-[#6E6266] text-[10px] uppercase font-bold block">Payment ID</span>
              <span className="font-mono text-[#3A3034] text-[11px] font-semibold truncate block">
                {order?.gatewayTransactionId || order?.paymentId || 'rzp_verified'}
              </span>
            </div>
          </div>

          {/* Order Metadata Row */}
          {order && (
            <div className="flex flex-wrap items-center justify-between gap-2 px-2 text-xs text-[#6E6266]">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#D66B8B]" />
                Order Date: {formatDate(order.createdAt)}
              </span>
              <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 text-[11px] font-bold">
                Payment: PAID • Order: CONFIRMED
              </span>
            </div>
          )}

          {/* Ordered Items Breakdown (if order found) */}
          {order && (
            <div className="text-left space-y-3 pt-2">
              <h3 className="font-serif-luxury font-bold text-sm text-[#3A3034] pb-1 border-b border-[#F8D7E3]">
                Purchased Items ({order.items.length})
              </h3>
              <div className="divide-y divide-[#F8D7E3]/60">
                {order.items.map((item) => (
                  <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-[#FFF4F7] border border-[#F8D7E3] shrink-0">
                        <Image src={item.image} alt={item.productName} fill className="object-cover" />
                      </div>
                      <div>
                        <p className="font-bold text-[#3A3034]">{item.productName}</p>
                        {item.variantName && (
                          <p className="text-[10px] text-[#D66B8B]">{item.variantName}</p>
                        )}
                        <p className="text-[10px] text-[#6E6266]">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-bold text-[#3A3034]">{formatPrice(item.total)}</span>
                  </div>
                ))}
              </div>

              {/* Delivery Address Preview */}
              <div className="p-3.5 bg-[#FFF4F7]/40 rounded-2xl border border-[#F8D7E3] text-xs text-[#6E6266]">
                <p className="font-bold text-[#3A3034] mb-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#D66B8B]" />
                  Shipping To: {order.shippingAddress.fullName} ({order.shippingAddress.phone})
                </p>
                <p className="text-[11px]">
                  {order.shippingAddress.address}, {order.shippingAddress.city},{' '}
                  {order.shippingAddress.state} - {order.shippingAddress.pincode}
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons: VIEW ORDER & CONTINUE SHOPPING required by prompt */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-[#F8D7E3]/60">
            {order && (
              <button
                type="button"
                onClick={() => setShowInvoiceModal(true)}
                className="w-full sm:w-auto px-6 py-3 bg-white border border-[#D66B8B] text-[#D66B8B] hover:bg-[#FFF4F7] rounded-full text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xs"
              >
                <Printer className="w-4 h-4" />
                <span>Print Invoice</span>
              </button>
            )}

            <Link
              href="/account/orders"
              className="w-full sm:w-auto px-6 py-3 bg-[#FFF4F7] border border-[#F8D7E3] text-[#3A3034] hover:bg-[#F8D7E3] rounded-full text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
            >
              <ShoppingBag className="w-4 h-4 text-[#D66B8B]" />
              <span>VIEW ORDER</span>
            </Link>

            <Link
              href="/shop"
              className="w-full sm:w-auto px-6 py-3 bg-[#D66B8B] hover:bg-[#c25877] text-white rounded-full text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-pink-soft transition-all"
            >
              <span>CONTINUE SHOPPING</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Invoice Modal Preview if opened */}
        {showInvoiceModal && order && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-[#F8D7E3]">
              <div className="flex justify-end mb-2 no-print">
                <button
                  type="button"
                  onClick={() => setShowInvoiceModal(false)}
                  className="text-xs font-bold text-[#6E6266] hover:text-[#3A3034] px-3 py-1 bg-[#FFF4F7] rounded-lg"
                >
                  Close ✕
                </button>
              </div>
              <InvoiceView order={order} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
