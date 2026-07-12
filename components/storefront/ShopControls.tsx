import Link from 'next/link';
import { cn } from '@/utils';

export interface ShopCategoryFilter {
  name: string;
  slug: string;
  productCount: number;
}

export interface ShopControlsProps {
  categories: ShopCategoryFilter[];
  selectedCategory?: string;
  searchQuery: string;
  sort: string;
  totalProducts: number;
  filteredProducts: number;
}

function buildShopHref(params: { category?: string; q?: string; sort?: string }) {
  const query = new URLSearchParams();

  if (params.category) query.set('category', params.category);
  if (params.q) query.set('q', params.q);
  if (params.sort && params.sort !== 'newest') query.set('sort', params.sort);

  const queryString = query.toString();
  return queryString ? `/shop?${queryString}` : '/shop';
}

export function ShopControls({
  categories,
  selectedCategory,
  searchQuery,
  sort,
  totalProducts,
  filteredProducts,
}: ShopControlsProps) {
  return (
    <div className="card p-4 sm:p-5 md:p-6">
      <form action="/shop" className="grid gap-4 lg:grid-cols-[1fr_14rem_auto_auto] lg:items-end">
        {selectedCategory ? <input type="hidden" name="category" value={selectedCategory} /> : null}
        <div>
          <label htmlFor="shop-search" className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
            Search products
          </label>
          <input
            id="shop-search"
            name="q"
            type="search"
            defaultValue={searchQuery}
            placeholder="Search shirts, dresses, belts..."
            className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-dark outline-none transition focus:border-primary focus:ring-4 focus:ring-sky-100"
          />
        </div>

        <div>
          <label htmlFor="shop-sort" className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
            Sort by
          </label>
          <select
            id="shop-sort"
            name="sort"
            defaultValue={sort}
            className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-dark outline-none transition focus:border-primary focus:ring-4 focus:ring-sky-100"
          >
            <option value="newest">Newest first</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
            <option value="name-asc">Name: A to Z</option>
          </select>
        </div>

        <button type="submit" className="btn-primary h-12">
          Apply
        </button>

        <Link href="/shop" className="btn-secondary h-12">
          Clear
        </Link>
      </form>

      <div className="mt-5 flex flex-wrap gap-2">
        <Link
          href={buildShopHref({ q: searchQuery, sort })}
          className={cn(
            'rounded-full border px-3.5 py-2 text-sm font-bold transition',
            !selectedCategory
              ? 'border-primary-darker bg-primary-darker text-white'
              : 'border-slate-200 bg-white text-slate-700 hover:border-primary hover:text-primary-darker',
          )}
        >
          All <span className="opacity-75">({totalProducts})</span>
        </Link>

        {categories.map((category) => (
          <Link
            key={category.slug}
            href={buildShopHref({ category: category.slug, q: searchQuery, sort })}
            className={cn(
              'rounded-full border px-3.5 py-2 text-sm font-bold transition',
              selectedCategory === category.slug
                ? 'border-primary-darker bg-primary-darker text-white'
                : 'border-slate-200 bg-white text-slate-700 hover:border-primary hover:text-primary-darker',
            )}
          >
            {category.name} <span className="opacity-75">({category.productCount})</span>
          </Link>
        ))}
      </div>

      <p className="mt-5 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600">
        Showing <span className="text-primary-darker">{filteredProducts}</span> of{' '}
        <span className="text-primary-darker">{totalProducts}</span> active products.
        {searchQuery ? <span> Search: “{searchQuery}”.</span> : null}
      </p>
    </div>
  );
}
