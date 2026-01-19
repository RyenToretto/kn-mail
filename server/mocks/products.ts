// Mock data for products
import type { Asset } from "./collections";

export interface ProductOption {
  id: string;
  name: string;
  group: {
    id: string;
    name: string;
  };
}

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  stockLevel: string;
  currencyCode: string;
  price: number;
  priceWithTax: number;
  options: ProductOption[];
  featuredAsset: Asset | null;
  assets: Asset[];
}

export interface ProductCollection {
  id: string;
  name: string;
  slug: string;
  parent: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  featuredAsset: Asset | null;
  assets: Asset[];
  variants: ProductVariant[];
  collections: ProductCollection[];
}

export interface SearchResultItem {
  productName: string;
  slug: string;
  productAsset: Asset | null;
  priceWithTax:
    | { __typename: "SinglePrice"; value: number }
    | { __typename: "PriceRange"; min: number; max: number };
  currencyCode: string;
}

export const mockProducts: Product[] = [
  {
    id: "prod-1",
    name: "iPhone 15 Pro",
    slug: "iphone-15-pro",
    description:
      "The latest iPhone with A17 Pro chip, titanium design, and advanced camera system. Features a 6.1-inch Super Retina XDR display with ProMotion technology.",
    featuredAsset: {
      id: "asset-prod-1",
      preview: "https://picsum.photos/seed/iphone15/600/600",
    },
    assets: [
      { id: "asset-prod-1-1", preview: "https://picsum.photos/seed/iphone15-1/600/600" },
      { id: "asset-prod-1-2", preview: "https://picsum.photos/seed/iphone15-2/600/600" },
      { id: "asset-prod-1-3", preview: "https://picsum.photos/seed/iphone15-3/600/600" },
    ],
    variants: [
      {
        id: "var-1-1",
        name: "iPhone 15 Pro 128GB Natural Titanium",
        sku: "IP15P-128-NT",
        stockLevel: "IN_STOCK",
        currencyCode: "USD",
        price: 99900,
        priceWithTax: 99900,
        options: [
          { id: "opt-1", name: "128GB", group: { id: "grp-1", name: "Storage" } },
          { id: "opt-2", name: "Natural Titanium", group: { id: "grp-2", name: "Color" } },
        ],
        featuredAsset: { id: "asset-var-1-1", preview: "https://picsum.photos/seed/iphone15-nt/600/600" },
        assets: [],
      },
      {
        id: "var-1-2",
        name: "iPhone 15 Pro 256GB Blue Titanium",
        sku: "IP15P-256-BT",
        stockLevel: "IN_STOCK",
        currencyCode: "USD",
        price: 109900,
        priceWithTax: 109900,
        options: [
          { id: "opt-3", name: "256GB", group: { id: "grp-1", name: "Storage" } },
          { id: "opt-4", name: "Blue Titanium", group: { id: "grp-2", name: "Color" } },
        ],
        featuredAsset: { id: "asset-var-1-2", preview: "https://picsum.photos/seed/iphone15-bt/600/600" },
        assets: [],
      },
      {
        id: "var-1-3",
        name: "iPhone 15 Pro 512GB Black Titanium",
        sku: "IP15P-512-BK",
        stockLevel: "LOW_STOCK",
        currencyCode: "USD",
        price: 129900,
        priceWithTax: 129900,
        options: [
          { id: "opt-5", name: "512GB", group: { id: "grp-1", name: "Storage" } },
          { id: "opt-6", name: "Black Titanium", group: { id: "grp-2", name: "Color" } },
        ],
        featuredAsset: { id: "asset-var-1-3", preview: "https://picsum.photos/seed/iphone15-bk/600/600" },
        assets: [],
      },
    ],
    collections: [
      { id: "1", name: "Electronics", slug: "electronics", parent: null },
      { id: "1-1", name: "Smartphones", slug: "smartphones", parent: { id: "1", name: "Electronics", slug: "electronics" } },
    ],
  },
  {
    id: "prod-2",
    name: "MacBook Pro 14\"",
    slug: "macbook-pro-14",
    description:
      "Supercharged by M3 Pro or M3 Max chip. Up to 22 hours of battery life. Stunning Liquid Retina XDR display.",
    featuredAsset: {
      id: "asset-prod-2",
      preview: "https://picsum.photos/seed/macbook14/600/600",
    },
    assets: [
      { id: "asset-prod-2-1", preview: "https://picsum.photos/seed/macbook14-1/600/600" },
      { id: "asset-prod-2-2", preview: "https://picsum.photos/seed/macbook14-2/600/600" },
    ],
    variants: [
      {
        id: "var-2-1",
        name: "MacBook Pro 14\" M3 Pro 512GB Space Black",
        sku: "MBP14-M3P-512-SB",
        stockLevel: "IN_STOCK",
        currencyCode: "USD",
        price: 199900,
        priceWithTax: 199900,
        options: [
          { id: "opt-7", name: "M3 Pro", group: { id: "grp-3", name: "Chip" } },
          { id: "opt-8", name: "512GB", group: { id: "grp-1", name: "Storage" } },
          { id: "opt-9", name: "Space Black", group: { id: "grp-2", name: "Color" } },
        ],
        featuredAsset: { id: "asset-var-2-1", preview: "https://picsum.photos/seed/macbook14-sb/600/600" },
        assets: [],
      },
      {
        id: "var-2-2",
        name: "MacBook Pro 14\" M3 Max 1TB Silver",
        sku: "MBP14-M3M-1TB-SV",
        stockLevel: "IN_STOCK",
        currencyCode: "USD",
        price: 299900,
        priceWithTax: 299900,
        options: [
          { id: "opt-10", name: "M3 Max", group: { id: "grp-3", name: "Chip" } },
          { id: "opt-11", name: "1TB", group: { id: "grp-1", name: "Storage" } },
          { id: "opt-12", name: "Silver", group: { id: "grp-2", name: "Color" } },
        ],
        featuredAsset: { id: "asset-var-2-2", preview: "https://picsum.photos/seed/macbook14-sv/600/600" },
        assets: [],
      },
    ],
    collections: [
      { id: "1", name: "Electronics", slug: "electronics", parent: null },
      { id: "1-2", name: "Laptops", slug: "laptops", parent: { id: "1", name: "Electronics", slug: "electronics" } },
    ],
  },
  {
    id: "prod-3",
    name: "AirPods Pro 2",
    slug: "airpods-pro-2",
    description:
      "Active Noise Cancellation, Adaptive Audio, and Conversation Awareness. Up to 2x more Active Noise Cancellation than the previous generation.",
    featuredAsset: {
      id: "asset-prod-3",
      preview: "https://picsum.photos/seed/airpodspro/600/600",
    },
    assets: [
      { id: "asset-prod-3-1", preview: "https://picsum.photos/seed/airpodspro-1/600/600" },
    ],
    variants: [
      {
        id: "var-3-1",
        name: "AirPods Pro 2 with USB-C",
        sku: "APP2-USBC",
        stockLevel: "IN_STOCK",
        currencyCode: "USD",
        price: 24900,
        priceWithTax: 24900,
        options: [],
        featuredAsset: { id: "asset-var-3-1", preview: "https://picsum.photos/seed/airpodspro/600/600" },
        assets: [],
      },
    ],
    collections: [
      { id: "1", name: "Electronics", slug: "electronics", parent: null },
      { id: "1-3", name: "Audio", slug: "audio", parent: { id: "1", name: "Electronics", slug: "electronics" } },
    ],
  },
  {
    id: "prod-4",
    name: "Sony WH-1000XM5",
    slug: "sony-wh-1000xm5",
    description:
      "Industry-leading noise cancellation with 8 microphones and Auto NC Optimizer. Crystal clear hands-free calling with 4 beamforming microphones.",
    featuredAsset: {
      id: "asset-prod-4",
      preview: "https://picsum.photos/seed/sonywh1000/600/600",
    },
    assets: [
      { id: "asset-prod-4-1", preview: "https://picsum.photos/seed/sonywh1000-1/600/600" },
      { id: "asset-prod-4-2", preview: "https://picsum.photos/seed/sonywh1000-2/600/600" },
    ],
    variants: [
      {
        id: "var-4-1",
        name: "Sony WH-1000XM5 Black",
        sku: "SONY-WH5-BK",
        stockLevel: "IN_STOCK",
        currencyCode: "USD",
        price: 39900,
        priceWithTax: 39900,
        options: [
          { id: "opt-13", name: "Black", group: { id: "grp-2", name: "Color" } },
        ],
        featuredAsset: { id: "asset-var-4-1", preview: "https://picsum.photos/seed/sonywh1000-bk/600/600" },
        assets: [],
      },
      {
        id: "var-4-2",
        name: "Sony WH-1000XM5 Silver",
        sku: "SONY-WH5-SV",
        stockLevel: "IN_STOCK",
        currencyCode: "USD",
        price: 39900,
        priceWithTax: 39900,
        options: [
          { id: "opt-14", name: "Silver", group: { id: "grp-2", name: "Color" } },
        ],
        featuredAsset: { id: "asset-var-4-2", preview: "https://picsum.photos/seed/sonywh1000-sv/600/600" },
        assets: [],
      },
    ],
    collections: [
      { id: "1", name: "Electronics", slug: "electronics", parent: null },
      { id: "1-3", name: "Audio", slug: "audio", parent: { id: "1", name: "Electronics", slug: "electronics" } },
    ],
  },
  {
    id: "prod-5",
    name: "Classic Cotton T-Shirt",
    slug: "classic-cotton-tshirt",
    description:
      "Premium 100% organic cotton t-shirt. Soft, breathable, and perfect for everyday wear. Pre-shrunk for a consistent fit.",
    featuredAsset: {
      id: "asset-prod-5",
      preview: "https://picsum.photos/seed/tshirt/600/600",
    },
    assets: [
      { id: "asset-prod-5-1", preview: "https://picsum.photos/seed/tshirt-1/600/600" },
    ],
    variants: [
      {
        id: "var-5-1",
        name: "Classic Cotton T-Shirt S White",
        sku: "TSHIRT-S-WH",
        stockLevel: "IN_STOCK",
        currencyCode: "USD",
        price: 2900,
        priceWithTax: 2900,
        options: [
          { id: "opt-15", name: "S", group: { id: "grp-4", name: "Size" } },
          { id: "opt-16", name: "White", group: { id: "grp-2", name: "Color" } },
        ],
        featuredAsset: null,
        assets: [],
      },
      {
        id: "var-5-2",
        name: "Classic Cotton T-Shirt M Black",
        sku: "TSHIRT-M-BK",
        stockLevel: "IN_STOCK",
        currencyCode: "USD",
        price: 2900,
        priceWithTax: 2900,
        options: [
          { id: "opt-17", name: "M", group: { id: "grp-4", name: "Size" } },
          { id: "opt-18", name: "Black", group: { id: "grp-2", name: "Color" } },
        ],
        featuredAsset: null,
        assets: [],
      },
      {
        id: "var-5-3",
        name: "Classic Cotton T-Shirt L Navy",
        sku: "TSHIRT-L-NV",
        stockLevel: "OUT_OF_STOCK",
        currencyCode: "USD",
        price: 2900,
        priceWithTax: 2900,
        options: [
          { id: "opt-19", name: "L", group: { id: "grp-4", name: "Size" } },
          { id: "opt-20", name: "Navy", group: { id: "grp-2", name: "Color" } },
        ],
        featuredAsset: null,
        assets: [],
      },
    ],
    collections: [
      { id: "2", name: "Clothing", slug: "clothing", parent: null },
      { id: "2-1", name: "Men's Clothing", slug: "mens-clothing", parent: { id: "2", name: "Clothing", slug: "clothing" } },
    ],
  },
  {
    id: "prod-6",
    name: "Modern Desk Lamp",
    slug: "modern-desk-lamp",
    description:
      "Elegant LED desk lamp with adjustable brightness and color temperature. Touch control and USB charging port included.",
    featuredAsset: {
      id: "asset-prod-6",
      preview: "https://picsum.photos/seed/desklamp/600/600",
    },
    assets: [],
    variants: [
      {
        id: "var-6-1",
        name: "Modern Desk Lamp White",
        sku: "LAMP-DESK-WH",
        stockLevel: "IN_STOCK",
        currencyCode: "USD",
        price: 4900,
        priceWithTax: 4900,
        options: [
          { id: "opt-21", name: "White", group: { id: "grp-2", name: "Color" } },
        ],
        featuredAsset: null,
        assets: [],
      },
      {
        id: "var-6-2",
        name: "Modern Desk Lamp Black",
        sku: "LAMP-DESK-BK",
        stockLevel: "IN_STOCK",
        currencyCode: "USD",
        price: 4900,
        priceWithTax: 4900,
        options: [
          { id: "opt-22", name: "Black", group: { id: "grp-2", name: "Color" } },
        ],
        featuredAsset: null,
        assets: [],
      },
    ],
    collections: [
      { id: "3", name: "Home & Garden", slug: "home-garden", parent: null },
      { id: "3-1", name: "Furniture", slug: "furniture", parent: { id: "3", name: "Home & Garden", slug: "home-garden" } },
    ],
  },
];

