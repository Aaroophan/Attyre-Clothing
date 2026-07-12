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
    <article className="card grid gap-4 p-4 sm:grid-cols-[7rem_1fr] lg:grid-cols-[7rem_1fr_auto] lg:items-center">
      <Link href={`/shop/${item.slug}`} className="relative block overflow-hidden rounded-2xl bg-slate-100">
        <Image
          src={item.image}
          alt={`${item.name} cart item image`}
          width={220}
          height={220}
          className="aspect-square w-full object-cover transition hover:scale-[1.03]"
        />
      </Link>

      <div className="min-w-0">
        <Link href={`/shop/${item.slug}`} className="text-lg font-black leading-6 text-dark transition hover:text-primary-darker">
          {item.name}
        </Link>

        <div className="mt-2 flex flex-wrap gap-2 text-xs font-bold text-slate-600">
          {item.size ? <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">Size: {item.size}</span> : null}
          {item.color ? <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">Color: {item.color}</span> : null}
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">Stock: {item.stockLimit}</span>
        </div>

        <div className="mt-3 grid gap-1 text-sm font-semibold text-slate-600 sm:grid-cols-2">
          <p>Unit price: <span className="font-black text-primary-darker">{formatPrice(item.unitPrice, CURRENCY)}</span></p>
          <p>Item total: <span className="font-black text-primary-darker">{formatPrice(lineTotal, CURRENCY)}</span></p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 sm:col-span-2 lg:col-span-1 lg:flex-col lg:items-end">
        <div className="inline-flex items-center rounded-full border border-slate-200 bg-white p-1 shadow-sm">
          <button
            type="button"
            onClick={() => updateItemQuantity(cartItemKey, item.quantity - 1)}
            disabled={item.quantity <= 1}
            className="flex h-9 w-9 items-center justify-center rounded-full text-lg font-black text-dark transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
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
            className="h-9 w-12 border-0 bg-transparent text-center text-base font-black text-dark outline-none"
            aria-label={`Quantity for ${item.name}`}
          />
          <button
            type="button"
            onClick={() => updateItemQuantity(cartItemKey, item.quantity + 1)}
            disabled={item.quantity >= item.stockLimit}
            className="flex h-9 w-9 items-center justify-center rounded-full text-lg font-black text-dark transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
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
    <div className="grid gap-7 lg:grid-cols-[1fr_22rem] lg:items-start">
      <section className="space-y-4" aria-label="Cart items">
        {items.map((item) => <CartItemRow key={getPublicCartItemKey(item)} item={item} />)}
      </section>

      <aside className="card p-5 md:p-6">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-primary-darker">Cart summary</p>
        <h2 className="mt-2 text-2xl font-black text-dark">Order total</h2>

        <div className="mt-5 space-y-3 text-sm font-semibold text-slate-700">
          <div className="flex items-center justify-between gap-4"><span>Items</span><span>{totals.itemCount}</span></div>
          <div className="flex items-center justify-between gap-4"><span>Subtotal</span><span>{formatPrice(totals.subtotal, CURRENCY)}</span></div>
          <div className="flex items-center justify-between gap-4"><span>Delivery fee</span><span>{formatPrice(totals.deliveryFee, CURRENCY)}</span></div>
        </div>

        <div className="mt-5 border-t border-slate-100 pt-5">
          <div className="flex items-center justify-between gap-4">
            <span className="text-base font-black text-dark">Total</span>
            <span className="text-2xl font-black text-primary-darker">{formatPrice(totals.total, CURRENCY)}</span>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-sky-100 bg-sky-50 p-4 text-sm leading-6 text-primary-darker">
          Cash on Delivery will be used at checkout. Card payments are outside the current Attyre MVP scope.
        </div>

        <div className="mt-5 grid gap-3">
          <Link href="/checkout" className="btn-primary w-full">Continue to checkout</Link>
          <Link href="/shop" className="btn-secondary w-full">Add more items</Link>
          <button type="button" onClick={clearCart} className="inline-flex w-full items-center justify-center rounded-full border border-red-200 px-5 py-3 text-sm font-black text-red-700 transition hover:bg-red-50">
            Clear cart
          </button>
        </div>
      </aside>
    </div>
  );
}
