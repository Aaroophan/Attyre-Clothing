import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { CategoryForm, type CategoryFormInitialValues } from '@/components/admin/categories';
import { countProductsByCategory, findCategoryById, objectIdToString } from '@/lib/db';

export const dynamic = 'force-dynamic';

interface EditCategoryPageProps {
  params: Promise<{ id: string }>;
}

function toInitialValues(category: NonNullable<Awaited<ReturnType<typeof findCategoryById>>>): CategoryFormInitialValues {
  return {
    id: objectIdToString(category._id),
    name: category.name,
    slug: category.slug,
    description: category.description ?? '',
    active: category.active,
  };
}

export async function generateMetadata({ params }: EditCategoryPageProps): Promise<Metadata> {
  const { id } = await params;
  const category = await findCategoryById(id);

  return {
    title: category ? `Edit ${category.name}` : 'Edit Category',
    description: 'Edit a category in the protected Attyre admin area.',
  };
}

export default async function EditCategoryPage({ params }: EditCategoryPageProps) {
  const { id } = await params;
  const [category, productCount] = await Promise.all([
    findCategoryById(id),
    countProductsByCategory(id),
  ]);

  if (!category) {
    notFound();
  }

  return <CategoryForm mode="edit" initialValues={toInitialValues(category)} productCount={productCount} />;
}
