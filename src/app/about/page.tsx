import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Sparkles, ShieldCheck, Heart, Award, CheckCircle2, ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'Our Brand Story & Heritage | Khushi & Gohar',
  description: 'Learn about Khushi & Gohar (Khushi Whitening Cream), our authentic Ayurvedic ingredients and luxury beauty mission.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF4F7]/40 via-white to-white py-12 md:py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header Hero */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white text-xs font-bold uppercase tracking-wider text-[#D66B8B] border border-[#F8D7E3] shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pure Indian Luxury Skincare</span>
          </div>
          <h1 className="font-serif-luxury text-3xl sm:text-4xl md:text-5xl font-bold text-[#3A3034] leading-tight">
            The Story Behind Khushi & Gohar
          </h1>
          <p className="text-sm text-[#6E6266] leading-relaxed">
            Where traditional Kashmiri botanical wisdom meets modern clinical radiance.
          </p>
        </div>

        {/* Narrative & Visual */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="relative aspect-4/3 rounded-3xl overflow-hidden shadow-pink-card border-4 border-white">
            <Image
              src="/images/banners/hero_banner.jpg"
              alt="Khushi & Gohar Formulation Lab"
              fill
              className="object-cover"
            />
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-[#6E6266] leading-relaxed">
            <h2 className="font-serif-luxury text-2xl font-bold text-[#3A3034]">
              Born for Real, Visible Radiance
            </h2>
            <p>
              Khushi & Gohar was founded on a simple yet revolutionary promise: to deliver genuine, highly potent, and skin-loving whitening and night repair formulas that genuinely work without harsh bleaches or harmful steroids.
            </p>
            <p>
              From our signature <strong>The King Night Cream</strong> to our iconic <strong>3-Step Whitening Combos</strong>, every single product is infused with authentic active botanicals—wild Kashmiri saffron (Kesar), pure Damask rose water, 24K gold dust, and restorative brightening peptides.
            </p>
          </div>
        </div>

        {/* Core Pillars */}
        <div className="bg-[#FFF4F7]/60 p-8 rounded-3xl border border-[#F8D7E3] space-y-6">
          <h3 className="font-serif-luxury text-xl font-bold text-[#3A3034] text-center">
            Our Quality Standards
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div className="p-4 bg-white rounded-2xl border border-[#F8D7E3]">
              <ShieldCheck className="w-8 h-8 text-[#D66B8B] mx-auto mb-2" />
              <h4 className="font-bold text-xs text-[#3A3034] mb-1">100% Authentic Ingredients</h4>
              <p className="text-[11px] text-[#6E6266]">Ethically sourced natural extracts and clinical peptides.</p>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-[#F8D7E3]">
              <Heart className="w-8 h-8 text-[#D66B8B] mx-auto mb-2" />
              <h4 className="font-bold text-xs text-[#3A3034] mb-1">Cruelty Free & Safe</h4>
              <p className="text-[11px] text-[#6E6266]">Never tested on animals and free from harsh chemicals.</p>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-[#F8D7E3]">
              <Award className="w-8 h-8 text-[#D66B8B] mx-auto mb-2" />
              <h4 className="font-bold text-xs text-[#3A3034] mb-1">15,000+ Happy Customers</h4>
              <p className="text-[11px] text-[#6E6266]">Loved across India for dependable 7-day visible results.</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#D66B8B] hover:bg-[#c25877] text-white rounded-full font-bold text-xs uppercase tracking-wider shadow-pink-soft"
          >
            <span>Explore Our Authentic Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
