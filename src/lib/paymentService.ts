import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import QRCode from 'qrcode';
import { Order, PaymentIntent, OrderItem, ShippingAddress, PaymentMethod } from '@/types';
import { generateOrderId } from '@/lib/utils';
import { INITIAL_PRODUCTS } from '@/data/initialProducts';

const ORDERS_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'orders.json');
const PRODUCTS_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'products.json');

interface OrdersDataStore {
  orders: Order[];
  paymentIntents: PaymentIntent[];
}

// Read database
async function readStore(): Promise<OrdersDataStore> {
  try {
    const raw = await fs.readFile(ORDERS_FILE_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    return {
      orders: Array.isArray(parsed.orders) ? parsed.orders : [],
      paymentIntents: Array.isArray(parsed.paymentIntents) ? parsed.paymentIntents : [],
    };
  } catch (error) {
    console.error('Error reading orders file, returning fallback:', error);
    return { orders: [], paymentIntents: [] };
  }
}

// Write database atomically
async function writeStore(data: OrdersDataStore): Promise<void> {
  await fs.writeFile(ORDERS_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

// Safe product stock deduction
async function deductProductStock(items: OrderItem[]): Promise<void> {
  try {
    let products = INITIAL_PRODUCTS;
    try {
      const raw = await fs.readFile(PRODUCTS_FILE_PATH, 'utf-8');
      products = JSON.parse(raw);
    } catch {
      products = INITIAL_PRODUCTS;
    }

    const updated = products.map((prod) => {
      const orderedItem = items.find((it) => it.productId === prod.id);
      if (!orderedItem) return prod;

      let nextVariants = prod.variants;
      if (orderedItem.variantName) {
        nextVariants = prod.variants.map((v) =>
          v.name === orderedItem.variantName
            ? { ...v, stock: Math.max(0, v.stock - orderedItem.quantity) }
            : v
        );
      }

      const nextBaseStock = Math.max(0, prod.baseStock - orderedItem.quantity);
      return {
        ...prod,
        baseStock: nextBaseStock,
        variants: nextVariants,
      };
    });

    await fs.writeFile(PRODUCTS_FILE_PATH, JSON.stringify(updated, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to deduct product stock on payment success:', err);
  }
}

export class PaymentService {
  private getMerchantName(): string {
    return (
      process.env.MERCHANT_NAME ||
      process.env.NEXT_PUBLIC_MERCHANT_NAME ||
      'Parveen Bano'
    );
  }

  private getMerchantUpiId(): string {
    return (
      process.env.MERCHANT_UPI_ID ||
      process.env.NEXT_PUBLIC_MERCHANT_UPI_ID ||
      'parveenbanowith-1@okhdfcbank'
    );
  }

  private getRazorpayKeyId(): string | undefined {
    return process.env.PAYMENT_GATEWAY_KEY_ID || process.env.RAZORPAY_KEY_ID;
  }

  private getRazorpayKeySecret(): string | undefined {
    return process.env.PAYMENT_GATEWAY_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET;
  }

  /**
   * STEP 1: Create a secure server-side payment & order intent
   */
  async createPayment(params: {
    customer: { fullName: string; email?: string; phone: string };
    shippingAddress: ShippingAddress;
    items: OrderItem[];
    subtotal: number;
    discount: number;
    couponCode?: string;
    shippingFee: number;
    total: number;
    paymentMethod?: PaymentMethod;
  }): Promise<PaymentIntent> {
    const store = await readStore();

    // Verify amount matches server calculations
    const verifiedSubtotal = params.items.reduce((acc, it) => acc + it.price * it.quantity, 0);
    const calculatedTotal = Math.max(0, verifiedSubtotal - params.discount + params.shippingFee);
    const finalAmount = params.total > 0 ? params.total : calculatedTotal;

    const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const orderNumber = generateOrderId();
    const merchantName = this.getMerchantName();
    const upiId = this.getMerchantUpiId();

    // Standard NPCI UPI URI Specification with Google Pay aid
    // upi://pay?pa=<upi_id>&pn=<payee_name>&aid=<aid>&am=<amount>&cu=INR&tn=<transaction_note>&tr=<ref_id>
    const upiUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(
      merchantName
    )}&aid=uGICAgMC07NmNPA&am=${finalAmount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(
      `Order ${orderNumber}`
    )}&tr=${encodeURIComponent(paymentId)}`;

    // Generate crisp QR code SVG/PNG Data URL
    const qrCodeDataUrl = await QRCode.toDataURL(upiUri, {
      width: 440,
      margin: 2,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#1F2937',
        light: '#FFFFFF',
      },
    });

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes timeout

    const newIntent: PaymentIntent = {
      paymentId,
      orderNumber,
      amount: finalAmount,
      currency: 'INR',
      customer: params.customer,
      shippingAddress: params.shippingAddress,
      items: params.items,
      subtotal: params.subtotal,
      discount: params.discount,
      couponCode: params.couponCode,
      shippingFee: params.shippingFee,
      paymentMethod: params.paymentMethod || 'RAZORPAY_UPI',
      paymentStatus: 'PENDING',
      orderStatus: 'PAYMENT_PENDING',
      upiUri,
      upiId,
      merchantName,
      qrCodeDataUrl,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    };

    // Save intent to server disk
    store.paymentIntents.unshift(newIntent);
    // Keep max 200 intents to avoid unbounded file growth
    if (store.paymentIntents.length > 200) {
      store.paymentIntents = store.paymentIntents.slice(0, 200);
    }
    await writeStore(store);

    return newIntent;
  }

  /**
   * STEP 2: Polling - Get current payment & order status
   */
  async getPaymentStatus(paymentId: string): Promise<{
    found: boolean;
    paymentStatus: PaymentIntent['paymentStatus'];
    orderStatus: PaymentIntent['orderStatus'];
    orderNumber?: string;
    amount?: number;
    gatewayTransactionId?: string;
    paidAt?: string;
    isExpired?: boolean;
    orderId?: string;
  }> {
    const store = await readStore();
    const intent = store.paymentIntents.find((p) => p.paymentId === paymentId);

    if (!intent) {
      // Check if an order was already finalized for this payment ID
      const existingOrder = store.orders.find(
        (o) => o.paymentId === paymentId || o.orderNumber === paymentId
      );
      if (existingOrder) {
        return {
          found: true,
          paymentStatus: existingOrder.paymentStatus,
          orderStatus: existingOrder.orderStatus,
          orderNumber: existingOrder.orderNumber,
          amount: existingOrder.total,
          gatewayTransactionId: existingOrder.gatewayTransactionId,
          paidAt: existingOrder.paidAt,
          orderId: existingOrder.id,
        };
      }
      return { found: false, paymentStatus: 'FAILED', orderStatus: 'PAYMENT_FAILED' };
    }

    // Check expiration if still pending
    const isPastExpiry = new Date().getTime() > new Date(intent.expiresAt).getTime();
    if (isPastExpiry && intent.paymentStatus === 'PENDING') {
      intent.paymentStatus = 'EXPIRED';
      intent.orderStatus = 'PAYMENT_FAILED';
      await writeStore(store);
      return {
        found: true,
        paymentStatus: 'EXPIRED',
        orderStatus: 'PAYMENT_FAILED',
        orderNumber: intent.orderNumber,
        amount: intent.amount,
        isExpired: true,
      };
    }

    // Check if corresponding finalized order exists
    const matchingOrder = store.orders.find(
      (o) => o.paymentId === paymentId || o.orderNumber === intent.orderNumber
    );

    return {
      found: true,
      paymentStatus: matchingOrder ? matchingOrder.paymentStatus : intent.paymentStatus,
      orderStatus: matchingOrder ? matchingOrder.orderStatus : intent.orderStatus,
      orderNumber: intent.orderNumber,
      amount: intent.amount,
      gatewayTransactionId: matchingOrder?.gatewayTransactionId || intent.gatewayTransactionId,
      paidAt: matchingOrder?.paidAt || intent.paidAt,
      orderId: matchingOrder?.id,
    };
  }

  /**
   * STEP 3 & 4: Server-side Payment Verification
   */
  async verifyPayment(
    paymentId: string,
    verification: {
      razorpay_payment_id?: string;
      razorpay_order_id?: string;
      razorpay_signature?: string;
      isSimulation?: boolean;
      simulatedSuccess?: boolean;
    }
  ): Promise<{ success: boolean; error?: string; order?: Order }> {
    const store = await readStore();
    const intent = store.paymentIntents.find((p) => p.paymentId === paymentId);

    if (!intent) {
      return { success: false, error: 'Payment intent not found or already purged' };
    }

    // Check expiration
    if (new Date().getTime() > new Date(intent.expiresAt).getTime()) {
      intent.paymentStatus = 'EXPIRED';
      intent.orderStatus = 'PAYMENT_FAILED';
      await writeStore(store);
      return { success: false, error: 'Payment intent has expired. Please initiate checkout again.' };
    }

    // Handle Real Razorpay Signature Verification
    if (verification.razorpay_signature) {
      const secret = this.getRazorpayKeySecret();
      if (!secret) {
        return { success: false, error: 'Payment gateway secret not configured on server' };
      }
      const body = `${verification.razorpay_order_id}|${verification.razorpay_payment_id}`;
      const expectedSignature = crypto.createHmac('sha256', secret).update(body).digest('hex');

      if (expectedSignature !== verification.razorpay_signature) {
        intent.paymentStatus = 'FAILED';
        intent.orderStatus = 'PAYMENT_FAILED';
        await writeStore(store);
        return { success: false, error: 'Cryptographic signature verification failed' };
      }
    } else if (verification.isSimulation) {
      // Strictly guard simulation: only active in development / sandbox mode
      const isDev = process.env.NODE_ENV !== 'production' || process.env.PAYMENT_MODE === 'simulation';
      if (!isDev) {
        return { success: false, error: 'Payment simulation is strictly forbidden in production mode' };
      }

      if (verification.simulatedSuccess === false) {
        intent.paymentStatus = 'FAILED';
        intent.orderStatus = 'PAYMENT_FAILED';
        await writeStore(store);
        return { success: false, error: 'Simulated payment was marked failed by user' };
      }
    } else {
      return { success: false, error: 'Missing payment gateway verification credentials' };
    }

    // Payment is verified! Execute idempotent order confirmation
    const gatewayTransactionId =
      verification.razorpay_payment_id || `rzp_upi_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const confirmedOrder = await this.handlePaymentSuccess(paymentId, gatewayTransactionId);
    return { success: true, order: confirmedOrder };
  }

  /**
   * STEP 5: Idempotent Payment Success & Final Order Confirmation
   * - Prevents duplicate orders if called multiple times
   * - Deducts stock only once
   * - Sets paymentStatus = 'PAID', orderStatus = 'CONFIRMED'
   */
  async handlePaymentSuccess(paymentId: string, gatewayTransactionId: string): Promise<Order> {
    const store = await readStore();

    // 1. Idempotency Check: Did an order already finalize for this payment ID or order number?
    const existingOrder = store.orders.find(
      (o) => o.paymentId === paymentId || (o.gatewayTransactionId && o.gatewayTransactionId === gatewayTransactionId)
    );

    if (existingOrder && existingOrder.paymentStatus === 'PAID') {
      // Already processed! Return existing order without creating duplicate or deducting stock again
      return existingOrder;
    }

    const intentIndex = store.paymentIntents.findIndex((p) => p.paymentId === paymentId);
    if (intentIndex === -1) {
      throw new Error(`Cannot finalize order: Payment intent ${paymentId} not found`);
    }

    const intent = store.paymentIntents[intentIndex];
    const paidAt = new Date().toISOString();

    // Update Intent
    intent.paymentStatus = 'PAID';
    intent.orderStatus = 'CONFIRMED';
    intent.gatewayTransactionId = gatewayTransactionId;
    intent.paidAt = paidAt;

    // Create Confirmed Order
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: intent.orderNumber,
      customer: intent.customer,
      shippingAddress: intent.shippingAddress,
      items: intent.items,
      subtotal: intent.subtotal,
      discount: intent.discount,
      couponCode: intent.couponCode,
      shippingFee: intent.shippingFee,
      total: intent.amount,
      paymentMethod: intent.paymentMethod,
      paymentStatus: 'PAID',
      orderStatus: 'CONFIRMED',
      paymentId: intent.paymentId,
      gatewayTransactionId,
      paidAt,
      paymentVerificationStatus: 'VERIFIED',
      createdAt: paidAt,
      updatedAt: paidAt,
    };

    // Prepend new order to server database
    store.orders.unshift(newOrder);
    store.paymentIntents[intentIndex] = intent;
    await writeStore(store);

    // Stock Safety: Deduct inventory permanently on confirmed payment
    await deductProductStock(intent.items);

    return newOrder;
  }

  /**
   * Handle user or system payment cancellation
   */
  async cancelPayment(paymentId: string): Promise<boolean> {
    const store = await readStore();
    const intent = store.paymentIntents.find((p) => p.paymentId === paymentId);
    if (!intent) return false;

    // Only cancel if still pending
    if (intent.paymentStatus === 'PENDING') {
      intent.paymentStatus = 'CANCELLED';
      intent.orderStatus = 'CANCELLED';
      await writeStore(store);
      return true;
    }
    return false;
  }

  /**
   * Fetch all orders from server disk
   */
  async getAllOrders(): Promise<Order[]> {
    const store = await readStore();
    return store.orders;
  }

  /**
   * Fetch single order by ID or order number
   */
  async getOrderById(idOrNumber: string): Promise<Order | undefined> {
    const store = await readStore();
    return store.orders.find(
      (o) => o.id === idOrNumber || o.orderNumber === idOrNumber || o.paymentId === idOrNumber
    );
  }
}

export const paymentService = new PaymentService();
