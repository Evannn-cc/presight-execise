interface EmptyStateProps {
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

export default function EmptyState({ hasActiveFilters, onClearFilters }: EmptyStateProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-4 py-16 text-center">
      <div className="text-4xl" aria-hidden>
        🔍
      </div>
      <h2 className="text-lg font-semibold text-slate-900">No users found</h2>
      <p className="max-w-sm text-sm text-slate-500">
        {hasActiveFilters
          ? 'No users match the current search and filters. Try removing some filters.'
          : 'The directory is empty.'}
      </p>
      {hasActiveFilters && (
        <button
          type="button"
          onClick={onClearFilters}
          className="mt-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
        >
          Clear all filters
        </button>
      )}
    </div>
  );
}
