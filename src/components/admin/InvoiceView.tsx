'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import { Printer, Download, Sparkles, ShieldCheck, Loader2 } from 'lucide-react';
import { Order } from '@/types';
import { formatPrice, formatDate } from '@/lib/utils';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface InvoiceViewProps {
  order: Order;
}

export const InvoiceView: React.FC<InvoiceViewProps> = ({ order }) => {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!invoiceRef.current) return;
    setIsGeneratingPdf(true);

    try {
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, Math.min(pageHeight, imgHeight));
      pdf.save(`Invoice_${order.orderNumber}.pdf`);
    } catch (err) {
      console.error('PDF generation error:', err);
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between no-print pb-2 border-b border-[#F8D7E3]">
        <span className="text-xs font-bold text-[#3A3034]">
          Tax Invoice #{order.orderNumber}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FFF4F7] border border-[#F8D7E3] hover:bg-[#F8D7E3] rounded-xl text-xs font-bold text-[#3A3034] transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-[#D66B8B]" />
            <span>Print</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#D66B8B] hover:bg-[#c25877] text-white rounded-xl text-xs font-bold transition-colors shadow-xs disabled:opacity-50"
          >
            {isGeneratingPdf ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Invoice Container */}
      <div
        id="invoice-printable"
        ref={invoiceRef}
        className="bg-white p-6 sm:p-8 rounded-3xl border border-[#F8D7E3] text-[#3A3034] space-y-6 shadow-xs font-sans text-xs"
      >
        {/* Header with Brand Logo & Tax Details */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-[#F8D7E3]">
          <div className="flex items-center gap-3">
            <div className="relative w-14 h-14 rounded-full overflow-hidden border border-[#F8D7E3] bg-white p-1">
              <Image src="/images/brand/kg_logo.jpg" alt="Khushi & Gohar" fill className="object-contain" />
            </div>
            <div>
              <h2 className="font-serif-luxury text-xl font-bold text-[#3A3034]">Khushi & Gohar</h2>
              <p className="text-[10px] uppercase tracking-wider text-[#D66B8B] font-semibold">
                Khushi Whitening Cream Official
              </p>
              <p className="text-[10px] text-[#6E6266]">care@khushigohar.com | +91 98765 43210</p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-base font-serif-luxury font-bold text-[#D66B8B] block">
              TAX INVOICE
            </span>
            <p className="font-mono text-xs font-bold text-[#3A3034]">INV-{order.orderNumber}</p>
            <p className="text-[10px] text-[#6E6266]">Date: {formatDate(order.createdAt)}</p>
            <p className="text-[10px] text-[#6E6266]">Status: {order.orderStatus}</p>
          </div>
        </div>

        {/* Customer & Billing Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-[#FFF4F7]/40 border border-[#F8D7E3]/70">
          <div>
            <span className="text-[10px] uppercase font-bold text-[#D66B8B] tracking-wider block mb-1">
              Billed To:
            </span>
            <p className="font-bold text-[#3A3034]">{order.customer.fullName}</p>
            <p className="text-[11px] text-[#6E6266]">{order.customer.phone}</p>
            <p className="text-[11px] text-[#6E6266]">{order.customer.email}</p>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-[#D66B8B] tracking-wider block mb-1">
              Shipping Destination:
            </span>
            <p className="text-[11px] text-[#3A3034]">{order.shippingAddress.address}</p>
            {order.shippingAddress.landmark && (
              <p className="text-[11px] text-[#6E6266]">Landmark: {order.shippingAddress.landmark}</p>
            )}
            <p className="text-[11px] text-[#3A3034]">
              {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
            </p>
            <p className="text-[10px] font-semibold text-emerald-800 mt-1">
              Payment: {order.paymentMethod} ({order.paymentStatus})
            </p>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#F8D7E3] text-[#6E6266] uppercase text-[10px] tracking-wider">
                <th className="py-2.5">Item Description</th>
                <th className="py-2.5 text-center">Qty</th>
                <th className="py-2.5 text-right">Unit Price</th>
                <th className="py-2.5 text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F8D7E3]/60">
              {order.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-3">
                    <p className="font-bold text-[#3A3034]">{item.productName}</p>
                    {item.variantName && (
                      <span className="text-[10px] text-[#D66B8B]">{item.variantName}</span>
                    )}
                  </td>
                  <td className="py-3 text-center font-medium">{item.quantity}</td>
                  <td className="py-3 text-right">{formatPrice(item.price)}</td>
                  <td className="py-3 text-right font-bold text-[#3A3034]">
                    {formatPrice(item.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pricing Summary */}
        <div className="pt-4 border-t border-[#F8D7E3] flex justify-end">
          <div className="w-full sm:w-64 space-y-1.5 text-xs text-[#6E6266]">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-semibold text-[#3A3034]">{formatPrice(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Discount ({order.couponCode || 'Coupon'}):</span>
                <span>- {formatPrice(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Shipping Fee:</span>
              <span>{order.shippingFee === 0 ? 'FREE' : formatPrice(order.shippingFee)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-[#3A3034] pt-2 border-t border-[#F8D7E3]">
              <span>Grand Total:</span>
              <span className="text-base text-[#D66B8B]">{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Verification Footer */}
        <div className="pt-6 border-t border-[#F8D7E3]/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-[11px] text-[#6E6266]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#2E7D32]" />
            <span>100% Genuine Khushi & Gohar Product Sealed Guarantee</span>
          </div>
          <p className="italic text-[#D66B8B]">Thank you for glowing with us! ✨</p>
        </div>
      </div>
    </div>
  );
};
