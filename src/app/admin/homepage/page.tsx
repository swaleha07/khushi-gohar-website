'use client';

import React, { useState } from 'react';
import { LayoutTemplate, Save, CheckCircle2, Sparkles, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function AdminHomepageCMSPage() {
  const [heroHeading, setHeroHeading] = useState('Embrace Your Radiance. Pure Whitening Glow.');
  const [heroSubheading, setHeroSubheading] = useState(
    'Transform your skin with authentic Khushi Whitening Cream, The King Night Cream, and the signature 3-Step Radiance Combo.'
  );
  const [announcementText, setAnnouncementText] = useState(
    '✨ 100% Authentic Khushi & Gohar Formulations | Visible Glow in 7 Days!'
  );
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
            Homepage Content Management
          </h1>
          <p className="text-xs text-[#6E6266] mt-0.5">
            Update hero headlines, announcement marquee banners, and featured copy.
          </p>
        </div>

        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#FFF4F7] border border-[#F8D7E3] rounded-xl text-xs font-bold text-[#D66B8B] hover:bg-[#F8D7E3]"
        >
          <span>Preview Live Homepage</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Homepage CMS content saved!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        <div className="bg-white p-6 rounded-3xl border border-[#F8D7E3] shadow-xs space-y-4">
          <h2 className="font-serif-luxury font-bold text-base text-[#3A3034]">
            Top Announcement Bar
          </h2>
          <div>
            <label className="block font-bold text-[#3A3034] mb-1">Ticker Headline</label>
            <input
              type="text"
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#FFF4F7] rounded-xl border border-[#F8D7E3] text-[#3A3034] focus:outline-none"
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#F8D7E3] shadow-xs space-y-4">
          <h2 className="font-serif-luxury font-bold text-base text-[#3A3034]">
            Hero Section Banner Copy
          </h2>
          <div>
            <label className="block font-bold text-[#3A3034] mb-1">Main H1 Title</label>
            <input
              type="text"
              value={heroHeading}
              onChange={(e) => setHeroHeading(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#FFF4F7] rounded-xl border border-[#F8D7E3] text-[#3A3034] focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-[#3A3034] mb-1">Subheadline Description</label>
            <textarea
              rows={3}
              value={heroSubheading}
              onChange={(e) => setHeroSubheading(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#FFF4F7] rounded-xl border border-[#F8D7E3] text-[#3A3034] focus:outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-8 py-3.5 bg-[#D66B8B] hover:bg-[#c25877] text-white rounded-2xl text-xs font-bold uppercase tracking-wider shadow-pink-soft flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Update Homepage Content</span>
          </button>
        </div>
      </form>
    </div>
  );
}
