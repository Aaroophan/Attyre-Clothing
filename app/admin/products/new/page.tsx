import type { Metadata } from 'next';
import { ProductForm, type AdminCategoryOption } from '@/components/admin/products';
import { listCategories, objectIdToString } from '@/lib/db';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Create Product',
  description: 'Create a new product in the protected Attyre admin area.',
};

function toCategoryOptions(categories: Awaited<ReturnType<typeof listCategories>>): AdminCategoryOption[] {
  return categories.map((category) => ({
    id: objectIdToString(category._id),
    name: category.name,
    slug: category.slug,
  }));
}

export default async function NewProductPage() {
  const categories = await listCategories({ activeOnly: true });

  return <ProductForm mode="create" categories={toCategoryOptions(categories)} />;
}
