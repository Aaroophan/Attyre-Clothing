/**
 * Application Constants
 */

// Site Configuration
export const SITE_NAME = 'Attyre';
export const SITE_DESCRIPTION = 'Premium clothing e-commerce platform for style-conscious customers';

// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Pagination
export const ITEMS_PER_PAGE = 12;

// Sizes (for clothing)
export const CLOTHING_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

// Colors
export const COMMON_COLORS = [
  'Black',
  'White',
  'Navy',
  'Gray',
  'Red',
  'Blue',
  'Green',
  'Yellow',
  'Pink',
  'Purple',
];

// Product Categories
export const PRODUCT_CATEGORIES = [
  { id: 'mens', name: 'Mens' },
  { id: 'womens', name: 'Womens' },
  { id: 'kids', name: 'Kids' },
  { id: 'accessories', name: 'Accessories' },
];

// Order Status
export const ORDER_STATUSES = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const;

// Currency
export const CURRENCY = 'PKR';
export const CURRENCY_SYMBOL = 'Rs.';
