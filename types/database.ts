import type { ObjectId } from 'mongodb';

export type UserRole = 'customer' | 'admin';

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export type PaymentMethod = 'cod';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface UserDocument {
  _id: ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryDocument {
  _id: ObjectId;
  name: string;
  slug: string;
  description?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductDocument {
  _id: ObjectId;
  name: string;
  slug: string;
  description: string;
  categoryId: ObjectId;
  categorySlug: string;
  categoryName: string;
  price: number;
  salePrice?: number;
  images: string[];
  sizes: string[];
  colors: string[];
  stock: number;
  featured: boolean;
  active: boolean;
  sku?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderCustomerInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  note?: string;
}

export interface OrderItemDocument {
  productId: ObjectId;
  name: string;
  slug: string;
  image?: string;
  size?: string;
  color?: string;
  price: number;
  quantity: number;
  lineTotal: number;
}

export interface OrderDocument {
  _id: ObjectId;
  orderNumber: string;
  customerId?: ObjectId;
  customerInfo: OrderCustomerInfo;
  items: OrderItemDocument[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateUserInput = Omit<UserDocument, '_id' | 'createdAt' | 'updatedAt'>;
export type CreateCategoryInput = Omit<CategoryDocument, '_id' | 'createdAt' | 'updatedAt'>;
export type CreateProductInput = Omit<ProductDocument, '_id' | 'createdAt' | 'updatedAt'>;
export type CreateOrderInput = Omit<OrderDocument, '_id' | 'createdAt' | 'updatedAt'>;
