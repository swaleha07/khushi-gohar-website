'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, Edit3 } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { EditCategoryModal } from '@/components/category/EditCategoryModal';
import { Category } from '@/types';

export const CategoryGrid: React.FC = () => {
  const { categories } = useStore();
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Exclude 'All Products' card from the homepage visual grid
  const displayCategories = categories.filter(
    (cat) => cat.id !== 'all' && cat.name.toLowerCase() !== 'all products'
  );

  return (
    <section className="py-14 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF4F7] text-xs font-bold uppercase tracking-wider text-[#D66B8B] mb-2 border border-[#F8D7E3]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Curated Collections</span>
          </div>
          <h2 className="font-serif-luxury text-2xl sm:text-3xl md:text-4xl font-bold text-[#3A3034]">
            Shop by Category
          </h2>
          <p className="text-xs sm:text-sm text-[#6E6266] mt-2">
            Targeted formulations designed for every stage of your bridal and daily radiance routine.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {displayCategories.map((cat) => {
            const primaryImage =
              cat.images && cat.images.length > 0
                ? cat.images[0]
                : '/images/products/extra_whitening_combo.jpg';

            return (
              <div key={cat.id} className="relative group">
                <Link
                  href={cat.href || `/category/${cat.id}`}
                  className="flex flex-col items-center bg-[#FFF4F7]/50 hover:bg-[#FFF4F7] p-3.5 rounded-2xl border border-[#F8D7E3]/70 hover:border-[#D66B8B] transition-all duration-300 shadow-xs hover:shadow-pink-card text-center h-full w-full"
                >
                  {/* Floating Badge */}
                  {cat.badge && (
                    <span className="absolute top-2 right-2 text-[9px] font-bold uppercase tracking-wider text-[#D66B8B] bg-white px-2 py-0.5 rounded-full border border-[#F8D7E3] shadow-xs">
                      {cat.badge}
                    </span>
                  )}

                  {/* Image Circle */}
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-white shadow-sm mb-3 bg-white mt-1 group-hover:scale-105 transition-transform duration-300">
                    <Image
                      src={primaryImage}
                      alt={cat.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Title & Subtitle */}
                  <h3 className="font-serif-luxury font-bold text-xs sm:text-sm text-[#3A3034] group-hover:text-[#D66B8B] transition-colors leading-tight">
                    {cat.name}
                  </h3>
                  <p className="text-[10px] text-[#6E6266] mt-1 line-clamp-1">
                    {cat.subtitle}
                  </p>
                </Link>

                {/* Quick Edit Overlay Button on hover for localhost */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setEditingCategory(cat);
                  }}
                  className="absolute bottom-2 right-2 p-1.5 bg-white text-[#D66B8B] hover:bg-[#D66B8B] hover:text-white rounded-full border border-[#F8D7E3] shadow-sm opacity-0 group-hover:opacity-100 transition-all z-10"
                  title={`Edit ${cat.name} Images`}
                >
                  <Edit3 className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit Category Modal */}
      {editingCategory && (
        <EditCategoryModal
          isOpen={!!editingCategory}
          onClose={() => setEditingCategory(null)}
          category={editingCategory}
        />
      )}
    </section>
  );
};
