import { NextResponse } from 'next/server';
import { isAdminUser } from '@/lib/auth/admin';
import { getCurrentUser } from '@/lib/auth/session';
import type { UserDocument } from '@/types/database';

export const DEFAULT_JSON_BODY_LIMIT_BYTES = 64 * 1024;

export class RequestBodyError extends Error {
  status: number;
  fieldErrors?: Record<string, string>;

  constructor(message: string, status = 400, fieldErrors?: Record<string, string>) {
    super(message);
    this.name = 'RequestBodyError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

export function jsonError(
  message: string,
  status = 400,
  fieldErrors?: Record<string, string>,
) {
  return NextResponse.json(
    {
      ok: false,
      message,
      ...(fieldErrors ? { fieldErrors } : {}),
    },
    { status },
  );
}

export function jsonOk<T extends Record<string, unknown>>(body: T, status = 200) {
  return NextResponse.json({ ok: true, ...body }, { status });
}

export async function readJsonRequest<T = unknown>(
  request: Request,
  options: { maxBytes?: number; required?: boolean } = {},
): Promise<T> {
  const maxBytes = options.maxBytes ?? DEFAULT_JSON_BODY_LIMIT_BYTES;
  const contentType = request.headers.get('content-type') ?? '';
  const contentLength = Number(request.headers.get('content-length') ?? 0);

  if (contentLength > maxBytes) {
    throw new RequestBodyError('Request body is too large.', 413);
  }

  if (contentType && !contentType.toLowerCase().includes('application/json')) {
    throw new RequestBodyError('Request must use application/json.', 415);
  }

  const text = await request.text();

  if (!text.trim()) {
    if (options.required === false) {
      return {} as T;
    }

    throw new RequestBodyError('Request body is required.', 400);
  }

  if (Buffer.byteLength(text, 'utf8') > maxBytes) {
    throw new RequestBodyError('Request body is too large.', 413);
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new RequestBodyError('Invalid JSON request body.', 400);
  }
}

export function requestBodyErrorResponse(error: unknown) {
  if (error instanceof RequestBodyError) {
    return jsonError(error.message, error.status, error.fieldErrors);
  }

  return null;
}

export async function requireAdminApi(): Promise<{ user: UserDocument | null; response: NextResponse | null }> {
  const user = await getCurrentUser();

  if (!user) {
    return { user: null, response: jsonError('Login is required.', 401) };
  }

  if (!isAdminUser(user)) {
    return { user: null, response: jsonError('Admin access is required.', 403) };
  }

  return { user, response: null };
}

export function isConfigurationError(error: unknown): boolean {
  return error instanceof Error && error.message.toLowerCase().includes('must be configured');
}

export function safeLogError(label: string, error: unknown) {
  if (process.env.NODE_ENV !== 'production') {
    console.error(label, error);
    return;
  }

  console.error(label, error instanceof Error ? error.message : 'Unknown error');
}
