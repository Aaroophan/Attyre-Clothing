import Link from 'next/link';
import type { ReactNode } from 'react';
import { cn } from '@/utils';

interface DashboardCardProps {
  title: string;
  value: string;
  description: string;
  href?: string;
  tone?: 'default' | 'sky' | 'amber' | 'emerald' | 'red';
  icon?: ReactNode;
}

const toneClasses: Record<NonNullable<DashboardCardProps['tone']>, string> = {
  default: 'border-slate-200 bg-white',
  sky: 'border-sky-100 bg-sky-50/70',
  amber: 'border-amber-100 bg-amber-50/70',
  emerald: 'border-emerald-100 bg-emerald-50/70',
  red: 'border-red-100 bg-red-50/70',
};

const iconToneClasses: Record<NonNullable<DashboardCardProps['tone']>, string> = {
  default: 'border-slate-200 bg-slate-50 text-slate-700',
  sky: 'border-sky-200 bg-white text-primary-darker',
  amber: 'border-amber-200 bg-white text-amber-700',
  emerald: 'border-emerald-200 bg-white text-emerald-700',
  red: 'border-red-200 bg-white text-red-700',
};

export function DashboardCard({
  title,
  value,
  description,
  href,
  tone = 'default',
  icon,
}: DashboardCardProps) {
  const content = (
    <article
      className={cn(
        'rounded-[1.4rem] border p-5 shadow-sm transition md:p-6',
        toneClasses[tone],
        href && 'hover:-translate-y-0.5 hover:shadow-lg',
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">{title}</p>
          <p className="mt-3 text-3xl font-black tracking-tight text-dark md:text-3xl">{value}</p>
        </div>
        {icon ? (
          <div className={cn('rounded-xl border p-2', iconToneClasses[tone])} aria-hidden="true">
            {icon}
          </div>
        ) : null}
      </div>
      <p className="mt-4 text-sm font-semibold leading-6 text-slate-600">{description}</p>
      {href ? <span className="mt-4 inline-flex text-sm font-black text-primary-darker">View details →</span> : null}
    </article>
  );

  if (!href) {
    return content;
  }

  return (
    <Link href={href} className="block focus:outline-none focus:ring-4 focus:ring-sky-100">
      {content}
    </Link>
  );
}
