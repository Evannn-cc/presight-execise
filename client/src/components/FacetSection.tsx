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
      <h2 className="mb-2 border-b border-line pb-1.5 font-display text-xs font-bold uppercase tracking-[0.12em] text-ink/70">
        {title}
      </h2>
      {isLoading ? (
        <div className="space-y-1.5" aria-label={`Loading ${title}`}>
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="h-7 animate-pulse rounded-[2px] bg-line/50" />
          ))}
        </div>
      ) : isError ? (
        <p className="text-sm text-ink/70">Couldn't load {title.toLowerCase()}.</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted">No {title.toLowerCase()} in the current results.</p>
      ) : (
        <ul>
          {rows.map((entry) => {
            const isSelected = selected.includes(entry.value);
            return (
              <li key={entry.value}>
                <button
                  type="button"
                  onClick={() => onToggle(entry.value)}
                  aria-pressed={isSelected}
                  className={`flex w-full items-center justify-between gap-2 border-l-2 px-2 py-1.5 text-left text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-cobalt ${
                    isSelected
                      ? 'border-cobalt bg-cobalt/[0.07] font-medium text-cobalt hover:bg-cobalt/[0.12]'
                      : 'border-transparent text-ink/85 hover:bg-ink/[0.04]'
                  }`}
                >
                  <span className="truncate">{entry.value}</span>
                  <span
                    className={`shrink-0 font-mono text-[11px] tabular-nums ${
                      isSelected ? 'text-cobalt/80' : 'text-muted'
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
