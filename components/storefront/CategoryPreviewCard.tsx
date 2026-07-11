import Link from 'next/link';

export interface CategoryPreviewCardProps {
  name: string;
  slug: string;
  description?: string;
  productCount?: number;
}

export function CategoryPreviewCard({
  name,
  slug,
  description,
  productCount,
}: CategoryPreviewCardProps) {
  return (
    <Link href={`/shop?category=${slug}`} className="card group flex h-full flex-col p-6">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-lg font-black text-primary-darker transition group-hover:bg-primary group-hover:text-white">
        {name.charAt(0)}
      </div>
      <h3 className="text-xl font-bold text-dark">{name}</h3>
      {description ? (
        <p className="mt-2 flex-1 text-sm leading-6 text-gray-600">
          {description}
        </p>
      ) : null}
      <div className="mt-5 flex items-center justify-between gap-4 text-sm font-semibold text-primary-darker">
        <span>Browse category →</span>
        {typeof productCount === 'number' ? (
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs">
            {productCount} items
          </span>
        ) : null}
      </div>
    </Link>
  );
}
