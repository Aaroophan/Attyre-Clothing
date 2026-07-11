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

function buildShopHref(params: {
  category?: string;
  q?: string;
  sort?: string;
}) {
  const query = new URLSearchParams();

  if (params.category) {
    query.set('category', params.category);
  }

  if (params.q) {
    query.set('q', params.q);
  }

  if (params.sort && params.sort !== 'newest') {
    query.set('sort', params.sort);
  }

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
    <div className="rounded-[2rem] border border-primary/10 bg-white p-5 shadow-sm md:p-6">
      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.7fr_auto] lg:items-end">
        <form action="/shop" className="grid gap-3 md:grid-cols-[1fr_auto] lg:col-span-2">
          {selectedCategory ? <input type="hidden" name="category" value={selectedCategory} /> : null}
          <div>
            <label htmlFor="shop-search" className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">
              Search products
            </label>
            <input
              id="shop-search"
              name="q"
              type="search"
              defaultValue={searchQuery}
              placeholder="Search shirts, dresses, belts..."
              className="mt-2 h-12 w-full rounded-full border border-gray-200 bg-white px-5 text-sm font-medium text-dark outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
            />
          </div>

          <div>
            <label htmlFor="shop-sort" className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">
              Sort by
            </label>
            <select
              id="shop-sort"
              name="sort"
              defaultValue={sort}
              className="mt-2 h-12 w-full rounded-full border border-gray-200 bg-white px-5 text-sm font-bold text-dark outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 md:w-52"
            >
              <option value="newest">Newest first</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
              <option value="name-asc">Name: A to Z</option>
            </select>
          </div>

          <button
            type="submit"
            className="h-12 rounded-full bg-primary-darker px-6 text-sm font-black text-white transition hover:bg-primary md:self-end"
          >
            Apply
          </button>
        </form>

        <Link
          href="/shop"
          className="inline-flex h-12 items-center justify-center rounded-full border border-gray-200 px-5 text-sm font-black text-dark transition hover:border-primary hover:text-primary-darker"
        >
          Clear filters
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href={buildShopHref({ q: searchQuery, sort })}
          className={cn(
            'rounded-full border px-4 py-2 text-sm font-bold transition',
            !selectedCategory
              ? 'border-primary-darker bg-primary-darker text-white'
              : 'border-gray-200 bg-white text-gray-700 hover:border-primary hover:text-primary-darker',
          )}
        >
          All products <span className="opacity-75">({totalProducts})</span>
        </Link>

        {categories.map((category) => (
          <Link
            key={category.slug}
            href={buildShopHref({ category: category.slug, q: searchQuery, sort })}
            className={cn(
              'rounded-full border px-4 py-2 text-sm font-bold transition',
              selectedCategory === category.slug
                ? 'border-primary-darker bg-primary-darker text-white'
                : 'border-gray-200 bg-white text-gray-700 hover:border-primary hover:text-primary-darker',
            )}
          >
            {category.name} <span className="opacity-75">({category.productCount})</span>
          </Link>
        ))}
      </div>

      <div className="mt-5 rounded-2xl bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-600">
        Showing <span className="text-primary-darker">{filteredProducts}</span> of{' '}
        <span className="text-primary-darker">{totalProducts}</span> active products.
        {searchQuery ? <span> Search: “{searchQuery}”.</span> : null}
      </div>
    </div>
  );
}
