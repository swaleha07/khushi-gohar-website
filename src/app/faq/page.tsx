'use client';

import React, { useState } from 'react';
import { ChevronDown, Sparkles, Search, HelpCircle } from 'lucide-react';

export default function FAQPage() {
  const [search, setSearch] = useState('');
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How long does it take to see visible results from Khushi Whitening Cream?',
      a: 'Most customers notice significant visible improvements in skin clarity, brightness, and hydration within 7 to 10 days of consistent daily use. For deeper pigmentation and dark spot removal, continued application for 3 to 4 weeks is recommended.',
    },
    {
      q: 'Is The King Night Cream suitable for all skin types?',
      a: 'Yes! The King Night Cream is formulated with gentle botanical actives, saffron peptides, and soothing shea extracts that work safely across oily, dry, normal, and sensitive Indian skin profiles.',
    },
    {
      q: 'Is Cash on Delivery (COD) available for my pincode?',
      a: 'We offer doorstep Cash on Delivery (COD) across 26,000+ PIN codes in India. You can choose COD during checkout and pay when your delivery arrives.',
    },
    {
      q: 'How do I use the 3-Step Extra Whitening Combo?',
      a: '1. Cleanse: Wash face with 24K Gold Face Wash for 60 seconds and pat dry. \n2. Treat: Apply Extra Whitening Cream gently across face and neck. \n3. Protect: In daytime, finish with Moisturizer + Sunscreen SPF 50 PA+++.',
    },
    {
      q: 'Are your products free from harmful chemicals and bleach?',
      a: 'Absolutely. All Khushi & Gohar products are formulated without harmful steroid bleaches, heavy metals, or toxic additives. We prioritize pure saffron, herbal oils, and certified skin-safe peptides.',
    },
    {
      q: 'How long does shipping take?',
      a: 'Orders are dispatched within 24 hours. Metro deliveries typically arrive in 2 to 3 days, and rest of India takes 3 to 5 business days with live SMS and WhatsApp tracking.',
    },
  ];

  const filtered = faqs.filter(
    (f) =>
      f.q.toLowerCase().includes(search.toLowerCase()) ||
      f.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF4F7]/40 via-white to-white py-12 md:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-xs font-bold uppercase tracking-wider text-[#D66B8B] border border-[#F8D7E3]">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Got Questions?</span>
          </div>
          <h1 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-[#3A3034]">
            Frequently Asked Questions
          </h1>
          <p className="text-xs sm:text-sm text-[#6E6266]">
            Find answers to commonly asked questions about our products, ordering, and skin routine.
          </p>

          <div className="pt-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search questions (e.g. results, ingredients, COD)..."
              className="w-full max-w-md px-4 py-3 bg-white rounded-2xl border border-[#F8D7E3] text-xs text-[#3A3034] shadow-xs focus:outline-none focus:ring-1 focus:ring-[#D66B8B]"
            />
          </div>
        </div>

        <div className="space-y-4">
          {filtered.map((item, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-[#F8D7E3] overflow-hidden shadow-xs transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-serif-luxury font-bold text-sm text-[#3A3034] hover:text-[#D66B8B] transition-colors"
                >
                  <span>{item.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#D66B8B] transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs text-[#6E6266] leading-relaxed border-t border-[#F8D7E3]/60 pt-3 whitespace-pre-line">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
