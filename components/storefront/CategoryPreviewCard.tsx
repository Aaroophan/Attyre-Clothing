import Link from 'next/link';

export interface CategoryPreviewCardProps {
  name: string;
  slug: string;
  description?: string;
  productCount?: number;
}

export function CategoryPreviewCard({ name, slug, description, productCount }: CategoryPreviewCardProps) {
  return (
    <Link href={`/shop?category=${slug}`} className="card group flex h-full flex-col p-5 transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-base font-black text-primary-darker transition group-hover:bg-primary-darker group-hover:text-white">
        {name.charAt(0)}
      </div>
      <h3 className="text-lg font-black text-dark">{name}</h3>
      {description ? <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">{description}</p> : null}
      <div className="mt-5 flex items-center justify-between gap-4 text-sm font-bold text-primary-darker">
        <span>Browse category</span>
        {typeof productCount === 'number' ? (
          <span className="rounded-full bg-sky-50 px-3 py-1 text-xs">{productCount} items</span>
        ) : null}
      </div>
    </Link>
  );
}