// Helper function to get product by slug
export function getProductBySlug(slug: string): Product | undefined {
  return mockProducts.find((p) => p.slug === slug);
}

// Helper function to get product by ID
export function getProductById(id: string): Product | undefined {
  return mockProducts.find((p) => p.id === id);
}

// Convert product to search result item
export function productToSearchResult(product: Product): SearchResultItem {
  const minPrice = Math.min(...product.variants.map((v) => v.priceWithTax));
  const maxPrice = Math.max(...product.variants.map((v) => v.priceWithTax));

  return {
    productName: product.name,
    slug: product.slug,
    productAsset: product.featuredAsset,
    priceWithTax:
      minPrice === maxPrice
        ? { __typename: "SinglePrice", value: minPrice }
        : { __typename: "PriceRange", min: minPrice, max: maxPrice },
    currencyCode: product.variants[0]?.currencyCode || "USD",
  };
}

// Search products by term
export function searchProducts(
  term: string,
  collectionSlug?: string,
  skip = 0,
  take = 12
): { items: SearchResultItem[]; totalItems: number } {
  let filtered = mockProducts;

  // Filter by collection
  if (collectionSlug) {
    filtered = filtered.filter((p) =>
      p.collections.some((c) => c.slug === collectionSlug)
    );
  }

  // Filter by search term
  if (term) {
    const lowerTerm = term.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(lowerTerm) ||
        p.description.toLowerCase().includes(lowerTerm)
    );
  }

  const totalItems = filtered.length;
  const items = filtered.slice(skip, skip + take).map(productToSearchResult);

  return { items, totalItems };
}

// Get products list
export function getProducts(
  skip = 0,
  take = 12
): { items: Product[]; totalItems: number } {
  const totalItems = mockProducts.length;
  const items = mockProducts.slice(skip, skip + take);
  return { items, totalItems };
}

// Get variant stock
export function getVariantStock(
  productId: string,
  variantId: string
): string | null {
  const product = getProductById(productId);
  if (!product) return null;

  const variant = product.variants.find((v) => v.id === variantId);
  return variant?.stockLevel || null;
}
