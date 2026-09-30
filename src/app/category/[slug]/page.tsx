'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles, Edit3 } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { ProductCard } from '@/components/product/ProductCard';
import { EditCategoryModal } from '@/components/category/EditCategoryModal';
import { Category } from '@/types';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;
  const { products, getCategoryById, categories } = useStore();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Retrieve category from StoreContext by ID or href
  const storeCategory =
    getCategoryById(slug) ||
    categories.find((c) => c.id === slug || c.href === `/category/${slug}`);

  const fallbackCategory: Category = {
    id: slug,
    name: `${slug.charAt(0).toUpperCase() + slug.slice(1)} Collection`,
    subtitle: 'Khushi & Gohar Luxury Care',
    description: 'Explore our authentic beauty and skincare formulations.',
    badge: 'Curated',
    href: `/category/${slug}`,
    images: ['/images/banners/hero_banner.jpg'],
  };

  const category = storeCategory || fallbackCategory;

  const categoryProducts = products.filter((p) => p.category === slug);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF4F7]/50 via-white to-white py-10 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Action Bar with Breadcrumb and Edit Category Button */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#D66B8B] hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Collections</span>
          </Link>

          {/* Prominent Edit Category Button */}
          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-[#FFF4F7] text-[#D66B8B] border border-[#F8D7E3] hover:border-[#D66B8B] rounded-full text-xs font-bold transition-all shadow-xs group"
          >
            <Edit3 className="w-3.5 h-3.5 text-[#D66B8B] group-hover:scale-110 transition-transform" />
            <span>Edit Category</span>
            <span className="hidden sm:inline text-[10px] bg-[#FFF4F7] text-[#3A3034] px-1.5 py-0.5 rounded-full border border-[#F8D7E3]">
              Localhost
            </span>
          </button>
        </div>

        {/* Category Hero Banner */}
        <div className="bg-white rounded-3xl p-8 md:p-12 border border-[#F8D7E3] shadow-pink-card mb-10 text-center max-w-4xl mx-auto relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#FFF4F7] rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 space-y-3">
            {category.subtitle && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF4F7] text-xs font-bold uppercase tracking-wider text-[#D66B8B] border border-[#F8D7E3]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{category.subtitle}</span>
              </div>
            )}
            <h1 className="font-serif-luxury text-3xl sm:text-4xl md:text-5xl font-bold text-[#3A3034]">
              {category.name}
            </h1>
            {category.description && (
              <p className="text-xs sm:text-sm text-[#6E6266] max-w-2xl mx-auto leading-relaxed">
                {category.description}
              </p>
            )}
          </div>
        </div>

        {/* Products Grid Section Header */}
        <div className="mb-6 flex items-center justify-between pb-3 border-b border-[#F8D7E3]">
          <h2 className="font-serif-luxury text-xl sm:text-2xl font-bold text-[#3A3034]">
            Products in {category.name}
          </h2>
          <span className="text-xs font-bold text-[#D66B8B] bg-[#FFF4F7] px-3 py-1 rounded-full border border-[#F8D7E3]">
            {categoryProducts.length} {categoryProducts.length === 1 ? 'Product' : 'Products'}
          </span>
        </div>

        {/* Products Grid */}
        {categoryProducts.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl border border-[#F8D7E3] p-8">
            <h3 className="font-serif-luxury text-lg font-bold text-[#3A3034]">
              Products coming soon to this category
            </h3>
            <p className="text-xs text-[#6E6266] mt-2 mb-6">
              Browse our full catalog to discover available beauty & skincare formulations.
            </p>
            <Link
              href="/shop"
              className="px-6 py-2.5 bg-[#D66B8B] text-white rounded-full text-xs font-bold uppercase tracking-wider"
            >
              Browse All Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categoryProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

      {/* Edit Category Modal */}
      {category && (
        <EditCategoryModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          category={category}
        />
      )}
    </div>
  );
}
