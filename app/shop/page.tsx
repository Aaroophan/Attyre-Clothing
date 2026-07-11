import { HomeProductCard } from '@/components/storefront';
import { EmptyState, PageContainer, SectionHeader } from '@/components/ui';
import { sampleCategories, sampleProducts } from '@/data/seed';
import { listCategories, listProducts } from '@/lib/db';
import type { ProductDocument } from '@/types/database';

export const dynamic = 'force-dynamic';

function productFromDocument(product: ProductDocument) {
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

function fallbackShopProducts() {
  return sampleProducts.map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    categoryName: sampleCategories.find((category) => category.slug === product.category)?.name ?? product.category,
    image: product.images[0] ?? '/images/products/classic-white-shirt.svg',
    price: product.originalPrice ?? product.price,
    salePrice: product.originalPrice ? product.price : undefined,
    stock: product.stock,
  }));
}

async function getShopPreviewProducts() {
  try {
    const products = await listProducts({ activeOnly: true, limit: 12 });
    await listCategories({ activeOnly: true });

    return {
      products: products.map(productFromDocument),
      usingFallbackData: false,
    };
  } catch {
    return {
      products: fallbackShopProducts(),
      usingFallbackData: true,
    };
  }
}

export default async function ShopPage() {
  const { products, usingFallbackData } = await getShopPreviewProducts();

  return (
    <PageContainer className="py-14">
      {usingFallbackData ? (
        <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
          The shop preview is using bundled seed data. Run <strong>npm run seed</strong> to load the MongoDB catalog.
        </div>
      ) : null}

      <SectionHeader
        eyebrow="Shop preview"
        title="Attyre product catalog"
        description="This preview keeps the navigation from the landing page complete. Search, filtering, and sorting will be expanded in Issue 06."
      />

      {products.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
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
          title="No products yet"
          description="Products will appear after running the seed script."
          actionLabel="Back to home"
          actionHref="/"
        />
      )}
    </PageContainer>
  );
}
