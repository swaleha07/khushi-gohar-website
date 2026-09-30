'use client';

import React from 'react';
import { ShieldCheck, Zap, Leaf, Truck, Sparkles } from 'lucide-react';

export const WhyKhushi: React.FC = () => {
  const features = [
    {
      icon: <ShieldCheck className="w-7 h-7 text-[#D66B8B]" />,
      title: '100% Authentic Formulas',
      description:
        'Guaranteed genuine Khushi & Gohar products directly from verified manufacturing facilities.',
    },
    {
      icon: <Zap className="w-7 h-7 text-[#D66B8B]" />,
      title: 'Fast 7-Day Visible Glow',
      description:
        'Potent active saffron peptides that actively target dullness and uneven pigmentation.',
    },
    {
      icon: <Leaf className="w-7 h-7 text-[#D66B8B]" />,
      title: 'Zero Harsh Bleaches',
      description:
        'Gentle botanical extracts suitable for sensitive Indian skin types without harmful chemicals.',
    },
    {
      icon: <Truck className="w-7 h-7 text-[#D66B8B]" />,
      title: 'Pan-India COD & Free Shipping',
      description:
        'Doorstep Cash on Delivery and complimentary Express Shipping on all orders above ₹999.',
    },
  ];

  return (
    <section className="py-14 bg-white border-y border-[#F8D7E3]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF4F7] text-xs font-bold uppercase tracking-wider text-[#D66B8B] mb-2 border border-[#F8D7E3]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>The Khushi Promise</span>
          </div>
          <h2 className="font-serif-luxury text-2xl sm:text-3xl md:text-4xl font-bold text-[#3A3034]">
            Why Choose Khushi & Gohar
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <div
              key={i}
              className="p-6 rounded-3xl bg-[#FFF4F7]/40 border border-[#F8D7E3] hover:border-[#D66B8B] hover:bg-[#FFF4F7] transition-all duration-300 shadow-xs hover:shadow-pink-card flex flex-col items-center text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-white border border-[#F8D7E3] shadow-sm flex items-center justify-center mb-4">
                {f.icon}
              </div>
              <h3 className="font-serif-luxury font-bold text-base text-[#3A3034] mb-2">
                {f.title}
              </h3>
              <p className="text-xs text-[#6E6266] leading-relaxed">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
