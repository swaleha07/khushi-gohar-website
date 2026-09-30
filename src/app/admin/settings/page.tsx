'use client';

import React, { useState } from 'react';
import { Settings, Save, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function AdminSettingsPage() {
  const [storeName, setStoreName] = useState('Khushi & Gohar (Khushi Whitening Cream)');
  const [supportEmail, setSupportEmail] = useState('care@khushigohar.com');
  const [supportPhone, setSupportPhone] = useState('+91 98765 43210');
  const [freeShippingLimit, setFreeShippingLimit] = useState(999);
  const [gstRate, setGstRate] = useState(18);
  const [currencySymbol, setCurrencySymbol] = useState('₹');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F8D7E3]">
        <div>
          <h1 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#3A3034]">
            Store & Business Settings
          </h1>
          <p className="text-xs text-[#6E6266] mt-0.5">
            Configure contact helplines, shipping rules, and tax parameters.
          </p>
        </div>

        {savedSuccess && (
          <div className="p-2.5 px-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Settings saved successfully!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        <div className="bg-white p-6 rounded-3xl border border-[#F8D7E3] shadow-xs space-y-4">
          <h2 className="font-serif-luxury font-bold text-base text-[#3A3034]">
            Brand & Contact Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-[#3A3034] mb-1">Official Store Name</label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FFF4F7] rounded-xl border border-[#F8D7E3] text-[#3A3034] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-[#3A3034] mb-1">Customer Support Email</label>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FFF4F7] rounded-xl border border-[#F8D7E3] text-[#3A3034] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-[#3A3034] mb-1">WhatsApp & Phone Helpline</label>
              <input
                type="tel"
                value={supportPhone}
                onChange={(e) => setSupportPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FFF4F7] rounded-xl border border-[#F8D7E3] text-[#3A3034] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-[#3A3034] mb-1">Currency Symbol</label>
              <input
                type="text"
                value={currencySymbol}
                onChange={(e) => setCurrencySymbol(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FFF4F7] rounded-xl border border-[#F8D7E3] text-[#3A3034] focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#F8D7E3] shadow-xs space-y-4">
          <h2 className="font-serif-luxury font-bold text-base text-[#3A3034]">
            Shipping & Tax Thresholds
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-[#3A3034] mb-1">
                Free Delivery Threshold (₹)
              </label>
              <input
                type="number"
                value={freeShippingLimit}
                onChange={(e) => setFreeShippingLimit(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-[#FFF4F7] rounded-xl border border-[#F8D7E3] text-[#3A3034] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-[#3A3034] mb-1">
                Standard Shipping Fee (for orders under threshold)
              </label>
              <input
                type="number"
                defaultValue={99}
                className="w-full px-3.5 py-2.5 bg-[#FFF4F7] rounded-xl border border-[#F8D7E3] text-[#3A3034] focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-8 py-3.5 bg-[#D66B8B] hover:bg-[#c25877] text-white rounded-2xl text-xs font-bold uppercase tracking-wider shadow-pink-soft flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Store Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
