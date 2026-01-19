// Mock data for orders
import type { Asset } from "./collections";

export interface OrderLine {
  id: string;
  unitPriceWithTax: number;
  quantity: number;
  linePriceWithTax: number;
  productVariant: {
    id: string;
    name: string;
    sku?: string;
  };
  featuredAsset: Asset | null;
}

export interface OrderAddress {
  fullName?: string;
  streetLine1?: string;
  streetLine2?: string;
  city?: string;
  postalCode?: string;
  country?: string;
}

export interface OrderCustomer {
  id: string;
  firstName: string;
  lastName: string;
  emailAddress: string;
}

export interface Discount {
  description: string;
  amountWithTax: number;
}

export interface Order {
  id: string;
  code: string;
  state: string;
  couponCodes: string[];
  totalQuantity: number;
  subTotal: number;
  shippingWithTax: number;
  totalWithTax: number;
  currencyCode: string;
  orderPlacedAt?: string;
  customer?: OrderCustomer;
  shippingAddress?: OrderAddress;
  billingAddress?: OrderAddress;
  discounts: Discount[];
  lines: OrderLine[];
  payments: { method: string }[];
  shippingLines: { shippingMethod: { name: string } }[];
  taxSummary: { description: string; taxTotal: number }[];
}

// In-memory order storage
const orders: Map<string, Order> = new Map();
const activeOrders: Map<string, string> = new Map(); // sessionToken -> orderId

// Generate order code
function generateOrderCode(): string {
  return `ORD-${Date.now().toString(36).toUpperCase()}`;
}

