'use client';

import { useMemo, useState } from 'react';
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

interface PreparedCartItem {
  productId: string;
  slug: string;
  name: string;
  image: string;
  size?: string;
  color?: string;
  unitPrice: number;
  quantity: number;
  stockLimit: number;
  preparedAt: string;
}

const PREPARED_CART_KEY = 'attyre-prepared-cart-item';

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

  function handleAddToCartPreview() {
    const nextErrors = validateSelection();
    setErrors(nextErrors);
    setSuccessMessage('');

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const preparedItem: PreparedCartItem = {
      productId,
      slug,
      name,
      image,
      size: selectedSize || undefined,
      color: selectedColor || undefined,
      unitPrice: displayPrice,
      quantity,
      stockLimit: stock,
      preparedAt: new Date().toISOString(),
    };

    globalThis.localStorage.setItem(PREPARED_CART_KEY, JSON.stringify(preparedItem));
    setSuccessMessage('Product options selected successfully. Full cart persistence will be completed in Issue 08.');
  }

  return (
    <div className="rounded-[1.75rem] border border-primary/10 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-gray-500">Price</p>
          <div className="mt-2 flex flex-wrap items-end gap-3">
            <span className="text-3xl font-black text-primary-darker">
              {formatPrice(displayPrice, CURRENCY)}
            </span>
            {salePrice ? (
              <span className="pb-1 text-base font-semibold text-gray-400 line-through">
                {formatPrice(price, CURRENCY)}
              </span>
            ) : null}
          </div>
        </div>

        {salePrice ? (
          <span className="rounded-full bg-primary-darker px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-white">
            Sale item
          </span>
        ) : null}
      </div>

      <div className="mt-7 rounded-2xl border border-gray-100 bg-gray-50 p-4">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-gray-500">Availability</p>
        <p className={cn('mt-2 text-lg font-black', isOutOfStock ? 'text-red-700' : stock <= 5 ? 'text-amber-700' : 'text-emerald-700')}>
          {isOutOfStock ? 'Currently out of stock' : `${stock} unit${stock === 1 ? '' : 's'} available`}
        </p>
      </div>

      {sizes.length > 0 ? (
        <div className="mt-7">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-gray-500">Select size</p>
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
                    'rounded-full border px-5 py-2.5 text-sm font-black transition',
                    isSelected
                      ? 'border-primary-darker bg-primary-darker text-white shadow-sm'
                      : 'border-gray-200 bg-white text-dark hover:border-primary hover:text-primary-darker',
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
        <div className="mt-7">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-gray-500">Select color</p>
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
                    'rounded-full border px-5 py-2.5 text-sm font-black transition',
                    isSelected
                      ? 'border-primary-darker bg-primary-darker text-white shadow-sm'
                      : 'border-gray-200 bg-white text-dark hover:border-primary hover:text-primary-darker',
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

      <div className="mt-7">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-gray-500">Quantity</p>
          {errors.quantity ? <p className="text-sm font-semibold text-red-600">{errors.quantity}</p> : null}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-4">
          <div className="inline-flex items-center rounded-full border border-gray-200 bg-white p-1 shadow-sm">
            <button
              type="button"
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={isOutOfStock || quantity <= 1}
              className="flex h-10 w-10 items-center justify-center rounded-full text-xl font-black text-dark transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
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
              className="h-10 w-16 border-0 bg-transparent text-center text-base font-black text-dark outline-none disabled:opacity-40"
              aria-label="Product quantity"
            />
            <button
              type="button"
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={isOutOfStock || quantity >= stock}
              className="flex h-10 w-10 items-center justify-center rounded-full text-xl font-black text-dark transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          <p className="text-sm font-semibold text-gray-600">
            Line total: <span className="font-black text-primary-darker">{formatPrice(lineTotal, CURRENCY)}</span>
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={handleAddToCartPreview}
        disabled={isOutOfStock}
        className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-primary-darker px-6 py-4 text-sm font-black uppercase tracking-[0.16em] text-white transition hover:bg-primary disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
      >
        {isOutOfStock ? 'Out of stock' : 'Add to cart'}
      </button>

      {successMessage ? (
        <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold leading-6 text-emerald-800">
          {successMessage}
        </div>
      ) : null}

      <div className="mt-5 rounded-2xl border border-primary/10 bg-primary/5 p-4 text-sm leading-6 text-primary-darker">
        Cash on Delivery checkout will be used for Attyre orders. Card payments are intentionally outside the current RAD scope.
      </div>
    </div>
  );
}
