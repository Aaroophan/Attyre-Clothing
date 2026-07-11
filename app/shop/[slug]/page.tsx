import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PageContainer } from '@/components/ui';
import { sampleCategories, sampleProducts } from '@/data/seed';
import { findProductBySlug } from '@/lib/db';
import { CURRENCY } from '@/lib/constants';
import { formatPrice } from '@/utils';
import type { ProductDocument } from '@/types/database';

export const dynamic = 'force-dynamic';

interface ProductPreview {
  name: string;
  slug: string;
  description: string;
  categoryName: string;
  image: string;
  price: number;
  salePrice?: number;
  sizes: string[];
  colors: string[];
  stock: number;
}

function productFromDocument(product: ProductDocument): ProductPreview {
  return {
    name: product.name,
    slug: product.slug,
    description: product.description,
    categoryName: product.categoryName,
    image: product.images[0] ?? '/images/products/classic-white-shirt.svg',
    price: product.price,
    salePrice: product.salePrice,
    sizes: product.sizes,
    colors: product.colors,
    stock: product.stock,
  };
}

function fallbackProduct(slug: string): ProductPreview | null {
  const product = sampleProducts.find((item) => item.slug === slug);

  if (!product) {
    return null;
  }

  return {
    name: product.name,
    slug: product.slug,
    description: product.description,
    categoryName: sampleCategories.find((category) => category.slug === product.category)?.name ?? product.category,
    image: product.images[0] ?? '/images/products/classic-white-shirt.svg',
    price: product.originalPrice ?? product.price,
    salePrice: product.originalPrice ? product.price : undefined,
    sizes: product.sizes ?? [],
    colors: product.colors ?? [],
    stock: product.stock,
  };
}

async function getProduct(slug: string): Promise<ProductPreview | null> {
  try {
    const product = await findProductBySlug(slug);

    if (product) {
      return productFromDocument(product);
    }
  } catch {
    return fallbackProduct(slug);
  }

  return fallbackProduct(slug);
}

export default async function ProductPreviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  return (
    <PageContainer className="py-14">
      <Link href="/shop" className="mb-8 inline-flex text-sm font-semibold text-primary-darker hover:text-primary">
        ← Back to shop
      </Link>

      <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div className="overflow-hidden rounded-[2rem] bg-gray-100 shadow-sm">
          <Image
            src={product.image}
            alt={`${product.name} product preview`}
            width={720}
            height={840}
            className="h-[32rem] w-full object-cover"
            priority
          />
        </div>

        <div className="rounded-[2rem] bg-white p-8 shadow-sm">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-primary-darker">
            {product.categoryName}
          </p>
          <h1 className="text-4xl font-black tracking-tight text-dark md:text-5xl">
            {product.name}
          </h1>
          <p className="mt-5 text-base leading-8 text-gray-600">
            {product.description}
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <span className="text-3xl font-black text-primary-darker">
              {formatPrice(product.salePrice ?? product.price, CURRENCY)}
            </span>
            {product.salePrice ? (
              <span className="text-lg text-gray-400 line-through">
                {formatPrice(product.price, CURRENCY)}
              </span>
            ) : null}
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-gray-500">Sizes</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <span key={size} className="rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-dark">
                    {size}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-gray-500">Colors</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <span key={color} className="rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-dark">
                    {color}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-primary/10 bg-primary/5 p-5">
            <p className="font-bold text-primary-darker">
              {product.stock > 0 ? `${product.stock} units available` : 'Currently out of stock'}
            </p>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              Full size/color selection and add-to-cart behavior will be completed in Issue 07 and Issue 08.
            </p>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
