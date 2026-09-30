'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Truck,
  CreditCard,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Lock,
  Loader2,
  User,
  MapPin,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useStore } from '@/context/StoreContext';
import { useAuth } from '@/context/AuthContext';
import { PaymentMethod, ShippingAddress, OrderItem, SavedAddress } from '@/types';
import { formatPrice, generateOrderId } from '@/lib/utils';
import { UpiQrModal } from '@/components/checkout/UpiQrModal';

export default function CheckoutPage() {
  const router = useRouter();
  const {
    items,
    subtotal: cartSubtotal,
    discount: cartDiscount,
    appliedCoupon,
    shippingFee: cartShippingFee,
    grandTotal: cartGrandTotal,
    clearCart,
    directCheckoutItem,
    setDirectCheckoutItem,
  } = useCart();

  const { createOrder } = useStore();
  const { user, isAuthenticated, openAuthModal } = useAuth();

  // Determine whether this checkout is from a direct "Buy Now" click or standard cart
  const checkoutItems: OrderItem[] = directCheckoutItem
    ? [
        {
          id: directCheckoutItem.id,
          productId: directCheckoutItem.productId,
          productName: directCheckoutItem.productName,
          variantName: directCheckoutItem.variantName,
          price: directCheckoutItem.price,
          quantity: directCheckoutItem.quantity,
          total: directCheckoutItem.price * directCheckoutItem.quantity,
          image: directCheckoutItem.image,
        },
      ]
    : items.map((i) => ({
        id: i.id,
        productId: i.productId,
        productName: i.productName,
        variantName: i.variantName,
        price: i.price,
        quantity: i.quantity,
        total: i.price * i.quantity,
        image: i.image,
      }));

  const subtotal = directCheckoutItem
    ? directCheckoutItem.price * directCheckoutItem.quantity
    : cartSubtotal;

  const discount = directCheckoutItem ? 0 : cartDiscount;
  const shippingFee = subtotal >= 999 ? 0 : 99;
  const grandTotal = Math.max(0, subtotal - discount + shippingFee);

  // Form State
  const [formData, setFormData] = useState<ShippingAddress>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    landmark: '',
    city: '',
    state: 'Maharashtra',
    pincode: '',
    country: 'India',
  });

  // Autofill user credentials & saved addresses if logged in
  useEffect(() => {
    if (user) {
      const defaultAddr = user.savedAddresses?.find((a) => a.isDefault) || user.savedAddresses?.[0];
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || user.name || defaultAddr?.fullName || '',
        phone: prev.phone || user.nationalNumber || defaultAddr?.phone || '',
        address: prev.address || defaultAddr?.address || '',
        landmark: prev.landmark || defaultAddr?.landmark || '',
        city: prev.city || defaultAddr?.city || '',
        state: prev.state || defaultAddr?.state || 'Maharashtra',
        pincode: prev.pincode || defaultAddr?.pincode || '',
      }));
    }
  }, [user]);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('RAZORPAY_UPI');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRazorpayModal, setShowRazorpayModal] = useState(false);
  const [showUpiQrModal, setShowUpiQrModal] = useState(false);
  const [isCreatingIntent, setIsCreatingIntent] = useState(false);
  const [activePaymentIntent, setActivePaymentIntent] = useState<{
    paymentId: string;
    orderNumber: string;
    amount: number;
    upiId: string;
    merchantName: string;
    qrCodeDataUrl: string;
    upiUri?: string;
  } | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const indianStates = [
    'Andhra Pradesh', 'Assam', 'Bihar', 'Chandigarh', 'Chhattisgarh', 'Delhi NCR', 'Goa',
    'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu & Kashmir', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Odisha', 'Punjab', 'Rajasthan',
    'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
  ];

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.fullName.trim()) errors.fullName = 'Full name is required';
    if (formData.email && formData.email.trim() && !formData.email.includes('@')) {
      errors.email = 'Please enter a valid email address or leave blank';
    }
    if (!formData.phone.trim() || formData.phone.replace(/\D/g, '').length < 10) {
      errors.phone = 'Valid 10-digit mobile number is required';
    }
    if (!formData.address.trim()) errors.address = 'Street address is required';
    if (!formData.city.trim()) errors.city = 'City is required';
    if (!formData.pincode.trim() || formData.pincode.length < 6) {
      errors.pincode = 'Valid 6-digit PIN code is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (checkoutItems.length === 0) {
      alert('Your cart is empty');
      return;
    }

    if (paymentMethod === 'COD') {
      setIsProcessing(true);
      try {
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customer: {
              fullName: formData.fullName,
              email: formData.email,
              phone: formData.phone,
            },
            shippingAddress: formData,
            items: checkoutItems,
            subtotal,
            discount,
            couponCode: appliedCoupon?.code,
            shippingFee,
            total: grandTotal,
            paymentMethod: 'COD',
          }),
        });
        const data = await res.json();
        if (data.success && data.order) {
          clearCart();
          setDirectCheckoutItem(null);
          router.push(`/order-success?orderId=${data.order.orderNumber}`);
        } else {
          alert(data.error || 'Failed to place COD order');
        }
      } catch (err) {
        console.error('Error placing COD order:', err);
        alert('Server error placing COD order');
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    // For UPI / Online payment: Open the updated Razorpay Gateway popup
    setShowRazorpayModal(true);
  };

  const handleProceedToUpiQr = async () => {
    setIsCreatingIntent(true);
    try {
      const res = await fetch('/api/payment/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: {
            fullName: formData.fullName,
            email: formData.email,
            phone: formData.phone,
          },
          shippingAddress: formData,
          items: checkoutItems,
          subtotal,
          discount,
          couponCode: appliedCoupon?.code,
          shippingFee,
          total: grandTotal,
          paymentMethod: 'RAZORPAY_UPI',
        }),
      });

      const data = await res.json();
      if (!data.success || !data.paymentIntent) {
        alert(data.error || 'Failed to initialize payment');
        return;
      }

      setActivePaymentIntent(data.paymentIntent);
      setShowRazorpayModal(false);
      setShowUpiQrModal(true);
    } catch (err) {
      console.error('Error creating payment intent:', err);
      alert('Failed to connect to payment server. Please try again.');
    } finally {
      setIsCreatingIntent(false);
    }
  };

  if (checkoutItems.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="font-serif-luxury text-2xl font-bold text-[#3A3034]">Nothing to checkout</h2>
        <p className="text-xs text-[#6E6266] mt-2 mb-6">
          Please add products to your bag before proceeding.
        </p>
        <Link
          href="/shop"
          className="px-6 py-2.5 bg-[#D66B8B] text-white rounded-full text-xs font-bold uppercase tracking-wider"
        >
          Browse Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF4F7]/40 via-white to-white py-10 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Back */}
        <div className="mb-6">
          <Link
            href="/cart"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#D66B8B] hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Shopping Bag</span>
          </Link>
        </div>

        <h1 className="font-serif-luxury text-3xl font-bold text-[#3A3034] mb-8 pb-4 border-b border-[#F8D7E3]">
          Express Checkout
        </h1>

        <form onSubmit={handlePlaceOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left Column: Customer & Delivery Details */}
            <div className="lg:col-span-7 space-y-6">
              {/* Member Sign-in Banner for Fast Checkout */}
              {!isAuthenticated && (
                <div className="p-4 rounded-2xl bg-[#FFF4F7] border border-[#F8D7E3] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-[#D66B8B] shrink-0" />
                    <span className="text-[#3A3034]">
                      Have an account? <strong>Log in with Mobile OTP</strong> for 1-click address autofill.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => openAuthModal('login')}
                    className="px-4 py-1.5 bg-white border border-[#D66B8B] text-[#D66B8B] hover:bg-[#D66B8B] hover:text-white rounded-xl font-bold uppercase text-[10px] tracking-wider transition-all shrink-0"
                  >
                    Quick Login
                  </button>
                </div>
              )}

              {/* Step 1: Contact Information */}
              <div className="bg-white rounded-3xl p-6 border border-[#F8D7E3] shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[#F8D7E3]/60">
                  <h3 className="font-serif-luxury font-bold text-base text-[#3A3034] flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#FFF4F7] border border-[#F8D7E3] text-[#D66B8B] text-xs flex items-center justify-center font-sans">
                      1
                    </span>
                    Contact Information
                  </h3>
                  {isAuthenticated && (
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      ✓ Verified Phone Member
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-[#3A3034] mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Pooja Sharma"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#FFF4F7]/60 rounded-xl border border-[#F8D7E3] text-[#3A3034] focus:outline-none focus:ring-1 focus:ring-[#D66B8B]"
                    />
                    {formErrors.fullName && (
                      <p className="text-[10px] text-red-500 mt-0.5">{formErrors.fullName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block font-bold text-[#3A3034] mb-1">
                      Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="10-digit mobile number"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#FFF4F7]/60 rounded-xl border border-[#F8D7E3] text-[#3A3034] focus:outline-none focus:ring-1 focus:ring-[#D66B8B]"
                    />
                    {formErrors.phone && (
                      <p className="text-[10px] text-red-500 mt-0.5">{formErrors.phone}</p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-[#3A3034] mb-1">
                      Email Address <span className="font-normal text-[#6E6266]">(Optional - for digital e-bill)</span>
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. pooja.sharma@gmail.com (Optional)"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#FFF4F7]/60 rounded-xl border border-[#F8D7E3] text-[#3A3034] focus:outline-none focus:ring-1 focus:ring-[#D66B8B]"
                    />
                    {formErrors.email && (
                      <p className="text-[10px] text-red-500 mt-0.5">{formErrors.email}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Step 2: Delivery Address */}
              <div className="bg-white rounded-3xl p-6 border border-[#F8D7E3] shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[#F8D7E3]/60">
                  <h3 className="font-serif-luxury font-bold text-base text-[#3A3034] flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#FFF4F7] border border-[#F8D7E3] text-[#D66B8B] text-xs flex items-center justify-center font-sans">
                      2
                    </span>
                    Delivery Address
                  </h3>
                </div>

                {/* 1-Click Saved Addresses Picker */}
                {user?.savedAddresses && user.savedAddresses.length > 0 && (
                  <div className="p-3.5 rounded-2xl bg-[#FFF4F7]/50 border border-[#F8D7E3] space-y-2">
                    <span className="text-[11px] font-bold text-[#D66B8B] uppercase tracking-wider flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Use a Saved Address:</span>
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {user.savedAddresses.map((addr) => {
                        const isSelected = formData.address === addr.address && formData.pincode === addr.pincode;
                        return (
                          <button
                            type="button"
                            key={addr.id}
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                fullName: addr.fullName,
                                phone: addr.phone,
                                address: addr.address,
                                landmark: addr.landmark || '',
                                city: addr.city,
                                state: addr.state,
                                pincode: addr.pincode,
                              }));
                            }}
                            className={`p-3 rounded-xl border text-left transition-all text-xs ${
                              isSelected
                                ? 'border-[#D66B8B] bg-white ring-1 ring-[#D66B8B] shadow-xs'
                                : 'border-[#F8D7E3] bg-white/80 hover:border-[#D66B8B]'
                            }`}
                          >
                            <p className="font-bold text-[#3A3034]">{addr.fullName}</p>
                            <p className="text-[11px] text-[#6E6266] truncate">{addr.address}, {addr.city}</p>
                            <span className="text-[10px] text-[#D66B8B] font-mono font-semibold">{addr.pincode}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-[#3A3034] mb-1">
                      House / Flat No., Building & Street <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Flat 301, Sunshine Heights, MG Road"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#FFF4F7]/60 rounded-xl border border-[#F8D7E3] text-[#3A3034] focus:outline-none focus:ring-1 focus:ring-[#D66B8B]"
                    />
                    {formErrors.address && (
                      <p className="text-[10px] text-red-500 mt-0.5">{formErrors.address}</p>
                    )}
                  </div>

                  <div>
                    <label className="block font-bold text-[#3A3034] mb-1">Landmark (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Near City Mall"
                      value={formData.landmark || ''}
                      onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#FFF4F7]/60 rounded-xl border border-[#F8D7E3] text-[#3A3034] focus:outline-none focus:ring-1 focus:ring-[#D66B8B]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#3A3034] mb-1">
                      City / Town <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mumbai"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#FFF4F7]/60 rounded-xl border border-[#F8D7E3] text-[#3A3034] focus:outline-none focus:ring-1 focus:ring-[#D66B8B]"
                    />
                    {formErrors.city && (
                      <p className="text-[10px] text-red-500 mt-0.5">{formErrors.city}</p>
                    )}
                  </div>

                  <div>
                    <label className="block font-bold text-[#3A3034] mb-1">
                      State <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#FFF4F7]/60 rounded-xl border border-[#F8D7E3] text-[#3A3034] focus:outline-none focus:ring-1 focus:ring-[#D66B8B]"
                    >
                      {indianStates.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-[#3A3034] mb-1">
                      PIN Code (6-digits) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      placeholder="e.g. 400050"
                      value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#FFF4F7]/60 rounded-xl border border-[#F8D7E3] text-[#3A3034] focus:outline-none focus:ring-1 focus:ring-[#D66B8B]"
                    />
                    {formErrors.pincode && (
                      <p className="text-[10px] text-red-500 mt-0.5">{formErrors.pincode}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Step 3: Payment Method */}
              <div className="bg-white rounded-3xl p-6 border border-[#F8D7E3] shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[#F8D7E3]/60">
                  <h3 className="font-serif-luxury font-bold text-base text-[#3A3034] flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#FFF4F7] border border-[#F8D7E3] text-[#D66B8B] text-xs flex items-center justify-center font-sans">
                      3
                    </span>
                    Payment Option
                  </h3>
                </div>

                <div>
                  {/* Option 1: Razorpay UPI */}
                  <label
                    className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      paymentMethod === 'RAZORPAY_UPI'
                        ? 'border-[#D66B8B] bg-[#FFF4F7] ring-1 ring-[#D66B8B]'
                        : 'border-[#F8D7E3] hover:border-[#D66B8B] bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'RAZORPAY_UPI'}
                        onChange={() => setPaymentMethod('RAZORPAY_UPI')}
                        className="text-[#D66B8B] focus:ring-[#D66B8B]"
                      />
                      <div>
                        <p className="font-bold text-xs text-[#3A3034] flex items-center gap-1.5">
                          <CreditCard className="w-4 h-4 text-[#D66B8B]" />
                          UPI / Google Pay / PhonePe / Paytm (Fast & Secure)
                        </p>
                        <p className="text-[10px] text-[#6E6266] mt-0.5">
                          Instant online payment with zero convenience fees.
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-[#2E7D32] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Recommended
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary & Place Order CTA */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white rounded-3xl border border-[#F8D7E3] p-6 shadow-xs space-y-4">
                <h3 className="font-serif-luxury font-bold text-lg text-[#3A3034] pb-3 border-b border-[#F8D7E3]">
                  Order Items ({checkoutItems.length})
                </h3>

                {/* Items preview list */}
                <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
                  {checkoutItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 text-xs">
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-[#FFF4F7] border border-[#F8D7E3] shrink-0">
                        <Image src={item.image} alt={item.productName} fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-serif-luxury font-bold text-xs text-[#3A3034] truncate">
                          {item.productName}
                        </h4>
                        {item.variantName && (
                          <span className="text-[10px] text-[#D66B8B]">{item.variantName}</span>
                        )}
                        <p className="text-[11px] text-[#6E6266]">Qty: {item.quantity}</p>
                      </div>
                      <span className="font-bold text-xs text-[#3A3034]">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Breakdown */}
                <div className="space-y-2 text-xs text-[#6E6266] border-t border-[#F8D7E3]/60 pt-4">
                  <div className="flex justify-between">
                    <span>Items Subtotal</span>
                    <span className="font-semibold text-[#3A3034]">{formatPrice(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Discount ({appliedCoupon?.code})</span>
                      <span>- {formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Express Delivery</span>
                    <span>
                      {shippingFee === 0 ? (
                        <strong className="text-emerald-700">FREE</strong>
                      ) : (
                        formatPrice(shippingFee)
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-[#3A3034] pt-3 border-t border-[#F8D7E3]">
                    <span>Grand Total</span>
                    <span className="text-xl text-[#D66B8B]">{formatPrice(grandTotal)}</span>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-4 px-6 bg-[#D66B8B] hover:bg-[#c25877] text-white rounded-2xl font-bold text-xs uppercase tracking-wider shadow-pink-soft flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Securing Your Order...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Proceed to Razorpay Payment</span>
                    </>
                  )}
                </button>

                <div className="pt-2 flex items-center justify-center gap-2 text-[10px] text-[#6E6266]">
                  <ShieldCheck className="w-4 h-4 text-[#2E7D32]" />
                  <span>100% Secure Checkout | Verified Genuine Khushi Product</span>
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Razorpay Gateway Payment Popup */}
        {showRazorpayModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#F8D7E3] space-y-5 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-[#F8D7E3]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#FFF4F7] border border-[#F8D7E3] flex items-center justify-center text-[#D66B8B]">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-serif-luxury font-bold text-base text-[#3A3034]">
                      Razorpay Gateway
                    </h3>
                    <p className="text-[10px] text-[#6E6266]">
                      {process.env.NEXT_PUBLIC_MERCHANT_NAME || 'Khushi & Gohar Official Merchant'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-base font-bold text-[#D66B8B]">{formatPrice(grandTotal)}</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#FFF4F7] border border-[#F8D7E3] space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-[#3A3034]">
                  <span>Payment method:</span>
                  <span className="bg-white px-2.5 py-0.5 rounded-full border border-[#F8D7E3] text-[#D66B8B] font-bold text-[11px]">
                    UPI
                  </span>
                </div>
                <p className="text-xs text-[#6E6266] pt-1">
                  Pay securely using any UPI app
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setShowRazorpayModal(false)}
                  disabled={isCreatingIntent}
                  className="py-3 px-4 rounded-xl border border-[#F8D7E3] text-xs font-bold text-[#6E6266] hover:bg-[#FFF4F7] disabled:opacity-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleProceedToUpiQr}
                  disabled={isCreatingIntent}
                  className="py-3 px-4 bg-[#D66B8B] hover:bg-[#c25877] text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-pink-soft transition-all disabled:opacity-50"
                >
                  {isCreatingIntent ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Generating QR...</span>
                    </>
                  ) : (
                    <span>PAY USING UPI</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* UPI QR Payment Screen (Reference Image 2 Inspired) */}
        {showUpiQrModal && activePaymentIntent && (
          <UpiQrModal
            isOpen={showUpiQrModal}
            onClose={() => {
              setShowUpiQrModal(false);
              setActivePaymentIntent(null);
            }}
            paymentId={activePaymentIntent.paymentId}
            orderNumber={activePaymentIntent.orderNumber}
            amount={activePaymentIntent.amount}
            upiId={activePaymentIntent.upiId}
            merchantName={activePaymentIntent.merchantName}
            qrCodeDataUrl={activePaymentIntent.qrCodeDataUrl}
            upiUri={activePaymentIntent.upiUri}
            onPaymentSuccess={(confirmedOrderNumber) => {
              clearCart();
              setDirectCheckoutItem(null);
              setShowUpiQrModal(false);
              router.push(`/order-success?orderId=${confirmedOrderNumber}`);
            }}
          />
        )}
      </div>
    </div>
  );
}
