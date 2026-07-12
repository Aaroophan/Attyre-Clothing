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
  if (stock <= 0) return 'Out of stock';
  if (stock <= 5) return 'Low stock';
  return 'In stock';
}

function getStockClassName(stock: number): string {
  if (stock <= 0) return 'border-red-200 bg-red-50 text-red-700';
  if (stock <= 5) return 'border-amber-200 bg-amber-50 text-amber-700';
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
    <article className={cn('card group flex h-full flex-col overflow-hidden', isOutOfStock && 'opacity-80')}>
      <Link href={`/shop/${slug}`} className="relative block overflow-hidden bg-slate-100">
        <Image
          src={image}
          alt={`${name} product image`}
          width={560}
          height={520}
          className={cn('aspect-[4/3] w-full object-cover transition duration-300 group-hover:scale-[1.03]', isOutOfStock && 'grayscale')}
        />
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {salePrice ? (
            <span className="rounded-full bg-primary-darker px-2.5 py-1 text-[0.65rem] font-black uppercase tracking-[0.12em] text-white">
              Sale
            </span>
          ) : null}
          {isOutOfStock ? (
            <span className="rounded-full bg-slate-900 px-2.5 py-1 text-[0.65rem] font-black uppercase tracking-[0.12em] text-white">
              Sold out
            </span>
          ) : null}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="truncate text-[0.68rem] font-black uppercase tracking-[0.18em] text-primary-darker">
            {categoryName}
          </p>
          <span className={cn('shrink-0 rounded-full border px-2.5 py-1 text-[0.68rem] font-bold', getStockClassName(stock))}>
            {getStockLabel(stock)}
          </span>
        </div>

        <h3 className="text-lg font-black leading-6 text-dark">
          <Link href={`/shop/${slug}`} className="transition hover:text-primary-darker">
            {name}
          </Link>
        </h3>

        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{description}</p>

        <div className="mt-auto pt-5">
          <div className="flex flex-wrap items-end gap-2">
            <span className="text-lg font-black text-primary-darker">
              {formatPrice(displayPrice, CURRENCY)}
            </span>
            {salePrice ? (
              <span className="pb-0.5 text-xs font-semibold text-slate-400 line-through">
                {formatPrice(price, CURRENCY)}
              </span>
            ) : null}
          </div>

          <Link href={`/shop/${slug}`} className="btn-primary mt-4 w-full">
            View product
          </Link>
        </div>
      </div>
    </article>
  );
}
