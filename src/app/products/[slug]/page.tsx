'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Heart,
  ShoppingBag,
  Zap,
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Plus,
  Minus,
  ArrowLeft,
  Share2,
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { ProductVariant } from '@/types';
import { formatPrice } from '@/lib/utils';
import { ProductCard } from '@/components/product/ProductCard';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default function ProductDetailPage({ params }: ProductPageProps) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;
  const router = useRouter();

  const { getProductBySlug, products } = useStore();
  const { addItem, setDirectCheckoutItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const product = getProductBySlug(slug);

  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(
    product?.variants && product.variants.length > 0 ? product.variants[0] : undefined
  );
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'overview' | 'ingredients' | 'howToUse' | 'reviews'>('overview');
  const [isAdded, setIsAdded] = useState(false);

  if (!product) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="font-serif-luxury text-2xl font-bold text-[#3A3034]">Product not found</h2>
        <p className="text-xs text-[#6E6266] mt-2 mb-6">
          The item you are looking for might have been moved or removed.
        </p>
        <Link
          href="/shop"
          className="px-6 py-2.5 bg-[#D66B8B] text-white rounded-full text-xs font-bold uppercase tracking-wider"
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  const activePrice = selectedVariant
    ? (selectedVariant.discountPrice ?? selectedVariant.price)
    : (product.discountPrice ?? product.price);

  const originalPrice = selectedVariant ? selectedVariant.price : product.price;

  const discountPercent =
    originalPrice > activePrice
      ? Math.round(((originalPrice - activePrice) / originalPrice) * 100)
      : 0;

  const currentStock = selectedVariant ? selectedVariant.stock : product.baseStock;
  const currentSKU = selectedVariant ? selectedVariant.sku : product.sku;
  const isWished = isInWishlist(product.id);

  const handleAddToCart = () => {
    if (currentStock <= 0) return;
    addItem(product, selectedVariant, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleBuyNow = () => {
    if (currentStock <= 0) return;
    const checkoutItem = {
      id: selectedVariant ? `${product.id}_${selectedVariant.id}` : product.id,
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      variantId: selectedVariant?.id,
      variantName: selectedVariant?.name,
      price: activePrice,
      originalPrice,
      quantity,
      image: product.images[0] || '/images/products/extra_whitening_combo.jpg',
      stock: currentStock,
    };
    setDirectCheckoutItem(checkoutItem);
    router.push('/checkout');
  };

  const relatedProducts = products
    .filter((p) => p.id !== product.id && (p.category === product.category || p.isFeatured))
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-white py-8 md:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-[#6E6266] mb-8">
          <Link href="/" className="hover:text-[#D66B8B] transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-[#D66B8B] transition-colors">
            Shop
          </Link>
          <span>/</span>
          <Link
            href={`/category/${product.category}`}
            className="hover:text-[#D66B8B] transition-colors capitalize"
          >
            {product.categoryName}
          </Link>
          <span>/</span>
          <span className="text-[#3A3034] font-medium truncate max-w-xs">{product.name}</span>
        </div>

        {/* Main Product Showcase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Left Column: Image Gallery */}
          <div className="lg:col-span-6 space-y-4">
            {/* Active Large Image Display */}
            <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-[#FFF4F7] border border-[#F8D7E3] shadow-xs">
              <Image
                src={product.images[selectedImageIdx] || product.images[0]}
                alt={product.name}
                fill
                priority
                className="object-cover"
              />

              {/* Discount Tag */}
              {discountPercent > 0 && (
                <div className="absolute top-4 left-4 bg-[#D66B8B] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                  Save {discountPercent}%
                </div>
              )}

              {/* Wishlist Button */}
              <button
                type="button"
                onClick={() => toggleWishlist(product)}
                className={`absolute top-4 right-4 p-3 rounded-full backdrop-blur-md transition-all shadow-sm ${
                  isWished
                    ? 'bg-rose-50 text-[#D66B8B]'
                    : 'bg-white/80 text-[#6E6266] hover:text-[#D66B8B] hover:bg-white'
                }`}
                aria-label="Wishlist"
              >
                <Heart className={`w-5 h-5 ${isWished ? 'fill-[#D66B8B]' : ''}`} />
              </button>
            </div>

            {/* Thumbnails Row */}
            {product.images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImageIdx(idx)}
                    className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all shrink-0 bg-[#FFF4F7] ${
                      selectedImageIdx === idx
                        ? 'border-[#D66B8B] ring-2 ring-[#D66B8B]/20 scale-95'
                        : 'border-[#F8D7E3] opacity-70 hover:opacity-100'
                    }`}
                  >
                    <Image src={img} alt={`Thumbnail ${idx}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product Config & Purchase Details */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              {/* Category & Verified Ratings */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs uppercase font-bold text-[#D66B8B] tracking-widest bg-[#FFF4F7] px-3 py-1 rounded-full border border-[#F8D7E3]">
                  {product.categoryName}
                </span>
                <div className="flex items-center gap-1.5 text-amber-500 font-bold text-sm">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-[#3A3034] text-xs">({product.reviewsCount} Verified Reviews)</span>
                </div>
              </div>

              {/* Product Headline */}
              <h1 className="font-serif-luxury text-2xl sm:text-3xl md:text-4xl font-bold text-[#3A3034] leading-tight break-words">
                {product.name}
              </h1>
              <p className="text-sm text-[#D66B8B] font-medium mt-1">{product.tagline}</p>
            </div>

            {/* Live Pricing */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-[#FFF4F7]/60 border border-[#F8D7E3] flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <div className="flex flex-wrap items-baseline gap-2 sm:gap-3">
                <span className="text-2xl sm:text-3xl font-bold text-[#3A3034]">
                  {formatPrice(activePrice)}
                </span>
                {originalPrice > activePrice && (
                  <span className="text-sm sm:text-base text-[#6E6266] line-through">
                    {formatPrice(originalPrice)}
                  </span>
                )}
                {discountPercent > 0 && (
                  <span className="text-[11px] sm:text-xs font-bold text-[#D66B8B] bg-white px-2 sm:px-2.5 py-0.5 rounded-full border border-[#F8D7E3] whitespace-nowrap">
                    Save {formatPrice(originalPrice - activePrice)} ({discountPercent}% OFF)
                  </span>
                )}
              </div>
              <span className="text-[11px] sm:text-xs text-[#6E6266]">Inclusive of all taxes</span>
            </div>

            {/* Variant Selector (20 GM, 30 GM, 100 GM / Packs) */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-2.5 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#3A3034] uppercase tracking-wider">
                    Select Size / Package Option:
                  </span>
                  <span className="text-[#6E6266] font-mono text-[11px]">SKU: {currentSKU}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-2 gap-2.5">
                  {product.variants.map((v) => {
                    const isSelected = selectedVariant?.id === v.id;
                    const vPrice = v.discountPrice ?? v.price;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => {
                          setSelectedVariant(v);
                          setQuantity(1);
                        }}
                        className={`p-3 rounded-2xl border text-left transition-all relative ${
                          isSelected
                            ? 'border-[#D66B8B] bg-[#FFF4F7] ring-1 ring-[#D66B8B] shadow-xs'
                            : 'border-[#F8D7E3] hover:border-[#D66B8B] bg-white'
                        }`}
                      >
                        <div className="font-bold text-xs text-[#3A3034]">{v.name}</div>
                        <div className="flex items-baseline justify-between mt-1">
                          <span className="text-xs font-bold text-[#D66B8B]">
                            {formatPrice(vPrice)}
                          </span>
                          <span className="text-[10px] text-[#6E6266]">
                            {v.stock > 0 ? `${v.stock} in stock` : 'Out of stock'}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Stepper & Stock Status */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#3A3034] uppercase tracking-wider">Quantity:</span>
                <span className={`font-semibold ${currentStock > 0 ? 'text-[#2E7D32]' : 'text-red-500'}`}>
                  {currentStock > 0 ? `✓ In Stock (${currentStock} units available)` : '✕ Currently Out of Stock'}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center border-2 border-[#F8D7E3] rounded-2xl overflow-hidden bg-white">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="px-4 py-3 text-[#3A3034] hover:bg-[#FFF4F7] disabled:opacity-40 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-5 py-2 text-sm font-bold text-[#3A3034] min-w-[36px] text-center">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                    disabled={quantity >= currentStock}
                    className="px-4 py-3 text-[#3A3034] hover:bg-[#FFF4F7] disabled:opacity-40 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <span className="text-xs text-[#6E6266]">
                  Total: <strong>{formatPrice(activePrice * quantity)}</strong>
                </span>
              </div>
            </div>

            {/* Action Buttons: Add to Cart & Buy Now */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={currentStock <= 0}
                className={`py-4 px-6 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xs ${
                  isAdded
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#FFF4F7] text-[#3A3034] border-2 border-[#F8D7E3] hover:bg-[#F8D7E3] active:scale-95 disabled:opacity-40'
                }`}
              >
                <ShoppingBag className="w-4 h-4 text-[#D66B8B]" />
                <span>{isAdded ? 'Added to Bag!' : 'Add to Bag'}</span>
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                disabled={currentStock <= 0}
                className="py-4 px-6 bg-[#D66B8B] hover:bg-[#c25877] text-white rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-pink-soft active:scale-95 transition-all disabled:opacity-40"
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>Buy Now (Instant Checkout)</span>
              </button>
            </div>

            {/* Trust Assurances */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[#F8D7E3]/60 text-center">
              <div className="p-3 bg-[#FFF4F7]/40 rounded-2xl border border-[#F8D7E3]">
                <ShieldCheck className="w-5 h-5 text-[#D66B8B] mx-auto mb-1" />
                <p className="text-[11px] font-bold text-[#3A3034]">100% Genuine</p>
                <p className="text-[9px] text-[#6E6266]">Direct from Khushi</p>
              </div>
              <div className="p-3 bg-[#FFF4F7]/40 rounded-2xl border border-[#F8D7E3]">
                <Truck className="w-5 h-5 text-[#D66B8B] mx-auto mb-1" />
                <p className="text-[11px] font-bold text-[#3A3034]">Free Delivery</p>
                <p className="text-[9px] text-[#6E6266]">Orders above ₹999</p>
              </div>
              <div className="p-3 bg-[#FFF4F7]/40 rounded-2xl border border-[#F8D7E3]">
                <RotateCcw className="w-5 h-5 text-[#D66B8B] mx-auto mb-1" />
                <p className="text-[11px] font-bold text-[#3A3034]">COD Available</p>
                <p className="text-[9px] text-[#6E6266]">Pay on delivery</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed In-Depth Information */}
        <div className="mt-16 pt-10 border-t border-[#F8D7E3]">
          {/* Tab Navigation */}
          <div className="flex items-center gap-4 border-b border-[#F8D7E3] pb-4 overflow-x-auto no-scrollbar">
            {[
              { id: 'overview', label: 'Product Overview & Benefits' },
              { id: 'ingredients', label: '100% Natural Ingredients' },
              { id: 'howToUse', label: 'Step-by-Step Usage Guide' },
              { id: 'reviews', label: `Verified Reviews (${product.reviewsCount})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`text-sm font-bold pb-2 transition-all border-b-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-[#D66B8B] text-[#D66B8B]'
                    : 'border-transparent text-[#6E6266] hover:text-[#3A3034]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content Panels */}
          <div className="py-8">
            {activeTab === 'overview' && (
              <div className="max-w-4xl space-y-6">
                <p className="text-sm text-[#6E6266] leading-relaxed">{product.description}</p>
                <div className="bg-[#FFF4F7]/60 p-6 rounded-3xl border border-[#F8D7E3] space-y-3">
                  <h4 className="font-serif-luxury font-bold text-base text-[#3A3034]">
                    Key Benefits & Action
                  </h4>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-[#3A3034]">
                    {product.benefits.map((b, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#2E7D32] shrink-0 mt-0.5" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'ingredients' && (
              <div className="max-w-4xl space-y-6">
                <p className="text-xs text-[#6E6266]">
                  Every ingredient is selected for maximum skin compatibility, safety, and luminous whitening efficacy:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {product.ingredients.map((ing, i) => (
                    <div
                      key={i}
                      className="p-3.5 bg-white border border-[#F8D7E3] rounded-2xl flex items-center gap-3 shadow-xs"
                    >
                      <Sparkles className="w-4 h-4 text-[#D66B8B] shrink-0" />
                      <span className="text-xs font-semibold text-[#3A3034]">{ing}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'howToUse' && (
              <div className="max-w-4xl space-y-4">
                {product.howToUse.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-white border border-[#F8D7E3] rounded-2xl flex items-start gap-4 shadow-xs"
                  >
                    <div className="w-7 h-7 rounded-full bg-[#FFF4F7] border border-[#F8D7E3] text-[#D66B8B] font-bold text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </div>
                    <p className="text-xs text-[#3A3034] leading-relaxed pt-0.5">{step}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="max-w-4xl space-y-6">
                <div className="bg-[#FFF4F7]/60 p-6 rounded-3xl border border-[#F8D7E3] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-3xl font-bold text-[#3A3034]">{product.rating}</span>
                      <div className="flex text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-[#6E6266] mt-1">
                      Based on {product.reviewsCount} verified customer purchase reviews.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-5 bg-white border border-[#F8D7E3] rounded-2xl shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <span className="text-[10px] text-[#6E6266]">Verified Purchase</span>
                    </div>
                    <h5 className="font-bold text-xs text-[#3A3034] mb-1">
                      Visible glow from day 4 itself!
                    </h5>
                    <p className="text-xs text-[#6E6266] leading-relaxed">
                      &ldquo;I ordered the 100g jar. My skin tone has become remarkably brighter and dark circles have reduced. Genuinely authentic quality.&rdquo;
                    </p>
                    <span className="text-[11px] font-bold text-[#D66B8B] block mt-2">
                      — Manisha S., Pune
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products Showcase */}
        {relatedProducts.length > 0 && (
          <div className="mt-20 pt-10 border-t border-[#F8D7E3]">
            <h2 className="font-serif-luxury text-2xl font-bold text-[#3A3034] mb-8">
              Complete Your Radiance Regimen
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((rel) => (
                <ProductCard key={rel.id} product={rel} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
