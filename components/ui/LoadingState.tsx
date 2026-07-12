interface LoadingStateProps {
  label?: string;
}

export function LoadingState({ label = 'Loading content...' }: LoadingStateProps) {
  return (
    <div className="flex min-h-40 items-center justify-center rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
      <div className="flex items-center gap-3 text-sm font-medium text-gray-600">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
        <span>{label}</span>
      </div>
    </div>
  );
}
