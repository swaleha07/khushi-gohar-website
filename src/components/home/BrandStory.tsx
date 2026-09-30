'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles, Heart, CheckCircle2 } from 'lucide-react';

export const BrandStory: React.FC = () => {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-[#FFF4F7]/40 via-white to-[#FFF4F7]/40 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Imagery */}
          <div className="lg:col-span-6 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              <div className="relative aspect-4/3 rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-white">
                <Image
                  src="/images/banners/luxury_skincare_hamper.jpg"
                  alt="Khushi & Gohar Luxury Skincare Hamper"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                  className="object-cover object-center"
                  priority
                />
              </div>

              {/* Floating Instagram Community Stat */}
              <div className="absolute -bottom-4 right-2 sm:-bottom-6 sm:-right-6 bg-white p-3 sm:p-4 rounded-2xl sm:rounded-3xl shadow-pink-soft border border-[#F8D7E3] max-w-[180px] sm:max-w-[200px]">
                <div className="flex items-center gap-2 mb-1 text-[#D66B8B]">
                  <Heart className="w-4 h-4 fill-[#D66B8B]" />
                  <span className="text-xs font-bold">50k+ Glow Lovers</span>
                </div>
                <p className="text-[10px] text-[#6E6266] leading-tight">
                  Join our thriving Instagram beauty community across India.
                </p>
              </div>
            </div>
          </div>

          {/* Right Text Content */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF4F7] text-xs font-bold uppercase tracking-wider text-[#D66B8B] border border-[#F8D7E3]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Our Heritage & Vision</span>
            </div>

            <h2 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-[#3A3034] leading-snug">
              Crafted for Real Radiance, Driven by Love for Indian Skin.
            </h2>

            <p className="text-xs sm:text-sm text-[#6E6266] leading-relaxed">
              Born from the desire to create effective, gentle, and transformative beauty rituals,{' '}
              <strong>Khushi & Gohar</strong> pairs age-old Kashmiri saffron and Damask rose traditions
              with modern dermatological efficacy. Every jar of our signature Whitening and Night
              Creams is crafted to nourish deeply while bringing out your inner golden glow.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#2E7D32] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-[#3A3034]">Authentic Herbal Formulations</h4>
                  <p className="text-[11px] text-[#6E6266]">
                    Pure natural ingredients with no harmful bleaching agents or synthetic steroids.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#2E7D32] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-[#3A3034]">Proven by Thousands of Brides</h4>
                  <p className="text-[11px] text-[#6E6266]">
                    Trusted by bridal makeup artists and everyday women seeking radiant, spotless skin.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-[#D66B8B] text-[#D66B8B] hover:bg-[#D66B8B] hover:text-white rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-xs group"
              >
                <span>Read Full Brand Story</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
