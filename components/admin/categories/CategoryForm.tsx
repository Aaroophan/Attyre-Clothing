'use client';

import { useMemo, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toSlug } from '@/utils';

export interface CategoryFormInitialValues {
  id?: string;
  name: string;
  slug: string;
  description: string;
  active: boolean;
}

interface CategoryFormProps {
  mode: 'create' | 'edit';
  initialValues?: CategoryFormInitialValues;
  productCount?: number;
}

interface CategoryMutationResponse {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
}

const emptyCategoryValues: CategoryFormInitialValues = {
  name: '',
  slug: '',
  description: '',
  active: true,
};

function getError(fieldErrors: Record<string, string>, field: string): string | undefined {
  return fieldErrors[field];
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="mt-1 text-xs font-bold text-red-600">{message}</p>;
}

export function CategoryForm({ mode, initialValues, productCount = 0 }: CategoryFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<CategoryFormInitialValues>(initialValues ?? emptyCategoryValues);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const generatedSlug = useMemo(() => toSlug(values.name), [values.name]);
  const submitLabel = mode === 'create' ? 'Create category' : 'Save category';

  function updateField(field: keyof CategoryFormInitialValues, value: string | boolean) {
    setValues((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => {
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  function applyGeneratedSlug() {
    updateField('slug', generatedSlug);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage('');
    setFieldErrors({});

    const endpoint = mode === 'create' ? '/api/admin/categories' : `/api/admin/categories/${values.id}`;
    const method = mode === 'create' ? 'POST' : 'PUT';

    const response = await fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });

    const data = await response.json() as CategoryMutationResponse;

    if (!response.ok || !data.ok) {
      setMessage(data.message ?? 'Category could not be saved.');
      setFieldErrors(data.fieldErrors ?? {});
      setSubmitting(false);
      return;
    }

    router.push(`/admin/categories?${mode === 'create' ? 'created=1' : 'updated=1'}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6">
      <section className="card p-5 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-primary-darker">Category editor</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-dark md:text-4xl">
              {mode === 'create' ? 'Create category' : 'Edit category'}
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 md:text-base">
              {mode === 'create'
                ? 'Add a storefront category for grouping clothing products and supporting customer filters.'
                : 'Update the category name, slug, storefront description, and active visibility.'}
            </p>
          </div>
          <Link href="/admin/categories" className="btn-secondary w-full md:w-auto">Back to categories</Link>
        </div>

        {message ? (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            {message}
          </div>
        ) : null}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem] xl:items-start">
        <div className="card p-5 md:p-6">
          <h2 className="text-xl font-black text-dark">Category details</h2>
          <div className="mt-5 grid gap-4">
            <label className="grid gap-2">
              <span className="text-sm font-black text-dark">Category name</span>
              <input
                value={values.name}
                onChange={(event) => updateField('name', event.target.value)}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none transition focus:border-primary focus:ring-4 focus:ring-sky-100"
                placeholder="Men"
              />
              <FieldError message={getError(fieldErrors, 'name')} />
            </label>

            <div className="grid gap-2">
              <label className="text-sm font-black text-dark" htmlFor="category-slug">Slug</label>
              <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
                <input
                  id="category-slug"
                  value={values.slug}
                  onChange={(event) => updateField('slug', event.target.value)}
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none transition focus:border-primary focus:ring-4 focus:ring-sky-100"
                  placeholder={generatedSlug || 'men'}
                />
                <button type="button" onClick={applyGeneratedSlug} className="btn-secondary w-full sm:w-auto">
                  Use generated slug
                </button>
              </div>
              <FieldError message={getError(fieldErrors, 'slug')} />
            </div>

            <label className="grid gap-2">
              <span className="text-sm font-black text-dark">Description</span>
              <textarea
                value={values.description}
                onChange={(event) => updateField('description', event.target.value)}
                rows={5}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold leading-6 outline-none transition focus:border-primary focus:ring-4 focus:ring-sky-100"
                placeholder="Short customer-facing explanation for this category."
              />
              <FieldError message={getError(fieldErrors, 'description')} />
            </label>
          </div>
        </div>

        <aside className="grid gap-6">
          <div className="card p-5 md:p-6">
            <h2 className="text-xl font-black text-dark">Visibility</h2>
            <label className="mt-5 flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <input
                type="checkbox"
                checked={values.active}
                onChange={(event) => updateField('active', event.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
              />
              <span>
                <span className="block text-sm font-black text-dark">Active category</span>
                <span className="mt-1 block text-xs font-semibold leading-5 text-slate-500">
                  Active categories appear in admin product forms and customer shop filters.
                </span>
              </span>
            </label>
          </div>

          {mode === 'edit' ? (
            <div className="card p-5 md:p-6">
              <h2 className="text-xl font-black text-dark">Usage</h2>
              <p className="mt-3 text-4xl font-black text-primary-darker">{productCount}</p>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                product{productCount === 1 ? '' : 's'} currently reference this category. Editing the name or slug updates those product records so filters continue to work.
              </p>
            </div>
          ) : null}

          <div className="card p-5 md:p-6">
            <button type="submit" disabled={submitting} className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60">
              {submitting ? 'Saving...' : submitLabel}
            </button>
            <Link href="/admin/categories" className="btn-secondary mt-3 w-full">Cancel</Link>
          </div>
        </aside>
      </section>
    </form>
  );
}
