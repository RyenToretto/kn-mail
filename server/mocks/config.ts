// Mock data for configuration (shipping methods, payment methods, countries)

export interface ShippingMethod {
  id: string;
  name: string;
  price: number;
  description: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  code: string;
  isEligible: boolean;
}

export interface Country {
  id: string;
  code: string;
  name: string;
}

export interface ShippingZone {
  id: string;
  name: string;
  members: Country[];
}

export interface Channel {
  defaultShippingZone: ShippingZone;
}

// Mock shipping methods
export const mockShippingMethods: ShippingMethod[] = [
  {
    id: "ship-1",
    name: "Standard Shipping",
    price: 999, // $9.99
    description: "Delivery in 5-7 business days",
  },
  {
    id: "ship-2",
    name: "Express Shipping",
    price: 1999, // $19.99
    description: "Delivery in 2-3 business days",
  },
  {
    id: "ship-3",
    name: "Overnight Shipping",
    price: 2999, // $29.99
    description: "Next business day delivery",
  },
];

// Mock payment methods
export const mockPaymentMethods: PaymentMethod[] = [
  {
    id: "pay-1",
    name: "Credit Card",
    code: "credit-card",
    isEligible: true,
  },
  {
    id: "pay-2",
    name: "PayPal",
    code: "paypal",
    isEligible: true,
  },
  {
    id: "pay-3",
    name: "Stripe",
    code: "stripe",
    isEligible: true,
  },
  {
    id: "pay-4",
    name: "Bank Transfer",
    code: "bank-transfer",
    isEligible: false, // Not available for this order
  },
];

// Mock countries
export const mockCountries: Country[] = [
  { id: "country-1", code: "US", name: "United States" },
  { id: "country-2", code: "CA", name: "Canada" },
  { id: "country-3", code: "GB", name: "United Kingdom" },
  { id: "country-4", code: "DE", name: "Germany" },
  { id: "country-5", code: "FR", name: "France" },
  { id: "country-6", code: "AU", name: "Australia" },
  { id: "country-7", code: "JP", name: "Japan" },
  { id: "country-8", code: "CN", name: "China" },
  { id: "country-9", code: "BR", name: "Brazil" },
  { id: "country-10", code: "MX", name: "Mexico" },
];

// Mock channel with default shipping zone
export const mockChannel: Channel = {
  defaultShippingZone: {
    id: "zone-1",
    name: "Default Shipping Zone",
    members: mockCountries,
  },
};

// Get eligible shipping methods
export function getEligibleShippingMethods(): ShippingMethod[] {
  return mockShippingMethods;
}

// Get eligible payment methods
export function getEligiblePaymentMethods(): PaymentMethod[] {
  return mockPaymentMethods.filter((m) => m.isEligible);
}

// Get all payment methods
export function getAllPaymentMethods(): PaymentMethod[] {
  return mockPaymentMethods;
}

// Get channel countries
export function getChannelCountries(): Country[] {
  return mockCountries;
}

// Get active channel
export function getActiveChannel(): Channel {
  return mockChannel;
}

// Create Stripe payment intent (mock)
export function createStripePaymentIntent(): string {
  // Return a mock client secret
  return `pi_mock_${Date.now()}_secret_${Math.random().toString(36).substring(2, 15)}`;
}
