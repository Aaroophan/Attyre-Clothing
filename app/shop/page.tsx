import { ProductGrid, ShopControls, type ShopProductCardData } from '@/components/storefront';
import { PageContainer, SectionHeader } from '@/components/ui';
import { sampleCategories, sampleProducts } from '@/data/seed';
import { listCategories, listProducts } from '@/lib/db';
import type { CategoryDocument, ProductDocument } from '@/types/database';

export const dynamic = 'force-dynamic';

type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'name-asc';

type ShopSearchParams = Promise<{
  category?: string | string[];
  q?: string | string[];
  sort?: string | string[];
}>;

interface ShopProduct extends ShopProductCardData {
  categorySlug: string;
  createdAt: Date;
}

interface ShopCategory {
  name: string;
  slug: string;
  productCount: number;
}

interface ShopCatalogData {
  products: ShopProduct[];
  categories: ShopCategory[];
  totalProducts: number;
  usingFallbackData: boolean;
}

function firstParam(value?: string | string[]): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function normalizeSearch(value?: string): string {
  return (value ?? '').trim().slice(0, 80);
}

function normalizeCategory(value?: string): string | undefined {
  const category = (value ?? '').trim().toLowerCase();
  return category || undefined;
}

function normalizeSort(value?: string): SortOption {
  const allowedSorts: SortOption[] = ['newest', 'price-asc', 'price-desc', 'name-asc'];
  return allowedSorts.includes(value as SortOption) ? (value as SortOption) : 'newest';
}

function getEffectivePrice(product: ShopProduct): number {
  return product.salePrice ?? product.price;
}

function sortProducts(products: ShopProduct[], sort: SortOption): ShopProduct[] {
  return [...products].sort((a, b) => {
    if (sort === 'price-asc') {
      return getEffectivePrice(a) - getEffectivePrice(b);
    }

    if (sort === 'price-desc') {
      return getEffectivePrice(b) - getEffectivePrice(a);
    }

    if (sort === 'name-asc') {
      return a.name.localeCompare(b.name);
    }

    return b.createdAt.getTime() - a.createdAt.getTime();
  });
}

function productFromDocument(product: ProductDocument): ShopProduct {
  return {
    id: product._id.toString(),
    name: product.name,
    slug: product.slug,
    description: product.description,
    categorySlug: product.categorySlug,
    categoryName: product.categoryName,
    image: product.images[0] ?? '/images/products/classic-white-shirt.svg',
    price: product.price,
    salePrice: product.salePrice,
    stock: product.stock,
    createdAt: product.createdAt,
  };
}

function productFromSeed(product: (typeof sampleProducts)[number]): ShopProduct {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    categorySlug: product.category,
    categoryName: sampleCategories.find((category) => category.slug === product.category)?.name ?? product.category,
    image: product.images[0] ?? '/images/products/classic-white-shirt.svg',
    price: product.originalPrice ?? product.price,
    salePrice: product.originalPrice ? product.price : undefined,
    stock: product.stock,
    createdAt: product.createdAt,
  };
}

function categoryFromDocument(category: CategoryDocument, products: ShopProduct[]): ShopCategory {
  return {
    name: category.name,
    slug: category.slug,
    productCount: products.filter((product) => product.categorySlug === category.slug).length,
  };
}

function categoryFromSeed(category: (typeof sampleCategories)[number], products: ShopProduct[]): ShopCategory {
  return {
    name: category.name,
    slug: category.slug,
    productCount: products.filter((product) => product.categorySlug === category.slug).length,
  };
}

function filterFallbackProducts(products: ShopProduct[], category?: string, search = ''): ShopProduct[] {
  const query = search.toLowerCase();

  return products.filter((product) => {
    const matchesCategory = category ? product.categorySlug === category : true;
    const matchesSearch = query
      ? `${product.name} ${product.description}`.toLowerCase().includes(query)
      : true;

    return matchesCategory && matchesSearch;
  });
}

async function getShopCatalogData(category: string | undefined, search: string): Promise<ShopCatalogData> {
  try {
    const [allProductDocuments, filteredProductDocuments, categoryDocuments] = await Promise.all([
      listProducts({ activeOnly: true }),
      listProducts({ activeOnly: true, categorySlug: category, search: search || undefined }),
      listCategories({ activeOnly: true }),
    ]);

    const allProducts = allProductDocuments.map(productFromDocument);

    return {
      products: filteredProductDocuments.map(productFromDocument),
      categories: categoryDocuments.map((item) => categoryFromDocument(item, allProducts)),
      totalProducts: allProducts.length,
      usingFallbackData: false,
    };
  } catch {
    const allProducts = sampleProducts.map(productFromSeed);

    return {
      products: filterFallbackProducts(allProducts, category, search),
      categories: sampleCategories.map((item) => categoryFromSeed(item, allProducts)),
      totalProducts: allProducts.length,
      usingFallbackData: true,
    };
  }
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: ShopSearchParams;
}) {
  const params = await searchParams;
  const selectedCategory = normalizeCategory(firstParam(params.category));
  const searchQuery = normalizeSearch(firstParam(params.q));
  const sort = normalizeSort(firstParam(params.sort));
  const { products, categories, totalProducts, usingFallbackData } = await getShopCatalogData(
    selectedCategory,
    searchQuery,
  );
  const sortedProducts = sortProducts(products, sort);
  const hasFilters = Boolean(selectedCategory || searchQuery || sort !== 'newest');

  return (
    <PageContainer className="py-10 md:py-14">
      {usingFallbackData ? (
        <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
          The shop is using bundled seed data. Run <strong>npm run seed</strong> and check your MongoDB connection to load the live catalog.
        </div>
      ) : null}

      <SectionHeader
        eyebrow="Shop Attyre"
        title="Browse the clothing catalog"
        description="Search by product name, filter by category, sort by price or newest arrivals, and quickly identify sale and stock status before opening the product details."
      />

      <div className="mt-8 space-y-8">
        <ShopControls
          categories={categories}
          selectedCategory={selectedCategory}
          searchQuery={searchQuery}
          sort={sort}
          totalProducts={totalProducts}
          filteredProducts={sortedProducts.length}
        />

        <ProductGrid products={sortedProducts} hasFilters={hasFilters} />
      </div>
    </PageContainer>
  );
}
