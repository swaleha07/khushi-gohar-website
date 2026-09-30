'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Heart, ShoppingBag, Star, Check, Sparkles, Zap } from 'lucide-react';
import { Product, ProductVariant } from '@/types';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { formatPrice } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const router = useRouter();
  const { addItem, setDirectCheckoutItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  // Selected variant state on card (defaults to first variant)
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(
    product.variants && product.variants.length > 0 ? product.variants[0] : undefined
  );
  const [isAdded, setIsAdded] = useState(false);

  const activePrice = selectedVariant
    ? (selectedVariant.discountPrice ?? selectedVariant.price)
    : (product.discountPrice ?? product.price);

  const originalPrice = selectedVariant ? selectedVariant.price : product.price;

  const discountPercent =
    originalPrice > activePrice
      ? Math.round(((originalPrice - activePrice) / originalPrice) * 100)
      : 0;

  const inStock = selectedVariant ? selectedVariant.stock > 0 : product.baseStock > 0;
  const isWished = isInWishlist(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!inStock) return;

    addItem(product, selectedVariant, 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1800);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!inStock) return;

    const checkoutLine = {
      id: selectedVariant ? `${product.id}_${selectedVariant.id}` : product.id,
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      variantId: selectedVariant?.id,
      variantName: selectedVariant?.name,
      price: activePrice,
      originalPrice,
      quantity: 1,
      image: product.images[0] || '/images/products/extra_whitening_combo.jpg',
      stock: selectedVariant ? selectedVariant.stock : product.baseStock,
    };

    setDirectCheckoutItem(checkoutLine);
    router.push('/checkout');
  };

  return (
    <div className="group relative bg-white rounded-3xl border border-[#F8D7E3] hover:border-[#D66B8B] p-4 flex flex-col justify-between transition-all duration-300 shadow-xs hover:shadow-pink-card">
      {/* Top Badges & Wishlist */}
      <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-[#FFF4F7] mb-3.5">
        <Link href={`/products/${product.slug}`} className="block w-full h-full relative">
          <Image
            src={product.images[0] || '/images/products/extra_whitening_combo.jpg'}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </Link>

        {/* Badges container */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10 pointer-events-none">
          {discountPercent > 0 && (
            <span className="bg-[#D66B8B] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
              {discountPercent}% OFF
            </span>
          )}
          {product.isBestSeller && (
            <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
              Best Seller
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product);
          }}
          className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md transition-all z-10 ${
            isWished
              ? 'bg-rose-50 text-[#D66B8B] shadow-sm'
              : 'bg-white/80 text-[#6E6266] hover:text-[#D66B8B] hover:bg-white'
          }`}
          aria-label="Toggle Wishlist"
        >
          <Heart className={`w-4 h-4 ${isWished ? 'fill-[#D66B8B]' : ''}`} />
        </button>

        {!inStock && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center">
            <span className="bg-[#3A3034] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Product Information */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Ratings */}
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-[10px] uppercase font-bold text-[#D66B8B] tracking-wider">
              {product.categoryName}
            </span>
            <div className="flex items-center gap-1 text-amber-500 font-bold text-[11px]">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{product.rating}</span>
              <span className="text-[#6E6266] font-normal">({product.reviewsCount})</span>
            </div>
          </div>

          {/* Product Title */}
          <Link href={`/products/${product.slug}`} className="block">
            <h3 className="font-serif-luxury font-bold text-base text-[#3A3034] group-hover:text-[#D66B8B] transition-colors leading-snug line-clamp-1">
              {product.name}
            </h3>
          </Link>
          <p className="text-xs text-[#6E6266] mt-0.5 line-clamp-1">{product.tagline}</p>

          {/* Variant Selector Pills (if multiple variants exist) */}
          {product.variants && product.variants.length > 1 && (
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {product.variants.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedVariant(v);
                  }}
                  className={`text-[10px] px-2 py-1 rounded-lg font-medium border transition-all ${
                    selectedVariant?.id === v.id
                      ? 'border-[#D66B8B] bg-[#FFF4F7] text-[#D66B8B] font-bold shadow-xs'
                      : 'border-[#F8D7E3] text-[#6E6266] hover:bg-[#FFF4F7]'
                  }`}
                >
                  {v.size || v.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Pricing & Add To Cart Actions */}
        <div className="mt-4 pt-3 border-t border-[#F8D7E3]/60">
          <div className="flex items-baseline justify-between mb-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-bold text-[#3A3034]">
                {formatPrice(activePrice)}
              </span>
              {originalPrice > activePrice && (
                <span className="text-xs text-[#6E6266] line-through">
                  {formatPrice(originalPrice)}
                </span>
              )}
            </div>
            {selectedVariant && (
              <span className="text-[10px] font-semibold text-emerald-700">
                {selectedVariant.stock < 10 && selectedVariant.stock > 0
                  ? `Only ${selectedVariant.stock} left!`
                  : 'In Stock'}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!inStock}
              className={`py-2 px-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-xs ${
                isAdded
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#FFF4F7] text-[#3A3034] border border-[#F8D7E3] hover:bg-[#F8D7E3] active:scale-95 disabled:opacity-40'
              }`}
            >
              {isAdded ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Added</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5 text-[#D66B8B]" />
                  <span>Add</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleBuyNow}
              disabled={!inStock}
              className="py-2 px-2.5 bg-[#D66B8B] hover:bg-[#c25877] text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1 shadow-pink-soft active:scale-95 transition-all disabled:opacity-40"
            >
              <Zap className="w-3 h-3 fill-white" />
              <span>Buy Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
