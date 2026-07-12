'use client';

import { useMemo, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toSlug } from '@/utils';

export interface AdminCategoryOption {
  id: string;
  name: string;
  slug: string;
}

export interface ProductFormInitialValues {
  id?: string;
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  price: string;
  salePrice: string;
  imageUrl: string;
  sizes: string;
  colors: string;
  stock: string;
  sku: string;
  featured: boolean;
  active: boolean;
}

interface ProductFormProps {
  mode: 'create' | 'edit';
  categories: AdminCategoryOption[];
  initialValues?: ProductFormInitialValues;
}

interface ProductMutationResponse {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
}

const emptyProductValues: ProductFormInitialValues = {
  name: '',
  slug: '',
  description: '',
  categoryId: '',
  price: '',
  salePrice: '',
  imageUrl: '/images/products/classic-white-shirt.svg',
  sizes: 'S, M, L, XL',
  colors: 'Black, White',
  stock: '10',
  sku: '',
  featured: false,
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

export function ProductForm({ mode, categories, initialValues }: ProductFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<ProductFormInitialValues>(initialValues ?? emptyProductValues);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  const submitLabel = mode === 'create' ? 'Create product' : 'Save changes';
  const pageDescription = mode === 'create'
    ? 'Add a new product to the Attyre storefront catalog.'
    : 'Update product details, pricing, stock, visibility, and storefront display settings.';

  const generatedSlug = useMemo(() => toSlug(values.name), [values.name]);

  function updateField(field: keyof ProductFormInitialValues, value: string | boolean) {
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

    const endpoint = mode === 'create' ? '/api/admin/products' : `/api/admin/products/${values.id}`;
    const method = mode === 'create' ? 'POST' : 'PUT';

    const response = await fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });

    const data = await response.json() as ProductMutationResponse;

    if (!response.ok || !data.ok) {
      setMessage(data.message ?? 'Product could not be saved.');
      setFieldErrors(data.fieldErrors ?? {});
      setSubmitting(false);
      return;
    }

    router.push(`/admin/products?${mode === 'create' ? 'created=1' : 'updated=1'}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6">
      <section className="card p-5 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-primary-darker">Product editor</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-dark md:text-4xl">
              {mode === 'create' ? 'Create product' : 'Edit product'}
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 md:text-base">{pageDescription}</p>
          </div>
          <Link href="/admin/products" className="btn-secondary w-full md:w-auto">Back to products</Link>
        </div>

        {message ? (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            {message}
          </div>
        ) : null}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem] xl:items-start">
        <div className="grid gap-6">
          <div className="card p-5 md:p-6">
            <h2 className="text-xl font-black text-dark">Basic information</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm font-black text-dark">Product name</span>
                <input
                  value={values.name}
                  onChange={(event) => updateField('name', event.target.value)}
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none transition focus:border-primary focus:ring-4 focus:ring-sky-100"
                  placeholder="Classic White Shirt"
                />
                <FieldError message={getError(fieldErrors, 'name')} />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-black text-dark">SKU</span>
                <input
                  value={values.sku}
                  onChange={(event) => updateField('sku', event.target.value)}
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold uppercase outline-none transition focus:border-primary focus:ring-4 focus:ring-sky-100"
                  placeholder="ATT-SHIRT-001"
                />
              </label>

              <div className="grid gap-2 md:col-span-2">
                <label className="text-sm font-black text-dark" htmlFor="product-slug">Slug</label>
                <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
                  <input
                    id="product-slug"
                    value={values.slug}
                    onChange={(event) => updateField('slug', event.target.value)}
                    className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none transition focus:border-primary focus:ring-4 focus:ring-sky-100"
                    placeholder={generatedSlug || 'classic-white-shirt'}
                  />
                  <button type="button" onClick={applyGeneratedSlug} className="btn-secondary w-full sm:w-auto">
                    Use generated slug
                  </button>
                </div>
                <FieldError message={getError(fieldErrors, 'slug')} />
              </div>

              <label className="grid gap-2 md:col-span-2">
                <span className="text-sm font-black text-dark">Description</span>
                <textarea
                  value={values.description}
                  onChange={(event) => updateField('description', event.target.value)}
                  rows={6}
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold leading-6 outline-none transition focus:border-primary focus:ring-4 focus:ring-sky-100"
                  placeholder="Describe material, fit, styling, and use case."
                />
                <FieldError message={getError(fieldErrors, 'description')} />
              </label>
            </div>
          </div>

          <div className="card p-5 md:p-6">
            <h2 className="text-xl font-black text-dark">Pricing, category, and inventory</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm font-black text-dark">Category</span>
                <select
                  value={values.categoryId}
                  onChange={(event) => updateField('categoryId', event.target.value)}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none transition focus:border-primary focus:ring-4 focus:ring-sky-100"
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
                <FieldError message={getError(fieldErrors, 'categoryId')} />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-black text-dark">Stock</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={values.stock}
                  onChange={(event) => updateField('stock', event.target.value)}
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none transition focus:border-primary focus:ring-4 focus:ring-sky-100"
                />
                <FieldError message={getError(fieldErrors, 'stock')} />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-black text-dark">Regular price</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={values.price}
                  onChange={(event) => updateField('price', event.target.value)}
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none transition focus:border-primary focus:ring-4 focus:ring-sky-100"
                  placeholder="4500"
                />
                <FieldError message={getError(fieldErrors, 'price')} />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-black text-dark">Sale price</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={values.salePrice}
                  onChange={(event) => updateField('salePrice', event.target.value)}
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none transition focus:border-primary focus:ring-4 focus:ring-sky-100"
                  placeholder="Optional"
                />
                <FieldError message={getError(fieldErrors, 'salePrice')} />
              </label>
            </div>
          </div>

          <div className="card p-5 md:p-6">
            <h2 className="text-xl font-black text-dark">Variants and image</h2>
            <div className="mt-5 grid gap-4">
              <label className="grid gap-2">
                <span className="text-sm font-black text-dark">Product image URL</span>
                <input
                  value={values.imageUrl}
                  onChange={(event) => updateField('imageUrl', event.target.value)}
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none transition focus:border-primary focus:ring-4 focus:ring-sky-100"
                  placeholder="/images/products/classic-white-shirt.svg"
                />
                <FieldError message={getError(fieldErrors, 'imageUrl')} />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-sm font-black text-dark">Sizes</span>
                  <input
                    value={values.sizes}
                    onChange={(event) => updateField('sizes', event.target.value)}
                    className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none transition focus:border-primary focus:ring-4 focus:ring-sky-100"
                    placeholder="S, M, L, XL"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-black text-dark">Colors</span>
                  <input
                    value={values.colors}
                    onChange={(event) => updateField('colors', event.target.value)}
                    className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none transition focus:border-primary focus:ring-4 focus:ring-sky-100"
                    placeholder="Black, White, Blue"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        <aside className="grid gap-6">
          <section className="card p-5 md:p-6">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-primary-darker">Visibility</p>
            <h2 className="mt-2 text-xl font-black text-dark">Storefront settings</h2>
            <div className="mt-5 grid gap-3">
              <label className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <input
                  type="checkbox"
                  checked={values.active}
                  onChange={(event) => updateField('active', event.target.checked)}
                  className="mt-1 h-4 w-4 accent-sky-600"
                />
                <span>
                  <span className="block text-sm font-black text-dark">Active product</span>
                  <span className="mt-1 block text-xs font-semibold leading-5 text-slate-500">Active products appear in the customer shop.</span>
                </span>
              </label>

              <label className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <input
                  type="checkbox"
                  checked={values.featured}
                  onChange={(event) => updateField('featured', event.target.checked)}
                  className="mt-1 h-4 w-4 accent-sky-600"
                />
                <span>
                  <span className="block text-sm font-black text-dark">Featured product</span>
                  <span className="mt-1 block text-xs font-semibold leading-5 text-slate-500">Featured products can appear on the homepage.</span>
                </span>
              </label>
            </div>
          </section>

          <section className="card p-5 md:p-6">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-primary-darker">Preview</p>
            <h2 className="mt-2 text-xl font-black text-dark">Quick summary</h2>
            <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm font-semibold leading-6 text-slate-600">
              <p><span className="font-black text-dark">Name:</span> {values.name || 'Untitled product'}</p>
              <p><span className="font-black text-dark">Slug:</span> {values.slug || generatedSlug || 'not-generated-yet'}</p>
              <p><span className="font-black text-dark">Stock:</span> {values.stock || '0'} units</p>
              <p><span className="font-black text-dark">Status:</span> {values.active ? 'Active' : 'Inactive'}</p>
            </div>
          </section>

          <button type="submit" disabled={submitting} className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60">
            {submitting ? 'Saving product...' : submitLabel}
          </button>
        </aside>
      </section>
    </form>
  );
}
