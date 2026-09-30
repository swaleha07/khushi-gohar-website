'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, Search, Filter, Printer, ChevronRight, CheckCircle2, Clock } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { formatPrice, formatDate } from '@/lib/utils';
import { OrderStatus, Order } from '@/types';
import { InvoiceView } from '@/components/admin/InvoiceView';

export default function AdminOrdersPage() {
  const { orders, updateOrderStatus, refreshOrders } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);

  useEffect(() => {
    refreshOrders();
  }, [refreshOrders]);

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = statusFilter === 'ALL' || o.orderStatus === statusFilter;
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !term ||
      o.orderNumber.toLowerCase().includes(term) ||
      o.customer.fullName.toLowerCase().includes(term) ||
      o.customer.phone.includes(term);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F8D7E3]">
        <div>
          <h1 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#3A3034]">
            Order Management
          </h1>
          <p className="text-xs text-[#6E6266] mt-0.5">
            Process shipments, update delivery statuses, and generate GST tax invoices.
          </p>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-[#F8D7E3] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          {['ALL', 'CONFIRMED', 'PAYMENT_PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'PAYMENT_FAILED'].map(
            (st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-full font-bold transition-all whitespace-nowrap ${
                  statusFilter === st
                    ? 'bg-[#D66B8B] text-white shadow-xs'
                    : 'bg-[#FFF4F7] text-[#3A3034] hover:bg-[#F8D7E3]'
                }`}
              >
                {st}
              </button>
            )
          )}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6E6266]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search order # or phone..."
            className="w-full pl-10 pr-4 py-2 bg-[#FFF4F7] rounded-xl border border-[#F8D7E3] text-xs text-[#3A3034] focus:outline-none focus:ring-1 focus:ring-[#D66B8B]"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-[#F8D7E3] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#FFF4F7]/60 border-b border-[#F8D7E3] text-[#6E6266] uppercase text-[10px] tracking-wider">
                <th className="py-3.5 px-4">Order #</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Customer Details</th>
                <th className="py-3.5 px-4">Items</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Payment</th>
                <th className="py-3.5 px-4">Order Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F8D7E3]/60">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#6E6266]">
                    No orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-[#FFF4F7]/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#3A3034]">
                      {ord.orderNumber}
                    </td>
                    <td className="py-3.5 px-4 text-[11px] text-[#6E6266]">
                      {formatDate(ord.createdAt)}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-[#3A3034]">{ord.customer.fullName}</p>
                      <p className="text-[10px] text-[#6E6266]">{ord.customer.phone}</p>
                    </td>
                    <td className="py-3.5 px-4 text-[#6E6266] max-w-[200px] truncate">
                      {ord.items.map((i) => `${i.productName} (${i.quantity})`).join(', ')}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#3A3034]">
                      {formatPrice(ord.total)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          ord.paymentStatus === 'PAID'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {ord.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={ord.orderStatus}
                        onChange={(e) =>
                          updateOrderStatus(ord.id, e.target.value as OrderStatus)
                        }
                        aria-label="Update order status"
                        className="text-[11px] font-bold px-2.5 py-1 bg-[#FFF4F7] border border-[#F8D7E3] rounded-xl text-[#3A3034] focus:outline-none cursor-pointer"
                      >
                        <option value="PAYMENT_PENDING">PAYMENT_PENDING</option>
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="PROCESSING">PROCESSING</option>
                        <option value="SHIPPED">SHIPPED</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="CANCELLED">CANCELLED</option>
                        <option value="PAYMENT_FAILED">PAYMENT_FAILED</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => setSelectedInvoiceOrder(ord)}
                        className="px-2.5 py-1 bg-white border border-[#F8D7E3] hover:bg-[#FFF4F7] text-[#3A3034] rounded-lg text-[11px] font-bold transition-colors"
                      >
                        Invoice
                      </button>
                      <Link
                        href={`/admin/orders/${ord.id}`}
                        className="px-2.5 py-1 bg-[#FFF4F7] border border-[#F8D7E3] hover:bg-[#F8D7E3] text-[#3A3034] rounded-lg text-[11px] font-bold transition-colors"
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

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
  );
}
