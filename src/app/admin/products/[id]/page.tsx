'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Trash2, Save, Sparkles } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { Product, ProductVariant, CategoryType } from '@/types';

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default function EditProductPage({ params }: EditProductPageProps) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const router = useRouter();
  const { getProductById, updateProduct } = useStore();

  const product = getProductById(id);

  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<CategoryType>('skincare');
  const [price, setPrice] = useState<number>(999);
  const [discountPrice, setDiscountPrice] = useState<number>(799);
  const [sku, setSku] = useState('');
  const [variants, setVariants] = useState<ProductVariant[]>([]);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setTagline(product.tagline);
      setDescription(product.description);
      setCategory(product.category);
      setPrice(product.price);
      setDiscountPrice(product.discountPrice || 0);
      setSku(product.sku);
      setVariants(product.variants || []);
    }
  }, [product]);

  if (!product) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-[#F8D7E3]">
        <h2 className="font-serif-luxury text-xl font-bold text-[#3A3034]">Product not found</h2>
        <Link href="/admin/products" className="text-xs font-bold text-[#D66B8B] mt-2 inline-block">
          ← Back to Catalog
        </Link>
      </div>
    );
  }

  const handleAddVariant = () => {
    const newVar: ProductVariant = {
      id: `var-${Date.now()}`,
      name: 'New Size Variant',
      size: 'New Size',
      price: 999,
      discountPrice: 799,
      stock: 20,
      sku: `${sku}-V${variants.length + 1}`,
      isActive: true,
    };
    setVariants([...variants, newVar]);
  };

  const handleRemoveVariant = (varId: string) => {
    setVariants(variants.filter((v) => v.id !== varId));
  };

  const handleVariantChange = (varId: string, field: keyof ProductVariant, value: any) => {
    setVariants(
      variants.map((v) => (v.id === varId ? { ...v, [field]: value } : v))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const updatedProd: Product = {
      ...product,
      name,
      tagline,
      description,
      category,
      categoryName: category.toUpperCase(),
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : undefined,
      sku,
      variants,
      baseStock: variants.reduce((sum, v) => sum + v.stock, 0),
    };

    updateProduct(updatedProd);
    router.push('/admin/products');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between pb-4 border-b border-[#F8D7E3]">
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#D66B8B] hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Products</span>
        </Link>
        <h1 className="font-serif-luxury text-2xl font-bold text-[#3A3034]">
          Edit: {product.name}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Product Info */}
        <div className="bg-white p-6 rounded-3xl border border-[#F8D7E3] shadow-xs space-y-4 text-xs">
          <h2 className="font-serif-luxury font-bold text-base text-[#3A3034]">Product Details</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-[#3A3034] mb-1">Product Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FFF4F7] rounded-xl border border-[#F8D7E3] text-[#3A3034] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-[#3A3034] mb-1">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CategoryType)}
                className="w-full px-3.5 py-2.5 bg-[#FFF4F7] rounded-xl border border-[#F8D7E3] text-[#3A3034] focus:outline-none"
              >
                <option value="skincare">Skincare & Night Creams</option>
                <option value="combos">Combos & Kits</option>
                <option value="bodycare">Bodycare</option>
                <option value="haircare">Haircare</option>
                <option value="lipcare">Lipcare</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-[#3A3034] mb-1">Tagline</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FFF4F7] rounded-xl border border-[#F8D7E3] text-[#3A3034] focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-[#3A3034] mb-1">Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FFF4F7] rounded-xl border border-[#F8D7E3] text-[#3A3034] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Pricing & SKU */}
        <div className="bg-white p-6 rounded-3xl border border-[#F8D7E3] shadow-xs space-y-4 text-xs">
          <h2 className="font-serif-luxury font-bold text-base text-[#3A3034]">Base Pricing & SKU</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-[#3A3034] mb-1">MRP Price (₹)</label>
              <input
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-[#FFF4F7] rounded-xl border border-[#F8D7E3] text-[#3A3034]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#3A3034] mb-1">Discount Price (₹)</label>
              <input
                type="number"
                value={discountPrice}
                onChange={(e) => setDiscountPrice(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-[#FFF4F7] rounded-xl border border-[#F8D7E3] text-[#3A3034]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#3A3034] mb-1">SKU Code</label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FFF4F7] rounded-xl border border-[#F8D7E3] text-[#3A3034]"
              />
            </div>
          </div>
        </div>

        {/* Variants Manager */}
        <div className="bg-white p-6 rounded-3xl border border-[#F8D7E3] shadow-xs space-y-4 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-[#F8D7E3]">
            <div>
              <h2 className="font-serif-luxury font-bold text-base text-[#3A3034]">
                Variants (20 GM / 30 GM / 100 GM / Packs)
              </h2>
              <p className="text-[10px] text-[#6E6266]">
                Manage independent stock and pricing for each size.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddVariant}
              className="px-3 py-1.5 bg-[#FFF4F7] border border-[#F8D7E3] hover:bg-[#F8D7E3] text-[#D66B8B] rounded-xl font-bold text-xs inline-flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Variant</span>
            </button>
          </div>

          <div className="space-y-3">
            {variants.map((v) => (
              <div
                key={v.id}
                className="p-4 bg-[#FFF4F7]/40 rounded-2xl border border-[#F8D7E3] grid grid-cols-1 sm:grid-cols-5 gap-3 items-end"
              >
                <div className="sm:col-span-2">
                  <label className="block font-bold text-[#3A3034] mb-1">Variant Name</label>
                  <input
                    type="text"
                    value={v.name}
                    onChange={(e) => handleVariantChange(v.id, 'name', e.target.value)}
                    className="w-full px-3 py-1.5 bg-white rounded-lg border border-[#F8D7E3] text-[#3A3034]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#3A3034] mb-1">Offer Price (₹)</label>
                  <input
                    type="number"
                    value={v.discountPrice ?? v.price}
                    onChange={(e) =>
                      handleVariantChange(v.id, 'discountPrice', Number(e.target.value))
                    }
                    className="w-full px-3 py-1.5 bg-white rounded-lg border border-[#F8D7E3] text-[#3A3034]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#3A3034] mb-1">Stock</label>
                  <input
                    type="number"
                    value={v.stock}
                    onChange={(e) => handleVariantChange(v.id, 'stock', Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-white rounded-lg border border-[#F8D7E3] text-[#3A3034]"
                  />
                </div>

                <div className="flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => handleRemoveVariant(v.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    title="Remove variant"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-4">
          <Link
            href="/admin/products"
            className="px-6 py-3 bg-white border border-[#F8D7E3] text-[#3A3034] rounded-2xl text-xs font-bold uppercase tracking-wider"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="px-8 py-3 bg-[#D66B8B] hover:bg-[#c25877] text-white rounded-2xl text-xs font-bold uppercase tracking-wider shadow-pink-soft flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Product Changes</span>
          </button>
        </div>
      </form>
    </div>
  );
}
