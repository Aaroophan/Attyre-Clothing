export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  image: string;
  size?: string;
  color?: string;
  unitPrice: number;
  quantity: number;
  stockLimit: number;
  addedAt: string;
  updatedAt: string;
}

export interface CartTotals {
  subtotal: number;
  deliveryFee: number;
  total: number;
  itemCount: number;
}

export interface AddCartItemInput {
  productId: string;
  slug: string;
  name: string;
  image: string;
  size?: string;
  color?: string;
  unitPrice: number;
  quantity: number;
  stockLimit: number;
}
