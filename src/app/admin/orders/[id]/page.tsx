'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Printer, ShieldCheck, MapPin, Phone, Mail } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { InvoiceView } from '@/components/admin/InvoiceView';
import { OrderStatus } from '@/types';

interface AdminOrderDetailProps {
  params: Promise<{ id: string }>;
}

export default function AdminOrderDetailPage({ params }: AdminOrderDetailProps) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const { getOrderById, updateOrderStatus } = useStore();
  const order = getOrderById(id);

  if (!order) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-[#F8D7E3]">
        <h2 className="font-serif-luxury text-xl font-bold text-[#3A3034]">Order not found</h2>
        <Link href="/admin/orders" className="text-xs font-bold text-[#D66B8B] mt-2 inline-block">
          ← Back to Orders List
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-[#F8D7E3]">
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#D66B8B] hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Orders List</span>
        </Link>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-[#3A3034]">Update Status:</span>
          <select
            value={order.orderStatus}
            onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
            aria-label="Update order status"
            className="text-xs font-bold px-3 py-1.5 bg-white border border-[#F8D7E3] rounded-xl text-[#3A3034] focus:outline-none cursor-pointer"
          >
            <option value="PENDING">PENDING</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="PROCESSING">PROCESSING</option>
            <option value="SHIPPED">SHIPPED</option>
            <option value="DELIVERED">DELIVERED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>
      </div>

      {/* Embedded Printable Invoice Layout */}
      <div className="bg-white rounded-3xl p-6 border border-[#F8D7E3] shadow-xs">
        <InvoiceView order={order} />
      </div>
    </div>
  );
}
