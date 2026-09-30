'use client';

import React, { useState } from 'react';
import { Users, Search, Phone, Mail, MapPin, ShoppingBag, ArrowRight } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { formatPrice, formatDate } from '@/lib/utils';
import { Customer } from '@/types';

export default function AdminCustomersPage() {
  const { orders } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomerOrders, setSelectedCustomerOrders] = useState<string | null>(null);

  // Group orders by customer phone/email
  const customerMap = new Map<string, Customer>();

  orders.forEach((ord) => {
    const key = ord.customer.phone || ord.customer.email || ord.id;
    const existing = customerMap.get(key);

    if (existing) {
      existing.totalSpent += ord.total;
      existing.totalOrders += 1;
    } else {
      customerMap.set(key, {
        id: `cust-${key.replace(/\D/g, '') || ord.id}`,
        fullName: ord.customer.fullName,
        email: ord.customer.email || '',
        phone: ord.customer.phone,
        address: ord.shippingAddress.address,
        city: ord.shippingAddress.city,
        state: ord.shippingAddress.state,
        pincode: ord.shippingAddress.pincode,
        totalSpent: ord.total,
        totalOrders: 1,
        lastOrderDate: ord.createdAt,
        createdAt: ord.createdAt,
      });
    }
  });

  const customers = Array.from(customerMap.values());

  const filtered = customers.filter(
    (c) =>
      c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm) ||
      (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      c.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F8D7E3]">
        <div>
          <h1 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#3A3034]">
            Customer Directory & CRM
          </h1>
          <p className="text-xs text-[#6E6266] mt-0.5">
            Verified customer list, lifetime spend value, and purchase history.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-3xl border border-[#F8D7E3] shadow-xs flex items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6E6266]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by customer name, phone, or city..."
            className="w-full pl-10 pr-4 py-2 bg-[#FFF4F7] rounded-xl border border-[#F8D7E3] text-xs text-[#3A3034] focus:outline-none focus:ring-1 focus:ring-[#D66B8B]"
          />
        </div>
        <span className="text-xs text-[#6E6266]">
          Total Customers: <strong>{customers.length}</strong>
        </span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-[#F8D7E3] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#FFF4F7]/60 border-b border-[#F8D7E3] text-[#6E6266] uppercase text-[10px] tracking-wider">
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4 text-center">Orders</th>
                <th className="py-3.5 px-4">Total Spent</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F8D7E3]/60">
              {filtered.map((cust) => (
                <tr key={cust.id} className="hover:bg-[#FFF4F7]/40 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-[#3A3034] text-xs">
                    {cust.fullName}
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="text-[#3A3034] font-medium">{cust.phone}</p>
                    <p className="text-[10px] text-[#6E6266]">{cust.email}</p>
                  </td>
                  <td className="py-3.5 px-4 text-[#6E6266]">
                    {cust.city}, {cust.state}
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-[#3A3034]">
                    {cust.totalOrders}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-[#D66B8B]">
                    {formatPrice(cust.totalSpent)}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedCustomerOrders(cust.phone)}
                      className="px-3 py-1 bg-[#FFF4F7] hover:bg-[#F8D7E3] text-[#3A3034] border border-[#F8D7E3] rounded-lg font-bold text-[11px] transition-colors"
                    >
                      Order History
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Orders History Modal */}
      {selectedCustomerOrders && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-[#F8D7E3] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F8D7E3]">
              <h3 className="font-serif-luxury font-bold text-base text-[#3A3034]">
                Customer Order History
              </h3>
              <button
                type="button"
                onClick={() => setSelectedCustomerOrders(null)}
                className="text-xs font-bold text-[#6E6266] hover:text-[#3A3034]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {orders
                .filter((o) => o.customer.phone === selectedCustomerOrders)
                .map((ord) => (
                  <div key={ord.id} className="p-3.5 bg-[#FFF4F7]/60 rounded-2xl border border-[#F8D7E3] text-xs">
                    <div className="flex justify-between font-bold text-[#3A3034] mb-1">
                      <span>Order #{ord.orderNumber}</span>
                      <span className="text-[#D66B8B]">{formatPrice(ord.total)}</span>
                    </div>
                    <p className="text-[11px] text-[#6E6266]">
                      {ord.items.map((i) => `${i.productName} (${i.quantity})`).join(', ')}
                    </p>
                    <span className="text-[10px] font-semibold text-emerald-800 mt-1 inline-block">
                      Status: {ord.orderStatus}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
