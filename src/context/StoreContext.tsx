'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Order, Offer, OrderStatus, ProductVariant, Category } from '@/types';
import { INITIAL_PRODUCTS, INITIAL_OFFERS, INITIAL_CATEGORIES } from '@/data/initialProducts';

interface StoreContextType {
  products: Product[];
  offers: Offer[];
  orders: Order[];
  categories: Category[];
  activeOffer: Offer | null;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  // Product Actions
  getProductBySlug: (slug: string) => Product | undefined;
  getProductById: (id: string) => Product | undefined;
  updateProduct: (product: Product) => void;
  addProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  updateVariantStock: (productId: string, variantId: string, newStock: number) => void;
  // Category Actions
  getCategoryById: (id: string) => Category | undefined;
  updateCategory: (category: Category) => Promise<void>;
  saveCategories: (categories: Category[]) => Promise<void>;
  // Order Actions
  createOrder: (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  getOrderById: (orderId: string) => Order | undefined;
  getCustomerOrders: (emailOrPhone: string) => Order[];
  refreshOrders: () => Promise<void>;
  // Offer Actions
  updateOffer: (offer: Offer) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const SEED_ORDERS: Order[] = [
  {
    id: 'ord-101',
    orderNumber: 'KG-84920',
    customer: {
      fullName: 'Aarohi Sen',
      email: 'aarohi.sen@gmail.com',
      phone: '+91 98765 43210',
    },
    shippingAddress: {
      fullName: 'Aarohi Sen',
      email: 'aarohi.sen@gmail.com',
      phone: '+91 98765 43210',
      address: 'Flat 402, Lotus Bloom Apartments, Bandra West',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400050',
      country: 'India',
    },
    items: [
      {
        id: 'item-1',
        productId: 'prod-extra-whitening-combo',
        productName: 'Khushi Extra Whitening Combo',
        variantName: 'Complete 3-Step Kit (100ml + 50g + 100ml)',
        price: 1500,
        quantity: 1,
        total: 1500,
        image: '/images/products/extra_whitening_combo.jpg',
      },
    ],
    subtotal: 1500,
    discount: 150,
    couponCode: 'KHUSHI10',
    shippingFee: 0,
    total: 1350,
    paymentMethod: 'RAZORPAY_UPI',
    paymentStatus: 'PAID',
    orderStatus: 'CONFIRMED',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: 'ord-102',
    orderNumber: 'KG-84921',
    customer: {
      fullName: 'Vikram Joshi',
      email: 'vikram.j@outlook.com',
      phone: '+91 91234 56789',
    },
    shippingAddress: {
      fullName: 'Vikram Joshi',
      email: 'vikram.j@outlook.com',
      phone: '+91 91234 56789',
      address: 'House #14, Sector 21-A',
      city: 'Chandigarh',
      state: 'Punjab',
      pincode: '160022',
      country: 'India',
    },
    items: [
      {
        id: 'item-2',
        productId: 'prod-king-night-cream',
        productName: 'The King Night Cream',
        variantName: 'King Night Cream Jumbo Jar (100 GM)',
        price: 2099,
        quantity: 1,
        total: 2099,
        image: '/images/products/king_night_cream_100g.jpg',
      },
    ],
    subtotal: 2099,
    discount: 0,
    shippingFee: 0,
    total: 2099,
    paymentMethod: 'COD',
    paymentStatus: 'PENDING',
    orderStatus: 'PROCESSING',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
  },
];

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [offers, setOffers] = useState<Offer[]>(INITIAL_OFFERS);
  const [orders, setOrders] = useState<Order[]>(SEED_ORDERS);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize from LocalStorage and Server API
  useEffect(() => {
    try {
      const savedProducts = localStorage.getItem('kg_store_products');
      if (savedProducts) {
        const parsed: Product[] = JSON.parse(savedProducts);
        const filtered = parsed.filter((p: Product) => p.id !== 'prod-rose-tinted-lip-butter');
        setProducts(filtered);
      } else {
        setProducts(INITIAL_PRODUCTS);
      }

      const savedCategories = localStorage.getItem('kg_store_categories');
      if (savedCategories) {
        setCategories(JSON.parse(savedCategories));
      }

      const savedOffers = localStorage.getItem('kg_store_offers');
      if (savedOffers) {
        setOffers(JSON.parse(savedOffers));
      }

      const savedOrders = localStorage.getItem('kg_store_orders');
      if (savedOrders) {
        setOrders(JSON.parse(savedOrders));
      }

      // Fetch latest products from server disk
      fetch('/api/products')
        .then((res) => res.json())
        .then((data) => {
          if (data?.success && Array.isArray(data.products) && data.products.length > 0) {
            setProducts(data.products);
            localStorage.setItem('kg_store_products', JSON.stringify(data.products));
          }
        })
        .catch((err) => console.log('Notice: using local product cache', err));

      // Fetch latest categories from server disk
      fetch('/api/categories')
        .then((res) => res.json())
        .then((data) => {
          if (data?.success && Array.isArray(data.categories) && data.categories.length > 0) {
            setCategories(data.categories);
            localStorage.setItem('kg_store_categories', JSON.stringify(data.categories));
          }
        })
        .catch((err) => console.log('Notice: using local category cache', err));

      // Fetch latest orders from server disk
      fetch('/api/orders')
        .then((res) => res.json())
        .then((data) => {
          if (data?.success && Array.isArray(data.orders) && data.orders.length > 0) {
            setOrders(data.orders);
            localStorage.setItem('kg_store_orders', JSON.stringify(data.orders));
          }
        })
        .catch((err) => console.log('Notice: using local orders cache', err));
    } catch (e) {
      console.error('Error loading store state from localStorage:', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Sync to LocalStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem('kg_store_products', JSON.stringify(products));
    } catch (e) {
      console.error('Failed to sync products to storage', e);
    }
  }, [products, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem('kg_store_categories', JSON.stringify(categories));
    } catch (e) {
      console.error('Failed to sync categories to storage', e);
    }
  }, [categories, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem('kg_store_offers', JSON.stringify(offers));
    } catch (e) {
      console.error('Failed to sync offers to storage', e);
    }
  }, [offers, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem('kg_store_orders', JSON.stringify(orders));
    } catch (e) {
      console.error('Failed to sync orders to storage', e);
    }
  }, [orders, isLoaded]);

  const activeOffer = offers.find((o) => o.isActive) || null;

  const getCategoryById = (id: string) => {
    return categories.find((c) => c.id === id);
  };

  const updateCategory = async (updatedCategory: Category) => {
    const updatedCats = categories.map((c) => (c.id === updatedCategory.id ? updatedCategory : c));
    if (!categories.some((c) => c.id === updatedCategory.id)) {
      updatedCats.push(updatedCategory);
    }
    setCategories(updatedCats);

    // Sync products: Ensure every image in updatedCategory.images has a matching product
    const existingInCat = products.filter((p) => p.category === updatedCategory.id);
    const otherProds = products.filter((p) => p.category !== updatedCategory.id);

    const updatedCatProds: Product[] = [];
    const catImages = updatedCategory.images || [];

    catImages.forEach((imgUrl, idx) => {
      if (existingInCat[idx]) {
        // Update existing product with new image & category name
        updatedCatProds.push({
          ...existingInCat[idx],
          categoryName: updatedCategory.name,
          images: [imgUrl, ...(existingInCat[idx].images?.slice(1) || [])],
        });
      } else {
        // Create new product for the added image
        const newId = `prod-${updatedCategory.id}-${Date.now()}-${idx}`;
        const newSlug = `${updatedCategory.id}-product-${Date.now()}-${idx}`;
        updatedCatProds.push({
          id: newId,
          name: `${updatedCategory.name} Formulation #${idx + 1}`,
          slug: newSlug,
          tagline: `Authentic ${updatedCategory.name} Glow & Care`,
          description: `Luxury ${updatedCategory.name} beauty care formulation crafted with active botanical extracts.`,
          category: updatedCategory.id as any,
          categoryName: updatedCategory.name,
          images: [imgUrl],
          price: 499,
          discountPrice: 349,
          baseStock: 50,
          sku: `KG-${updatedCategory.id.toUpperCase().slice(0, 3)}-0${idx + 1}`,
          rating: 4.9,
          reviewsCount: 120,
          isActive: true,
          variants: [
            {
              id: `var-${Date.now()}-${idx}`,
              name: 'Standard Unit',
              size: 'Standard',
              price: 499,
              discountPrice: 349,
              stock: 50,
              sku: `KG-${updatedCategory.id.toUpperCase().slice(0, 3)}-0${idx + 1}-STD`,
              isActive: true,
            },
          ],
          ingredients: ['Natural Botanical Extracts', 'Niacinamide', 'Saffron Dew', 'Vitamin E'],
          howToUse: ['Apply evenly to clean skin and massage gently in circular motions.'],
          benefits: ['Nourishes, protects, and enhances natural radiant glow.'],
          specifications: { 'Category': updatedCategory.name },
        });
      }
    });

    const nextProducts = [...otherProds, ...updatedCatProds];
    setProducts(nextProducts);

    try {
      localStorage.setItem('kg_store_categories', JSON.stringify(updatedCats));
      localStorage.setItem('kg_store_products', JSON.stringify(nextProducts));

      await Promise.all([
        fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ category: updatedCategory }),
        }),
        fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ products: nextProducts }),
        }),
      ]);
    } catch (err) {
      console.error('Failed to persist category and products to server:', err);
    }
  };

  const saveCategories = async (newCategories: Category[]) => {
    setCategories(newCategories);
    try {
      localStorage.setItem('kg_store_categories', JSON.stringify(newCategories));
      await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categories: newCategories }),
      });
    } catch (err) {
      console.error('Failed to persist categories to server:', err);
    }
  };

  const getProductBySlug = (slug: string) => {
    return products.find((p) => p.slug === slug);
  };

  const getProductById = (id: string) => {
    return products.find((p) => p.id === id);
  };

  const updateProduct = async (updated: Product) => {
    const nextProducts = products.map((p) => (p.id === updated.id ? updated : p));
    setProducts(nextProducts);
    try {
      localStorage.setItem('kg_store_products', JSON.stringify(nextProducts));
      await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product: updated }),
      });
    } catch (err) {
      console.error('Failed to persist product:', err);
    }
  };

  const addProduct = async (newProduct: Product) => {
    const nextProducts = [newProduct, ...products];
    setProducts(nextProducts);
    try {
      localStorage.setItem('kg_store_products', JSON.stringify(nextProducts));
      await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: nextProducts }),
      });
    } catch (err) {
      console.error('Failed to persist new product:', err);
    }
  };

  const deleteProduct = async (id: string) => {
    const nextProducts = products.filter((p) => p.id !== id);
    setProducts(nextProducts);
    try {
      localStorage.setItem('kg_store_products', JSON.stringify(nextProducts));
      await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: nextProducts }),
      });
    } catch (err) {
      console.error('Failed to persist product deletion:', err);
    }
  };

  const updateVariantStock = (productId: string, variantId: string, newStock: number) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        const updatedVariants = p.variants.map((v) =>
          v.id === variantId ? { ...v, stock: Math.max(0, newStock) } : v
        );
        return { ...p, variants: updatedVariants };
      })
    );
  };

  const createOrder = (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Order => {
    const newOrder: Order = {
      ...orderData,
      id: `ord-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Deduct stock for ordered items
    setProducts((prev) =>
      prev.map((prod) => {
        const orderItem = newOrder.items.find((item) => item.productId === prod.id);
        if (!orderItem) return prod;

        let updatedVariants = prod.variants;
        if (orderItem.variantName) {
          updatedVariants = prod.variants.map((v) =>
            v.name === orderItem.variantName
              ? { ...v, stock: Math.max(0, v.stock - orderItem.quantity) }
              : v
          );
        }

        const newBaseStock = Math.max(0, prod.baseStock - orderItem.quantity);
        return {
          ...prod,
          baseStock: newBaseStock,
          variants: updatedVariants,
        };
      })
    );

    setOrders((prev) => [newOrder, ...prev]);
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((ord) =>
        ord.id === orderId || ord.orderNumber === orderId
          ? { ...ord, orderStatus: status, updatedAt: new Date().toISOString() }
          : ord
      )
    );
  };

  const getOrderById = (orderId: string) => {
    return orders.find((o) => o.id === orderId || o.orderNumber === orderId);
  };

  const getCustomerOrders = (emailOrPhone: string) => {
    const term = emailOrPhone.trim().toLowerCase();
    return orders.filter(
      (o) =>
        (o.customer.email && o.customer.email.toLowerCase().includes(term)) ||
        (o.customer.phone && o.customer.phone.replace(/\D/g, '').includes(term.replace(/\D/g, '')))
    );
  };

  const refreshOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        if (data?.success && Array.isArray(data.orders)) {
          setOrders(data.orders);
          localStorage.setItem('kg_store_orders', JSON.stringify(data.orders));
        }
      }
    } catch (err) {
      console.error('Failed to refresh orders from server:', err);
    }
  };

  const updateOffer = (offer: Offer) => {
    setOffers((prev) => prev.map((o) => (o.id === offer.id ? offer : o)));
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        offers,
        orders,
        categories,
        activeOffer,
        searchOpen,
        setSearchOpen,
        getProductBySlug,
        getProductById,
        updateProduct,
        addProduct,
        deleteProduct,
        updateVariantStock,
        getCategoryById,
        updateCategory,
        saveCategories,
        createOrder,
        updateOrderStatus,
        getOrderById,
        getCustomerOrders,
        refreshOrders,
        updateOffer,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
