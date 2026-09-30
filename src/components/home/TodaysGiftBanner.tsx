'use client';

import React from 'react';
import Link from 'next/link';
import { Gift, ArrowRight, Clock } from 'lucide-react';
import { useStore } from '@/context/StoreContext';

export const TodaysGiftBanner: React.FC = () => {
  const { activeOffer } = useStore();

  if (!activeOffer || !activeOffer.isActive) {
    return null;
  }

  return (
    <section className="py-6 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#FFF4F7] via-[#F8D7E3]/60 to-[#FFF4F7] border border-[#F8D7E3] shadow-pink-card p-6 md:p-8">
          {/* Decorative Sparkle Accent */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/40 rounded-full blur-2xl pointer-events-none" />

          {/* Centered Offer Details */}
          <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white rounded-full text-xs font-bold uppercase tracking-wider text-[#D66B8B] border border-[#F8D7E3] shadow-xs">
              <Gift className="w-3.5 h-3.5 text-[#D66B8B]" />
              <span>{activeOffer.title}</span>
            </div>

            <h2 className="font-serif-luxury text-xl sm:text-2xl md:text-3xl font-bold text-[#3A3034]">
              {activeOffer.subtitle}
            </h2>

            <p className="text-xs sm:text-sm text-[#6E6266] max-w-xl mx-auto">
              Place an order of ₹{activeOffer.minOrderValue} or more today and automatically receive a{' '}
              <strong className="text-[#3A3034]">{activeOffer.giftName}</strong> complimentary inside your parcel!
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href={activeOffer.ctaLink || '/shop'}
                className="px-6 py-3 bg-[#D66B8B] hover:bg-[#c25877] text-white rounded-full text-xs font-bold uppercase tracking-wider shadow-pink-soft flex items-center gap-2 transition-all active:scale-95"
              >
                <span>{activeOffer.ctaText || 'Claim Free Gift'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <div className="flex items-center gap-1 text-[11px] text-[#6E6266] font-medium">
                <Clock className="w-3.5 h-3.5 text-[#D66B8B]" />
                <span>Limited Time Promo (Valid until {activeOffer.endDate})</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
