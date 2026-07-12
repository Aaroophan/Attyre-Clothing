'use client';

import { FormEvent, useState } from 'react';

interface ContactFormValues {
  name: string;
  email: string;
  subject: string;
  message: string;
}

type ContactFormErrors = Partial<Record<keyof ContactFormValues, string>>;

const initialValues: ContactFormValues = {
  name: '',
  email: '',
  subject: '',
  message: '',
};

function validateContactForm(values: ContactFormValues): ContactFormErrors {
  const errors: ContactFormErrors = {};
  const trimmedEmail = values.email.trim();

  if (!values.name.trim()) {
    errors.name = 'Please enter your name.';
  }

  if (!trimmedEmail) {
    errors.email = 'Please enter your email address.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!values.subject.trim()) {
    errors.subject = 'Please enter a subject.';
  }

  if (!values.message.trim()) {
    errors.message = 'Please enter your message.';
  } else if (values.message.trim().length < 10) {
    errors.message = 'Please add a little more detail to your message.';
  }

  return errors;
}

export function ContactForm() {
  const [values, setValues] = useState<ContactFormValues>(initialValues);
  const [errors, setErrors] = useState<ContactFormErrors>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  function updateValue(field: keyof ContactFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setIsSubmitted(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateContactForm(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setIsSubmitted(false);
      return;
    }

    setIsSubmitted(true);
    setValues(initialValues);
  }

  return (
    <form onSubmit={handleSubmit} className="card p-5 sm:p-6 lg:p-8" noValidate>
      <div className="mb-6">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-primary-darker">Contact form</p>
        <h2 className="mt-2 text-2xl font-black tracking-tight text-dark">Send Attyre a message</h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          This form is simulated for the assignment build. It validates input and shows a confirmation message without sending email.
        </p>
      </div>

      {isSubmitted ? (
        <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800" role="status">
          Your message has been received. Attyre support will contact you using the provided email address.
        </div>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold text-slate-700">
          Name
          <input
            type="text"
            value={values.name}
            onChange={(event) => updateValue('name', event.target.value)}
            className="min-h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-dark outline-none transition focus:border-primary focus:ring-4 focus:ring-sky-100"
            placeholder="Your name"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? 'contact-name-error' : undefined}
          />
          {errors.name ? <span id="contact-name-error" className="text-xs font-bold text-red-600">{errors.name}</span> : null}
        </label>

        <label className="grid gap-2 text-sm font-bold text-slate-700">
          Email
          <input
            type="email"
            value={values.email}
            onChange={(event) => updateValue('email', event.target.value)}
            className="min-h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-dark outline-none transition focus:border-primary focus:ring-4 focus:ring-sky-100"
            placeholder="you@example.com"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'contact-email-error' : undefined}
          />
          {errors.email ? <span id="contact-email-error" className="text-xs font-bold text-red-600">{errors.email}</span> : null}
        </label>
      </div>

      <label className="mt-5 grid gap-2 text-sm font-bold text-slate-700">
        Subject
        <input
          type="text"
          value={values.subject}
          onChange={(event) => updateValue('subject', event.target.value)}
          className="min-h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-dark outline-none transition focus:border-primary focus:ring-4 focus:ring-sky-100"
          placeholder="Order question, delivery question, product support..."
          aria-invalid={Boolean(errors.subject)}
          aria-describedby={errors.subject ? 'contact-subject-error' : undefined}
        />
        {errors.subject ? <span id="contact-subject-error" className="text-xs font-bold text-red-600">{errors.subject}</span> : null}
      </label>

      <label className="mt-5 grid gap-2 text-sm font-bold text-slate-700">
        Message
        <textarea
          value={values.message}
          onChange={(event) => updateValue('message', event.target.value)}
          rows={6}
          className="resize-y rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-dark outline-none transition focus:border-primary focus:ring-4 focus:ring-sky-100"
          placeholder="Tell us how we can help. Include your order number if this is about an existing order."
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? 'contact-message-error' : undefined}
        />
        {errors.message ? <span id="contact-message-error" className="text-xs font-bold text-red-600">{errors.message}</span> : null}
      </label>

      <button type="submit" className="btn-primary mt-6 w-full sm:w-auto">
        Send message
      </button>
    </form>
  );
}
