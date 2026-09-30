import React from 'react';
import { HeroSection } from '@/components/home/HeroSection';
import { TodaysGiftBanner } from '@/components/home/TodaysGiftBanner';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { WhyKhushi } from '@/components/home/WhyKhushi';
import { BrandStory } from '@/components/home/BrandStory';
import { ReviewCarousel } from '@/components/home/ReviewCarousel';

export const metadata = {
  title: 'Khushi & Gohar | Extra Whitening Cream & Luxury Skincare India',
  description:
    'Official store of Khushi & Gohar (Khushi Whitening Cream). Shop 100% authentic whitening creams, The King Night Cream, 3-Step Radiance Combos, and herbal beauty care.',
  openGraph: {
    title: 'Khushi & Gohar | Authentic Whitening Creams',
    description: 'Transform your skin with proven 7-day visible radiance and natural Ayurvedic formulations.',
  },
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <HeroSection />
      <TodaysGiftBanner />
      <CategoryGrid />
      <FeaturedProducts />
      <WhyKhushi />
      <BrandStory />
      <ReviewCarousel />
    </main>
  );
}
