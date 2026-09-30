'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ImageIcon,
  Edit3,
  ExternalLink,
  Sparkles,
  Plus,
  Layers,
  FolderOpen,
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { EditCategoryModal } from '@/components/category/EditCategoryModal';
import { Category } from '@/types';

export default function AdminCategoriesPage() {
  const { categories, products } = useStore();
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F8D7E3]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#3A3034]">
              Categories & Media Management
            </h1>
            <span className="text-[10px] uppercase font-bold text-[#D66B8B] bg-[#FFF4F7] px-2.5 py-0.5 rounded-full border border-[#F8D7E3]">
              Direct Localhost CMS
            </span>
          </div>
          <p className="text-xs text-[#6E6266] mt-0.5">
            Replace existing category images, upload new media from your computer, and manage category descriptions.
          </p>
        </div>
      </div>

      {/* Categories Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => {
          const catProducts = products.filter(
            (p) => p.category === cat.id || (cat.id === 'skincare' && p.category === 'skincare')
          );
          const imagesList = cat.images || [];

          return (
            <div
              key={cat.id}
              className="bg-white rounded-3xl border border-[#F8D7E3] shadow-xs hover:shadow-pink-card transition-all p-5 flex flex-col justify-between group"
            >
              <div className="space-y-4">
                {/* Top Title & Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif-luxury font-bold text-base text-[#3A3034]">
                        {cat.name}
                      </h3>
                    </div>
                    <p className="text-xs text-[#D66B8B] font-semibold mt-0.5">{cat.subtitle}</p>
                  </div>

                  <span className="text-[10px] font-bold text-[#6E6266] bg-[#FFF4F7] px-2 py-0.5 rounded-full border border-[#F8D7E3] shrink-0">
                    {imagesList.length} {imagesList.length === 1 ? 'Image' : 'Images'}
                  </span>
                </div>

                {/* Primary Image Cover & Thumbnails */}
                <div className="space-y-2">
                  <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-[#FFF4F7] border border-[#F8D7E3]">
                    <Image
                      src={imagesList[0] || '/images/products/extra_whitening_combo.jpg'}
                      alt={cat.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute bottom-2 left-2">
                      <span className="text-[10px] font-bold text-white bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded-md">
                        Primary Cover
                      </span>
                    </div>
                  </div>

                  {/* Thumbnail Previews */}
                  {imagesList.length > 1 && (
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                      {imagesList.map((img, idx) => (
                        <div
                          key={idx}
                          className="relative w-12 h-12 rounded-lg overflow-hidden border border-[#F8D7E3] shrink-0 bg-gray-50"
                        >
                          <Image src={img} alt={`Thumb ${idx + 1}`} fill className="object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Description */}
                <p className="text-xs text-[#6E6266] line-clamp-2 leading-relaxed">
                  {cat.description}
                </p>

                {/* Products Count */}
                <div className="flex items-center gap-2 text-[11px] text-[#6E6266] bg-[#FFF4F7]/60 p-2.5 rounded-xl border border-[#F8D7E3]/60">
                  <Layers className="w-3.5 h-3.5 text-[#D66B8B]" />
                  <span>
                    Linked Products: <strong className="text-[#3A3034]">{catProducts.length}</strong>
                  </span>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-4 mt-4 border-t border-[#F8D7E3]/60 flex items-center justify-between gap-2">
                <Link
                  href={cat.href || `/category/${cat.id}`}
                  target="_blank"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#6E6266] hover:text-[#3A3034]"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Live Page</span>
                </Link>

                <button
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#D66B8B] hover:bg-[#c25877] text-white rounded-xl text-xs font-bold transition-all shadow-pink-soft"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Images & Content</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Category Modal */}
      {selectedCategory && (
        <EditCategoryModal
          isOpen={!!selectedCategory}
          onClose={() => setSelectedCategory(null)}
          category={selectedCategory}
        />
      )}
    </div>
  );
}
