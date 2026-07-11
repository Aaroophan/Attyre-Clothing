import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ProductGrid, ProductPurchasePanel, type ShopProductCardData } from '@/components/storefront';
import { PageContainer, SectionHeader } from '@/components/ui';
import { sampleCategories, sampleProducts } from '@/data/seed';
import { CURRENCY } from '@/lib/constants';
import { findProductBySlug, listProducts } from '@/lib/db';
import type { ProductDocument } from '@/types/database';
import { formatDate, formatPrice } from '@/utils';

export const dynamic = 'force-dynamic';

interface ProductDetailsView {
  id: string;
  name: string;
  slug: string;
  description: string;
  categorySlug: string;
  categoryName: string;
  image: string;
  price: number;
  salePrice?: number;
  sizes: string[];
  colors: string[];
  stock: number;
  sku?: string;
  createdAt: Date;
}

interface ProductDetailsData {
  product: ProductDetailsView;
  relatedProducts: ShopProductCardData[];
  usingFallbackData: boolean;
}

interface ProductDetailsPageProps {
  params: Promise<{ slug: string }>;
}

function productFromDocument(product: ProductDocument): ProductDetailsView {
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
    sizes: product.sizes,
    colors: product.colors,
    stock: product.stock,
    sku: product.sku,
    createdAt: product.createdAt,
  };
}

function relatedProductFromDocument(product: ProductDocument): ShopProductCardData {
  return {
    id: product._id.toString(),
    name: product.name,
    slug: product.slug,
    description: product.description,
    categoryName: product.categoryName,
    image: product.images[0] ?? '/images/products/classic-white-shirt.svg',
    price: product.price,
    salePrice: product.salePrice,
    stock: product.stock,
  };
}

function productFromSeed(product: (typeof sampleProducts)[number]): ProductDetailsView {
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
    sizes: product.sizes ?? [],
    colors: product.colors ?? [],
    stock: product.stock,
    sku: product.sku,
    createdAt: product.createdAt,
  };
}

function relatedProductFromSeed(product: (typeof sampleProducts)[number]): ShopProductCardData {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    categoryName: sampleCategories.find((category) => category.slug === product.category)?.name ?? product.category,
    image: product.images[0] ?? '/images/products/classic-white-shirt.svg',
    price: product.originalPrice ?? product.price,
    salePrice: product.originalPrice ? product.price : undefined,
    stock: product.stock,
  };
}

function getFallbackProductDetails(slug: string): ProductDetailsData | null {
  const seedProduct = sampleProducts.find((item) => item.slug === slug);

  if (!seedProduct) {
    return null;
  }

  const relatedProducts = sampleProducts
    .filter((item) => item.slug !== seedProduct.slug && item.category === seedProduct.category)
    .slice(0, 4)
    .map(relatedProductFromSeed);

  return {
    product: productFromSeed(seedProduct),
    relatedProducts,
    usingFallbackData: true,
  };
}

async function getProductDetails(slug: string): Promise<ProductDetailsData | null> {
  try {
    const productDocument = await findProductBySlug(slug);

    if (!productDocument) {
      return getFallbackProductDetails(slug);
    }

    const relatedProductDocuments = await listProducts({
      activeOnly: true,
      categorySlug: productDocument.categorySlug,
      limit: 5,
    });

    return {
      product: productFromDocument(productDocument),
      relatedProducts: relatedProductDocuments
        .filter((item) => item.slug !== productDocument.slug)
        .slice(0, 4)
        .map(relatedProductFromDocument),
      usingFallbackData: false,
    };
  } catch {
    return getFallbackProductDetails(slug);
  }
}

