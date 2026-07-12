'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { EmptyState, LoadingState } from '@/components/ui';
import { useCart } from '@/components/cart/CartProvider';
import { CURRENCY } from '@/lib/constants';
import type { CheckoutCustomerInput, CheckoutOrderResponse } from '@/types/checkout';
import type { PublicUser } from '@/types/auth';
import { formatPrice } from '@/utils';

interface CheckoutFormState extends CheckoutCustomerInput {
  agreeToCod: boolean;
}

type FieldErrors = Partial<Record<keyof CheckoutFormState | 'items' | 'form', string>>;

const initialFormState: CheckoutFormState = {
  name: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  district: '',
  note: '',
  agreeToCod: true,
};

function validateCheckoutForm(form: CheckoutFormState): FieldErrors {
  const errors: FieldErrors = {};

  if (!form.name.trim()) {
    errors.name = 'Name is required.';
  }

  if (!form.email.trim()) {
    errors.email = 'Email is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = 'Enter a valid email address.';
  }

  if (!form.phone.trim()) {
    errors.phone = 'Phone number is required.';
  } else if (!/^[+\d][\d\s()-]{6,20}$/.test(form.phone.trim())) {
    errors.phone = 'Enter a valid phone number.';
  }

  if (!form.address.trim()) {
    errors.address = 'Delivery address is required.';
  }

  if (!form.city.trim()) {
    errors.city = 'City is required.';
  }

  if (!form.district.trim()) {
    errors.district = 'District is required.';
  }

  if (!form.agreeToCod) {
    errors.agreeToCod = 'Please confirm that Cash on Delivery will be used.';
  }

  return errors;
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) {
    return null;
  }

  return <p id={id} className="mt-2 text-sm font-semibold text-red-600">{message}</p>;
}

