'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ShoppingBag, Printer, Search, CheckCircle2, Clock, Truck, ShieldCheck } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { formatPrice, formatDate } from '@/lib/utils';
import { InvoiceView } from '@/components/admin/InvoiceView';
import { Order } from '@/types';

export default function CustomerOrdersPage() {
  const { orders, refreshOrders } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);

  useEffect(() => {
    refreshOrders();
  }, [refreshOrders]);

  const filteredOrders = orders.filter((o) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      o.orderNumber.toLowerCase().includes(term) ||
      o.customer.fullName.toLowerCase().includes(term) ||
      o.customer.phone.includes(term) ||
      o.items.some((i) => i.productName.toLowerCase().includes(term))
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF4F7]/40 via-white to-white py-10 md:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Back */}
        <div className="mb-6">
          <Link
            href="/account"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#D66B8B] hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to My Account</span>
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-[#F8D7E3]">
          <div>
            <h1 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#3A3034]">
              Order History & Tracking
            </h1>
            <p className="text-xs text-[#6E6266] mt-1">
              Track delivery progress and generate official tax receipts for all past purchases.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6E6266]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search order # or phone..."
              className="w-full pl-10 pr-4 py-2 bg-white rounded-xl border border-[#F8D7E3] text-xs text-[#3A3034] focus:outline-none focus:ring-1 focus:ring-[#D66B8B]"
            />
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-[#F8D7E3] p-8 shadow-xs">
            <ShoppingBag className="w-12 h-12 text-[#D66B8B] mx-auto mb-3" />
            <h3 className="font-serif-luxury text-xl font-bold text-[#3A3034]">No orders found</h3>
            <p className="text-xs text-[#6E6266] mt-1 mb-6">
              You haven&apos;t placed any orders matching this criteria yet.
            </p>
            <Link
              href="/shop"
              className="px-6 py-2.5 bg-[#D66B8B] text-white rounded-full text-xs font-bold uppercase tracking-wider"
            >
              Shop Whitening Catalog
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((ord) => (
              <div
                key={ord.id}
                className="bg-white rounded-3xl border border-[#F8D7E3] p-6 shadow-xs space-y-4 hover:border-[#D66B8B] transition-colors"
              >
                {/* Order Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#F8D7E3]/60">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-[#3A3034]">
                        {ord.orderNumber}
                      </span>
                      <span
                        className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full ${
                          ord.orderStatus === 'DELIVERED' || ord.orderStatus === 'CONFIRMED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ord.orderStatus === 'CANCELLED' || ord.orderStatus === 'PAYMENT_FAILED'
                            ? 'bg-red-100 text-red-800'
                            : ord.orderStatus === 'SHIPPED'
                            ? 'bg-blue-100 text-blue-800'
                            : ord.orderStatus === 'PAYMENT_PENDING'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {ord.orderStatus === 'PAYMENT_PENDING' ? 'PAYMENT PENDING' : ord.orderStatus}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#6E6266] mt-0.5">
                      Placed on {formatDate(ord.createdAt)} • Customer: {ord.customer.fullName} ({ord.customer.phone})
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-base font-bold text-[#D66B8B]">
                      {formatPrice(ord.total)}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedInvoiceOrder(ord)}
                      className="px-3.5 py-1.5 bg-[#FFF4F7] hover:bg-[#F8D7E3] text-[#3A3034] rounded-xl text-xs font-bold flex items-center gap-1.5 border border-[#F8D7E3] transition-colors"
                    >
                      <Printer className="w-3.5 h-3.5 text-[#D66B8B]" />
                      <span>Invoice</span>
                    </button>
                  </div>
                </div>

                {/* Items in this order */}
                <div className="space-y-3">
                  {ord.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-4 text-xs">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-[#FFF4F7] border border-[#F8D7E3] shrink-0">
                          <Image src={item.image} alt={item.productName} fill className="object-cover" />
                        </div>
                        <div>
                          <p className="font-bold text-[#3A3034]">{item.productName}</p>
                          {item.variantName && (
                            <p className="text-[10px] text-[#D66B8B]">{item.variantName}</p>
                          )}
                          <p className="text-[11px] text-[#6E6266]">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <span className="font-bold text-[#3A3034]">{formatPrice(item.total)}</span>
                    </div>
                  ))}
                </div>

                {/* Shipping & Payment Status Footer */}
                <div className="pt-3 border-t border-[#F8D7E3]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-[#6E6266]">
                  <p>
                    <strong>Destination:</strong> {ord.shippingAddress.address}, {ord.shippingAddress.city}, {ord.shippingAddress.state} ({ord.shippingAddress.pincode})
                  </p>
                  <div className="flex items-center gap-2 font-medium">
                    <span>
                      Payment:{' '}
                      <strong
                        className={
                          ord.paymentStatus === 'PAID'
                            ? 'text-emerald-700'
                            : ord.paymentStatus === 'FAILED'
                            ? 'text-red-700'
                            : 'text-amber-700'
                        }
                      >
                        {ord.paymentStatus}
                      </strong>
                    </span>
                    <span>•</span>
                    <span>
                      Method: <strong className="text-[#3A3034]">{ord.paymentMethod === 'RAZORPAY_UPI' ? 'UPI' : ord.paymentMethod}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Order Status:{' '}
                      <strong
                        className={
                          ord.orderStatus === 'CONFIRMED' || ord.orderStatus === 'DELIVERED'
                            ? 'text-emerald-700'
                            : ord.orderStatus === 'PAYMENT_PENDING'
                            ? 'text-amber-700'
                            : 'text-rose-700'
                        }
                      >
                        {ord.orderStatus === 'PAYMENT_PENDING' ? 'PAYMENT PENDING' : ord.orderStatus}
                      </strong>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Invoice Modal */}
        {selectedInvoiceOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-[#F8D7E3]">
              <div className="flex justify-end mb-2 no-print">
                <button
                  type="button"
                  onClick={() => setSelectedInvoiceOrder(null)}
                  className="text-xs font-bold text-[#6E6266] hover:text-[#3A3034] px-3 py-1 bg-[#FFF4F7] rounded-lg"
                >
                  Close ✕
                </button>
              </div>
              <InvoiceView order={selectedInvoiceOrder} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
