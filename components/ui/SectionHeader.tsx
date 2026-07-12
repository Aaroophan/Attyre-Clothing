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
    <div className="mb-10 flex flex-col gap-6 md:mb-12 md:flex-row md:items-end md:justify-between">
      <div className="flex-1">
        {eyebrow ? (
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-primary">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="text-3xl font-black tracking-tight text-dark sm:text-4xl">
          {title}
        </h2>
        {description ? (
          <p className="mt-4 max-w-2xl text-base leading-7 text-gray-600">
            {description}
          </p>
        ) : null}
      </div>

      {actionHref && actionLabel ? (
        <Link
          href={actionHref}
          className="inline-flex flex-shrink-0 items-center justify-center rounded-lg border border-primary/30 px-4 py-2 text-sm font-semibold text-primary-darker transition duration-200 hover:border-primary hover:bg-primary/10 active:bg-primary/20"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
