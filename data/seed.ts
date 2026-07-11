/**
 * Seed data for development and testing
 */

import type { ICategory, IProduct } from '@/types';

export const sampleCategories: ICategory[] = [
  {
    id: 'mens',
    name: 'Mens',
    slug: 'mens',
    description: 'Premium menswear collection',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'womens',
    name: 'Womens',
    slug: 'womens',
    description: 'Exclusive womens fashion line',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'kids',
    name: 'Kids',
    slug: 'kids',
    description: 'Comfortable and stylish kids wear',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const sampleProducts: IProduct[] = [
  {
    id: '1',
    name: 'Classic Cotton T-Shirt',
    slug: 'classic-cotton-tshirt',
    description: 'Comfortable everyday cotton t-shirt',
    price: 1500,
    originalPrice: 2000,
    category: 'mens',
    images: ['https://via.placeholder.com/400x500?text=T-Shirt'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Black', 'White', 'Navy', 'Gray'],
    stock: 50,
    sku: 'TSHIRT-001',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    name: 'Slim Fit Denim Jeans',
    slug: 'slim-fit-denim-jeans',
    description: 'Modern slim fit denim jeans',
    price: 3500,
    originalPrice: 5000,
    category: 'mens',
    images: ['https://via.placeholder.com/400x500?text=Jeans'],
    sizes: ['28', '30', '32', '34', '36'],
    colors: ['Blue', 'Black', 'Navy'],
    stock: 30,
    sku: 'JEANS-001',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    name: 'Elegant Summer Dress',
    slug: 'elegant-summer-dress',
    description: 'Perfect for summer occasions',
    price: 4000,
    category: 'womens',
    images: ['https://via.placeholder.com/400x500?text=Dress'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Red', 'Blue', 'Pink'],
    stock: 25,
    sku: 'DRESS-001',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];