function getStockTone(stock: number): string {
  if (stock <= 0) {
    return 'border-red-200 bg-red-50 text-red-700';
  }

  if (stock <= 5) {
    return 'border-amber-200 bg-amber-50 text-amber-700';
  }

  return 'border-emerald-200 bg-emerald-50 text-emerald-700';
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

export async function generateMetadata({ params }: ProductDetailsPageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getProductDetails(slug);

  if (!data) {
    return {
      title: 'Product not found | Attyre',
    };
  }

  return {
    title: `${data.product.name} | Attyre`,
    description: data.product.description,
  };
}

export default async function ProductDetailsPage({ params }: ProductDetailsPageProps) {
  const { slug } = await params;
  const data = await getProductDetails(slug);

  if (!data) {
    notFound();
  }

  const { product, relatedProducts, usingFallbackData } = data;
  const displayPrice = product.salePrice ?? product.price;

  return (
    <PageContainer className="py-14">
      {usingFallbackData ? (
        <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
          This product page is using bundled seed data. Run <strong>npm run seed</strong> and check your MongoDB connection to load the live catalog.
        </div>
      ) : null}

      <nav className="mb-8 flex flex-wrap items-center gap-2 text-sm font-semibold text-gray-500" aria-label="Product breadcrumb">
        <Link href="/" className="transition hover:text-primary-darker">Home</Link>
        <span>/</span>
        <Link href="/shop" className="transition hover:text-primary-darker">Shop</Link>
        <span>/</span>
        <Link href={`/shop?category=${product.categorySlug}`} className="transition hover:text-primary-darker">
          {product.categoryName}
        </Link>
        <span>/</span>
        <span className="text-dark">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
        <div className="space-y-5">
          <div className="relative overflow-hidden rounded-[2rem] bg-gray-100 shadow-sm">
            <Image
              src={product.image}
              alt={`${product.name} product image`}
              width={820}
              height={980}
              className="h-[30rem] w-full object-cover md:h-[42rem]"
              priority
            />
            <div className="absolute left-5 top-5 flex flex-wrap gap-2">
              {product.salePrice ? (
                <span className="rounded-full bg-primary-darker px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-white shadow-sm">
                  Sale
                </span>
              ) : null}
              <span className={`rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.18em] shadow-sm ${getStockTone(product.stock)}`}>
                {getStockLabel(product.stock)}
              </span>
            </div>
          </div>

          <div className="grid gap-4 rounded-[1.75rem] border border-gray-100 bg-white p-5 shadow-sm sm:grid-cols-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-gray-400">Category</p>
              <p className="mt-1 font-bold text-dark">{product.categoryName}</p>
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-gray-400">SKU</p>
              <p className="mt-1 font-bold text-dark">{product.sku ?? 'Attyre item'}</p>
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-gray-400">Added</p>
              <p className="mt-1 font-bold text-dark">{formatDate(product.createdAt)}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[2rem] bg-white p-7 shadow-sm md:p-8">
            <p className="text-sm font-black uppercase tracking-[0.25em] text-primary-darker">
              {product.categoryName}
            </p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-dark md:text-5xl">
              {product.name}
            </h1>
            <p className="mt-5 text-base leading-8 text-gray-600">
              {product.description}
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3 border-y border-gray-100 py-5">
              <span className="text-3xl font-black text-primary-darker">
                {formatPrice(displayPrice, CURRENCY)}
              </span>
              {product.salePrice ? (
                <span className="text-lg font-semibold text-gray-400 line-through">
                  {formatPrice(product.price, CURRENCY)}
                </span>
              ) : null}
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-gray-50 p-4">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-gray-400">Available sizes</p>
                <p className="mt-2 font-semibold text-dark">{product.sizes.join(', ') || 'One size'}</p>
              </div>
              <div className="rounded-2xl bg-gray-50 p-4">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-gray-400">Available colors</p>
                <p className="mt-2 font-semibold text-dark">{product.colors.join(', ') || 'Standard'}</p>
              </div>
            </div>
          </div>

          <ProductPurchasePanel
            productId={product.id}
            name={product.name}
            slug={product.slug}
            image={product.image}
            price={product.price}
            salePrice={product.salePrice}
            stock={product.stock}
            sizes={product.sizes}
            colors={product.colors}
          />
        </div>
      </div>

      <section className="mt-16 grid gap-5 md:grid-cols-3">
        <div className="rounded-[1.5rem] border border-primary/10 bg-primary/5 p-6">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-primary-darker">Payment</p>
          <p className="mt-3 text-sm leading-6 text-gray-700">Cash on Delivery is supported for the RAD MVP checkout flow.</p>
        </div>
        <div className="rounded-[1.5rem] border border-primary/10 bg-primary/5 p-6">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-primary-darker">Stock aware</p>
          <p className="mt-3 text-sm leading-6 text-gray-700">Quantity controls prevent customers from selecting more than available stock.</p>
        </div>
        <div className="rounded-[1.5rem] border border-primary/10 bg-primary/5 p-6">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-primary-darker">Simple variants</p>
          <p className="mt-3 text-sm leading-6 text-gray-700">Size and color choices are intentionally simple for the small clothing-store scope.</p>
        </div>
      </section>

      {relatedProducts.length > 0 ? (
        <section className="mt-16">
          <SectionHeader
            eyebrow="Related styles"
            title="More from this category"
            description="Continue browsing similar products from the same Attyre category."
            actionLabel="View all products"
            actionHref="/shop"
          />
          <div className="mt-8">
            <ProductGrid products={relatedProducts} hasFilters={false} />
          </div>
        </section>
      ) : null}
    </PageContainer>
  );
}
