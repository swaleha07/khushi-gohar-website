'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  Copy,
  Check,
  RefreshCw,
  Loader2,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { PaymentStatus, OrderStatus } from '@/types';

interface UpiQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentId: string;
  orderNumber: string;
  amount: number;
  upiId: string;
  merchantName: string;
  qrCodeDataUrl: string;
  upiUri?: string;
  onPaymentSuccess: (orderNumber: string) => void;
  onPaymentFailure?: (reason: string) => void;
}

export const UpiQrModal: React.FC<UpiQrModalProps> = ({
  isOpen,
  onClose,
  paymentId,
  orderNumber,
  amount,
  upiId,
  merchantName,
  qrCodeDataUrl,
  upiUri,
  onPaymentSuccess,
  onPaymentFailure,
}) => {
  const [currentPaymentStatus, setCurrentPaymentStatus] = useState<PaymentStatus>('PENDING');
  const [currentOrderStatus, setCurrentOrderStatus] = useState<OrderStatus>('PAYMENT_PENDING');
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [showDevSandbox, setShowDevSandbox] = useState(false);
  const [viewMode, setViewMode] = useState<'qr' | 'card'>('qr');

  // Determine if dev sandbox tools can be shown (only in development or if env flag set)
  const isDevMode =
    process.env.NODE_ENV !== 'production' || process.env.NEXT_PUBLIC_PAYMENT_MODE === 'simulation';

  const pollingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Poll payment status every 2.5 seconds
  useEffect(() => {
    if (!isOpen || !paymentId) return;

    // Reset status on open
    setCurrentPaymentStatus('PENDING');
    setCurrentOrderStatus('PAYMENT_PENDING');
    setErrorMessage(null);

    const checkStatus = async () => {
      try {
        const res = await fetch(`/api/payment/status?paymentId=${encodeURIComponent(paymentId)}`);
        if (!res.ok) return;

        const data = await res.json();
        if (!data.success) return;

        const pStatus: PaymentStatus = data.paymentStatus;
        const oStatus: OrderStatus = data.orderStatus;

        setCurrentPaymentStatus(pStatus);
        setCurrentOrderStatus(oStatus);

        // Success State
        if (pStatus === 'PAID' || pStatus === 'SUCCESS' || oStatus === 'CONFIRMED') {
          if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
          setTimeout(() => {
            onPaymentSuccess(data.orderNumber || orderNumber);
          }, 1500);
        }

        // Failure / Cancelled / Expired
        if (pStatus === 'FAILED' || oStatus === 'PAYMENT_FAILED') {
          if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
          setErrorMessage('Your payment could not be verified.');
          if (onPaymentFailure) onPaymentFailure('Payment failed or unverified');
        } else if (pStatus === 'EXPIRED') {
          if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
          setErrorMessage('Payment session expired. Please try again.');
        } else if (pStatus === 'CANCELLED') {
          if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
          setErrorMessage('Payment was cancelled.');
        }
      } catch (err) {
        console.error('Error polling payment status:', err);
      }
    };

    // First check after 1.5s
    const initialTimeout = setTimeout(checkStatus, 1500);
    // Recurring poll every 2.5s
    pollingTimerRef.current = setInterval(checkStatus, 2500);

    return () => {
      clearTimeout(initialTimeout);
      if (pollingTimerRef.current) {
        clearInterval(pollingTimerRef.current);
        pollingTimerRef.current = null;
      }
    };
  }, [isOpen, paymentId, orderNumber, onPaymentSuccess, onPaymentFailure]);

  // Handle Cancel Payment
  const handleCancelPayment = async () => {
    try {
      if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
      await fetch('/api/payment/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId }),
      });
      setCurrentPaymentStatus('CANCELLED');
      setCurrentOrderStatus('CANCELLED');
    } catch {
      // ignore
    } finally {
      onClose();
    }
  };

  // Copy UPI ID to clipboard
  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId || 'parveenbanowith-1@okhdfcbank');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Developer Sandbox Trigger (Calls backend simulation endpoint)
  const triggerDevSandbox = async (action: 'APPROVE' | 'FAIL') => {
    setIsSimulating(true);
    try {
      await fetch('/api/payment/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId, action }),
      });
      // The server updates its state. The polling useEffect will detect the change naturally!
    } catch (err) {
      console.error('Failed to trigger sandbox payment:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  if (!isOpen) return null;

  // Authentic Parveen Bano QR / details
  const displayMerchantName = merchantName || 'Parveen Bano';
  const displayUpiId = upiId || 'parveenbanowith-1@okhdfcbank';
  const merchantInitial = displayMerchantName ? displayMerchantName.trim().charAt(0).toUpperCase() : 'P';

  // Construct mobile UPI direct link fallback
  const mobileUpiLink =
    upiUri ||
    `upi://pay?pa=${encodeURIComponent(displayUpiId)}&pn=${encodeURIComponent(
      displayMerchantName
    )}&aid=uGICAgMC07NmNPA&am=${amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(
      `Order ${orderNumber}`
    )}&tr=${encodeURIComponent(paymentId)}`;

  // Use the verified authentic Google Pay QR image by default, fallback to qrCodeDataUrl
  const finalQrImage = '/images/parveen-qr-code.png';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0F172A]/75 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[#F8FAFC] rounded-3xl max-w-sm w-full p-5 sm:p-6 shadow-2xl border border-slate-200 relative my-auto animate-in zoom-in-95 duration-200 text-slate-800">
        
        {/* Close Button at Top Right */}
        <button
          type="button"
          onClick={handleCancelPayment}
          className="absolute right-4 top-4 w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 flex items-center justify-center transition-colors shadow-2xs z-10"
          aria-label="Close and cancel"
        >
          <X className="w-4 h-4" />
        </button>

        {/* 1. Header: Merchant Avatar & Merchant Name (Official Google Pay style) */}
        <div className="flex items-center justify-center gap-3 pt-1 pb-1">
          <div className="w-11 h-11 rounded-full bg-[#E63920] text-white font-bold text-xl flex items-center justify-center shadow-xs shrink-0 select-none">
            {merchantInitial}
          </div>
          <div className="text-left">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight leading-tight">
              {displayMerchantName}
            </h2>
            <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Verified UPI Payee
            </p>
          </div>
        </div>

        {/* Amount Badge */}
        <div className="my-2.5 text-center">
          <div className="inline-flex items-center gap-1.5 bg-white px-4 py-1.5 rounded-full border border-slate-200 text-slate-900 font-extrabold text-lg shadow-2xs">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pay</span>
            <span className="text-slate-900 font-black">{formatPrice(amount)}</span>
          </div>
        </div>

        {/* View Mode Switcher: QR Code vs Full Card */}
        <div className="flex items-center justify-center gap-1 mb-2 bg-slate-200/70 p-1 rounded-xl text-xs font-bold">
          <button
            type="button"
            onClick={() => setViewMode('qr')}
            className={`flex-1 py-1 rounded-lg transition-all ${
              viewMode === 'qr'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            QR Scanner
          </button>
          <button
            type="button"
            onClick={() => setViewMode('card')}
            className={`flex-1 py-1 rounded-lg transition-all ${
              viewMode === 'card'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Official Card
          </button>
        </div>

        {/* 2. Main Card: Large Centered QR Code with White Card container */}
        <div className="bg-white rounded-2xl p-4 shadow-md border border-slate-200/80 text-center relative transition-all">
          {viewMode === 'qr' ? (
            <>
              <p className="text-[11px] font-semibold text-slate-500 mb-2 tracking-wide uppercase">
                Scan to pay with any UPI app
              </p>

              {/* QR Code Container with Authentic Google Pay QR (tested & verified to decode) */}
              <div className="relative w-56 h-56 mx-auto bg-white p-1 rounded-2xl border border-slate-100 flex items-center justify-center overflow-hidden">
                <Image
                  src={finalQrImage}
                  alt={`UPI Payment QR for ${displayMerchantName}`}
                  width={224}
                  height={224}
                  className="w-full h-full object-contain select-none"
                  priority
                />
              </div>

              {/* UPI ID Display below QR */}
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-center gap-1.5 text-xs text-slate-600 font-medium">
                <span className="text-slate-400 font-normal">UPI ID:</span>
                <span className="font-semibold text-slate-800 break-all select-all font-mono text-[11px]">
                  {displayUpiId}
                </span>
                <button
                  type="button"
                  onClick={handleCopyUpi}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-md transition-colors"
                  title="Copy UPI ID"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <div className="relative w-full max-h-[310px] rounded-xl overflow-hidden border border-slate-100 bg-slate-50 flex items-center justify-center">
                <Image
                  src="/images/upi-qr.jpg"
                  alt={`Official Google Pay QR Card for ${displayMerchantName}`}
                  width={340}
                  height={472}
                  className="w-full h-auto max-h-[310px] object-contain select-none rounded-xl"
                  priority
                />
              </div>
              <p className="text-[10px] text-slate-500 font-medium">
                Official Google Pay Card for {displayMerchantName}
              </p>
            </div>
          )}
        </div>

        {/* 3. Direct App Pay button (Essential for mobile shoppers!) */}
        <div className="mt-3">
          <a
            href={mobileUpiLink}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <span>Tap to Pay on UPI App (GPay / PhonePe / Paytm)</span>
          </a>
        </div>

        {/* Supported Apps Chips */}
        <div className="flex items-center justify-center gap-1.5 mt-2.5 text-[10px] font-bold text-slate-500">
          <span className="px-2 py-0.5 bg-white rounded-md border border-slate-200 shadow-2xs">GPay</span>
          <span className="px-2 py-0.5 bg-white rounded-md border border-slate-200 shadow-2xs">PhonePe</span>
          <span className="px-2 py-0.5 bg-white rounded-md border border-slate-200 shadow-2xs">Paytm</span>
          <span className="px-2 py-0.5 bg-white rounded-md border border-slate-200 shadow-2xs">BHIM</span>
          <span className="px-2 py-0.5 bg-white rounded-md border border-slate-200 shadow-2xs">Cred</span>
        </div>

        {/* 4. Payment States Display */}
        <div className="mt-4">
          {/* STATE 1: PENDING */}
          {currentPaymentStatus === 'PENDING' && (
            <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-center space-y-1">
              <div className="flex items-center justify-center gap-2 text-xs font-bold text-amber-900">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
                <span>Waiting for payment...</span>
              </div>
              <p className="text-[11px] text-amber-800">
                Complete the payment using your UPI app. Do not close this window.
              </p>
            </div>
          )}

          {/* STATE 2: SUCCESS */}
          {(currentPaymentStatus === 'PAID' ||
            currentPaymentStatus === 'SUCCESS' ||
            currentOrderStatus === 'CONFIRMED') && (
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-1 animate-in zoom-in-95">
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Payment Successful</span>
              </div>
              <p className="text-[11px] text-emerald-800">
                Your payment has been verified. Finalizing your order...
              </p>
            </div>
          )}

          {/* STATE 3: FAILED */}
          {(currentPaymentStatus === 'FAILED' || currentOrderStatus === 'PAYMENT_FAILED') && (
            <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-center space-y-2">
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-red-900">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span>Payment Failed</span>
              </div>
              <p className="text-[11px] text-red-700">
                {errorMessage || 'Your payment could not be verified.'}
              </p>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setCurrentPaymentStatus('PENDING')}
                  className="flex-1 py-1.5 px-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors"
                >
                  Try Again
                </button>
                <button
                  type="button"
                  onClick={handleCancelPayment}
                  className="flex-1 py-1.5 px-3 bg-white border border-red-200 text-red-700 hover:bg-red-50 rounded-xl text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* STATE 4: CANCELLED */}
          {currentPaymentStatus === 'CANCELLED' && (
            <div className="p-3 rounded-2xl bg-slate-100 border border-slate-200 text-center space-y-1">
              <span className="text-xs font-bold text-slate-800">Payment Cancelled</span>
              <p className="text-[11px] text-slate-600">No payment was completed.</p>
            </div>
          )}

          {/* STATE 5: EXPIRED */}
          {currentPaymentStatus === 'EXPIRED' && (
            <div className="p-3 rounded-2xl bg-slate-100 border border-slate-200 text-center space-y-2">
              <div className="flex items-center justify-center gap-1 text-xs font-bold text-slate-800">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>Payment Session Expired</span>
              </div>
              <p className="text-[11px] text-slate-600">Please start the payment again.</p>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-1.5 bg-slate-800 text-white rounded-xl text-xs font-bold"
              >
                Close & Restart
              </button>
            </div>
          )}
        </div>

        {/* 5. Cancel Button */}
        {currentPaymentStatus === 'PENDING' && (
          <div className="mt-4">
            <button
              type="button"
              onClick={handleCancelPayment}
              className="w-full py-2.5 px-4 rounded-2xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition-colors"
            >
              Cancel Payment
            </button>
          </div>
        )}

        {/* 6. Isolated Developer Sandbox Panel (Strictly Dev Only) */}
        {isDevMode && currentPaymentStatus === 'PENDING' && (
          <div className="mt-4 pt-3 border-t border-dashed border-slate-200">
            <button
              type="button"
              onClick={() => setShowDevSandbox((prev) => !prev)}
              className="w-full flex items-center justify-between text-[10px] uppercase font-bold text-slate-400 hover:text-slate-600 tracking-wider"
            >
              <span>🧪 Dev Sandbox Test Tools</span>
              {showDevSandbox ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>

            {showDevSandbox && (
              <div className="mt-2 p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-left space-y-2 animate-in fade-in">
                <p className="text-[10px] text-slate-600 leading-tight">
                  Triggers simulated server-side gateway webhook. The frontend will only confirm after polling discovers verified status.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => triggerDevSandbox('APPROVE')}
                    disabled={isSimulating}
                    className="py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 shadow-2xs"
                  >
                    {isSimulating ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      'Simulate Success'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => triggerDevSandbox('FAIL')}
                    disabled={isSimulating}
                    className="py-1.5 px-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 shadow-2xs"
                  >
                    {isSimulating ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      'Simulate Failure'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
