import Image from 'next/image';
import Link from 'next/link';
import { CURRENCY } from '@/lib/constants';
import { cn, formatPrice } from '@/utils';

export interface ProductCardProps {
  name: string;
  slug: string;
  description: string;
  categoryName: string;
  image: string;
  price: number;
  salePrice?: number;
  stock: number;
}

function getStockLabel(stock: number): string {
  if (stock <= 0) {
    return 'Out of stock';
  }

  if (stock <= 5) {
    return 'Low stock';
  }

  return 'In stock';
}

function getStockClassName(stock: number): string {
  if (stock <= 0) {
    return 'border-red-200 bg-red-50 text-red-700';
  }

  if (stock <= 5) {
    return 'border-amber-200 bg-amber-50 text-amber-700';
  }

  return 'border-emerald-200 bg-emerald-50 text-emerald-700';
}

export function ProductCard({
  name,
  slug,
  description,
  categoryName,
  image,
  price,
  salePrice,
  stock,
}: ProductCardProps) {
  const displayPrice = salePrice ?? price;
  const isOutOfStock = stock <= 0;

  return (
    <article
      className={cn(
        'group flex h-full flex-col overflow-hidden rounded-[1.75rem] border bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl',
        isOutOfStock ? 'border-gray-200 opacity-85' : 'border-primary/10',
      )}
    >
      <Link href={`/shop/${slug}`} className="relative block overflow-hidden bg-gray-100">
        <Image
          src={image}
          alt={`${name} product image`}
          width={640}
          height={760}
          className={cn(
            'h-80 w-full object-cover transition duration-500 group-hover:scale-105',
            isOutOfStock && 'grayscale',
          )}
        />

        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          {salePrice ? (
            <span className="rounded-full bg-primary-darker px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-white shadow-sm">
              Sale
            </span>
          ) : null}
          {isOutOfStock ? (
            <span className="rounded-full bg-dark px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-white shadow-sm">
              Sold out
            </span>
          ) : null}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-darker">
            {categoryName}
          </p>
          <span className={cn('rounded-full border px-3 py-1 text-xs font-bold', getStockClassName(stock))}>
            {getStockLabel(stock)}
          </span>
        </div>

        <h3 className="text-xl font-black leading-7 text-dark">
          <Link href={`/shop/${slug}`} className="transition hover:text-primary-darker">
            {name}
          </Link>
        </h3>

        <p className="mt-3 line-clamp-2 text-sm leading-6 text-gray-600">
          {description}
        </p>

        <div className="mt-auto pt-6">
          <div className="flex flex-wrap items-end gap-2">
            <span className="text-xl font-black text-primary-darker">
              {formatPrice(displayPrice, CURRENCY)}
            </span>
            {salePrice ? (
              <span className="pb-0.5 text-sm font-medium text-gray-400 line-through">
                {formatPrice(price, CURRENCY)}
              </span>
            ) : null}
          </div>

          <Link
            href={`/shop/${slug}`}
            className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-primary-darker px-5 py-3 text-sm font-black text-white transition hover:bg-primary"
          >
            View product
          </Link>
        </div>
      </div>
    </article>
  );
}
