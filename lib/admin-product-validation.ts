import type { CreateProductInput } from '@/types/database';
import type { ObjectId } from 'mongodb';
import { findCategoryById } from '@/lib/db/categories';
import { toSlug } from '@/utils';

export interface ProductPayload {
  name?: unknown;
  slug?: unknown;
  description?: unknown;
  categoryId?: unknown;
  price?: unknown;
  salePrice?: unknown;
  imageUrl?: unknown;
  sizes?: unknown;
  colors?: unknown;
  stock?: unknown;
  sku?: unknown;
  featured?: unknown;
  active?: unknown;
}

export interface ProductValidationResult {
  input?: CreateProductInput;
  fieldErrors: Record<string, string>;
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function asBoolean(value: unknown): boolean {
  return value === true || value === 'true' || value === 'on';
}

function asNumber(value: unknown): number | null {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
}

function splitList(value: unknown): string[] {
  const rawItems = Array.isArray(value) ? value : asString(value).split(',');
  const unique = new Set<string>();

  for (const item of rawItems) {
    const text = asString(item).replace(/\s+/g, ' ');

    if (text) {
      unique.add(text);
    }
  }

  return Array.from(unique);
}

function normalizeSku(value: string): string | undefined {
  const normalized = value.trim().toUpperCase();
  return normalized || undefined;
}

function validateImageUrl(value: string): boolean {
  if (value.startsWith('/images/products/') && /\.(svg|png|jpg|jpeg|webp)$/i.test(value)) {
    return true;
  }

  try {
    const url = new URL(value);
    return url.protocol === 'https:' && Boolean(url.hostname);
  } catch {
    return false;
  }
}

function normalizeSalePrice(price: number, rawSalePrice: number | null, fieldErrors: Record<string, string>): number | undefined {
  if (rawSalePrice === null) {
    return undefined;
  }

  if (rawSalePrice < 0) {
    fieldErrors.salePrice = 'Sale price cannot be negative.';
    return undefined;
  }

  if (rawSalePrice >= price) {
    fieldErrors.salePrice = 'Sale price must be lower than the regular price.';
    return undefined;
  }

  return rawSalePrice;
}

function validateListField(fieldName: string, items: string[], fieldErrors: Record<string, string>) {
  if (items.length > 12) {
    fieldErrors[fieldName] = 'Use 12 or fewer values.';
    return;
  }

  if (items.some((item) => item.length > 30)) {
    fieldErrors[fieldName] = 'Each value must be 30 characters or fewer.';
  }
}

export async function validateProductPayload(payload: ProductPayload): Promise<ProductValidationResult> {
  const fieldErrors: Record<string, string> = {};
  const name = asString(payload.name).replace(/\s+/g, ' ');
  const description = asString(payload.description).replace(/\s+/g, ' ');
  const categoryId = asString(payload.categoryId);
  const rawSlug = asString(payload.slug);
  const price = asNumber(payload.price);
  const rawSalePrice = asNumber(payload.salePrice);
  const stock = asNumber(payload.stock);
  const imageUrl = asString(payload.imageUrl);
  const sizes = splitList(payload.sizes);
  const colors = splitList(payload.colors);
  const sku = normalizeSku(asString(payload.sku));
  const featured = asBoolean(payload.featured);
  const active = payload.active === undefined ? true : asBoolean(payload.active);

  if (!name) {
    fieldErrors.name = 'Product name is required.';
  } else if (name.length > 120) {
    fieldErrors.name = 'Product name must be 120 characters or fewer.';
  }

  if (!description) {
    fieldErrors.description = 'Product description is required.';
  } else if (description.length > 1200) {
    fieldErrors.description = 'Description must be 1200 characters or fewer.';
  }

  if (!categoryId) {
    fieldErrors.categoryId = 'Category is required.';
  }

  if (price === null) {
    fieldErrors.price = 'Price is required.';
  } else if (price <= 0) {
    fieldErrors.price = 'Price must be greater than 0.';
  } else if (price > 1000000) {
    fieldErrors.price = 'Price is too high for this catalog.';
  }

  if (stock === null) {
    fieldErrors.stock = 'Stock is required.';
  } else if (!Number.isInteger(stock) || stock < 0) {
    fieldErrors.stock = 'Stock must be a whole number of 0 or more.';
  } else if (stock > 100000) {
    fieldErrors.stock = 'Stock value is too high.';
  }

  if (!imageUrl) {
    fieldErrors.imageUrl = 'Product image URL is required.';
  } else if (imageUrl.length > 500 || !validateImageUrl(imageUrl)) {
    fieldErrors.imageUrl = 'Use a local product image path or a valid HTTPS image URL.';
  }

  if (sku && sku.length > 64) {
    fieldErrors.sku = 'SKU must be 64 characters or fewer.';
  }

  validateListField('sizes', sizes, fieldErrors);
  validateListField('colors', colors, fieldErrors);

  const category = categoryId ? await findCategoryById(categoryId) : null;

  if (categoryId && !category) {
    fieldErrors.categoryId = 'Selected category could not be found.';
  }

  if (category && !category.active) {
    fieldErrors.categoryId = 'Selected category is inactive.';
  }

  if (Object.keys(fieldErrors).length > 0 || price === null || stock === null || !category) {
    return { fieldErrors };
  }

  const salePrice = normalizeSalePrice(price, rawSalePrice, fieldErrors);

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  const slug = toSlug(rawSlug || name);

  if (!slug) {
    fieldErrors.slug = 'A valid slug could not be generated.';
    return { fieldErrors };
  }

  if (slug.length > 120) {
    fieldErrors.slug = 'Slug must be 120 characters or fewer.';
    return { fieldErrors };
  }

  return {
    fieldErrors,
    input: {
      name,
      slug,
      description,
      categoryId: category._id as ObjectId,
      categorySlug: category.slug,
      categoryName: category.name,
      price,
      salePrice,
      images: [imageUrl],
      sizes: sizes.length > 0 ? sizes : ['S', 'M', 'L', 'XL'],
      colors: colors.length > 0 ? colors : ['Black', 'White'],
      stock,
      featured,
      active,
      sku,
    },
  };
}
