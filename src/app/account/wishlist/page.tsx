'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';

export default function WishlistPage() {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addItem } = useCart();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF4F7]/40 via-white to-white py-10 md:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Back */}
        <div className="mb-6">
          <Link
            href="/account"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#D66B8B] hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to My Account</span>
          </Link>
        </div>

        <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#F8D7E3]">
          <div>
            <h1 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#3A3034]">
              Saved Wishlist ({wishlist.length})
            </h1>
            <p className="text-xs text-[#6E6266] mt-1">
              Your hand-picked beauty selections ready to move to bag anytime.
            </p>
          </div>
          <Link
            href="/shop"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-[#D66B8B] hover:underline"
          >
            <span>Explore More Products</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {wishlist.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-[#F8D7E3] p-8 max-w-md mx-auto shadow-xs">
            <div className="w-16 h-16 rounded-full bg-[#FFF4F7] border border-[#F8D7E3] flex items-center justify-center mx-auto mb-4 text-[#D66B8B]">
              <Heart className="w-8 h-8" />
            </div>
            <h3 className="font-serif-luxury text-xl font-bold text-[#3A3034]">
              Your wishlist is empty
            </h3>
            <p className="text-xs text-[#6E6266] mt-2 mb-6">
              Save your favorite whitening creams and sets while browsing our store.
            </p>
            <Link
              href="/shop"
              className="px-6 py-2.5 bg-[#D66B8B] text-white rounded-full text-xs font-bold uppercase tracking-wider shadow-pink-soft"
            >
              Browse Catalog
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlist.map((product) => {
              const activePrice = product.discountPrice || product.price;
              return (
                <div
                  key={product.id}
                  className="bg-white rounded-3xl border border-[#F8D7E3] hover:border-[#D66B8B] p-4 flex flex-col justify-between shadow-xs hover:shadow-pink-card transition-all"
                >
                  <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-[#FFF4F7] mb-3">
                    <Link href={`/products/${product.slug}`}>
                      <Image
                        src={product.images[0] || '/images/products/extra_whitening_combo.jpg'}
                        alt={product.name}
                        fill
                        className="object-cover hover:scale-105 transition-transform"
                      />
                    </Link>
                    <button
                      type="button"
                      onClick={() => removeFromWishlist(product.id)}
                      className="absolute top-2.5 right-2.5 p-2 bg-white/80 rounded-full text-[#6E6266] hover:text-red-500 hover:bg-white transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#D66B8B]">
                        {product.categoryName}
                      </span>
                      <Link href={`/products/${product.slug}`}>
                        <h4 className="font-serif-luxury font-bold text-sm text-[#3A3034] hover:text-[#D66B8B] transition-colors truncate mt-0.5">
                          {product.name}
                        </h4>
                      </Link>
                      <p className="text-xs text-[#6E6266] truncate">{product.tagline}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#F8D7E3]/60 flex items-center justify-between">
                      <span className="text-sm font-bold text-[#3A3034]">
                        {formatPrice(activePrice)}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          addItem(product);
                          removeFromWishlist(product.id);
                        }}
                        className="px-3.5 py-1.5 bg-[#D66B8B] hover:bg-[#c25877] text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-pink-soft transition-all"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Move to Bag</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
