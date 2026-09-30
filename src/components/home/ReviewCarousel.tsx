'use client';

import React, { useState } from 'react';
import { Star, ShieldCheck, ChevronLeft, ChevronRight, Sparkles, Quote } from 'lucide-react';
import { INITIAL_REVIEWS } from '@/data/initialProducts';

export const ReviewCarousel: React.FC = () => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const reviews = INITIAL_REVIEWS;

  const next = () => {
    setCurrentIdx((prev) => (prev + 1) % reviews.length);
  };

  const prev = () => {
    setCurrentIdx((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  return (
    <section className="py-16 bg-[#FFF4F7]/40 border-t border-[#F8D7E3]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-xs font-bold uppercase tracking-wider text-[#D66B8B] mb-2 border border-[#F8D7E3]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Verified Results</span>
          </div>
          <h2 className="font-serif-luxury text-2xl sm:text-3xl md:text-4xl font-bold text-[#3A3034]">
            Loved by Thousands of Customers
          </h2>
          <p className="text-xs sm:text-sm text-[#6E6266] mt-2">
            Read real unfiltered reviews from customers across India.
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white p-6 rounded-3xl border border-[#F8D7E3] shadow-xs hover:shadow-pink-card transition-all flex flex-col justify-between"
            >
              <div>
                {/* Stars & Verified */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex text-amber-400">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  {rev.verifiedPurchase && (
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      Verified
                    </span>
                  )}
                </div>

                <h4 className="font-serif-luxury font-bold text-sm text-[#3A3034] mb-2">
                  &ldquo;{rev.title}&rdquo;
                </h4>

                <p className="text-xs text-[#6E6266] leading-relaxed italic">
                  &ldquo;{rev.comment}&rdquo;
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#F8D7E3]/60 flex items-center justify-between text-xs">
                <span className="font-bold text-[#3A3034]">{rev.author}</span>
                <span className="text-[#6E6266] text-[11px]">{rev.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
