import Image from 'next/image';
import Link from 'next/link';
import { sampleCategories, sampleProducts } from '@/data/seed';
import { CURRENCY, SITE_NAME } from '@/lib/constants';
import { formatPrice } from '@/utils';
import { EmptyState, PageContainer, SectionHeader } from '@/components/ui';

export default function Home() {
  const featuredProducts = sampleProducts.slice(0, 3);

  return (
    <div>
      <section className="overflow-hidden bg-gradient-to-br from-primary-darker via-dark to-primary-darker text-white">
        <PageContainer className="grid gap-10 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-24">
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-primary">
              Online clothing store
            </p>
            <h1 className="max-w-3xl text-5xl font-black tracking-tight md:text-6xl">
              Modern everyday clothing from {SITE_NAME}.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-200">
              Discover curated menswear, womenswear, accessories, sale picks, and new arrivals with a simple Cash on Delivery shopping flow.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/shop" className="btn-primary bg-white text-primary-darker hover:bg-gray-100">
                Shop Collection
              </Link>
              <Link href="/shop?category=new-arrivals" className="btn-secondary bg-white/10 text-white hover:bg-white/20">
                View New Arrivals
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur">
            <div className="rounded-[1.5rem] bg-white p-6 text-dark shadow-xl">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary-darker">
                Store highlights
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {[
                  'Cash on Delivery',
                  'Curated Apparel',
                  'Responsive Storefront',
                  'SME Ready Workflow',
                ].map((item) => (
                  <div key={item} className="rounded-2xl bg-primary/10 p-4 text-sm font-semibold text-primary-darker">
                    {item}
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-2xl bg-gradient-to-br from-primary to-primary-darker p-6 text-white">
                <p className="text-3xl font-black">New season edits</p>
                <p className="mt-2 text-sm text-white/80">
                  Build your cart and place a simulated COD order in a few steps.
                </p>
              </div>
            </div>
          </div>
        </PageContainer>
      </section>

      <PageContainer className="py-16">
        <section className="mb-16">
          <SectionHeader
            eyebrow="Browse by category"
            title="Shop by style lane"
            description="Attyre keeps the first release focused on clear clothing categories, simple navigation, and quick shopping paths."
            actionLabel="View all products"
            actionHref="/shop"
          />

          {sampleCategories.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {sampleCategories.map((category) => (
                <Link
                  key={category.id}
                  href={`/shop?category=${category.slug}`}
                  className="card group p-6"
                >
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-lg font-black text-primary-darker transition group-hover:bg-primary group-hover:text-white">
                    {category.name.charAt(0)}
                  </div>
                  <h3 className="text-xl font-bold text-dark">{category.name}</h3>
                  <p className="mt-2 text-sm leading-6 text-gray-600">{category.description}</p>
                  <span className="mt-5 inline-flex text-sm font-semibold text-primary-darker">
                    Browse category →
                  </span>
                </Link>
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

        <section>
          <SectionHeader
            eyebrow="Featured products"
            title="Selected pieces for the first release"
            description="A compact product set keeps the prototype understandable while still supporting the main shopping journey."
            actionLabel="Shop all"
            actionHref="/shop"
          />

          {featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featuredProducts.map((product) => (
                <article key={product.id} className="card overflow-hidden">
                  <Link href={`/shop/${product.slug}`} className="block bg-gray-100">
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      width={400}
                      height={500}
                      className="h-72 w-full object-cover transition duration-300 hover:scale-105"
                    />
                  </Link>
                  <div className="p-5">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary-darker">
                      {product.category}
                    </p>
                    <h3 className="text-lg font-bold text-dark">
                      <Link href={`/shop/${product.slug}`} className="hover:text-primary-darker">
                        {product.name}
                      </Link>
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-600">
                      {product.description}
                    </p>
                    <div className="mt-5 flex items-center justify-between gap-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-lg font-black text-primary-darker">
                          {formatPrice(product.price, CURRENCY)}
                        </span>
                        {product.originalPrice ? (
                          <span className="text-sm text-gray-400 line-through">
                            {formatPrice(product.originalPrice, CURRENCY)}
                          </span>
                        ) : null}
                      </div>
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                        {product.stock > 0 ? 'In stock' : 'Out of stock'}
                      </span>
                    </div>
                  </div>
                </article>
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
      </PageContainer>
    </div>
  );
}