function TextInput({
  label,
  name,
  value,
  error,
  onChange,
  type = 'text',
  placeholder,
  required = true,
}: {
  label: string;
  name: keyof CheckoutFormState;
  value: string;
  error?: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  const fieldId = `checkout-${String(name)}`;
  const errorId = `${fieldId}-error`;

  return (
    <label className="block" htmlFor={fieldId}>
      <span className="text-sm font-black text-slate-700">{label}{required ? <span className="text-red-500"> *</span> : null}</span>
      <input
        id={fieldId}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-dark outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-sky-100"
      />
      <FieldError id={errorId} message={error} />
    </label>
  );
}

function TextArea({
  label,
  name,
  value,
  error,
  onChange,
  placeholder,
  required = true,
}: {
  label: string;
  name: keyof CheckoutFormState;
  value: string;
  error?: string;
  onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  required?: boolean;
}) {
  const fieldId = `checkout-${String(name)}`;
  const errorId = `${fieldId}-error`;

  return (
    <label className="block" htmlFor={fieldId}>
      <span className="text-sm font-black text-slate-700">{label}{required ? <span className="text-red-500"> *</span> : null}</span>
      <textarea
        id={fieldId}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={4}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-dark outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-sky-100"
      />
      <FieldError id={errorId} message={error} />
    </label>
  );
}

export function CheckoutPageClient() {
  const router = useRouter();
  const { clearCart, isReady, items, totals } = useCart();
  const [form, setForm] = useState<CheckoutFormState>(initialFormState);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadCurrentUser() {
      try {
        const response = await globalThis.fetch('/api/auth/me', { cache: 'no-store' });
        const result = await response.json() as { user: PublicUser | null };

        const user = result.user;

        if (!isMounted || !user) {
          return;
        }

        setForm((current) => ({
          ...current,
          name: current.name || user.name,
          email: current.email || user.email,
          phone: current.phone || user.phone || '',
        }));
      } catch {
        // Guest checkout remains available if the current-user request fails.
      }
    }

    void loadCurrentUser();

    return () => {
      isMounted = false;
    };
  }, []);

  const checkoutItems = useMemo(() => items.map((item) => ({
    productId: item.productId,
    size: item.size,
    color: item.color,
    quantity: item.quantity,
  })), [items]);

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value, type, checked } = event.target;
    const nextValue = type === 'checkbox' ? checked : value;

    setForm((current) => ({ ...current, [name]: nextValue }));
    setFieldErrors((current) => ({ ...current, [name]: undefined, form: undefined }));
  }

  function handleTextAreaChange(event: ChangeEvent<HTMLTextAreaElement>) {
    const { name, value } = event.target;

    setForm((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: undefined, form: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const clientErrors = validateCheckoutForm(form);

    if (items.length === 0) {
      clientErrors.items = 'Your cart is empty.';
    }

    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      return;
    }

    setIsSubmitting(true);
    setFieldErrors({});

    try {
      const response = await globalThis.fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerInfo: {
            name: form.name,
            email: form.email,
            phone: form.phone,
            address: form.address,
            city: form.city,
            district: form.district,
            note: form.note,
          },
          items: checkoutItems,
        }),
      });

      const result = await response.json() as CheckoutOrderResponse;

      if (!result.ok) {
        setFieldErrors({
          ...result.fieldErrors,
          form: result.message,
        });
        return;
      }

      clearCart();
      router.push(`/order-success/${result.orderNumber}`);
    } catch {
      setFieldErrors({
        form: 'Checkout failed because the server could not be reached. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isReady) {
    return <LoadingState label="Preparing checkout..." />;
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title="Your cart is empty"
        description="Add at least one product before opening the Cash on Delivery checkout."
        actionLabel="Continue shopping"
        actionHref="/shop"
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start" noValidate>
      <section className="card p-5 md:p-7" aria-labelledby="checkout-delivery-title">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-primary-darker">Delivery details</p>
        <h2 id="checkout-delivery-title" className="mt-2 text-2xl font-black tracking-tight text-dark">Where should we deliver?</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Enter customer and delivery details. Payment will be collected at delivery.
        </p>

        {fieldErrors.form ? (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold leading-6 text-red-700">
            {fieldErrors.form}
          </div>
        ) : null}

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <TextInput label="Full name" name="name" value={form.name} error={fieldErrors.name} onChange={handleInputChange} placeholder="Aaroophan Varatharajan" />
          <TextInput label="Email" name="email" type="email" value={form.email} error={fieldErrors.email} onChange={handleInputChange} placeholder="customer@example.com" />
          <TextInput label="Phone" name="phone" type="tel" value={form.phone} error={fieldErrors.phone} onChange={handleInputChange} placeholder="+94 76 000 0000" />
          <TextInput label="City" name="city" value={form.city} error={fieldErrors.city} onChange={handleInputChange} placeholder="Colombo" />
          <TextInput label="District" name="district" value={form.district} error={fieldErrors.district} onChange={handleInputChange} placeholder="Colombo" />
          <div className="md:col-span-2">
            <TextArea label="Delivery address" name="address" value={form.address} error={fieldErrors.address} onChange={handleTextAreaChange} placeholder="Street address, apartment, landmark" />
          </div>
          <div className="md:col-span-2">
            <TextArea label="Order note" name="note" value={form.note ?? ''} error={fieldErrors.note} onChange={handleTextAreaChange} placeholder="Optional delivery instructions" required={false} />
          </div>
        </div>
      </section>

      <aside className="space-y-5 lg:sticky lg:top-6">
        <section className="card p-5 md:p-6" aria-labelledby="checkout-summary-title">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-primary-darker">Order summary</p>
          <h2 id="checkout-summary-title" className="mt-2 text-2xl font-black text-dark">Cash on Delivery</h2>

          <div className="mt-5 space-y-4">
            {items.map((item) => (
              <div key={`${item.productId}-${item.size}-${item.color}`} className="flex gap-3 border-b border-slate-100 pb-4 last:border-b-0 last:pb-0">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-slate-100">
                  <Image src={item.image} alt={`${item.name} checkout item image`} fill sizes="64px" className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-black text-dark">{item.name}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    {item.size ? `Size ${item.size}` : 'One size'} · {item.color ?? 'Standard'} · Qty {item.quantity}
                  </p>
                  <p className="mt-1 text-sm font-black text-primary-darker">{formatPrice(item.unitPrice * item.quantity, CURRENCY)}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 space-y-3 border-t border-slate-100 pt-5 text-sm font-semibold text-slate-700">
            <div className="flex justify-between gap-4"><span>Items</span><span>{totals.itemCount}</span></div>
            <div className="flex justify-between gap-4"><span>Subtotal</span><span>{formatPrice(totals.subtotal, CURRENCY)}</span></div>
            <div className="flex justify-between gap-4"><span>Delivery fee</span><span>{formatPrice(totals.deliveryFee, CURRENCY)}</span></div>
            <div className="flex justify-between gap-4 border-t border-slate-100 pt-4 text-base font-black text-dark">
              <span>Total</span><span className="text-primary-darker">{formatPrice(totals.total, CURRENCY)}</span>
            </div>
          </div>
        </section>

        <section className="card p-5 md:p-6" aria-labelledby="checkout-payment-title">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-primary-darker">Payment method</p>
          <h2 id="checkout-payment-title" className="mt-2 text-xl font-black text-dark">Cash on Delivery only</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            No card payment is collected in this RAD MVP. The customer pays when the order is delivered.
          </p>

          <label className="mt-5 flex gap-3 rounded-2xl border border-sky-100 bg-sky-50 p-4 text-sm font-semibold text-primary-darker">
            <input
              id="checkout-agree-to-cod"
              type="checkbox"
              name="agreeToCod"
              checked={form.agreeToCod}
              onChange={handleInputChange}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-primary-darker"
              required
              aria-invalid={Boolean(fieldErrors.agreeToCod)}
              aria-describedby={fieldErrors.agreeToCod ? 'checkout-agree-to-cod-error' : undefined}
            />
            <span>I understand this order will use Cash on Delivery.</span>
          </label>
          <FieldError id="checkout-agree-to-cod-error" message={fieldErrors.agreeToCod} />
          <FieldError id="checkout-items-error" message={fieldErrors.items} />

          <button type="submit" disabled={isSubmitting} className="btn-primary mt-5 w-full disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none">
            {isSubmitting ? 'Placing order...' : 'Place Cash on Delivery order'}
          </button>
        </section>
      </aside>
    </form>
  );
}
