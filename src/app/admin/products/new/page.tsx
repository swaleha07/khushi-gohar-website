'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Trash2, Save, Sparkles, Image as ImageIcon } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { Product, ProductVariant, CategoryType } from '@/types';

export default function NewProductPage() {
  const router = useRouter();
  const { addProduct } = useStore();

  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<CategoryType>('skincare');
  const [price, setPrice] = useState<number>(999);
  const [discountPrice, setDiscountPrice] = useState<number>(799);
  const [sku, setSku] = useState('KG-NEW-01');
  const [imageUrl, setImageUrl] = useState('/images/products/extra_whitening_combo.jpg');
  const [ingredientsText, setIngredientsText] = useState(
    'Kashmiri Saffron Extract, 24K Gold Dust, Niacinamide, Pure Rosewater, Hyaluronic Acid'
  );
  const [howToUseText, setHowToUseText] = useState(
    'Step 1: Cleanse face. Step 2: Apply cream evenly. Step 3: Massage gently.'
  );

  // Variant manager (20 GM, 30 GM, 100 GM)
  const [variants, setVariants] = useState<ProductVariant[]>([
    {
      id: 'var-1',
      name: '20 GM Trial Jar',
      size: '20 GM',
      price: 999,
      discountPrice: 799,
      stock: 50,
      sku: 'KG-NEW-20G',
      isActive: true,
    },
    {
      id: 'var-2',
      name: '100 GM Jumbo Jar',
      size: '100 GM',
      price: 2199,
      discountPrice: 1699,
      stock: 30,
      sku: 'KG-NEW-100G',
      isActive: true,
    },
  ]);

  const handleAddVariant = () => {
    const newVar: ProductVariant = {
      id: `var-${Date.now()}`,
      name: '30 GM Standard Jar',
      size: '30 GM',
      price: 1399,
      discountPrice: 1099,
      stock: 25,
      sku: `KG-VAR-${Date.now().toString().slice(-4)}`,
      isActive: true,
    };
    setVariants([...variants, newVar]);
  };

  const handleRemoveVariant = (id: string) => {
    setVariants(variants.filter((v) => v.id !== id));
  };

  const handleVariantChange = (id: string, field: keyof ProductVariant, value: any) => {
    setVariants(
      variants.map((v) => (v.id === id ? { ...v, [field]: value } : v))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const newProd: Product = {
      id: `prod-${Date.now()}`,
      name,
      slug,
      tagline,
      description,
      category,
      categoryName: category.toUpperCase(),
      images: [imageUrl, '/images/products/extra_whitening_combo_poster.jpg'],
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : undefined,
      baseStock: variants.reduce((sum, v) => sum + v.stock, 0) || 50,
      sku,
      rating: 5.0,
      reviewsCount: 1,
      isFeatured: true,
      isActive: true,
      variants,
      ingredients: ingredientsText.split(',').map((s) => s.trim()).filter(Boolean),
      howToUse: howToUseText.split('.').map((s) => s.trim()).filter(Boolean),
      benefits: ['Deep whitening radiance', 'Fades dark spots', 'Smooth even skin tone'],
      specifications: {
        Packaging: 'Luxury Jar / Bottle',
        Origin: 'India',
      },
    };

    addProduct(newProd);
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
        <h1 className="font-serif-luxury text-2xl font-bold text-[#3A3034]">Add New Product</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Product Info */}
        <div className="bg-white p-6 rounded-3xl border border-[#F8D7E3] shadow-xs space-y-4 text-xs">
          <h2 className="font-serif-luxury font-bold text-base text-[#3A3034]">Basic Details</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-[#3A3034] mb-1">Product Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Khushi Radiance Night Cream"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FFF4F7] rounded-xl border border-[#F8D7E3] text-[#3A3034] focus:outline-none focus:ring-1 focus:ring-[#D66B8B]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#3A3034] mb-1">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CategoryType)}
                className="w-full px-3.5 py-2.5 bg-[#FFF4F7] rounded-xl border border-[#F8D7E3] text-[#3A3034] focus:outline-none focus:ring-1 focus:ring-[#D66B8B]"
              >
                <option value="skincare">Skincare & Night Creams</option>
                <option value="combos">Combos & Kits</option>
                <option value="bodycare">Bodycare</option>
                <option value="haircare">Haircare</option>
                <option value="lipcare">Lipcare</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-[#3A3034] mb-1">Tagline / Short Hook</label>
              <input
                type="text"
                placeholder="e.g. 7-Day Spot Lightening & Deep Overnight Nourishment"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FFF4F7] rounded-xl border border-[#F8D7E3] text-[#3A3034] focus:outline-none focus:ring-1 focus:ring-[#D66B8B]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-[#3A3034] mb-1">Full Description</label>
              <textarea
                rows={3}
                placeholder="Describe key ingredients, benefits, and skin transformative effects..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FFF4F7] rounded-xl border border-[#F8D7E3] text-[#3A3034] focus:outline-none focus:ring-1 focus:ring-[#D66B8B]"
              />
            </div>
          </div>
        </div>

        {/* Pricing & SKU */}
        <div className="bg-white p-6 rounded-3xl border border-[#F8D7E3] shadow-xs space-y-4 text-xs">
          <h2 className="font-serif-luxury font-bold text-base text-[#3A3034]">Base Pricing & SKU</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-[#3A3034] mb-1">MRP / Original Price (₹)</label>
              <input
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-[#FFF4F7] rounded-xl border border-[#F8D7E3] text-[#3A3034] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-[#3A3034] mb-1">Offer / Discount Price (₹)</label>
              <input
                type="number"
                value={discountPrice}
                onChange={(e) => setDiscountPrice(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-[#FFF4F7] rounded-xl border border-[#F8D7E3] text-[#3A3034] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-[#3A3034] mb-1">SKU Code</label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FFF4F7] rounded-xl border border-[#F8D7E3] text-[#3A3034] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Multi-Variant Manager (20 GM, 30 GM, 100 GM) */}
        <div className="bg-white p-6 rounded-3xl border border-[#F8D7E3] shadow-xs space-y-4 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-[#F8D7E3]">
            <div>
              <h2 className="font-serif-luxury font-bold text-base text-[#3A3034]">
                Size & Pack Variants (20 GM / 30 GM / 100 GM)
              </h2>
              <p className="text-[10px] text-[#6E6266]">
                Configure distinct prices, stock levels, and SKUs for each size option.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddVariant}
              className="px-3 py-1.5 bg-[#FFF4F7] border border-[#F8D7E3] hover:bg-[#F8D7E3] text-[#D66B8B] rounded-xl font-bold text-xs inline-flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Size Variant</span>
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
                  <label className="block font-bold text-[#3A3034] mb-1">Price (₹)</label>
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
            <span>Publish Product to Store</span>
          </button>
        </div>
      </form>
    </div>
  );
}
