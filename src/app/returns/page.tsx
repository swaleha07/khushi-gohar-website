import React from 'react';
import { RotateCcw, CheckCircle2 } from 'lucide-react';

export default function ReturnsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF4F7]/40 via-white to-white py-12 md:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-xs sm:text-sm text-[#6E6266] leading-relaxed">
        <div className="text-center space-y-2">
          <h1 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-[#3A3034]">
            Returns & Refund Policy
          </h1>
          <p className="text-xs text-[#6E6266]">
            Customer happiness is our highest priority at Khushi & Gohar.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-[#F8D7E3] shadow-xs space-y-6">
          <h3 className="font-serif-luxury text-lg font-bold text-[#3A3034]">
            7-Day Replacement Guarantee
          </h3>
          <p>
            If you receive a product that is damaged during transit, defective, or incorrect, we provide an immediate free replacement within 7 days of delivery.
          </p>

          <h3 className="font-serif-luxury text-lg font-bold text-[#3A3034]">
            How to Request an Exchange
          </h3>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Send a photo or short unboxing video of the parcel to our WhatsApp helpline (+91 98765 43210) or email <strong>care@khushigohar.com</strong>.</li>
            <li>Provide your Order ID (e.g. <code>KG-84920</code>).</li>
            <li>Our team will arrange a free reverse pickup and ship your replacement item within 24 hours.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
