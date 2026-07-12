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
  if (stock <= 0) {
    return 'Out of stock';
  }

  if (stock <= 5) {
    return 'Low stock';
  }

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
    <article className="card group overflow-hidden">
      <Link href={`/shop/${slug}`} className="relative block overflow-hidden bg-gray-100">
        <Image
          src={image}
          alt={`${name} product preview`}
          width={520}
          height={640}
          className="h-72 w-full object-cover transition duration-500 group-hover:scale-105"
          priority={false}
        />
        {salePrice ? (
          <span className="absolute left-4 top-4 rounded-full bg-primary-darker px-3 py-1 text-xs font-bold uppercase tracking-[0.15em] text-white shadow-sm">
            Sale
          </span>
        ) : null}
      </Link>

      <div className="p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-darker">
            {categoryName}
          </p>
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
            {getStockLabel(stock)}
          </span>
        </div>

        <h3 className="text-lg font-bold leading-7 text-dark">
          <Link href={`/shop/${slug}`} className="transition hover:text-primary-darker">
            {name}
          </Link>
        </h3>

        <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-600">
          {description}
        </p>

        <div className="mt-5 flex items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-lg font-black text-primary-darker">
              {formatPrice(displayPrice, CURRENCY)}
            </span>
            {salePrice ? (
              <span className="text-sm font-medium text-gray-400 line-through">
                {formatPrice(price, CURRENCY)}
              </span>
            ) : null}
          </div>
          <Link
            href={`/shop/${slug}`}
            className="text-sm font-bold text-primary-darker transition hover:text-primary"
          >
            View →
          </Link>
        </div>
      </div>
    </article>
  );
}