// Generate order ID
function generateOrderId(): string {
  return `order-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
}

// Create empty order
function createEmptyOrder(): Order {
  const id = generateOrderId();
  const code = generateOrderCode();

  return {
    id,
    code,
    state: "AddingItems",
    couponCodes: [],
    totalQuantity: 0,
    subTotal: 0,
    shippingWithTax: 0,
    totalWithTax: 0,
    currencyCode: "USD",
    discounts: [],
    lines: [],
    payments: [],
    shippingLines: [],
    taxSummary: [],
  };
}

// Recalculate order totals
function recalculateOrder(order: Order): void {
  order.totalQuantity = order.lines.reduce((sum, line) => sum + line.quantity, 0);
  order.subTotal = order.lines.reduce((sum, line) => sum + line.linePriceWithTax, 0);

  // Apply discounts
  const discountTotal = order.discounts.reduce((sum, d) => sum + d.amountWithTax, 0);

  order.totalWithTax = order.subTotal + order.shippingWithTax - discountTotal;
}

// Get or create active order
export function getActiveOrder(sessionToken: string): Order {
  let orderId = activeOrders.get(sessionToken);

  if (!orderId || !orders.has(orderId)) {
    const newOrder = createEmptyOrder();
    orders.set(newOrder.id, newOrder);
    activeOrders.set(sessionToken, newOrder.id);
    orderId = newOrder.id;
  }

  return orders.get(orderId)!;
}

// Get order by code
export function getOrderByCode(code: string): Order | null {
  for (const order of orders.values()) {
    if (order.code === code) {
      return order;
    }
  }
  return null;
}

// Get order history for customer
export function getOrderHistory(
  _customerToken: string,
  options?: { take?: number; skip?: number }
): { items: Order[]; totalItems: number } {
  // In mock, return all non-AddingItems orders
  const completedOrders = Array.from(orders.values()).filter(
    (o) => o.state !== "AddingItems"
  );

  const skip = options?.skip || 0;
  const take = options?.take || 10;

  return {
    items: completedOrders.slice(skip, skip + take),
    totalItems: completedOrders.length,
  };
}

// Add item to order
export function addItemToOrder(
  sessionToken: string,
  variantId: string,
  quantity: number,
  variantInfo: { name: string; sku: string; price: number; asset?: Asset }
):
  | { success: true; order: Order }
  | { success: false; errorCode: string; message: string; order?: Order } {
  const order = getActiveOrder(sessionToken);

  // Check if variant already in order
  const existingLine = order.lines.find(
    (l) => l.productVariant.id === variantId
  );

  if (existingLine) {
    existingLine.quantity += quantity;
    existingLine.linePriceWithTax =
      existingLine.unitPriceWithTax * existingLine.quantity;
  } else {
    const newLine: OrderLine = {
      id: `line-${Date.now()}`,
      unitPriceWithTax: variantInfo.price,
      quantity,
      linePriceWithTax: variantInfo.price * quantity,
      productVariant: {
        id: variantId,
        name: variantInfo.name,
        sku: variantInfo.sku,
      },
      featuredAsset: variantInfo.asset || null,
    };
    order.lines.push(newLine);
  }

  recalculateOrder(order);

  return { success: true, order };
}

// Remove item from order
export function removeItemFromOrder(
  sessionToken: string,
  orderLineId: string
):
  | { success: true; order: Order }
  | { success: false; errorCode: string; message: string } {
  const order = getActiveOrder(sessionToken);

  const lineIndex = order.lines.findIndex((l) => l.id === orderLineId);
  if (lineIndex === -1) {
    return {
      success: false,
      errorCode: "ORDER_LINE_NOT_FOUND",
      message: "Order line not found",
    };
  }

  order.lines.splice(lineIndex, 1);
  recalculateOrder(order);

  return { success: true, order };
}

// Adjust order line quantity
export function adjustOrderLine(
  sessionToken: string,
  orderLineId: string,
  quantity: number
):
  | { success: true; order: Order }
  | { success: false; errorCode: string; message: string } {
  const order = getActiveOrder(sessionToken);

  const line = order.lines.find((l) => l.id === orderLineId);
  if (!line) {
    return {
      success: false,
      errorCode: "ORDER_LINE_NOT_FOUND",
      message: "Order line not found",
    };
  }

  if (quantity <= 0) {
    return removeItemFromOrder(sessionToken, orderLineId);
  }

  line.quantity = quantity;
  line.linePriceWithTax = line.unitPriceWithTax * quantity;
  recalculateOrder(order);

  return { success: true, order };
}

// Apply coupon code
export function applyCouponCode(
  sessionToken: string,
  couponCode: string
):
  | { success: true; order: Order }
  | { success: false; errorCode: string; message: string } {
  const order = getActiveOrder(sessionToken);

  // Mock coupon codes
  const validCoupons: Record<string, number> = {
    SAVE10: 1000, // $10 off
    SAVE20: 2000, // $20 off
    WELCOME: 500, // $5 off
  };

  const discount = validCoupons[couponCode.toUpperCase()];
  if (!discount) {
    return {
      success: false,
      errorCode: "COUPON_CODE_INVALID_ERROR",
      message: "Invalid coupon code",
    };
  }

  if (order.couponCodes.includes(couponCode.toUpperCase())) {
    return {
      success: false,
      errorCode: "COUPON_CODE_ALREADY_APPLIED_ERROR",
      message: "Coupon code already applied",
    };
  }

  order.couponCodes.push(couponCode.toUpperCase());
  order.discounts.push({
    description: `Coupon: ${couponCode.toUpperCase()}`,
    amountWithTax: discount,
  });
  recalculateOrder(order);

  return { success: true, order };
}

// Remove coupon code
export function removeCouponCode(
  sessionToken: string,
  couponCode: string
): { success: true; order: Order } {
  const order = getActiveOrder(sessionToken);

  const codeIndex = order.couponCodes.indexOf(couponCode.toUpperCase());
  if (codeIndex !== -1) {
    order.couponCodes.splice(codeIndex, 1);
    order.discounts = order.discounts.filter(
      (d) => !d.description.includes(couponCode.toUpperCase())
    );
    recalculateOrder(order);
  }

  return { success: true, order };
}

// Set customer for order
export function setCustomerForOrder(
  sessionToken: string,
  input: { emailAddress: string; firstName: string; lastName: string }
):
  | { success: true; order: Order }
  | { success: false; errorCode: string; message: string } {
  const order = getActiveOrder(sessionToken);

  order.customer = {
    id: `guest-${Date.now()}`,
    firstName: input.firstName,
    lastName: input.lastName,
    emailAddress: input.emailAddress,
  };

  return { success: true, order };
}

// Set shipping address
export function setOrderShippingAddress(
  sessionToken: string,
  input: {
    fullName?: string;
    streetLine1: string;
    streetLine2?: string;
    city?: string;
    postalCode?: string;
    countryCode: string;
  }
):
  | { success: true; order: Order }
  | { success: false; errorCode: string; message: string } {
  const order = getActiveOrder(sessionToken);

  // Mock shipping calculation based on country
  const shippingRates: Record<string, number> = {
    US: 999, // $9.99
    CA: 1499, // $14.99
    GB: 1999, // $19.99
    DEFAULT: 2499, // $24.99
  };

  order.shippingAddress = {
    fullName: input.fullName,
    streetLine1: input.streetLine1,
    streetLine2: input.streetLine2,
    city: input.city,
    postalCode: input.postalCode,
    country: input.countryCode,
  };

  order.shippingWithTax = shippingRates[input.countryCode] || shippingRates.DEFAULT;
  recalculateOrder(order);

  return { success: true, order };
}

// Set shipping method
export function setShippingMethod(
  sessionToken: string,
  shippingMethodId: string
):
  | { success: true; order: Order }
  | { success: false; errorCode: string; message: string } {
  const order = getActiveOrder(sessionToken);

  // Mock shipping methods
  const methods: Record<string, { name: string; price: number }> = {
    "ship-1": { name: "Standard Shipping", price: 999 },
    "ship-2": { name: "Express Shipping", price: 1999 },
    "ship-3": { name: "Overnight Shipping", price: 2999 },
  };

  const method = methods[shippingMethodId];
  if (!method) {
    return {
      success: false,
      errorCode: "INVALID_SHIPPING_METHOD",
      message: "Invalid shipping method",
    };
  }

  order.shippingWithTax = method.price;
  order.shippingLines = [{ shippingMethod: { name: method.name } }];
  recalculateOrder(order);

  return { success: true, order };
}

// Transition order state
export function transitionToState(
  sessionToken: string,
  state: string
):
  | { success: true; order: Order }
  | {
      success: false;
      errorCode: string;
      message: string;
      transitionError?: string;
      fromState?: string;
      toState?: string;
    } {
  const order = getActiveOrder(sessionToken);

  const validTransitions: Record<string, string[]> = {
    AddingItems: ["ArrangingPayment"],
    ArrangingPayment: ["PaymentAuthorized", "PaymentSettled"],
    PaymentAuthorized: ["PaymentSettled", "Cancelled"],
    PaymentSettled: ["Shipped", "Cancelled"],
    Shipped: ["Delivered"],
    Delivered: [],
    Cancelled: [],
  };

  const allowedStates = validTransitions[order.state];
  if (!allowedStates || !allowedStates.includes(state)) {
    return {
      success: false,
      errorCode: "ORDER_STATE_TRANSITION_ERROR",
      message: `Cannot transition from ${order.state} to ${state}`,
      transitionError: "Invalid state transition",
      fromState: order.state,
      toState: state,
    };
  }

  order.state = state;

  if (state === "PaymentSettled") {
    order.orderPlacedAt = new Date().toISOString();
  }

  return { success: true, order };
}

// Add payment to order
export function addPaymentToOrder(
  sessionToken: string,
  input: { method: string; metadata?: Record<string, unknown> }
):
  | { success: true; order: Order }
  | { success: false; errorCode: string; message: string } {
  const order = getActiveOrder(sessionToken);

  order.payments.push({ method: input.method });

  // Simulate payment success
  if (input.metadata?.shouldDecline) {
    return {
      success: false,
      errorCode: "PAYMENT_DECLINED_ERROR",
      message: "Payment was declined",
    };
  }

  if (input.metadata?.shouldError) {
    return {
      success: false,
      errorCode: "PAYMENT_FAILED_ERROR",
      message: "Payment failed",
    };
  }

  // Auto-transition to PaymentSettled
  order.state = "PaymentSettled";
  order.orderPlacedAt = new Date().toISOString();

  // Clear active order so next request creates new order
  activeOrders.delete(sessionToken);

  return { success: true, order };
}

// Set order custom fields
export function setOrderCustomFields(
  sessionToken: string,
  _input: { customFields: Record<string, unknown> }
): { success: true; order: Order } {
  const order = getActiveOrder(sessionToken);
  // In mock, we don't actually store custom fields
  return { success: true, order };
}
