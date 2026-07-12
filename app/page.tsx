import Image from 'next/image';
import Link from 'next/link';
import { CategoryPreviewCard, HomeProductCard } from '@/components/storefront';
import { EmptyState, PageContainer, SectionHeader } from '@/components/ui';
import { sampleCategories, sampleProducts } from '@/data/seed';
import { listCategories, listProducts } from '@/lib/db';
import { CURRENCY, SITE_NAME } from '@/lib/constants';
import { formatPrice } from '@/utils';
import type { CategoryDocument, ProductDocument } from '@/types/database';

export const dynamic = 'force-dynamic';

interface HomeCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  productCount?: number;
}

interface HomeProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  categoryName: string;
  categorySlug: string;
  image: string;
  price: number;
  salePrice?: number;
  stock: number;
}

function fromCategoryDocument(category: CategoryDocument, productCount?: number): HomeCategory {
  return {
    id: category._id.toString(),
    name: category.name,
    slug: category.slug,
    description: category.description,
    productCount,
  };
}

function fromProductDocument(product: ProductDocument): HomeProduct {
  return {
    id: product._id.toString(),
    name: product.name,
    slug: product.slug,
    description: product.description,
    categoryName: product.categoryName,
    categorySlug: product.categorySlug,
    image: product.images[0] ?? '/images/products/classic-white-shirt.svg',
    price: product.price,
    salePrice: product.salePrice,
    stock: product.stock,
  };
}

function sampleCategoryProductCount(slug: string): number {
  return sampleProducts.filter((product) => product.category === slug).length;
}

function fallbackCategories(): HomeCategory[] {
  return sampleCategories.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    productCount: sampleCategoryProductCount(category.slug),
  }));
}

function fallbackProducts(): HomeProduct[] {
  return sampleProducts
    .filter((product) => product.stock > 0)
    .slice(0, 6)
    .map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      categoryName: fallbackCategories().find((category) => category.slug === product.category)?.name ?? product.category,
      categorySlug: product.category,
      image: product.images[0] ?? '/images/products/classic-white-shirt.svg',
      price: product.originalPrice ?? product.price,
      salePrice: product.originalPrice ? product.price : undefined,
      stock: product.stock,
    }));
}

async function getHomeData(): Promise<{
  categories: HomeCategory[];
  featuredProducts: HomeProduct[];
  saleProducts: HomeProduct[];
  usingFallbackData: boolean;
}> {
  try {
    const [categoryDocuments, featuredDocuments, saleDocuments, allActiveProducts] = await Promise.all([
      listCategories({ activeOnly: true }),
      listProducts({ activeOnly: true, featuredOnly: true, limit: 6 }),
      listProducts({ activeOnly: true, categorySlug: 'sale', limit: 3 }),
      listProducts({ activeOnly: true }),
    ]);

    const productCounts = allActiveProducts.reduce<Record<string, number>>((counts, product) => {
      counts[product.categorySlug] = (counts[product.categorySlug] ?? 0) + 1;
      return counts;
    }, {});

    return {
      categories: categoryDocuments.map((category) => fromCategoryDocument(category, productCounts[category.slug] ?? 0)),
      featuredProducts: featuredDocuments.map(fromProductDocument),
      saleProducts: saleDocuments.map(fromProductDocument),
      usingFallbackData: false,
    };
  } catch {
    return {
      categories: fallbackCategories(),
      featuredProducts: fallbackProducts(),
      saleProducts: fallbackProducts().filter((product) => product.salePrice).slice(0, 3),
      usingFallbackData: true,
    };
  }
}

const trustHighlights = [
  {
    title: 'Cash on Delivery',
    description: 'Keep checkout simple for the first release with COD-focused ordering.',
  },
  {
    title: 'Curated clothing catalog',
    description: 'A small but realistic starter catalog keeps browsing clear and testable.',
  },
  {
    title: 'SME-ready workflow',
    description: 'Product, stock, category, and order data are structured for later admin work.',
  },
  {
    title: 'Responsive storefront',
    description: 'The landing page is designed for desktop, tablet, and mobile evidence screenshots.',
  },
];

