import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ProductForm, type AdminCategoryOption, type ProductFormInitialValues } from '@/components/admin/products';
import { findProductById, listCategories, objectIdToString } from '@/lib/db';

export const dynamic = 'force-dynamic';

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

function toCategoryOptions(categories: Awaited<ReturnType<typeof listCategories>>): AdminCategoryOption[] {
  return categories.map((category) => ({
    id: objectIdToString(category._id),
    name: category.name,
    slug: category.slug,
  }));
}

function toInitialValues(product: NonNullable<Awaited<ReturnType<typeof findProductById>>>): ProductFormInitialValues {
  return {
    id: objectIdToString(product._id),
    name: product.name,
    slug: product.slug,
    description: product.description,
    categoryId: objectIdToString(product.categoryId),
    price: product.price.toString(),
    salePrice: product.salePrice?.toString() ?? '',
    imageUrl: product.images[0] ?? '',
    sizes: product.sizes.join(', '),
    colors: product.colors.join(', '),
    stock: product.stock.toString(),
    sku: product.sku ?? '',
    featured: product.featured,
    active: product.active,
  };
}

export async function generateMetadata({ params }: EditProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await findProductById(id);

  return {
    title: product ? `Edit ${product.name}` : 'Edit Product',
    description: 'Edit a product in the protected Attyre admin area.',
  };
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    findProductById(id),
    listCategories({ activeOnly: true }),
  ]);

  if (!product) {
    notFound();
  }

  return <ProductForm mode="edit" categories={toCategoryOptions(categories)} initialValues={toInitialValues(product)} />;
}
