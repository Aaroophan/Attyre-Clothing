'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, type ChangeEvent, type FormEvent } from 'react';
import type { AuthResponse } from '@/types/auth';

interface LoginFormState {
  email: string;
  password: string;
}

type FieldErrors = Partial<Record<keyof LoginFormState | 'form', string>>;

const initialFormState: LoginFormState = {
  email: '',
  password: '',
};

function validateLoginForm(form: LoginFormState): FieldErrors {
  const errors: FieldErrors = {};

  if (!form.email.trim()) {
    errors.email = 'Email is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = 'Enter a valid email address.';
  }

  if (!form.password) {
    errors.password = 'Password is required.';
  }

  return errors;
}

function FieldError({ id, message }: { id: string; message?: string }) {
  return message ? <p id={id} className="mt-2 text-sm font-semibold text-red-600">{message}</p> : null;
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState<LoginFormState>(initialFormState);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const nextUrl = searchParams.get('next') || '/account/orders';
  const isAdminLogin = nextUrl.startsWith('/admin');

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;

    setForm((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: undefined, form: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const clientErrors = validateLoginForm(form);

    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      return;
    }

    setIsSubmitting(true);
    setFieldErrors({});

    try {
      const response = await globalThis.fetch('/api/auth/login', {
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
      setFieldErrors({ form: 'Login failed because the server could not be reached.' });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card mx-auto max-w-xl p-5 md:p-7" noValidate>
      <p className="text-xs font-black uppercase tracking-[0.22em] text-primary-darker">{isAdminLogin ? 'Admin login' : 'Account login'}</p>
      <h1 className="mt-2 text-3xl font-black tracking-tight text-dark md:text-4xl">{isAdminLogin ? 'Admin access' : 'Welcome back'}</h1>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        {isAdminLogin
          ? 'Log in with the seeded Attyre admin account to open the protected administration area.'
          : 'Log in to view your Attyre order history and keep checkout details connected to your account.'}
      </p>

      {fieldErrors.form ? (
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold leading-6 text-red-700">
          {fieldErrors.form}
        </div>
      ) : null}

      <div className="mt-6 space-y-5">
        <label className="block">
          <span className="text-sm font-black text-slate-700">Email <span className="text-red-500">*</span></span>
          <input
            id="login-email"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="customer@example.com"
            autoComplete="email"
            required
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? 'login-email-error' : undefined}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-dark outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-sky-100"
          />
          <FieldError id="login-email-error" message={fieldErrors.email} />
        </label>

        <label className="block">
          <span className="text-sm font-black text-slate-700">Password <span className="text-red-500">*</span></span>
          <input
            id="login-password"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Enter your password"
            autoComplete="current-password"
            required
            aria-invalid={Boolean(fieldErrors.password)}
            aria-describedby={fieldErrors.password ? 'login-password-error' : undefined}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-dark outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-sky-100"
          />
          <FieldError id="login-password-error" message={fieldErrors.password} />
        </label>
      </div>

      <button type="submit" disabled={isSubmitting} className="btn-primary mt-6 w-full disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none">
        {isSubmitting ? 'Logging in...' : 'Log in'}
      </button>

      <p className="mt-5 text-center text-sm font-semibold text-slate-600">
        {isAdminLogin ? 'Need a customer account?' : 'New to Attyre?'}{' '}
        <Link href={`/register?next=${encodeURIComponent(nextUrl)}`} className="font-black text-primary-darker hover:text-primary">
          Create an account
        </Link>
      </p>
    </form>
  );
}
