'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles, Star, ShieldCheck, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#FFF4F7] via-[#FFF4F7]/60 to-white pt-8 pb-16 md:pt-12 md:pb-24">
      {/* Decorative luxury rose glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#F8D7E3]/60 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#FFF4F7] rounded-full blur-2xl pointer-events-none -ml-20 -mb-20" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Hero Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-6 space-y-6 text-center lg:text-left"
          >
            {/* Top Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#F8D7E3] shadow-sm text-xs font-semibold text-[#D66B8B]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Khushi & Gohar Official Luxury Skincare</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-serif-luxury text-4xl sm:text-5xl lg:text-6xl font-bold text-[#3A3034] leading-[1.15] tracking-tight">
              Embrace Your{' '}
              <span className="relative inline-block text-[#D66B8B] italic">
                Radiance.
                <svg
                  className="absolute left-0 -bottom-2 w-full h-3 text-[#EFAFC3]/60"
                  viewBox="0 0 200 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3 9C50 3 150 3 197 9"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              </span>{' '}
              Pure Whitening Glow.
            </h1>

            {/* Subheading */}
            <p className="text-sm md:text-base text-[#6E6266] leading-relaxed max-w-xl mx-auto lg:mx-0">
              Transform your skin with authentic <strong>Khushi Whitening Cream</strong>, 
              <strong> The King Night Cream</strong>, and the signature <strong>3-Step Radiance Combo</strong>. 
              Clinically formulated for visible, spotless, glowing skin in just 7 days.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                href="/products/khushi-extra-whitening-combo"
                className="w-full sm:w-auto px-8 py-4 bg-[#D66B8B] hover:bg-[#c25877] text-white rounded-full font-bold text-sm uppercase tracking-wider shadow-pink-soft flex items-center justify-center gap-2 group transition-all active:scale-95"
              >
                <span>Shop Extra Whitening Combo</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/shop"
                className="w-full sm:w-auto px-7 py-4 bg-white hover:bg-[#FFF4F7] text-[#3A3034] border border-[#F8D7E3] rounded-full font-bold text-sm uppercase tracking-wider transition-colors text-center shadow-sm"
              >
                Explore Full Catalog
              </Link>
            </div>

            {/* Social Proof & Trust Badges */}
            <div className="pt-4 border-t border-[#F8D7E3]/60 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-[#6E6266]">
              <div className="flex items-center gap-1.5">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="font-bold text-[#3A3034]">4.9 / 5</span>
                <span>(1,500+ Reviews)</span>
              </div>
              <div className="flex items-center gap-1 text-[#2E7D32] font-medium">
                <ShieldCheck className="w-4 h-4" />
                <span>100% Authentic Guarantee</span>
              </div>
            </div>
          </motion.div>

          {/* Right Hero Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-6 relative"
          >
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Main Image Frame with luxury soft border */}
              <div className="relative aspect-4/3 rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-white">
                <Image
                  src="/images/hero-woman.png"
                  alt="Khushi & Gohar Natural Radiance & Whitening Glow"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                  className="object-cover object-[center_35%] hover:scale-105 transition-transform duration-700"
                  priority
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
