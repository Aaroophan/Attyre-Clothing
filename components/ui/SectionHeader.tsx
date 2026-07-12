import Link from 'next/link';

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  actionLabel,
  actionHref,
}: SectionHeaderProps) {
  return (
    <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        {eyebrow ? (
          <p className="mb-2 text-xs font-black uppercase tracking-[0.24em] text-primary-darker">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="text-2xl font-black tracking-tight text-dark sm:text-3xl md:text-4xl">
          {title}
        </h2>
        {description ? (
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">{description}</p>
        ) : null}
      </div>

      {actionHref && actionLabel ? (
        <Link href={actionHref} className="btn-secondary w-fit">
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
