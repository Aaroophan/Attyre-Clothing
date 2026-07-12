/**
 * Seed data for development and testing.
 *
 * Issue 04 uses these definitions both for the MongoDB seed script and for
 * lightweight storefront preview data before the full shop pages are built.
 */

import type { ICategory, IProduct } from '@/types';

export interface SeedCategoryDefinition {
  name: string;
  slug: string;
  description: string;
  active: boolean;
}

export interface SeedProductDefinition {
  name: string;
  slug: string;
  description: string;
  categorySlug: string;
  price: number;
  salePrice?: number;
  images: string[];
  sizes: string[];
  colors: string[];
  stock: number;
  featured: boolean;
  active: boolean;
  sku: string;
}

export const seedCategories: SeedCategoryDefinition[] = [
  {
    name: 'Men',
    slug: 'men',
    description: 'Everyday shirts, denim, hoodies, polos, and smart casual pieces for men.',
    active: true,
  },
  {
    name: 'Women',
    slug: 'women',
    description: 'Dresses, blazers, skirts, and curated wardrobe essentials for women.',
    active: true,
  },
  {
    name: 'Accessories',
    slug: 'accessories',
    description: 'Belts, bags, and practical finishing pieces for complete outfits.',
    active: true,
  },
  {
    name: 'New Arrivals',
    slug: 'new-arrivals',
    description: 'Recently added styles selected for the current Attyre release.',
    active: true,
  },
  {
    name: 'Sale',
    slug: 'sale',
    description: 'Discounted clothing and accessories for budget-conscious shoppers.',
    active: true,
  },
];

