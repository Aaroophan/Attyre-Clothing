'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, type ChangeEvent, type FormEvent } from 'react';
import type { AuthResponse } from '@/types/auth';

interface RegisterFormState {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

type FieldErrors = Partial<Record<keyof RegisterFormState | 'form', string>>;

const initialFormState: RegisterFormState = {
  name: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
};

function validateRegisterForm(form: RegisterFormState): FieldErrors {
  const errors: FieldErrors = {};

  if (!form.name.trim()) {
    errors.name = 'Name is required.';
  }

  if (!form.email.trim()) {
    errors.email = 'Email is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = 'Enter a valid email address.';
  }

  if (!form.password) {
    errors.password = 'Password is required.';
  } else if (form.password.length < 8) {
    errors.password = 'Password must be at least 8 characters.';
  }

  if (!form.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password.';
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  return errors;
}

function FieldError({ id, message }: { id: string; message?: string }) {
  return message ? <p id={id} className="mt-2 text-sm font-semibold text-red-600">{message}</p> : null;
}

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState<RegisterFormState>(initialFormState);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const nextUrl = searchParams.get('next') || '/account/orders';

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;

    setForm((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: undefined, form: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const clientErrors = validateRegisterForm(form);

    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      return;
    }

    setIsSubmitting(true);
    setFieldErrors({});

    try {
      const response = await globalThis.fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const result = await response.json() as AuthResponse;

      if (!result.ok) {
        setFieldErrors({
          ...result.fieldErrors,
          form: result.message,
        });
        return;
      }

      router.refresh();
      router.push(nextUrl.startsWith('/') ? nextUrl : '/account/orders');
    } catch {
      setFieldErrors({ form: 'Registration failed because the server could not be reached.' });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card mx-auto max-w-2xl p-5 md:p-7" noValidate>
      <p className="text-xs font-black uppercase tracking-[0.22em] text-primary-darker">Customer account</p>
      <h1 className="mt-2 text-3xl font-black tracking-tight text-dark md:text-4xl">Create your Attyre account</h1>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        Register with email and password to track Cash on Delivery orders from one place.
      </p>

      {fieldErrors.form ? (
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold leading-6 text-red-700">
          {fieldErrors.form}
        </div>
      ) : null}

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <label className="block md:col-span-2">
          <span className="text-sm font-black text-slate-700">Full name <span className="text-red-500">*</span></span>
          <input
            id="register-name"
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Aaroophan Varatharajan"
            autoComplete="name"
            required
            aria-invalid={Boolean(fieldErrors.name)}
            aria-describedby={fieldErrors.name ? 'register-name-error' : undefined}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-dark outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-sky-100"
          />
          <FieldError id="register-name-error" message={fieldErrors.name} />
        </label>

        <label className="block">
          <span className="text-sm font-black text-slate-700">Email <span className="text-red-500">*</span></span>
          <input
            id="register-email"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="customer@example.com"
            autoComplete="email"
            required
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? 'register-email-error' : undefined}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-dark outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-sky-100"
          />
          <FieldError id="register-email-error" message={fieldErrors.email} />
        </label>

        <label className="block">
          <span className="text-sm font-black text-slate-700">Phone</span>
          <input
            id="register-phone"
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="+94 76 000 0000"
            autoComplete="tel"
            aria-invalid={Boolean(fieldErrors.phone)}
            aria-describedby={fieldErrors.phone ? 'register-phone-error' : undefined}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-dark outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-sky-100"
          />
          <FieldError id="register-phone-error" message={fieldErrors.phone} />
        </label>

        <label className="block">
          <span className="text-sm font-black text-slate-700">Password <span className="text-red-500">*</span></span>
          <input
            id="register-password"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="At least 8 characters"
            autoComplete="new-password"
            required
            aria-invalid={Boolean(fieldErrors.password)}
            aria-describedby={fieldErrors.password ? 'register-password-error' : undefined}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-dark outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-sky-100"
          />
          <FieldError id="register-password-error" message={fieldErrors.password} />
        </label>

        <label className="block">
          <span className="text-sm font-black text-slate-700">Confirm password <span className="text-red-500">*</span></span>
          <input
            id="register-confirm-password"
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="Repeat your password"
            autoComplete="new-password"
            required
            aria-invalid={Boolean(fieldErrors.confirmPassword)}
            aria-describedby={fieldErrors.confirmPassword ? 'register-confirm-password-error' : undefined}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-dark outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-sky-100"
          />
          <FieldError id="register-confirm-password-error" message={fieldErrors.confirmPassword} />
        </label>
      </div>

      <button type="submit" disabled={isSubmitting} className="btn-primary mt-6 w-full disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none">
        {isSubmitting ? 'Creating account...' : 'Create account'}
      </button>

      <p className="mt-5 text-center text-sm font-semibold text-slate-600">
        Already registered?{' '}
        <Link href={`/login?next=${encodeURIComponent(nextUrl)}`} className="font-black text-primary-darker hover:text-primary">
          Log in
        </Link>
      </p>
    </form>
  );
}
