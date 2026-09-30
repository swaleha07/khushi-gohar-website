'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { ProductCard } from '@/components/product/ProductCard';

export const FeaturedProducts: React.FC = () => {
  const { products } = useStore();

  const featured = products.filter((p) => p.isFeatured || p.isBestSeller).slice(0, 4);

  return (
    <section className="py-16 bg-gradient-to-b from-white via-[#FFF4F7]/40 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF4F7] text-xs font-bold uppercase tracking-wider text-[#D66B8B] mb-2 border border-[#F8D7E3]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Customer Favorites</span>
            </div>
            <h2 className="font-serif-luxury text-2xl sm:text-3xl md:text-4xl font-bold text-[#3A3034]">
              Best Selling Whitening & Night Creams
            </h2>
            <p className="text-xs sm:text-sm text-[#6E6266] mt-1.5">
              Experience the proven formulations loved by over 15,000+ Indian women.
            </p>
          </div>

          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#D66B8B] hover:text-[#c25877] mt-4 md:mt-0 group"
          >
            <span>View All Products</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};