export const seedProducts: SeedProductDefinition[] = [
  {
    name: 'Classic White Shirt',
    slug: 'classic-white-shirt',
    description: 'A crisp long-sleeve white shirt designed for office wear, smart casual outfits, and weekend styling.',
    categorySlug: 'men',
    price: 4500,
    salePrice: 3990,
    images: ['/images/products/classic-white-shirt.svg'],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['White', 'Sky Blue'],
    stock: 28,
    featured: true,
    active: true,
    sku: 'ATT-MEN-SHIRT-001',
  },
  {
    name: 'Oversized Black T-Shirt',
    slug: 'oversized-black-t-shirt',
    description: 'A relaxed-fit cotton t-shirt with a clean streetwear silhouette for everyday casual outfits.',
    categorySlug: 'new-arrivals',
    price: 3200,
    images: ['/images/products/oversized-black-t-shirt.svg'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Black', 'Charcoal'],
    stock: 42,
    featured: true,
    active: true,
    sku: 'ATT-NEW-TEE-002',
  },
  {
    name: 'Slim Fit Denim Jeans',
    slug: 'slim-fit-denim-jeans',
    description: 'A versatile pair of slim-fit denim jeans suitable for daily wear, casual Fridays, and weekend looks.',
    categorySlug: 'men',
    price: 6900,
    salePrice: 5990,
    images: ['/images/products/slim-fit-denim-jeans.svg'],
    sizes: ['28', '30', '32', '34', '36'],
    colors: ['Blue', 'Black'],
    stock: 18,
    featured: true,
    active: true,
    sku: 'ATT-MEN-DENIM-003',
  },
  {
    name: 'Linen Summer Dress',
    slug: 'linen-summer-dress',
    description: 'A lightweight linen-blend dress made for warm weather, brunch outings, and relaxed daytime occasions.',
    categorySlug: 'women',
    price: 7800,
    images: ['/images/products/linen-summer-dress.svg'],
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Beige', 'White', 'Rose'],
    stock: 14,
    featured: true,
    active: true,
    sku: 'ATT-WOM-DRESS-004',
  },
  {
    name: 'Casual Hoodie',
    slug: 'casual-hoodie',
    description: 'A soft fleece hoodie with a relaxed shape, ideal for travel, casual layering, and cool evenings.',
    categorySlug: 'new-arrivals',
    price: 5900,
    images: ['/images/products/casual-hoodie.svg'],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Grey', 'Navy', 'Black'],
    stock: 9,
    featured: false,
    active: true,
    sku: 'ATT-NEW-HOOD-005',
  },
  {
    name: 'Formal Chinos',
    slug: 'formal-chinos',
    description: 'Smart stretch chinos built for business casual use, pairing well with shirts, polos, and jackets.',
    categorySlug: 'men',
    price: 6200,
    images: ['/images/products/formal-chinos.svg'],
    sizes: ['30', '32', '34', '36', '38'],
    colors: ['Khaki', 'Navy', 'Stone'],
    stock: 22,
    featured: false,
    active: true,
    sku: 'ATT-MEN-CHINO-006',
  },
  {
    name: 'Cotton Polo Shirt',
    slug: 'cotton-polo-shirt',
    description: 'A breathable cotton polo shirt for smart casual outfits, weekend wear, and simple everyday styling.',
    categorySlug: 'sale',
    price: 3800,
    salePrice: 2990,
    images: ['/images/products/cotton-polo-shirt.svg'],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Navy', 'White', 'Green'],
    stock: 36,
    featured: false,
    active: true,
    sku: 'ATT-SALE-POLO-007',
  },
  {
    name: "Women's Blazer",
    slug: 'womens-blazer',
    description: 'A structured blazer designed for office looks, presentations, and smart evening outfits.',
    categorySlug: 'women',
    price: 9800,
    salePrice: 8990,
    images: ['/images/products/womens-blazer.svg'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Black', 'Cream', 'Purple'],
    stock: 11,
    featured: true,
    active: true,
    sku: 'ATT-WOM-BLAZER-008',
  },
  {
    name: 'Leather Belt',
    slug: 'leather-belt',
    description: 'A classic faux-leather belt with a simple buckle, suitable for jeans, chinos, and formal trousers.',
    categorySlug: 'accessories',
    price: 2500,
    images: ['/images/products/leather-belt.svg'],
    sizes: ['M', 'L', 'XL'],
    colors: ['Black', 'Brown'],
    stock: 50,
    featured: false,
    active: true,
    sku: 'ATT-ACC-BELT-009',
  },
  {
    name: 'Canvas Tote Bag',
    slug: 'canvas-tote-bag',
    description: 'A reusable canvas tote bag for daily errands, light shopping, and casual carry needs.',
    categorySlug: 'accessories',
    price: 2100,
    salePrice: 1790,
    images: ['/images/products/canvas-tote-bag.svg'],
    sizes: ['One Size'],
    colors: ['Natural', 'Olive'],
    stock: 6,
    featured: false,
    active: true,
    sku: 'ATT-ACC-TOTE-010',
  },
  {
    name: 'Streetwear Jacket',
    slug: 'streetwear-jacket',
    description: 'A lightweight streetwear jacket for layering over t-shirts and hoodies during transitional weather.',
    categorySlug: 'sale',
    price: 8900,
    salePrice: 7490,
    images: ['/images/products/streetwear-jacket.svg'],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'Olive'],
    stock: 4,
    featured: true,
    active: true,
    sku: 'ATT-SALE-JACKET-011',
  },
  {
    name: 'Pleated Skirt',
    slug: 'pleated-skirt',
    description: 'A mid-length pleated skirt that works well with blouses, t-shirts, and light knitwear.',
    categorySlug: 'women',
    price: 5400,
    images: ['/images/products/pleated-skirt.svg'],
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Pink', 'Black', 'Beige'],
    stock: 0,
    featured: false,
    active: true,
    sku: 'ATT-WOM-SKIRT-012',
  },
];

const now = new Date();

export const sampleCategories: ICategory[] = seedCategories.map((category) => ({
  id: category.slug,
  name: category.name,
  slug: category.slug,
  description: category.description,
  createdAt: now,
  updatedAt: now,
}));

export const sampleProducts: IProduct[] = seedProducts.map((product) => ({
  id: product.slug,
  name: product.name,
  slug: product.slug,
  description: product.description,
  price: product.salePrice ?? product.price,
  originalPrice: product.salePrice ? product.price : undefined,
  category: product.categorySlug,
  images: product.images,
  sizes: product.sizes,
  colors: product.colors,
  stock: product.stock,
  sku: product.sku,
  createdAt: now,
  updatedAt: now,
}));
