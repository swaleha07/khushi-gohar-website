'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, ProductVariant, CartItem, Coupon } from '@/types';
import { INITIAL_COUPONS } from '@/data/initialProducts';

interface CartContextType {
  items: CartItem[];
  cartCount: number;
  subtotal: number;
  discount: number;
  shippingFee: number;
  grandTotal: number;
  appliedCoupon: Coupon | null;
  couponError: string | null;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
  addItem: (product: Product, variant?: ProductVariant, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  directCheckoutItem: CartItem | null;
  setDirectCheckoutItem: (item: CartItem | null) => void;
  freeShippingThreshold: number;
  amountNeededForFreeShipping: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [directCheckoutItem, setDirectCheckoutItem] = useState<CartItem | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const freeShippingThreshold = 999;

  // Load from localStorage
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('kg_shopping_cart');
      if (savedCart) {
        setItems(JSON.parse(savedCart));
      }
      const savedCoupon = localStorage.getItem('kg_applied_coupon');
      if (savedCoupon) {
        setAppliedCoupon(JSON.parse(savedCoupon));
      }
    } catch (e) {
      console.error('Failed to load cart from storage', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem('kg_shopping_cart', JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save cart to storage', e);
    }
  }, [items, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      if (appliedCoupon) {
        localStorage.setItem('kg_applied_coupon', JSON.stringify(appliedCoupon));
      } else {
        localStorage.removeItem('kg_applied_coupon');
      }
    } catch (e) {
      console.error('Failed to save coupon to storage', e);
    }
  }, [appliedCoupon, isLoaded]);

  const addItem = (product: Product, variant?: ProductVariant, quantity: number = 1) => {
    const selectedVariant = variant || (product.variants && product.variants.length > 0 ? product.variants[0] : undefined);
    const lineId = selectedVariant ? `${product.id}_${selectedVariant.id}` : product.id;
    const price = selectedVariant?.discountPrice ?? selectedVariant?.price ?? product.discountPrice ?? product.price;
    const originalPrice = selectedVariant?.price ?? product.price;
    const availableStock = selectedVariant?.stock ?? product.baseStock;

    setItems((prev) => {
      const existing = prev.find((item) => item.id === lineId);
      if (existing) {
        const updatedQty = Math.min(availableStock, existing.quantity + quantity);
        return prev.map((item) =>
          item.id === lineId ? { ...item, quantity: updatedQty } : item
        );
      } else {
        const newItem: CartItem = {
          id: lineId,
          productId: product.id,
          productName: product.name,
          productSlug: product.slug,
          variantId: selectedVariant?.id,
          variantName: selectedVariant?.name,
          price,
          originalPrice,
          quantity: Math.min(availableStock, quantity),
          image: product.images[0] || '/images/products/extra_whitening_combo.jpg',
          stock: availableStock,
        };
        return [...prev, newItem];
      }
    });

    setIsDrawerOpen(true);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const validQty = Math.min(item.stock, quantity);
          return { ...item, quantity: validQty };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
    setDirectCheckoutItem(null);
  };

  const applyCoupon = (code: string): boolean => {
    setCouponError(null);
    const cleanCode = code.trim().toUpperCase();
    const found = INITIAL_COUPONS.find((c) => c.code === cleanCode);

    if (!found) {
      setCouponError('Invalid coupon code. Try KHUSHI10 or GLOW200');
      return false;
    }

    if (subtotal < found.minOrderValue) {
      setCouponError(`Minimum order value of ₹${found.minOrderValue} required for this coupon`);
      return false;
    }

    setAppliedCoupon(found);
    return true;
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponError(null);
  };

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  let discount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountPercent) {
      discount = Math.round((subtotal * appliedCoupon.discountPercent) / 100);
    } else if (appliedCoupon.discountAmount) {
      discount = appliedCoupon.discountAmount;
    }
  }

  const shippingFee = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 99;
  const grandTotal = Math.max(0, subtotal - discount + shippingFee);
  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  return (
    <CartContext.Provider
      value={{
        items,
        cartCount,
        subtotal,
        discount,
        shippingFee,
        grandTotal,
        appliedCoupon,
        couponError,
        isDrawerOpen,
        setIsDrawerOpen,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        applyCoupon,
        removeCoupon,
        directCheckoutItem,
        setDirectCheckoutItem,
        freeShippingThreshold,
        amountNeededForFreeShipping,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
