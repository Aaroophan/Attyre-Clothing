import Link from 'next/link';

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center shadow-sm">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-xl text-primary-darker">
        ∅
      </div>
      <h3 className="text-xl font-semibold text-dark">{title}</h3>
      {description ? (
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-600">
          {description}
        </p>
      ) : null}
      {actionHref && actionLabel ? (
        <Link href={actionHref} className="btn-primary mt-6 inline-flex">
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
