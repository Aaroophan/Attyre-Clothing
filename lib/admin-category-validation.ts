import type { CreateCategoryInput } from '@/types/database';
import { toSlug } from '@/utils';

export interface CategoryPayload {
  name?: unknown;
  slug?: unknown;
  description?: unknown;
  active?: unknown;
}

export interface CategoryValidationResult {
  input?: CreateCategoryInput;
  fieldErrors: Record<string, string>;
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function asBoolean(value: unknown): boolean {
  return value === true || value === 'true' || value === 'on';
}

export function validateCategoryPayload(payload: CategoryPayload): CategoryValidationResult {
  const fieldErrors: Record<string, string> = {};
  const name = asString(payload.name);
  const rawSlug = asString(payload.slug);
  const description = asString(payload.description);
  const active = payload.active === undefined ? true : asBoolean(payload.active);

  if (!name) {
    fieldErrors.name = 'Category name is required.';
  }

  if (name.length > 80) {
    fieldErrors.name = 'Category name must be 80 characters or fewer.';
  }

  if (description.length > 220) {
    fieldErrors.description = 'Description must be 220 characters or fewer.';
  }

  const slug = toSlug(rawSlug || name);

  if (!slug) {
    fieldErrors.slug = 'A valid slug could not be generated.';
  }

  if (slug.length > 90) {
    fieldErrors.slug = 'Slug must be 90 characters or fewer.';
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  return {
    fieldErrors,
    input: {
      name,
      slug,
      description: description || undefined,
      active,
    },
  };
}
