'use client';

import Image from 'next/image';
import Link from 'next/link';
import { EmptyState, LoadingState } from '@/components/ui';
import { CURRENCY } from '@/lib/constants';
import type { CartItem } from '@/types/cart';
import { formatPrice } from '@/utils';
import { getPublicCartItemKey, useCart } from './CartProvider';

function CartItemRow({ item }: { item: CartItem }) {
  const { updateItemQuantity, removeItem } = useCart();
  const cartItemKey = getPublicCartItemKey(item);
  const lineTotal = item.unitPrice * item.quantity;

  return (
    <article className="grid gap-5 rounded-[1.75rem] border border-primary/10 bg-white p-5 shadow-sm md:grid-cols-[8rem_1fr_auto] md:items-center">
      <Link href={`/shop/${item.slug}`} className="relative block overflow-hidden rounded-2xl bg-gray-100">
        <Image
          src={item.image}
          alt={`${item.name} cart item image`}
          width={260}
          height={320}
          className="h-40 w-full object-cover transition hover:scale-105 md:h-32"
        />
      </Link>

      <div className="min-w-0">
        <Link
          href={`/shop/${item.slug}`}
          className="text-xl font-black leading-7 text-dark transition hover:text-primary-darker"
        >
          {item.name}
        </Link>

        <div className="mt-3 flex flex-wrap gap-2 text-sm font-semibold text-gray-600">
          {item.size ? (
            <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1">Size: {item.size}</span>
          ) : null}
          {item.color ? (
            <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1">Color: {item.color}</span>
          ) : null}
          <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1">
            Stock limit: {item.stockLimit}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4">
          <p className="text-sm font-semibold text-gray-600">
            Unit price: <span className="font-black text-primary-darker">{formatPrice(item.unitPrice, CURRENCY)}</span>
          </p>
          <p className="text-sm font-semibold text-gray-600">
            Item total: <span className="font-black text-primary-darker">{formatPrice(lineTotal, CURRENCY)}</span>
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 md:flex-col md:items-end">
        <div className="inline-flex items-center rounded-full border border-gray-200 bg-white p-1 shadow-sm">
          <button
            type="button"
            onClick={() => updateItemQuantity(cartItemKey, item.quantity - 1)}
            disabled={item.quantity <= 1}
            className="flex h-10 w-10 items-center justify-center rounded-full text-xl font-black text-dark transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label={`Decrease quantity for ${item.name}`}
          >
            −
          </button>
          <input
            type="number"
            min={1}
            max={item.stockLimit}
            value={item.quantity}
            onChange={(event) => updateItemQuantity(cartItemKey, Number(event.target.value))}
            className="h-10 w-16 border-0 bg-transparent text-center text-base font-black text-dark outline-none"
            aria-label={`Quantity for ${item.name}`}
          />
          <button
            type="button"
            onClick={() => updateItemQuantity(cartItemKey, item.quantity + 1)}
            disabled={item.quantity >= item.stockLimit}
            className="flex h-10 w-10 items-center justify-center rounded-full text-xl font-black text-dark transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label={`Increase quantity for ${item.name}`}
          >
            +
          </button>
        </div>

        <button
          type="button"
          onClick={() => removeItem(cartItemKey)}
          className="rounded-full border border-red-200 px-4 py-2 text-sm font-black text-red-700 transition hover:bg-red-50"
        >
          Remove
        </button>
      </div>
    </article>
  );
}

export function CartPageClient() {
  const { clearCart, isReady, items, totals } = useCart();

  if (!isReady) {
    return <LoadingState label="Loading your cart..." />;
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title="Your cart is empty"
        description="Browse Attyre products, choose your preferred size and color, then add items to your cart."
        actionLabel="Continue shopping"
        actionHref="/shop"
      />
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_24rem] lg:items-start">
      <section className="space-y-5" aria-label="Cart items">
        {items.map((item) => (
          <CartItemRow key={getPublicCartItemKey(item)} item={item} />
        ))}
      </section>

      <aside className="rounded-[1.75rem] border border-primary/10 bg-white p-6 shadow-sm lg:sticky lg:top-28">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-primary-darker">Cart summary</p>
        <h2 className="mt-2 text-2xl font-black text-dark">Order total</h2>

        <div className="mt-6 space-y-4 text-sm font-semibold text-gray-700">
          <div className="flex items-center justify-between gap-4">
            <span>Items</span>
            <span>{totals.itemCount}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span>Subtotal</span>
            <span>{formatPrice(totals.subtotal, CURRENCY)}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span>Delivery fee</span>
            <span>{formatPrice(totals.deliveryFee, CURRENCY)}</span>
          </div>
        </div>

        <div className="mt-5 border-t border-gray-100 pt-5">
          <div className="flex items-center justify-between gap-4">
            <span className="text-base font-black text-dark">Total</span>
            <span className="text-2xl font-black text-primary-darker">{formatPrice(totals.total, CURRENCY)}</span>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-primary/10 bg-primary/5 p-4 text-sm leading-6 text-primary-darker">
          Cash on Delivery will be used at checkout. Card payments are outside the current Attyre MVP scope.
        </div>

        <div className="mt-6 grid gap-3">
          <Link
            href="/checkout"
            className="inline-flex w-full items-center justify-center rounded-full bg-primary-darker px-6 py-4 text-sm font-black uppercase tracking-[0.16em] text-white transition hover:bg-primary"
          >
            Continue to checkout
          </Link>
          <Link
            href="/shop"
            className="inline-flex w-full items-center justify-center rounded-full border border-primary/30 px-6 py-3 text-sm font-black text-primary-darker transition hover:bg-primary/10"
          >
            Add more items
          </Link>
          <button
            type="button"
            onClick={clearCart}
            className="inline-flex w-full items-center justify-center rounded-full border border-red-200 px-6 py-3 text-sm font-black text-red-700 transition hover:bg-red-50"
          >
            Clear cart
          </button>
        </div>
      </aside>
    </div>
  );
}
