'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Gift, Sparkles, Save, CheckCircle2 } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { Offer } from '@/types';
import { formatPrice } from '@/lib/utils';

export default function AdminOffersPage() {
  const { offers, updateOffer } = useStore();
  const currentOffer = offers[0];

  const [title, setTitle] = useState(currentOffer?.title || "TODAY'S SPECIAL GIFT");
  const [subtitle, setSubtitle] = useState(
    currentOffer?.subtitle || 'FREE 24K Saffron Glow Serum on Orders Above ₹1,499'
  );
  const [giftName, setGiftName] = useState(currentOffer?.giftName || '24K Saffron Glow Serum (30ml)');
  const [minOrderValue, setMinOrderValue] = useState(currentOffer?.minOrderValue || 1499);
  const [ctaText, setCtaText] = useState(currentOffer?.ctaText || 'Claim Your Free Gift Now');
  const [ctaLink, setCtaLink] = useState(currentOffer?.ctaLink || '/shop');
  const [bannerImage, setBannerImage] = useState(
    currentOffer?.bannerImage || '/images/banners/todays_gift.jpg'
  );
  const [endDate, setEndDate] = useState(currentOffer?.endDate || '2026-09-30');
  const [isActive, setIsActive] = useState(currentOffer?.isActive ?? true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: Offer = {
      id: currentOffer?.id || 'offer-1',
      title,
      subtitle,
      giftName,
      minOrderValue: Number(minOrderValue),
      ctaText,
      ctaLink,
      bannerImage,
      startDate: currentOffer?.startDate || '2026-08-01',
      endDate,
      isActive,
    };
    updateOffer(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F8D7E3]">
        <div>
          <h1 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#3A3034]">
            Today&apos;s Gift & Promotional Campaign
          </h1>
          <p className="text-xs text-[#6E6266] mt-0.5">
            Configure the live homepage free gift banner, minimum order thresholds, and expiry dates.
          </p>
        </div>

        {savedSuccess && (
          <div className="p-2.5 px-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Campaign banner updated live!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Banner Preview */}
        <div className="bg-white p-6 rounded-3xl border border-[#F8D7E3] shadow-xs space-y-4 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-[#F8D7E3]">
            <h2 className="font-serif-luxury font-bold text-base text-[#3A3034]">
              Active Banner Preview
            </h2>
            <span
              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700'
              }`}
            >
              {isActive ? 'Live on Storefront' : 'Hidden / Inactive'}
            </span>
          </div>

          <div className="relative aspect-16/7 w-full rounded-2xl overflow-hidden bg-[#FFF4F7] border border-[#F8D7E3]">
            <Image src={bannerImage} alt="Offer Banner" fill className="object-cover" />
          </div>
        </div>

        {/* Configuration Fields */}
        <div className="bg-white p-6 rounded-3xl border border-[#F8D7E3] shadow-xs space-y-4 text-xs">
          <h2 className="font-serif-luxury font-bold text-base text-[#3A3034]">Offer Settings</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-[#3A3034] mb-1">Banner Badge Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FFF4F7] rounded-xl border border-[#F8D7E3] text-[#3A3034] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-[#3A3034] mb-1">Free Gift Item Name</label>
              <input
                type="text"
                required
                value={giftName}
                onChange={(e) => setGiftName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FFF4F7] rounded-xl border border-[#F8D7E3] text-[#3A3034] focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-[#3A3034] mb-1">Headline Subtitle</label>
              <input
                type="text"
                required
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FFF4F7] rounded-xl border border-[#F8D7E3] text-[#3A3034] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-[#3A3034] mb-1">
                Minimum Order Value Required (₹)
              </label>
              <input
                type="number"
                required
                value={minOrderValue}
                onChange={(e) => setMinOrderValue(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-[#FFF4F7] rounded-xl border border-[#F8D7E3] text-[#3A3034] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-[#3A3034] mb-1">Campaign End Date</label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FFF4F7] rounded-xl border border-[#F8D7E3] text-[#3A3034] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-[#3A3034] mb-1">Button Call to Action</label>
              <input
                type="text"
                value={ctaText}
                onChange={(e) => setCtaText(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FFF4F7] rounded-xl border border-[#F8D7E3] text-[#3A3034] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-[#3A3034] mb-1">Destination URL</label>
              <input
                type="text"
                value={ctaLink}
                onChange={(e) => setCtaLink(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FFF4F7] rounded-xl border border-[#F8D7E3] text-[#3A3034] focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-3 p-3 bg-[#FFF4F7] rounded-xl border border-[#F8D7E3] cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 text-[#D66B8B] rounded focus:ring-[#D66B8B]"
              />
              <span className="font-bold text-xs text-[#3A3034]">
                Display Today&apos;s Gift Banner on Homepage
              </span>
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-8 py-3.5 bg-[#D66B8B] hover:bg-[#c25877] text-white rounded-2xl text-xs font-bold uppercase tracking-wider shadow-pink-soft flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save & Apply Promo Changes</span>
          </button>
        </div>
      </form>
    </div>
  );
}
