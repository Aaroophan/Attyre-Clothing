export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export function cleanText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export function normalizeEmail(value: unknown): string {
  return cleanText(value).toLowerCase();
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function normalizeRegisterInput(input: unknown): RegisterInput {
  const value = input && typeof input === 'object' ? input as Partial<RegisterInput> : {};

  return {
    name: cleanText(value.name),
    email: normalizeEmail(value.email),
    password: cleanText(value.password),
    confirmPassword: cleanText(value.confirmPassword),
    phone: cleanText(value.phone) || undefined,
  };
}

export function normalizeLoginInput(input: unknown): LoginInput {
  const value = input && typeof input === 'object' ? input as Partial<LoginInput> : {};

  return {
    email: normalizeEmail(value.email),
    password: cleanText(value.password),
  };
}

export function validateRegisterInput(input: RegisterInput): Record<string, string> {
  const fieldErrors: Record<string, string> = {};

  if (!input.name) {
    fieldErrors.name = 'Name is required.';
  }

  if (!input.email) {
    fieldErrors.email = 'Email is required.';
  } else if (!isValidEmail(input.email)) {
    fieldErrors.email = 'Enter a valid email address.';
  }

  if (!input.password) {
    fieldErrors.password = 'Password is required.';
  } else if (input.password.length < 8) {
    fieldErrors.password = 'Password must be at least 8 characters.';
  }

  if (!input.confirmPassword) {
    fieldErrors.confirmPassword = 'Please confirm your password.';
  } else if (input.password !== input.confirmPassword) {
    fieldErrors.confirmPassword = 'Passwords do not match.';
  }

  return fieldErrors;
}

export function validateLoginInput(input: LoginInput): Record<string, string> {
  const fieldErrors: Record<string, string> = {};

  if (!input.email) {
    fieldErrors.email = 'Email is required.';
  } else if (!isValidEmail(input.email)) {
    fieldErrors.email = 'Enter a valid email address.';
  }

  if (!input.password) {
    fieldErrors.password = 'Password is required.';
  }

  return fieldErrors;
}
