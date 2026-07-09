import type { FacetEntry } from '../api/types';

interface FacetSectionProps {
  title: string;
  entries: FacetEntry[] | undefined;
  selected: string[];
  onToggle: (value: string) => void;
  isLoading: boolean;
  isError: boolean;
}

export default function FacetSection({
  title,
  entries,
  selected,
  onToggle,
  isLoading,
  isError,
}: FacetSectionProps) {
  // Selected values stay visible (and removable) even when they drop out of
  // the top-20 for the current result set.
  const entryValues = new Set((entries ?? []).map((e) => e.value));
  const pinned = selected
    .filter((value) => !entryValues.has(value))
    .map((value) => ({ value, count: 0 }));
  const rows = [...pinned, ...(entries ?? [])];

  return (
    <section>
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</h2>
      {isLoading ? (
        <div className="space-y-2" aria-label={`Loading ${title}`}>
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="h-7 animate-pulse rounded-md bg-slate-100" />
          ))}
        </div>
      ) : isError ? (
        <p className="text-sm text-red-600">Failed to load {title.toLowerCase()}.</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-slate-400">No {title.toLowerCase()} in the current results.</p>
      ) : (
        <ul className="space-y-0.5">
          {rows.map((entry) => {
            const isSelected = selected.includes(entry.value);
            return (
              <li key={entry.value}>
                <button
                  type="button"
                  onClick={() => onToggle(entry.value)}
                  aria-pressed={isSelected}
                  className={`flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors ${
                    isSelected
                      ? 'bg-indigo-50 font-medium text-indigo-700 hover:bg-indigo-100'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="flex min-w-0 items-center gap-1.5">
                    {isSelected && (
                      <svg
                        className="size-3.5 shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="m5 13 4 4L19 7" />
                      </svg>
                    )}
                    <span className="truncate">{entry.value}</span>
                  </span>
                  <span
                    className={`shrink-0 text-xs tabular-nums ${
                      isSelected ? 'text-indigo-500' : 'text-slate-400'
                    }`}
                  >
                    {entry.count}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
