'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, X, ArrowRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/context/StoreContext';
import { formatPrice } from '@/lib/utils';

export const SearchModal: React.FC = () => {
  const { searchOpen, setSearchOpen, products } = useStore();
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { label: 'All', value: 'all' },
    { label: 'Combos & Kits', value: 'combos' },
    { label: 'Skincare', value: 'skincare' },
    { label: 'Bodycare', value: 'bodycare' },
    { label: 'Haircare', value: 'haircare' },
    { label: 'Lipcare', value: 'lipcare' },
  ];

  const searchResults = useMemo(() => {
    if (!query.trim() && selectedCategory === 'all') {
      return products.slice(0, 4); // show recommended
    }

    return products.filter((product) => {
      const matchesCategory =
        selectedCategory === 'all' || product.category === selectedCategory;

      const q = query.toLowerCase().trim();
      if (!q) return matchesCategory;

      const matchesQuery =
        product.name.toLowerCase().includes(q) ||
        product.tagline.toLowerCase().includes(q) ||
        product.description.toLowerCase().includes(q) ||
        product.ingredients.some((ing) => ing.toLowerCase().includes(q));

      return matchesCategory && matchesQuery;
    });
  }, [query, selectedCategory, products]);

  if (!searchOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 md:pt-24 px-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSearchOpen(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          className="relative z-10 w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#F8D7E3] overflow-hidden flex flex-col max-h-[80vh]"
        >
          {/* Search Header */}
          <div className="p-5 border-b border-[#F8D7E3] bg-[#FFF4F7]/80">
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-[#D66B8B]" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search Khushi creams, 24k serums, face wash, combos..."
                className="w-full pl-12 pr-12 py-3.5 bg-white rounded-2xl border border-[#F8D7E3] text-[#3A3034] placeholder-[#6E6266]/60 focus:outline-none focus:ring-2 focus:ring-[#D66B8B] text-sm md:text-base font-medium shadow-inner"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="absolute right-3.5 p-1.5 text-[#6E6266] hover:text-[#3A3034] rounded-full hover:bg-black/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1 no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`text-xs px-3.5 py-1.5 rounded-full font-medium whitespace-nowrap transition-all ${
                    selectedCategory === cat.value
                      ? 'bg-[#D66B8B] text-white shadow-sm'
                      : 'bg-white text-[#3A3034] border border-[#F8D7E3] hover:bg-[#F8D7E3]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Results List */}
          <div className="overflow-y-auto p-5 space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-[#6E6266] mb-2 flex items-center justify-between">
              <span>{query.trim() ? `Search Results (${searchResults.length})` : 'Popular Khushi Products'}</span>
              <span className="text-[#D66B8B] flex items-center gap-1 font-normal lowercase">
                <Sparkles className="w-3 h-3" /> authentic stock
              </span>
            </div>

            {searchResults.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-[#3A3034] font-medium text-base">No matching products found</p>
                <p className="text-xs text-[#6E6266] mt-1">
                  Try searching for &quot;King Night Cream&quot;, &quot;Combo&quot;, or &quot;Whitening&quot;
                </p>
              </div>
            ) : (
              searchResults.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  onClick={() => setSearchOpen(false)}
                  className="flex items-center gap-4 p-3 rounded-2xl border border-[#F8D7E3]/60 hover:border-[#D66B8B] hover:bg-[#FFF4F7] transition-all group"
                >
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-white border border-[#F8D7E3] shrink-0">
                    <Image
                      src={product.images[0] || '/images/products/extra_whitening_combo.jpg'}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold text-[#D66B8B] bg-[#FFF4F7] px-2 py-0.5 rounded-full border border-[#F8D7E3]">
                        {product.categoryName}
                      </span>
                      {product.isBestSeller && (
                        <span className="text-[10px] uppercase font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                          Best Seller
                        </span>
                      )}
                    </div>
                    <h4 className="font-serif-luxury font-bold text-sm md:text-base text-[#3A3034] group-hover:text-[#D66B8B] transition-colors truncate mt-1">
                      {product.name}
                    </h4>
                    <p className="text-xs text-[#6E6266] truncate">{product.tagline}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-[#3A3034]">
                      {formatPrice(product.discountPrice || product.price)}
                    </p>
                    {product.discountPrice && (
                      <p className="text-xs text-[#6E6266] line-through">
                        {formatPrice(product.price)}
                      </p>
                    )}
                    <span className="text-xs text-[#D66B8B] flex items-center justify-end gap-1 mt-1 font-medium group-hover:translate-x-1 transition-transform">
                      View <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>

          {/* Footer link to Shop */}
          <div className="p-4 bg-[#FFF4F7] border-t border-[#F8D7E3] text-center">
            <Link
              href="/shop"
              onClick={() => setSearchOpen(false)}
              className="text-xs font-semibold text-[#D66B8B] hover:underline"
            >
              Explore Full Khushi Product Catalog →
            </Link>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
