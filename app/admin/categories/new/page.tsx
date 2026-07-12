import type { Metadata } from 'next';
import { CategoryForm } from '@/components/admin/categories';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Create Category',
  description: 'Create a new category in the protected Attyre admin area.',
};

export default function NewCategoryPage() {
  return <CategoryForm mode="create" />;
}
