'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Sparkles, ArrowUpDown } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { ProductCard } from '@/components/product/ProductCard';
import { CategoryType } from '@/types';

function ShopContent() {
  const { products } = useStore();
  const searchParams = useSearchParams();
  const initialCategory = (searchParams?.get('category') as CategoryType) || 'all';

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [sortBy, setSortBy] = useState<string>('featured');
  const [searchFilter, setSearchFilter] = useState('');

  const categories = [
    { label: 'All Products', value: 'all' },
    { label: 'Combos & Kits', value: 'combos' },
    { label: 'Skincare & Creams', value: 'skincare' },
    { label: 'Bodycare', value: 'bodycare' },
    { label: 'Haircare', value: 'haircare' },
    { label: 'Lipcare', value: 'lipcare' },
  ];

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesCat =
          selectedCategory === 'all' || p.category === selectedCategory;
        const matchesQuery =
          !searchFilter.trim() ||
          p.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
          p.description.toLowerCase().includes(searchFilter.toLowerCase());
        return matchesCat && matchesQuery;
      })
      .sort((a, b) => {
        const priceA = a.discountPrice || a.price;
        const priceB = b.discountPrice || b.price;

        if (sortBy === 'price-low') return priceA - priceB;
        if (sortBy === 'price-high') return priceB - priceA;
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'reviews') return b.reviewsCount - a.reviewsCount;
        return (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0);
      });
  }, [products, selectedCategory, searchFilter, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header Title */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-xs font-bold uppercase tracking-wider text-[#D66B8B] mb-2 border border-[#F8D7E3]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Complete Catalog</span>
        </div>
        <h1 className="font-serif-luxury text-3xl sm:text-4xl md:text-5xl font-bold text-[#3A3034]">
          Shop Khushi & Gohar
        </h1>
        <p className="text-xs sm:text-sm text-[#6E6266] mt-2">
          Explore authentic skin whitening creams, intensive night creams, and radiant herbal glow kits.
        </p>
      </div>

      {/* Filter & Sort Controls */}
      <div className="bg-white rounded-3xl p-4 md:p-6 border border-[#F8D7E3] shadow-xs mb-10 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setSelectedCategory(cat.value)}
                className={`text-xs px-4 py-2 rounded-full font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat.value
                    ? 'bg-[#D66B8B] text-white shadow-pink-soft'
                    : 'bg-[#FFF4F7] text-[#3A3034] hover:bg-[#F8D7E3] border border-[#F8D7E3]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Sort & Search Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Filter by keyword..."
              className="text-xs px-3.5 py-2 rounded-xl bg-[#FFF4F7] border border-[#F8D7E3] text-[#3A3034] focus:outline-none focus:ring-1 focus:ring-[#D66B8B]"
            />

            <div className="flex items-center gap-2 bg-[#FFF4F7] border border-[#F8D7E3] rounded-xl px-3 py-1.5">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#D66B8B]" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Sort products"
                className="text-xs bg-transparent text-[#3A3034] font-medium focus:outline-none cursor-pointer"
              >
                <option value="featured">Featured / Best Sellers</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
                <option value="reviews">Most Reviewed</option>
              </select>
            </div>
          </div>
        </div>

        <div className="text-xs text-[#6E6266] flex items-center justify-between pt-2 border-t border-[#F8D7E3]/60">
          <span>Showing <strong>{filteredProducts.length}</strong> products</span>
          <span className="text-[#D66B8B] font-medium">Free Express Delivery on orders above ₹999</span>
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-[#F8D7E3] p-8">
          <h3 className="font-serif-luxury text-xl font-bold text-[#3A3034]">
            No products found
          </h3>
          <p className="text-xs text-[#6E6266] mt-2 mb-6">
            Try adjusting your category selection or search keywords.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('all');
              setSearchFilter('');
            }}
            className="px-6 py-2.5 bg-[#D66B8B] text-white rounded-full text-xs font-bold uppercase tracking-wider"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ShopPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF4F7]/40 via-white to-white py-10 md:py-16">
      <Suspense fallback={<div className="text-center py-20 text-xs text-[#6E6266]">Loading catalog...</div>}>
        <ShopContent />
      </Suspense>
    </div>
  );
}
