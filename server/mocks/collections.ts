// Mock data for collections
export interface Asset {
  id: string;
  preview: string;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string;
  parentId: string | null;
  featuredAsset: Asset | null;
  children?: Collection[];
}

export const mockCollections: Collection[] = [
  {
    id: "1",
    name: "Electronics",
    slug: "electronics",
    description: "Latest electronic gadgets and devices",
    parentId: null,
    featuredAsset: {
      id: "asset-1",
      preview: "https://picsum.photos/seed/electronics/400/300",
    },
    children: [
      {
        id: "1-1",
        name: "Smartphones",
        slug: "smartphones",
        description: "Latest smartphones from top brands",
        parentId: "1",
        featuredAsset: {
          id: "asset-1-1",
          preview: "https://picsum.photos/seed/smartphones/400/300",
        },
      },
      {
        id: "1-2",
        name: "Laptops",
        slug: "laptops",
        description: "Powerful laptops for work and play",
        parentId: "1",
        featuredAsset: {
          id: "asset-1-2",
          preview: "https://picsum.photos/seed/laptops/400/300",
        },
      },
      {
        id: "1-3",
        name: "Audio",
        slug: "audio",
        description: "Headphones, speakers and audio equipment",
        parentId: "1",
        featuredAsset: {
          id: "asset-1-3",
          preview: "https://picsum.photos/seed/audio/400/300",
        },
      },
    ],
  },
  {
    id: "2",
    name: "Clothing",
    slug: "clothing",
    description: "Fashion and apparel for everyone",
    parentId: null,
    featuredAsset: {
      id: "asset-2",
      preview: "https://picsum.photos/seed/clothing/400/300",
    },
    children: [
      {
        id: "2-1",
        name: "Men's Clothing",
        slug: "mens-clothing",
        description: "Stylish clothing for men",
        parentId: "2",
        featuredAsset: {
          id: "asset-2-1",
          preview: "https://picsum.photos/seed/mens/400/300",
        },
      },
      {
        id: "2-2",
        name: "Women's Clothing",
        slug: "womens-clothing",
        description: "Fashionable clothing for women",
        parentId: "2",
        featuredAsset: {
          id: "asset-2-2",
          preview: "https://picsum.photos/seed/womens/400/300",
        },
      },
    ],
  },
  {
    id: "3",
    name: "Home & Garden",
    slug: "home-garden",
    description: "Everything for your home and garden",
    parentId: null,
    featuredAsset: {
      id: "asset-3",
      preview: "https://picsum.photos/seed/home/400/300",
    },
    children: [
      {
        id: "3-1",
        name: "Furniture",
        slug: "furniture",
        description: "Modern and classic furniture",
        parentId: "3",
        featuredAsset: {
          id: "asset-3-1",
          preview: "https://picsum.photos/seed/furniture/400/300",
        },
      },
      {
        id: "3-2",
        name: "Kitchen",
        slug: "kitchen",
        description: "Kitchen appliances and accessories",
        parentId: "3",
        featuredAsset: {
          id: "asset-3-2",
          preview: "https://picsum.photos/seed/kitchen/400/300",
        },
      },
    ],
  },
];

// Helper function to get collection by slug
export function getCollectionBySlug(slug: string): Collection | undefined {
  // Check top-level collections
  for (const collection of mockCollections) {
    if (collection.slug === slug) {
      return collection;
    }
    // Check children
    if (collection.children) {
      const child = collection.children.find((c) => c.slug === slug);
      if (child) {
        return child;
      }
    }
  }
  return undefined;
}

// Get all collections for menu (top-level with children)
export function getMenuCollections(): Collection[] {
  return mockCollections;
}
