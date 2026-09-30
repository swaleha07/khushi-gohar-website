'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Sparkles, Tag, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';

export const CartDrawer: React.FC = () => {
  const router = useRouter();
  const {
    items,
    isDrawerOpen,
    setIsDrawerOpen,
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

  const handleProceedToCheckout = () => {
    setIsDrawerOpen(false);
    router.push('/checkout');
  };

  const progressPercent = Math.min(
    100,
    Math.round((subtotal / freeShippingThreshold) * 100)
  );

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsDrawerOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
            {/* Drawer Window */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="w-full sm:w-[420px] max-w-full bg-white shadow-2xl flex flex-col justify-between h-full"
            >
              {/* Top Header */}
              <div className="p-5 border-b border-[#F8D7E3] bg-[#FFF4F7] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-[#D66B8B]" />
                  <h3 className="font-serif-luxury text-lg font-bold text-[#3A3034]">
                    Your Shopping Bag ({items.reduce((s, i) => s + i.quantity, 0)})
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-2 text-[#6E6266] hover:text-[#3A3034] rounded-full hover:bg-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Free Shipping Progress Indicator */}
              <div className="bg-[#FFF4F7]/80 px-5 py-3 border-b border-[#F8D7E3]">
                {subtotal >= freeShippingThreshold ? (
                  <p className="text-xs font-semibold text-[#2E7D32] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Congratulations! You unlocked <strong>FREE Express Delivery</strong>
                  </p>
                ) : (
                  <div>
                    <p className="text-xs text-[#3A3034] font-medium mb-1.5">
                      Add <strong>{formatPrice(amountNeededForFreeShipping)}</strong> more to get{' '}
                      <span className="text-[#D66B8B] font-bold">FREE Delivery!</span>
                    </p>
                    <div className="w-full h-1.5 bg-[#F8D7E3] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#D66B8B] rounded-full transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {items.length === 0 ? (
                  <div className="py-16 text-center">
                    <div className="w-16 h-16 rounded-full bg-[#FFF4F7] border border-[#F8D7E3] flex items-center justify-center mx-auto mb-4 text-[#D66B8B]">
                      <ShoppingBag className="w-8 h-8" />
                    </div>
                    <h4 className="font-serif-luxury text-lg font-bold text-[#3A3034]">
                      Your bag is empty
                    </h4>
                    <p className="text-xs text-[#6E6266] mt-1 mb-6">
                      Explore our authentic whitening formulas and radiant glow kits.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setIsDrawerOpen(false);
                        router.push('/shop');
                      }}
                      className="px-6 py-2.5 bg-[#D66B8B] text-white rounded-full text-xs font-bold uppercase tracking-wider hover:bg-[#c25877] shadow-pink-soft"
                    >
                      Start Shopping
                    </button>
                  </div>
                ) : (
                  items.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-4 p-3.5 rounded-2xl border border-[#F8D7E3]/60 bg-white hover:border-[#F8D7E3] transition-all shadow-sm"
                    >
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-[#FFF4F7] border border-[#F8D7E3] shrink-0">
                        <Image
                          src={item.image}
                          alt={item.productName}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-serif-luxury font-bold text-sm text-[#3A3034] truncate">
                              {item.productName}
                            </h4>
                            <button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              className="text-[#6E6266] hover:text-red-500 p-1 transition-colors"
                              title="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          {item.variantName && (
                            <p className="text-[11px] font-medium text-[#D66B8B] bg-[#FFF4F7] px-2 py-0.5 rounded-md inline-block mt-0.5 border border-[#F8D7E3]/60">
                              {item.variantName}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-2 pt-1 border-t border-[#F8D7E3]/30">
                          <div className="flex items-center border border-[#F8D7E3] rounded-lg overflow-hidden bg-[#FFF4F7]">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="px-2 py-1 text-[#3A3034] hover:bg-[#F8D7E3] text-xs transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2.5 py-0.5 text-xs font-bold text-[#3A3034] min-w-[20px] text-center">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={item.quantity >= item.stock}
                              className="px-2 py-1 text-[#3A3034] hover:bg-[#F8D7E3] disabled:opacity-30 text-xs transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <div className="text-right">
                            <span className="text-sm font-bold text-[#3A3034]">
                              {formatPrice(item.price * item.quantity)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Bottom Checkout & Summary */}
              {items.length > 0 && (
                <div className="p-5 border-t border-[#F8D7E3] bg-[#FFF4F7]/40 space-y-4">
                  {/* Coupon Code Input */}
                  <div>
                    {appliedCoupon ? (
                      <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs">
                        <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                          <Tag className="w-3.5 h-3.5" />
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
                          placeholder="Coupon code (KHUSHI10)"
                          className="flex-1 px-3 py-2 text-xs bg-white rounded-xl border border-[#F8D7E3] focus:outline-none focus:ring-1 focus:ring-[#D66B8B] uppercase tracking-wider"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2 bg-white border border-[#D66B8B] text-[#D66B8B] hover:bg-[#D66B8B] hover:text-white rounded-xl text-xs font-bold tracking-wider transition-colors"
                        >
                          Apply
                        </button>
                      </form>
                    )}
                    {couponError && (
                      <p className="text-[11px] text-red-500 mt-1 font-medium">{couponError}</p>
                    )}
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="space-y-1.5 text-xs text-[#6E6266] border-t border-[#F8D7E3]/60 pt-3">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-semibold text-[#3A3034]">{formatPrice(subtotal)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-emerald-700 font-semibold">
                        <span>Coupon Discount</span>
                        <span>- {formatPrice(discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Express Shipping</span>
                      <span>
                        {shippingFee === 0 ? (
                          <strong className="text-emerald-700">FREE</strong>
                        ) : (
                          formatPrice(shippingFee)
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-[#3A3034] pt-2 border-t border-[#F8D7E3]">
                      <span>Grand Total</span>
                      <span className="text-base text-[#D66B8B]">{formatPrice(grandTotal)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={handleProceedToCheckout}
                      className="w-full py-3.5 px-6 bg-[#D66B8B] hover:bg-[#c25877] text-white rounded-2xl font-bold text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-pink-soft active:scale-[0.98] transition-all"
                    >
                      <span>Proceed to Checkout</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <Link
                      href="/cart"
                      onClick={() => setIsDrawerOpen(false)}
                      className="block text-center text-xs font-semibold text-[#3A3034] hover:text-[#D66B8B] py-1 transition-colors"
                    >
                      View Full Cart Page
                    </Link>
                  </div>

                  <div className="flex items-center justify-center gap-2 text-[10px] text-[#6E6266] pt-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#2E7D32]" />
                    <span>Safe & Encrypted 256-Bit Checkout | Cash on Delivery Ready</span>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
