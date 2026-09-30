'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Package, Plus, Search, Edit2, Trash2, CheckCircle2, Star, Eye } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { formatPrice } from '@/lib/utils';

export default function AdminProductsPage() {
  const { products, deleteProduct, updateProduct } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filtered = products.filter((p) => {
    const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch = !term || p.name.toLowerCase().includes(term) || p.sku.toLowerCase().includes(term);
    return matchesCat && matchesSearch;
  });

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove "${name}" from the store catalog?`)) {
      deleteProduct(id);
    }
  };

  const handleToggleFeatured = (product: typeof products[0]) => {
    updateProduct({ ...product, isFeatured: !product.isFeatured });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F8D7E3]">
        <div>
          <h1 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#3A3034]">
            Product Catalog & Variants
          </h1>
          <p className="text-xs text-[#6E6266] mt-0.5">
            Manage your whitening creams, 20g/30g/100g sizes, combo sets, and pricing.
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#D66B8B] hover:bg-[#c25877] text-white rounded-2xl text-xs font-bold uppercase tracking-wider shadow-pink-soft transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-[#F8D7E3] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {['all', 'combos', 'skincare', 'bodycare', 'haircare', 'lipcare'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full font-bold uppercase text-[10px] tracking-wider transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-[#D66B8B] text-white shadow-xs'
                  : 'bg-[#FFF4F7] text-[#3A3034] hover:bg-[#F8D7E3]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6E6266]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search product name or SKU..."
            className="w-full pl-10 pr-4 py-2 bg-[#FFF4F7] rounded-xl border border-[#F8D7E3] text-xs text-[#3A3034] focus:outline-none focus:ring-1 focus:ring-[#D66B8B]"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-[#F8D7E3] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#FFF4F7]/60 border-b border-[#F8D7E3] text-[#6E6266] uppercase text-[10px] tracking-wider">
                <th className="py-3.5 px-4">Product Details</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Variants</th>
                <th className="py-3.5 px-4">Base Price</th>
                <th className="py-3.5 px-4">Total Stock</th>
                <th className="py-3.5 px-4 text-center">Featured</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F8D7E3]/60">
              {filtered.map((product) => {
                const totalVariantStock = product.variants
                  ? product.variants.reduce((sum, v) => sum + v.stock, 0)
                  : product.baseStock;

                return (
                  <tr key={product.id} className="hover:bg-[#FFF4F7]/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-[#FFF4F7] border border-[#F8D7E3] shrink-0">
                          <Image
                            src={product.images[0] || '/images/products/extra_whitening_combo.jpg'}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-bold text-[#3A3034] text-xs">{product.name}</p>
                          <p className="text-[10px] text-[#6E6266] font-mono">SKU: {product.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-[10px] uppercase font-bold text-[#D66B8B] bg-[#FFF4F7] px-2 py-0.5 rounded-full border border-[#F8D7E3]">
                        {product.categoryName}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-xs font-semibold text-[#3A3034]">
                        {product.variants?.length || 1} Option(s)
                      </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {product.variants?.map((v) => (
                          <span
                            key={v.id}
                            className="text-[9px] bg-gray-100 text-[#3A3034] px-1.5 py-0.5 rounded"
                          >
                            {v.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#3A3034]">
                      {formatPrice(product.discountPrice || product.price)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          totalVariantStock > 10
                            ? 'bg-emerald-50 text-[#2E7D32]'
                            : totalVariantStock > 0
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-red-50 text-red-700'
                        }`}
                      >
                        {totalVariantStock > 0 ? `${totalVariantStock} Units` : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleFeatured(product)}
                        className={`p-1.5 rounded-full transition-colors ${
                          product.isFeatured
                            ? 'text-amber-500 bg-amber-50'
                            : 'text-gray-300 hover:text-amber-400'
                        }`}
                        title="Toggle Featured"
                      >
                        <Star className={`w-4 h-4 ${product.isFeatured ? 'fill-amber-400' : ''}`} />
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <Link
                        href={`/products/${product.slug}`}
                        target="_blank"
                        className="p-1.5 text-[#6E6266] hover:text-[#3A3034] inline-block"
                        title="View Live"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="p-1.5 text-[#D66B8B] hover:text-[#c25877] inline-block"
                        title="Edit Product"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(product.id, product.name)}
                        className="p-1.5 text-[#6E6266] hover:text-red-500 inline-block"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
