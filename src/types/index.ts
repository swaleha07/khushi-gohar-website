export type CategoryType = 'skincare' | 'bodycare' | 'haircare' | 'lipcare' | 'facewash' | 'combos' | 'all';

export interface Category {
  id: string; // 'skincare' | 'combos' | 'bodycare' | 'haircare' | 'lipcare' | 'all'
  name: string;
  subtitle: string;
  description: string;
  badge?: string;
  href: string;
  images: string[];
}

export interface ProductVariant {
  id: string;
  name: string; // e.g. "20 GM", "30 GM", "100 GM" or "1 King Cream", "2 King Cream", "3 King Cream"
  size: string;
  price: number;
  discountPrice?: number;
  stock: number;
  sku: string;
  isActive: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  category: CategoryType;
  categoryName: string;
  images: string[];
  price: number;
  discountPrice?: number;
  baseStock: number;
  sku: string;
  rating: number;
  reviewsCount: number;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isActive: boolean;
  variants: ProductVariant[];
  ingredients: string[];
  howToUse: string[];
  benefits: string[];
  highlights?: string[];
  specifications: Record<string, string>;
}

export interface CartItem {
  id: string; // unique cart line id (productId + variantId)
  productId: string;
  productName: string;
  productSlug: string;
  variantId?: string;
  variantName?: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  image: string;
  stock: number;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  variantName?: string;
  price: number;
  quantity: number;
  total: number;
  image: string;
}

export type OrderStatus =
  | 'PENDING'
  | 'PAYMENT_PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'PAYMENT_FAILED';

export type PaymentStatus =
  | 'PENDING'
  | 'SUCCESS'
  | 'PAID'
  | 'FAILED'
  | 'CANCELLED'
  | 'EXPIRED';

export type PaymentMethod = 'RAZORPAY_UPI' | 'RAZORPAY_CARD' | 'RAZORPAY_NETBANKING' | 'COD';

export interface SavedAddress {
  id: string;
  fullName: string;
  phone: string;
  address: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault?: boolean;
}

export interface AuthUser {
  id: string;
  phone: string;
  countryCode: string;
  nationalNumber: string;
  name?: string;
  createdAt: string;
  savedAddresses: SavedAddress[];
}

export interface ShippingAddress {
  fullName: string;
  email?: string;
  phone: string;
  address: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. KB-10842
  customer: {
    fullName: string;
    email?: string;
    phone: string;
  };
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  shippingFee: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  paymentId?: string;
  gatewayTransactionId?: string;
  paidAt?: string;
  paymentVerificationStatus?: 'VERIFIED' | 'UNVERIFIED' | 'FAILED';
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export interface PaymentIntent {
  paymentId: string;
  orderNumber: string;
  amount: number;
  currency: string;
  customer: {
    fullName: string;
    email?: string;
    phone: string;
  };
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  shippingFee: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  upiUri: string;
  upiId: string;
  merchantName: string;
  qrCodeDataUrl: string;
  gatewayOrderId?: string;
  gatewayTransactionId?: string;
  paidAt?: string;
  createdAt: string;
  expiresAt: string;
}

export interface Offer {
  id: string;
  title: string;
  subtitle: string;
  giftName: string;
  minOrderValue: number;
  bannerImage: string;
  ctaText: string;
  ctaLink: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface Review {
  id: string;
  productId: string;
  author: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  verifiedPurchase: boolean;
  avatar?: string;
}

export interface Customer {
  id: string;
  fullName: string;
  email?: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  totalSpent: number;
  totalOrders: number;
  lastOrderDate?: string;
  createdAt: string;
}

export interface Coupon {
  code: string;
  discountPercent?: number;
  discountAmount?: number;
  minOrderValue: number;
  description: string;
}
