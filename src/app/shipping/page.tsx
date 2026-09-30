import React from 'react';
import { Truck, ShieldCheck, Clock, MapPin } from 'lucide-react';

export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF4F7]/40 via-white to-white py-12 md:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-xs sm:text-sm text-[#6E6266] leading-relaxed">
        <div className="text-center space-y-2">
          <h1 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-[#3A3034]">
            Shipping & Delivery Policy
          </h1>
          <p className="text-xs text-[#6E6266]">
            Fast, secure, and insured pan-India delivery for all Khushi & Gohar orders.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-[#F8D7E3] shadow-xs space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-6 border-b border-[#F8D7E3]">
            <div className="p-4 bg-[#FFF4F7]/60 rounded-2xl border border-[#F8D7E3] text-center">
              <Truck className="w-6 h-6 text-[#D66B8B] mx-auto mb-1.5" />
              <h4 className="font-bold text-xs text-[#3A3034]">Free Delivery</h4>
              <p className="text-[11px]">On all prepaid & COD orders above ₹999</p>
            </div>
            <div className="p-4 bg-[#FFF4F7]/60 rounded-2xl border border-[#F8D7E3] text-center">
              <Clock className="w-6 h-6 text-[#D66B8B] mx-auto mb-1.5" />
              <h4 className="font-bold text-xs text-[#3A3034]">24-Hour Dispatch</h4>
              <p className="text-[11px]">Fast packing & courier handover</p>
            </div>
            <div className="p-4 bg-[#FFF4F7]/60 rounded-2xl border border-[#F8D7E3] text-center">
              <ShieldCheck className="w-6 h-6 text-[#D66B8B] mx-auto mb-1.5" />
              <h4 className="font-bold text-xs text-[#3A3034]">Tamper-Proof Box</h4>
              <p className="text-[11px]">Sealed packaging for complete hygiene</p>
            </div>
          </div>

          <h3 className="font-serif-luxury text-lg font-bold text-[#3A3034]">
            Delivery Timelines
          </h3>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Metro Cities (Mumbai, Delhi, Bengaluru, Chennai, Kolkata, Hyderabad):</strong> 2 to 3 business days.</li>
            <li><strong>Tier 2 & Tier 3 Cities:</strong> 3 to 5 business days.</li>
            <li><strong>Remote Locations & Northeast:</strong> 5 to 7 business days.</li>
          </ul>

          <h3 className="font-serif-luxury text-lg font-bold text-[#3A3034]">
            Tracking Your Parcel
          </h3>
          <p>
            Once your order has been dispatched, you will receive an automatic WhatsApp message and SMS containing your live AWB courier tracking link (BlueDart / Delhivery / DTDC).
          </p>
        </div>
      </div>
    </div>
  );
}
