interface EmptyStateProps {
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

export default function EmptyState({ hasActiveFilters, onClearFilters }: EmptyStateProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-4 py-16 text-center">
      <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">0 records</div>
      <h2 className="font-display text-lg font-bold text-ink">No matching records</h2>
      <p className="max-w-sm text-sm text-muted">
        {hasActiveFilters
          ? 'Nothing matches this combination of search and filters. Remove a filter or check the spelling.'
          : 'The directory is empty.'}
      </p>
      {hasActiveFilters && (
        <button
          type="button"
          onClick={onClearFilters}
          className="mt-1 rounded-[3px] bg-cobalt px-4 py-2 text-sm font-medium text-white hover:bg-cobalt/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cobalt"
        >
          Clear all filters
        </button>
      )}
    </div>
  );
}
