'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Sparkles,
  Tag,
  ShieldCheck,
  Truck,
  ArrowLeft,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';

export default function CartPage() {
  const router = useRouter();
  const {
    items,
    removeItem,
    updateQuantity,
    subtotal,
    discount,
    shippingFee,
    grandTotal,
    appliedCoupon,
    couponError,
    applyCoupon,
    removeCoupon,
    freeShippingThreshold,
    amountNeededForFreeShipping,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const ok = applyCoupon(couponInput);
    if (ok) {
      setCouponInput('');
    }
  };

  const progressPercent = Math.min(
    100,
    Math.round((subtotal / freeShippingThreshold) * 100)
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF4F7]/40 via-white to-white py-10 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#F8D7E3]">
          <div>
            <h1 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#3A3034]">
              Shopping Bag ({items.reduce((s, i) => s + i.quantity, 0)})
            </h1>
            <p className="text-xs text-[#6E6266] mt-1">
              Review your selected Khushi & Gohar products before placing your order.
            </p>
          </div>
          <Link
            href="/shop"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-[#D66B8B] hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Continue Shopping</span>
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="py-24 text-center bg-white rounded-3xl border border-[#F8D7E3] p-8 max-w-lg mx-auto shadow-xs">
            <div className="w-20 h-20 rounded-full bg-[#FFF4F7] border border-[#F8D7E3] flex items-center justify-center mx-auto mb-4 text-[#D66B8B]">
              <ShoppingBag className="w-10 h-10" />
            </div>
            <h2 className="font-serif-luxury text-xl font-bold text-[#3A3034]">
              Your shopping bag is empty
            </h2>
            <p className="text-xs text-[#6E6266] mt-2 mb-8">
              Explore our best-selling Whitening Creams, 3-Step Combos, and Herbal sets.
            </p>
            <Link
              href="/shop"
              className="px-8 py-3.5 bg-[#D66B8B] hover:bg-[#c25877] text-white rounded-full text-xs font-bold uppercase tracking-wider shadow-pink-soft"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Items List Column */}
            <div className="lg:col-span-8 space-y-4">
              {/* Free Delivery Bar */}
              <div className="p-4 bg-white rounded-2xl border border-[#F8D7E3] shadow-xs">
                {subtotal >= freeShippingThreshold ? (
                  <p className="text-xs font-bold text-emerald-800 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    You unlocked FREE Express Delivery on this order!
                  </p>
                ) : (
                  <div>
                    <div className="flex justify-between text-xs text-[#3A3034] font-medium mb-1.5">
                      <span>
                        Add <strong>{formatPrice(amountNeededForFreeShipping)}</strong> more for FREE shipping
                      </span>
                      <span>{progressPercent}%</span>
                    </div>
                    <div className="w-full h-2 bg-[#FFF4F7] rounded-full overflow-hidden border border-[#F8D7E3]">
                      <div
                        className="h-full bg-[#D66B8B] rounded-full transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Items Card List */}
              <div className="bg-white rounded-3xl border border-[#F8D7E3] p-4 sm:p-6 shadow-xs divide-y divide-[#F8D7E3]/60">
                {items.map((item) => (
                  <div key={item.id} className="py-5 first:pt-0 last:pb-0 flex gap-4 sm:gap-6">
                    <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-[#FFF4F7] border border-[#F8D7E3] shrink-0">
                      <Image
                        src={item.image}
                        alt={item.productName}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <Link href={`/products/${item.productSlug}`}>
                            <h3 className="font-serif-luxury font-bold text-base text-[#3A3034] hover:text-[#D66B8B] transition-colors">
                              {item.productName}
                            </h3>
                          </Link>
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="text-[#6E6266] hover:text-red-500 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                            title="Remove from bag"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {item.variantName && (
                          <span className="text-xs font-semibold text-[#D66B8B] bg-[#FFF4F7] px-2.5 py-0.5 rounded-md inline-block mt-1 border border-[#F8D7E3]">
                            {item.variantName}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center border border-[#F8D7E3] rounded-xl overflow-hidden bg-[#FFF4F7]">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="px-3 py-1.5 text-[#3A3034] hover:bg-[#F8D7E3] text-xs transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-3 py-1 text-xs font-bold text-[#3A3034]">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.stock}
                            className="px-3 py-1.5 text-[#3A3034] hover:bg-[#F8D7E3] disabled:opacity-30 text-xs transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="text-right">
                          <span className="text-base font-bold text-[#3A3034]">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                          {item.originalPrice && item.originalPrice > item.price && (
                            <span className="text-xs text-[#6E6266] line-through block">
                              {formatPrice(item.originalPrice * item.quantity)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary & Checkout Card */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white rounded-3xl border border-[#F8D7E3] p-6 shadow-xs space-y-6">
                <h3 className="font-serif-luxury font-bold text-lg text-[#3A3034] pb-3 border-b border-[#F8D7E3]">
                  Order Summary
                </h3>

                {/* Coupon Code Section */}
                <div>
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs">
                      <div className="flex items-center gap-2 text-emerald-800 font-semibold">
                        <Tag className="w-4 h-4" />
                        <span>
                          {appliedCoupon.code} ({appliedCoupon.description})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={removeCoupon}
                        className="text-red-500 hover:text-red-700 font-bold uppercase text-[10px]"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        placeholder="Coupon (KHUSHI10 / GLOW200)"
                        className="flex-1 px-3.5 py-2.5 text-xs bg-[#FFF4F7] rounded-xl border border-[#F8D7E3] uppercase tracking-wider text-[#3A3034] focus:outline-none focus:ring-1 focus:ring-[#D66B8B]"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2.5 bg-[#D66B8B] text-white rounded-xl text-xs font-bold tracking-wider hover:bg-[#c25877] transition-colors"
                      >
                        Apply
                      </button>
                    </form>
                  )}
                  {couponError && (
                    <p className="text-[11px] text-red-500 mt-1 font-medium">{couponError}</p>
                  )}
                </div>

                {/* Pricing Line Items */}
                <div className="space-y-2.5 text-xs text-[#6E6266] border-t border-[#F8D7E3]/60 pt-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-semibold text-[#3A3034]">{formatPrice(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Coupon Savings</span>
                      <span>- {formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Delivery Charges</span>
                    <span>
                      {shippingFee === 0 ? (
                        <strong className="text-emerald-700 font-bold">FREE</strong>
                      ) : (
                        formatPrice(shippingFee)
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-[#3A3034] pt-3 border-t border-[#F8D7E3]">
                    <span>Total Amount</span>
                    <span className="text-lg text-[#D66B8B]">{formatPrice(grandTotal)}</span>
                  </div>
                </div>

                {/* Checkout CTA */}
                <button
                  type="button"
                  onClick={() => router.push('/checkout')}
                  className="w-full py-4 px-6 bg-[#D66B8B] hover:bg-[#c25877] text-white rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-pink-soft active:scale-[0.98] transition-all"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="pt-2 flex flex-col gap-2 text-[11px] text-[#6E6266] border-t border-[#F8D7E3]/60">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#2E7D32]" />
                    <span>256-Bit SSL Encrypted Checkout</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-[#D66B8B]" />
                    <span>Cash on Delivery (COD) Available Nationwide</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
