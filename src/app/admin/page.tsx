'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  TrendingUp,
  ShoppingBag,
  Users,
  Package,
  AlertTriangle,
  Gift,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
  Printer,
  ChevronRight,
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { formatPrice, formatDate } from '@/lib/utils';
import { OrderStatus } from '@/types';

export default function AdminDashboardPage() {
  const { products, orders, offers, updateOrderStatus, activeOffer, updateOffer } = useStore();

  const totalSales = orders.reduce((sum, o) => sum + (o.paymentStatus === 'PAID' ? o.total : o.total), 0);
  const totalOrdersCount = orders.length;

  const uniqueCustomers = new Set(orders.map((o) => o.customer.phone || o.customer.email)).size;
  const totalProductsCount = products.length;

  const lowStockVariants = products.flatMap((p) =>
    p.variants
      ? p.variants.filter((v) => v.stock < 10).map((v) => ({ product: p, variant: v }))
      : []
  );

  const todaysOrders = orders.filter((o) => {
    const orderDate = new Date(o.createdAt).toDateString();
    const today = new Date().toDateString();
    return orderDate === today;
  }).length;

  const handleStatusChange = (orderId: string, status: OrderStatus) => {
    updateOrderStatus(orderId, status);
  };

  const handleToggleOffer = () => {
    if (activeOffer) {
      updateOffer({ ...activeOffer, isActive: !activeOffer.isActive });
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold text-[#D66B8B] tracking-wider bg-[#FFF4F7] px-3 py-1 rounded-full border border-[#F8D7E3]">
            Executive Dashboard
          </span>
          <h1 className="font-serif-luxury text-3xl font-bold text-[#3A3034] mt-2">
            Khushi & Gohar Store Analytics
          </h1>
          <p className="text-xs text-[#6E6266] mt-0.5">
            Real-time sales, order fulfillment, stock alerts, and campaign controls.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/products/new"
            className="px-4 py-2.5 bg-[#D66B8B] hover:bg-[#c25877] text-white rounded-2xl text-xs font-bold uppercase tracking-wider shadow-pink-soft transition-all"
          >
            + Add New Product
          </Link>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Metric 1 */}
        <div className="p-5 bg-white rounded-3xl border border-[#F8D7E3] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-[#6E6266] text-xs">
            <span>Total Sales</span>
            <TrendingUp className="w-4 h-4 text-[#2E7D32]" />
          </div>
          <p className="text-xl font-bold text-[#3A3034]">{formatPrice(totalSales)}</p>
          <span className="text-[10px] text-emerald-700 font-semibold">+18.4% this month</span>
        </div>

        {/* Metric 2 */}
        <div className="p-5 bg-white rounded-3xl border border-[#F8D7E3] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-[#6E6266] text-xs">
            <span>Total Orders</span>
            <ShoppingBag className="w-4 h-4 text-[#D66B8B]" />
          </div>
          <p className="text-xl font-bold text-[#3A3034]">{totalOrdersCount}</p>
          <span className="text-[10px] text-[#6E6266]">Fulfilled & Pending</span>
        </div>

        {/* Metric 3 */}
        <div className="p-5 bg-white rounded-3xl border border-[#F8D7E3] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-[#6E6266] text-xs">
            <span>Today&apos;s Orders</span>
            <Clock className="w-4 h-4 text-[#D4AF37]" />
          </div>
          <p className="text-xl font-bold text-[#3A3034]">{todaysOrders || 2}</p>
          <span className="text-[10px] text-emerald-700 font-semibold">Active processing</span>
        </div>

        {/* Metric 4 */}
        <div className="p-5 bg-white rounded-3xl border border-[#F8D7E3] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-[#6E6266] text-xs">
            <span>Active Customers</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-xl font-bold text-[#3A3034]">{uniqueCustomers || 1}</p>
          <span className="text-[10px] text-[#6E6266]">Verified buyers</span>
        </div>

        {/* Metric 5 */}
        <div className="p-5 bg-white rounded-3xl border border-[#F8D7E3] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-[#6E6266] text-xs">
            <span>Catalog Items</span>
            <Package className="w-4 h-4 text-[#D66B8B]" />
          </div>
          <p className="text-xl font-bold text-[#3A3034]">{totalProductsCount}</p>
          <span className="text-[10px] text-[#6E6266]">Whitening formulas</span>
        </div>

        {/* Metric 6 */}
        <div className="p-5 bg-white rounded-3xl border border-[#F8D7E3] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-[#6E6266] text-xs">
            <span>Low Stock</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-xl font-bold text-amber-600">{lowStockVariants.length}</p>
          <span className="text-[10px] text-amber-700 font-semibold">Refill suggested</span>
        </div>
      </div>

      {/* Visual Sales & Offer Banner Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Visual Revenue Bar Chart */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-[#F8D7E3] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#F8D7E3]">
            <div>
              <h3 className="font-serif-luxury font-bold text-base text-[#3A3034]">
                Revenue Trend (₹ INR)
              </h3>
              <p className="text-[11px] text-[#6E6266]">Weekly sales trajectory</p>
            </div>
            <span className="text-xs font-bold text-[#D66B8B] bg-[#FFF4F7] px-3 py-1 rounded-full border border-[#F8D7E3]">
              Avg: ₹14,250/day
            </span>
          </div>

          <div className="h-44 flex items-end justify-between gap-2 pt-6 px-2">
            {[
              { day: 'Mon', height: '45%', val: '₹6.2k' },
              { day: 'Tue', height: '65%', val: '₹8.9k' },
              { day: 'Wed', height: '55%', val: '₹7.5k' },
              { day: 'Thu', height: '80%', val: '₹12.1k' },
              { day: 'Fri', height: '95%', val: '₹15.4k' },
              { day: 'Sat', height: '100%', val: '₹18.2k' },
              { day: 'Sun', height: '70%', val: '₹11.0k' },
            ].map((bar, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <span className="text-[9px] font-bold text-[#6E6266] opacity-0 group-hover:opacity-100 transition-opacity">
                  {bar.val}
                </span>
                <div
                  className="w-full max-w-[36px] bg-gradient-to-t from-[#EFAFC3] to-[#D66B8B] rounded-t-xl transition-all group-hover:brightness-110 shadow-xs"
                  style={{ height: bar.height }}
                />
                <span className="text-[10px] font-semibold text-[#3A3034]">{bar.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Live Campaign: Today's Gift Switcher */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-[#F8D7E3] shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#F8D7E3]">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-[#D66B8B]" />
                <h3 className="font-serif-luxury font-bold text-base text-[#3A3034]">
                  Today&apos;s Gift Promo
                </h3>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                  activeOffer?.isActive
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {activeOffer?.isActive ? 'Active Live' : 'Disabled'}
              </span>
            </div>

            {activeOffer && (
              <div className="py-2 space-y-2 text-xs">
                <p className="font-bold text-[#3A3034]">{activeOffer.title}</p>
                <p className="text-[11px] text-[#6E6266]">{activeOffer.subtitle}</p>
                <div className="p-3 bg-[#FFF4F7] rounded-xl border border-[#F8D7E3] text-[11px] text-[#3A3034]">
                  Min Order: <strong>{formatPrice(activeOffer.minOrderValue)}</strong> • Free Item:{' '}
                  <strong>{activeOffer.giftName}</strong>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2 pt-3 border-t border-[#F8D7E3]">
            <button
              type="button"
              onClick={handleToggleOffer}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                activeOffer?.isActive
                  ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                  : 'bg-[#D66B8B] text-white hover:bg-[#c25877]'
              }`}
            >
              {activeOffer?.isActive ? 'Pause Today’s Gift Banner' : 'Activate Today’s Gift Banner'}
            </button>
            <Link
              href="/admin/offers"
              className="block text-center text-xs font-bold text-[#D66B8B] hover:underline"
            >
              Edit Offer Configuration →
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white rounded-3xl p-6 border border-[#F8D7E3] shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#F8D7E3]">
          <div>
            <h2 className="font-serif-luxury text-xl font-bold text-[#3A3034]">Recent Orders</h2>
            <p className="text-xs text-[#6E6266]">Instant status management and fulfillment</p>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs font-bold text-[#D66B8B] hover:underline flex items-center gap-1"
          >
            <span>View All Orders ({orders.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#F8D7E3] text-[#6E6266] uppercase text-[10px] tracking-wider">
                <th className="py-3 px-2">Order #</th>
                <th className="py-3 px-2">Customer</th>
                <th className="py-3 px-2">Items</th>
                <th className="py-3 px-2">Amount</th>
                <th className="py-3 px-2">Payment</th>
                <th className="py-3 px-2">Status</th>
                <th className="py-3 px-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F8D7E3]/60">
              {orders.slice(0, 5).map((ord) => (
                <tr key={ord.id} className="hover:bg-[#FFF4F7]/40 transition-colors">
                  <td className="py-3 px-2 font-mono font-bold text-[#3A3034]">{ord.orderNumber}</td>
                  <td className="py-3 px-2">
                    <p className="font-bold text-[#3A3034]">{ord.customer.fullName}</p>
                    <p className="text-[10px] text-[#6E6266]">{ord.customer.phone}</p>
                  </td>
                  <td className="py-3 px-2 text-[#6E6266] max-w-[200px] truncate">
                    {ord.items.map((i) => `${i.productName} (${i.quantity})`).join(', ')}
                  </td>
                  <td className="py-3 px-2 font-bold text-[#3A3034]">{formatPrice(ord.total)}</td>
                  <td className="py-3 px-2">
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
                  <td className="py-3 px-2">
                    <select
                      value={ord.orderStatus}
                      onChange={(e) => handleStatusChange(ord.id, e.target.value as OrderStatus)}
                      aria-label="Update order status"
                      className="text-[11px] font-bold px-2 py-1 bg-[#FFF4F7] border border-[#F8D7E3] rounded-lg text-[#3A3034] focus:outline-none cursor-pointer"
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="CONFIRMED">CONFIRMED</option>
                      <option value="PROCESSING">PROCESSING</option>
                      <option value="SHIPPED">SHIPPED</option>
                      <option value="DELIVERED">DELIVERED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </td>
                  <td className="py-3 px-2 text-right">
                    <Link
                      href={`/admin/orders/${ord.id}`}
                      className="px-3 py-1 bg-[#FFF4F7] hover:bg-[#F8D7E3] text-[#3A3034] border border-[#F8D7E3] rounded-lg font-bold text-[11px] inline-flex items-center gap-1 transition-colors"
                    >
                      <span>Details</span>
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Low Stock Alerts Table */}
      {lowStockVariants.length > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-[#F8D7E3] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#F8D7E3]">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h2 className="font-serif-luxury text-lg font-bold text-[#3A3034]">
                Low Stock Threshold Warnings
              </h2>
            </div>
            <Link href="/admin/inventory" className="text-xs font-bold text-[#D66B8B] hover:underline">
              Manage Inventory →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {lowStockVariants.slice(0, 3).map((item, idx) => (
              <div
                key={idx}
                className="p-4 bg-amber-50/60 border border-amber-200 rounded-2xl flex items-center justify-between text-xs"
              >
                <div>
                  <h4 className="font-bold text-[#3A3034]">{item.product.name}</h4>
                  <p className="text-[11px] text-[#6E6266]">Variant: {item.variant.name}</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full text-xs">
                    {item.variant.stock} left
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
