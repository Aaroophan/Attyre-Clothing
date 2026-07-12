import Image from 'next/image';
import Link from 'next/link';
import { CURRENCY } from '@/lib/constants';
import { formatPrice } from '@/utils';

export interface HomeProductCardProps {
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

export function HomeProductCard({
  name,
  slug,
  description,
  categoryName,
  image,
  price,
  salePrice,
  stock,
}: HomeProductCardProps) {
  const displayPrice = salePrice ?? price;

  return (
    <article className="card group flex h-full flex-col overflow-hidden">
      <Link href={`/shop/${slug}`} className="relative block overflow-hidden bg-slate-100">
        <Image
          src={image}
          alt={`${name} product preview`}
          width={520}
          height={500}
          className="aspect-[4/3] w-full object-cover transition duration-300 group-hover:scale-[1.03]"
        />
        {salePrice ? (
          <span className="absolute left-3 top-3 rounded-full bg-primary-darker px-2.5 py-1 text-[0.65rem] font-black uppercase tracking-[0.12em] text-white">
            Sale
          </span>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="truncate text-[0.68rem] font-black uppercase tracking-[0.18em] text-primary-darker">
            {categoryName}
          </p>
          <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[0.68rem] font-bold text-slate-600">
            {getStockLabel(stock)}
          </span>
        </div>

        <h3 className="text-lg font-black leading-6 text-dark">
          <Link href={`/shop/${slug}`} className="transition hover:text-primary-darker">
            {name}
          </Link>
        </h3>

        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{description}</p>

        <div className="mt-auto flex items-end justify-between gap-4 pt-5">
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
          <Link href={`/shop/${slug}`} className="shrink-0 text-sm font-black text-primary-darker hover:text-primary">
            View
          </Link>
        </div>
      </div>
    </article>
  );
}
