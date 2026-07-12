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
    <div className="bg-[#f6f8fb]">
      <section className="bg-gradient-to-br from-dark via-primary-darker to-slate-900 text-white">
        <PageContainer className="grid gap-10 py-12 md:py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="max-w-2xl">
            <p className="mb-3 text-xs font-black uppercase tracking-[0.28em] text-primary">
              Online clothing store
            </p>
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
              Build your everyday wardrobe with {SITE_NAME}.
            </h1>
            <p className="mt-5 text-base leading-8 text-slate-200 sm:text-lg">
              A clean clothing storefront for browsing menswear, womenswear, accessories, sale picks, and new arrivals with a simple Cash on Delivery shopping flow.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href="/shop" className="btn-primary bg-white text-primary-darker hover:bg-slate-100 hover:text-primary-darker">
                Shop collection
              </Link>
              <Link href="/shop?category=new-arrivals" className="btn-secondary border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white">
                View new arrivals
              </Link>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                ['12+', 'Seed products'],
                ['5', 'Categories'],
                ['COD', 'Checkout plan'],
              ].map(([value, label]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                  <p className="text-2xl font-black">{value}</p>
                  <p className="mt-1 text-[0.65rem] font-black uppercase tracking-[0.18em] text-white/70">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mx-auto w-full max-w-md rounded-[1.75rem] border border-white/10 bg-white/10 p-4 shadow-2xl backdrop-blur">
            <div className="rounded-[1.35rem] bg-white p-5 text-dark shadow-lg">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-primary-darker">Featured edit</p>
                  <p className="mt-2 text-xl font-black tracking-tight">{heroProduct?.name ?? 'Attyre starter catalog'}</p>
                </div>
                <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-primary-darker">New</span>
              </div>

              {heroProduct ? (
                <div className="mt-5 overflow-hidden rounded-3xl bg-slate-100">
                  <Image
                    src={heroProduct.image}
                    alt={`${heroProduct.name} storefront feature`}
                    width={520}
                    height={460}
                    className="aspect-[4/3] w-full object-cover"
                    priority
                  />
                </div>
              ) : (
                <div className="mt-5 rounded-3xl bg-sky-50 p-8 text-center text-sm font-semibold text-primary-darker">
                  Seed the database to show featured product imagery here.
                </div>
              )}

              <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-slate-500">Starting from</p>
                  <p className="text-2xl font-black text-primary-darker">
                    {heroProduct ? formatPrice(heroProduct.salePrice ?? heroProduct.price, CURRENCY) : formatPrice(0, CURRENCY)}
                  </p>
                </div>
                <Link href={heroProduct ? `/shop/${heroProduct.slug}` : '/shop'} className="btn-primary">
                  View product
                </Link>
              </div>
            </div>
          </div>
        </PageContainer>
      </section>

      <PageContainer className="section-space">
        {usingFallbackData ? (
          <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
            The homepage is using bundled preview data because the live catalog could not be loaded. Run <strong>npm run seed</strong> after configuring MongoDB to display database-backed products.
          </div>
        ) : null}

        <section className="mb-14 md:mb-16">
          <SectionHeader
            eyebrow="Browse by category"
            title="Shop by style lane"
            description="Attyre keeps the first storefront release focused on clear clothing categories, simple navigation, and quick shopping paths."
            actionLabel="View all products"
            actionHref="/shop"
          />

          {categories.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
            <EmptyState title="No categories yet" description="Categories will appear here after the store data is seeded." actionLabel="Go to shop" actionHref="/shop" />
          )}
        </section>

        <section className="mb-14 overflow-hidden rounded-[1.75rem] bg-dark text-white shadow-xl md:mb-16">
          <div className="grid gap-6 p-6 md:grid-cols-[1.15fr_0.85fr] md:items-center md:p-8 lg:p-10">
            <div>
              <p className="mb-3 text-xs font-black uppercase tracking-[0.24em] text-primary">Sale preview</p>
              <h2 className="text-2xl font-black tracking-tight sm:text-3xl md:text-4xl">Launch-ready sale section for budget-conscious shoppers.</h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/75 sm:text-base">
                Attyre includes sale-ready product data so the storefront can demonstrate discounts, original prices, and category-based shopping without adding payment gateway complexity yet.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link href="/shop?category=sale" className="btn-primary bg-white text-primary-darker hover:bg-slate-100 hover:text-primary-darker">Browse sale</Link>
                {salePreview ? <Link href={`/shop/${salePreview.slug}`} className="btn-secondary border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white">View {salePreview.name}</Link> : null}
              </div>
            </div>
            <div className="rounded-3xl bg-white/10 p-5">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-white/60">Example discount</p>
              <p className="mt-3 text-3xl font-black">{salePreview ? formatPrice(salePreview.salePrice ?? salePreview.price, CURRENCY) : 'Sale items'}</p>
              {salePreview?.salePrice ? <p className="mt-1 text-base text-white/60 line-through">{formatPrice(salePreview.price, CURRENCY)}</p> : null}
              <p className="mt-4 text-sm leading-6 text-white/70">{salePreview?.description ?? 'Seed sale products to show discounted launch items here.'}</p>
            </div>
          </div>
        </section>

        <section className="mb-14 md:mb-16">
          <SectionHeader
            eyebrow="Featured products"
            title="Selected pieces for the first release"
            description="A compact product set keeps the prototype understandable while still supporting the main shopping journey."
            actionLabel="Shop all"
            actionHref="/shop"
          />

          {featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
            <EmptyState title="No featured products yet" description="Featured products will appear here after the product catalog is seeded." actionLabel="Browse shop" actionHref="/shop" />
          )}
        </section>

        <section className="mb-14 md:mb-16">
          <SectionHeader
            eyebrow="Store benefits"
            title="Built for a simple SME clothing workflow"
            description="The landing page communicates the core business value while keeping the first application release focused and testable."
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {trustHighlights.map((highlight) => (
              <div key={highlight.title} className="card p-5">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-xl font-black text-primary-darker">✓</div>
                <h3 className="text-base font-black text-dark">{highlight.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{highlight.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="card p-6 md:p-8">
          <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="mb-2 text-xs font-black uppercase tracking-[0.24em] text-primary-darker">Ready for the next iteration</p>
              <h2 className="text-2xl font-black tracking-tight text-dark sm:text-3xl">Continue into the full shopping flow.</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                This storefront now gives the project a complete landing experience around the seeded catalog, product details, cart, and Cash on Delivery checkout path.
              </p>
            </div>
            <Link href="/shop" className="btn-primary">Start shopping</Link>
          </div>
        </section>
      </PageContainer>
    </div>
  );
}