export default async function Home() {
  const { categories, featuredProducts, saleProducts, usingFallbackData } = await getHomeData();
  const heroProduct = featuredProducts[0];
  const salePreview = saleProducts[0];

  return (
    <div className="bg-[#f7fbfd]">
      <section className="overflow-hidden bg-gradient-to-br from-primary-darker via-dark to-primary-darker text-white">
        <PageContainer className="grid gap-8 py-12 sm:gap-12 sm:py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-24">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-primary">
              Online clothing store
            </p>
            <h1 className="max-w-3xl text-4xl font-black tracking-tight sm:text-5xl md:text-6xl">
              Build your everyday wardrobe with {SITE_NAME}.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 sm:text-lg sm:leading-8 text-gray-200">
              Shop curated menswear, womenswear, accessories, sale picks, and new arrivals through a clean storefront designed for small-to-medium clothing businesses.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row">
              <Link href="/shop" className="btn-primary bg-white text-primary-darker hover:bg-gray-100">
                Shop Collection
              </Link>
              <Link href="/shop?category=new-arrivals" className="btn-secondary bg-white/10 text-white hover:bg-white/20">
                View New Arrivals
              </Link>
            </div>
            <div className="mt-8 grid gap-3 sm:gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-white/10 bg-white/10 p-3 sm:p-4 backdrop-blur">
                <p className="text-xl sm:text-2xl font-black">12+</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-white/70">Seed products</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/10 p-3 sm:p-4 backdrop-blur">
                <p className="text-xl sm:text-2xl font-black">5</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-white/70">Categories</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/10 p-3 sm:p-4 backdrop-blur">
                <p className="text-xl sm:text-2xl font-black">COD</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-white/70">Checkout plan</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/10 p-4 shadow-2xl backdrop-blur sm:p-6">
            <div className="rounded-xl bg-white p-4 text-dark shadow-xl sm:rounded-2xl sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-primary-darker">
                    Featured edit
                  </p>
                  <p className="mt-2 text-lg sm:text-2xl font-black tracking-tight line-clamp-2">
                    {heroProduct?.name ?? 'Attyre starter catalog'}
                  </p>
                </div>
                <span className="flex-shrink-0 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary-darker">
                  New
                </span>
              </div>

              {heroProduct ? (
                <div className="mt-4 overflow-hidden rounded-xl bg-gray-100 sm:mt-6 sm:rounded-2xl">
                  <Image
                    src={heroProduct.image}
                    alt={`${heroProduct.name} storefront feature`}
                    width={560}
                    height={640}
                    className="h-64 w-full object-cover sm:h-80"
                    priority
                  />
                </div>
              ) : (
                <div className="mt-4 rounded-xl bg-primary/10 p-6 text-center text-xs sm:text-sm font-semibold text-primary-darker sm:mt-6 sm:rounded-2xl sm:p-8">
                  Seed the database to show featured product imagery here.
                </div>
              )}

              <div className="mt-4 flex flex-col gap-4 sm:mt-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-500">Starting from</p>
                  <p className="text-2xl font-black text-primary-darker">
                    {heroProduct ? formatPrice(heroProduct.salePrice ?? heroProduct.price, CURRENCY) : formatPrice(0, CURRENCY)}
                  </p>
                </div>
                <Link href={heroProduct ? `/shop/${heroProduct.slug}` : '/shop'} className="btn-primary inline-flex justify-center">
                  View Product
                </Link>
              </div>
            </div>
          </div>
        </PageContainer>
      </section>

      <PageContainer className="py-12 sm:py-16 md:py-20">
        {usingFallbackData ? (
          <div className="mb-8 rounded-lg border border-amber-200 bg-amber-50 p-4 text-xs sm:text-sm leading-6 text-amber-900 sm:mb-10 sm:rounded-xl sm:p-5 md:mb-12">
            The homepage is using bundled preview data because the live catalog could not be loaded. Run <strong>npm run seed</strong> after configuring MongoDB to display database-backed products.
          </div>
        ) : null}

        <section className="mb-12 sm:mb-16 md:mb-20">
          <SectionHeader
            eyebrow="Browse by category"
            title="Shop by style lane"
            description="Attyre keeps the first storefront release focused on clear clothing categories, simple navigation, and quick shopping paths."
            actionLabel="View all products"
            actionHref="/shop"
          />

          {categories.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3 md:gap-6">
              {categories.map((category) => (
                <CategoryPreviewCard
                  key={category.id}
                  name={category.name}
                  slug={category.slug}
                  description={category.description}
                  productCount={category.productCount}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No categories yet"
              description="Categories will appear here after the store data is seeded."
              actionLabel="Go to shop"
              actionHref="/shop"
            />
          )}
        </section>

        <section className="mb-12 overflow-hidden rounded-xl sm:rounded-2xl md:rounded-3xl bg-dark text-white shadow-xl md:mb-20">
          <div className="grid gap-6 p-6 sm:gap-8 sm:p-8 md:gap-10 md:grid-cols-[1.1fr_0.9fr] md:items-center md:p-10 lg:p-12">
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-primary">
                Sale preview
              </p>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight md:text-4xl">
                Launch-ready sale section for budget-conscious shoppers.
              </h2>
              <p className="mt-3 sm:mt-4 max-w-2xl text-sm sm:text-base leading-7 text-white/75">
                Attyre includes sale-ready product data so the storefront can demonstrate discounts, original prices, and category-based shopping without adding payment gateway complexity yet.
              </p>
              <div className="mt-5 sm:mt-7 flex flex-col gap-3 sm:flex-row">
                <Link href="/shop?category=sale" className="btn-primary bg-white text-primary-darker hover:bg-gray-100">
                  Browse Sale
                </Link>
                {salePreview ? (
                  <Link href={`/shop/${salePreview.slug}`} className="btn-secondary bg-white/10 text-white hover:bg-white/20">
                    View {salePreview.name}
                  </Link>
                ) : null}
              </div>
            </div>
            <div className="rounded-2xl bg-white/10 p-5 sm:p-6 md:rounded-3xl">
              <p className="text-xs font-bold uppercase tracking-wider text-white/60">
                Example discount
              </p>
              <p className="mt-4 text-3xl sm:text-4xl font-black">
                {salePreview ? formatPrice(salePreview.salePrice ?? salePreview.price, CURRENCY) : 'Sale items'}
              </p>
              {salePreview?.salePrice ? (
                <p className="mt-2 text-base sm:text-lg text-white/60 line-through">
                  {formatPrice(salePreview.price, CURRENCY)}
                </p>
              ) : null}
              <p className="mt-3 sm:mt-4 text-sm leading-6 text-white/70">
                {salePreview?.description ?? 'Seed sale products to show discounted launch items here.'}
              </p>
            </div>
          </div>
        </section>

        <section className="mb-12 sm:mb-16 md:mb-20">
          <SectionHeader
            eyebrow="Featured products"
            title="Selected pieces for the first release"
            description="A compact product set keeps the prototype understandable while still supporting the main shopping journey."
            actionLabel="Shop all"
            actionHref="/shop"
          />

          {featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3 md:gap-6">
              {featuredProducts.map((product) => (
                <HomeProductCard
                  key={product.id}
                  name={product.name}
                  slug={product.slug}
                  description={product.description}
                  categoryName={product.categoryName}
                  image={product.image}
                  price={product.price}
                  salePrice={product.salePrice}
                  stock={product.stock}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No featured products yet"
              description="Featured products will appear here after the product catalog is seeded."
              actionLabel="Browse shop"
              actionHref="/shop"
            />
          )}
        </section>

        <section className="mb-12 sm:mb-16 md:mb-20">
          <SectionHeader
            eyebrow="Store benefits"
            title="Built for a simple SME clothing workflow"
            description="The landing page communicates the core business value while keeping the first application release focused and testable."
          />
          <div className="grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-4 md:gap-6">
            {trustHighlights.map((highlight) => (
              <div key={highlight.title} className="card p-6">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-xl font-black text-primary-darker">
                  ✓
                </div>
                <h3 className="text-lg font-bold text-dark">{highlight.title}</h3>
                <p className="mt-2 text-sm leading-6 text-gray-600">{highlight.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl sm:rounded-2xl md:rounded-3xl border border-primary/10 bg-white p-6 shadow-sm sm:p-8 md:p-10">
          <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center md:gap-8">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-primary-darker">
                Ready for the next iteration
              </p>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-dark">
                Continue into the full shopping flow.
              </h2>
              <p className="mt-3 max-w-2xl text-sm sm:text-base leading-7 text-gray-600">
                This storefront now gives the project a complete landing experience. The next issues can connect the shop page, product details, cart, and Cash on Delivery checkout around the seeded catalog.
              </p>
            </div>
            <Link href="/shop" className="btn-primary inline-flex justify-center flex-shrink-0">
              Start Shopping
            </Link>
          </div>
        </section>
      </PageContainer>
    </div>
  );
}
