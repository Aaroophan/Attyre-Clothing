'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useCart } from '@/components/cart/CartProvider';
import { CURRENCY } from '@/lib/constants';
import { cn, formatPrice } from '@/utils';

export interface ProductPurchasePanelProps {
  productId: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  salePrice?: number;
  stock: number;
  sizes: string[];
  colors: string[];
}

interface SelectionErrors {
  size?: string;
  color?: string;
  quantity?: string;
}

function clampQuantity(value: number, stock: number): number {
  if (stock <= 0) {
    return 0;
  }

  if (Number.isNaN(value) || value < 1) {
    return 1;
  }

  return Math.min(value, stock);
}

export function ProductPurchasePanel({
  productId,
  name,
  slug,
  image,
  price,
  salePrice,
  stock,
  sizes,
  colors,
}: ProductPurchasePanelProps) {
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(stock > 0 ? 1 : 0);
  const [errors, setErrors] = useState<SelectionErrors>({});
  const [successMessage, setSuccessMessage] = useState('');
  const { addItem, getItemQuantity } = useCart();

  const displayPrice = salePrice ?? price;
  const lineTotal = useMemo(() => displayPrice * quantity, [displayPrice, quantity]);
  const isOutOfStock = stock <= 0;
  const needsSize = sizes.length > 0;
  const needsColor = colors.length > 0;

  function validateSelection(): SelectionErrors {
    const nextErrors: SelectionErrors = {};

    if (isOutOfStock) {
      nextErrors.quantity = 'This product is currently out of stock.';
    }

    if (needsSize && !selectedSize) {
      nextErrors.size = 'Please select a size before adding this product.';
    }

    if (needsColor && !selectedColor) {
      nextErrors.color = 'Please select a color before adding this product.';
    }

    if (quantity < 1) {
      nextErrors.quantity = 'Quantity must be at least 1.';
    }

    if (quantity > stock) {
      nextErrors.quantity = `Only ${stock} unit${stock === 1 ? '' : 's'} available.`;
    }

    return nextErrors;
  }

  function handleQuantityChange(value: number) {
    setQuantity(clampQuantity(value, stock));
    setSuccessMessage('');
    setErrors((current) => ({ ...current, quantity: undefined }));
  }

  function handleAddToCart() {
    const nextErrors = validateSelection();
    setErrors(nextErrors);
    setSuccessMessage('');

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const cartQuantityForVariant = getItemQuantity(
      productId,
      selectedSize || undefined,
      selectedColor || undefined,
    );
    const remainingStockForVariant = stock - cartQuantityForVariant;

    if (quantity > remainingStockForVariant) {
      setErrors({
        quantity: remainingStockForVariant > 0
          ? `Only ${remainingStockForVariant} more unit${remainingStockForVariant === 1 ? '' : 's'} can be added for this option.`
          : 'This selected option is already at the available stock limit in your cart.',
      });
      return;
    }

    addItem({
      productId,
      slug,
      name,
      image,
      size: selectedSize || undefined,
      color: selectedColor || undefined,
      unitPrice: displayPrice,
      quantity,
      stockLimit: stock,
    });

    setSuccessMessage('Added to cart. You can review the cart or continue shopping.');
  }

  return (
    <div className="card p-5 md:p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Price</p>
          <div className="mt-2 flex flex-wrap items-end gap-3">
            <span className="text-3xl font-black text-primary-darker">{formatPrice(displayPrice, CURRENCY)}</span>
            {salePrice ? <span className="pb-1 text-sm font-semibold text-slate-400 line-through">{formatPrice(price, CURRENCY)}</span> : null}
          </div>
        </div>

        {salePrice ? (
          <span className="rounded-full bg-primary-darker px-3 py-1.5 text-[0.68rem] font-black uppercase tracking-[0.14em] text-white">
            Sale item
          </span>
        ) : null}
      </div>

      <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Availability</p>
        <p className={cn('mt-1 text-base font-black', isOutOfStock ? 'text-red-700' : stock <= 5 ? 'text-amber-700' : 'text-emerald-700')}>
          {isOutOfStock ? 'Currently out of stock' : `${stock} unit${stock === 1 ? '' : 's'} available`}
        </p>
      </div>

      {sizes.length > 0 ? (
        <div className="mt-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Select size</p>
            {errors.size ? <p className="text-sm font-semibold text-red-600">{errors.size}</p> : null}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {sizes.map((size) => {
              const isSelected = selectedSize === size;

              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => {
                    setSelectedSize(size);
                    setSuccessMessage('');
                    setErrors((current) => ({ ...current, size: undefined }));
                  }}
                  className={cn(
                    'rounded-full border px-4 py-2 text-sm font-black transition',
                    isSelected
                      ? 'border-primary-darker bg-primary-darker text-white'
                      : 'border-slate-200 bg-white text-dark hover:border-primary hover:text-primary-darker',
                  )}
                  aria-pressed={isSelected}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {colors.length > 0 ? (
        <div className="mt-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Select color</p>
            {errors.color ? <p className="text-sm font-semibold text-red-600">{errors.color}</p> : null}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {colors.map((color) => {
              const isSelected = selectedColor === color;

              return (
                <button
                  key={color}
                  type="button"
                  onClick={() => {
                    setSelectedColor(color);
                    setSuccessMessage('');
                    setErrors((current) => ({ ...current, color: undefined }));
                  }}
                  className={cn(
                    'rounded-full border px-4 py-2 text-sm font-black transition',
                    isSelected
                      ? 'border-primary-darker bg-primary-darker text-white'
                      : 'border-slate-200 bg-white text-dark hover:border-primary hover:text-primary-darker',
                  )}
                  aria-pressed={isSelected}
                >
                  {color}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="mt-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Quantity</p>
          {errors.quantity ? <p className="text-sm font-semibold text-red-600">{errors.quantity}</p> : null}
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
          <div className="inline-flex items-center rounded-full border border-slate-200 bg-white p-1 shadow-sm">
            <button
              type="button"
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={isOutOfStock || quantity <= 1}
              className="flex h-10 w-10 items-center justify-center rounded-full text-xl font-black text-dark transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <input
              type="number"
              min={isOutOfStock ? 0 : 1}
              max={stock}
              value={quantity}
              onChange={(event) => handleQuantityChange(Number(event.target.value))}
              disabled={isOutOfStock}
              className="h-10 w-14 border-0 bg-transparent text-center text-base font-black text-dark outline-none disabled:opacity-40"
              aria-label="Product quantity"
            />
            <button
              type="button"
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={isOutOfStock || quantity >= stock}
              className="flex h-10 w-10 items-center justify-center rounded-full text-xl font-black text-dark transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          <p className="text-sm font-semibold text-slate-600">
            Line total: <span className="font-black text-primary-darker">{formatPrice(lineTotal, CURRENCY)}</span>
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={handleAddToCart}
        disabled={isOutOfStock}
        className="btn-primary mt-6 w-full disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none"
      >
        {isOutOfStock ? 'Out of stock' : 'Add to cart'}
      </button>

      {successMessage ? (
        <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold leading-6 text-emerald-800">
          <p>{successMessage}</p>
          <Link href="/cart" className="mt-3 inline-flex font-black text-emerald-900 underline underline-offset-4">
            View cart
          </Link>
        </div>
      ) : null}

      <div className="mt-4 rounded-2xl border border-sky-100 bg-sky-50 p-4 text-sm leading-6 text-primary-darker">
        Cash on Delivery checkout will be used for Attyre orders. Card payments are intentionally outside the current RAD scope.
      </div>
    </div>
  );
}
