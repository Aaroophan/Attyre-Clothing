import type { Metadata } from 'next';
import Link from 'next/link';
import { ContactForm } from '@/components/contact';
import { PageContainer, SectionHeader } from '@/components/ui';
import { CURRENCY, DELIVERY_FEE, SITE_NAME } from '@/lib/constants';
import { formatPrice } from '@/utils';

export const metadata: Metadata = {
  title: 'Contact and Store Information',
  description: 'Contact Attyre support and view basic delivery, payment, and store information.',
};

const contactCards = [
  {
    title: 'Email support',
    value: 'hello@attyre.local',
    detail: 'Use this for product, order, and account questions.',
  },
  {
    title: 'Phone',
    value: '+94 76 850 5131',
    detail: 'Available for simulated store support during business hours.',
  },
  {
    title: 'Store base',
    value: 'Colombo, Sri Lanka',
    detail: 'Attyre is modelled as a Sri Lankan clothing SME.',
  },
];

const supportTopics = [
  'Order confirmation and Cash on Delivery questions',
  'Product size, colour, stock, and availability questions',
  'Delivery address corrections before fulfilment',
  'General store and customer account support',
];

const deliverySteps = [
  {
    title: '1. Place the order',
    description: 'Browse products, select size and colour, add items to cart, and complete checkout with delivery details.',
  },
  {
    title: '2. Admin reviews it',
    description: 'The business owner can see the order in the admin panel and update the status as it moves through fulfilment.',
  },
  {
    title: '3. Pay on delivery',
    description: 'Payment is collected when the order is delivered. No card payment gateway is connected in this project version.',
  },
];

export default function ContactPage() {
  return (
    <PageContainer as="main" className="section-space">
      <section className="overflow-hidden rounded-[2rem] border border-sky-100 bg-gradient-to-br from-white via-sky-50 to-white p-6 shadow-sm sm:p-8 lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-primary-darker">Customer support</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-black tracking-tight text-dark sm:text-5xl lg:text-6xl">
              Contact {SITE_NAME} for orders, delivery, and product support.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600">
              This page gives customers one clear place to find Attyre contact information, Cash on Delivery details, delivery notes, and basic support guidance.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <a href="#contact-form" className="btn-primary">
                Send a message
              </a>
              <a href="#delivery-payment" className="btn-secondary">
                Delivery and payment
              </a>
            </div>
          </div>

          <div className="grid gap-3">
            {contactCards.map((card) => (
              <div key={card.title} className="rounded-3xl border border-white bg-white/85 p-5 shadow-sm">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-primary-darker">{card.title}</p>
                <p className="mt-2 text-lg font-black text-dark">{card.value}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{card.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contact-form" className="mt-12 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div className="card p-5 sm:p-6 lg:p-8">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-primary-darker">Support scope</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-dark">How Attyre can help</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            The store is designed for a small-to-medium clothing business, so support is intentionally simple and focused on customer shopping, checkout, delivery, and order follow-up.
          </p>
          <ul className="mt-5 grid gap-3">
            {supportTopics.map((topic) => (
              <li key={topic} className="flex gap-3 rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-700">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                <span>{topic}</span>
              </li>
            ))}
          </ul>
        </div>

        <ContactForm />
      </section>

      <section id="delivery-payment" className="mt-14">
        <SectionHeader
          eyebrow="Delivery and payment"
          title="Cash on Delivery ordering, explained simply"
          description="Attyre currently supports a simulated checkout flow with Cash on Delivery only. This keeps the project focused on the complete order workflow without adding card payment gateways."
        />

        <div className="grid gap-5 md:grid-cols-3">
          {deliverySteps.map((step) => (
            <article key={step.title} className="card p-5 sm:p-6">
              <h3 className="text-lg font-black text-dark">{step.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{step.description}</p>
            </article>
          ))}
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-3xl border border-sky-100 bg-sky-50 p-5 sm:p-6">
            <h3 className="text-lg font-black text-primary-darker">Payment information</h3>
            <p className="mt-3 text-sm leading-7 text-slate-700">
              Attyre does not collect card payments in this version. Customers place orders through checkout and pay when the order is delivered.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
            <h3 className="text-lg font-black text-dark">Delivery information</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              The demo delivery fee is {formatPrice(DELIVERY_FEE, CURRENCY)}. Delivery details are collected during checkout and shown to the admin when processing orders.
            </p>
          </div>
        </div>
      </section>

      <section id="support" className="mt-14 rounded-[2rem] bg-dark p-6 text-white sm:p-8 lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-primary">Need help after checkout?</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Keep your order number ready.</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
              Customers should include their order number when asking about delivery, status changes, or address corrections. Registered customers can also view their own orders from the account area.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
            <Link href="/account/orders" className="btn-secondary bg-white text-dark">
              View my orders
            </Link>
            <Link href="/shop" className="btn-primary">
              Continue shopping
            </Link>
          </div>
        </div>
      </section>
    </PageContainer>
  );
}
