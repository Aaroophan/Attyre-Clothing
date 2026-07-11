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
    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        {eyebrow ? (
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-primary-darker">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="text-3xl font-bold tracking-tight text-dark md:text-4xl">
          {title}
        </h2>
        {description ? (
          <p className="mt-3 text-base leading-7 text-gray-600">{description}</p>
        ) : null}
      </div>

      {actionHref && actionLabel ? (
        <Link
          href={actionHref}
          className="inline-flex w-fit items-center justify-center rounded-full border border-primary/30 px-5 py-2 text-sm font-semibold text-primary-darker transition hover:border-primary hover:bg-primary/10"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
