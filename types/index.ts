/**
 * Product Types
 */
export interface IProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  images: string[];
  sizes?: string[];
  colors?: string[];
  stock: number;
  sku: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Category Types
 */
export interface ICategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Cart Item Types
 */
export interface ICartItem {
  productId: string;
  quantity: number;
  size?: string;
  color?: string;
}

/**
 * Order Types
 */
export interface IOrder {
  id: string;
  customerId: string;
  items: IOrderItem[];
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  totalAmount: number;
  shippingAddress: IAddress;
  paymentMethod: 'cod';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  size?: string;
  color?: string;
}

/**
 * Address Types
 */
export interface IAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
}

/**
 * Customer Types
 */
export interface ICustomer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  addresses: IAddress[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Admin User Types
 */
export interface IAdminUser {
  id: string;
  email: string;
  role: 'admin' | 'moderator';
  createdAt: Date;
  updatedAt: Date;
}

export type {
  CategoryDocument,
  CreateCategoryInput,
  CreateOrderInput,
  CreateProductInput,
  CreateUserInput,
  OrderCustomerInfo,
  OrderDocument,
  OrderItemDocument,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  ProductDocument,
  UserDocument,
  UserRole,
} from './database';
