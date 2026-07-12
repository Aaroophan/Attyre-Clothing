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

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[+\d][\d\s()-]{6,20}$/;

export function cleanText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export function normalizeEmail(value: unknown): string {
  return cleanText(value).toLowerCase();
}

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value);
}

export function isValidPhone(value: string): boolean {
  return PHONE_PATTERN.test(value);
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

function isStrongEnoughPassword(password: string): boolean {
  return /[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password);
}

export function validateRegisterInput(input: RegisterInput): Record<string, string> {
  const fieldErrors: Record<string, string> = {};

  if (!input.name) {
    fieldErrors.name = 'Name is required.';
  } else if (input.name.length > 80) {
    fieldErrors.name = 'Name must be 80 characters or fewer.';
  }

  if (!input.email) {
    fieldErrors.email = 'Email is required.';
  } else if (!isValidEmail(input.email)) {
    fieldErrors.email = 'Enter a valid email address.';
  } else if (input.email.length > 254) {
    fieldErrors.email = 'Email must be 254 characters or fewer.';
  }

  if (input.phone && !isValidPhone(input.phone)) {
    fieldErrors.phone = 'Enter a valid phone number.';
  }

  if (!input.password) {
    fieldErrors.password = 'Password is required.';
  } else if (input.password.length < 8) {
    fieldErrors.password = 'Password must be at least 8 characters.';
  } else if (input.password.length > 128) {
    fieldErrors.password = 'Password must be 128 characters or fewer.';
  } else if (!isStrongEnoughPassword(input.password)) {
    fieldErrors.password = 'Password must include uppercase, lowercase, and a number.';
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
  } else if (input.email.length > 254) {
    fieldErrors.email = 'Email must be 254 characters or fewer.';
  }

  if (!input.password) {
    fieldErrors.password = 'Password is required.';
  } else if (input.password.length > 128) {
    fieldErrors.password = 'Password is too long.';
  }

  return fieldErrors;
}
