import { SORT_FIELDS, type SortDir, type SortField } from '../api/types';

const FIELD_LABELS: Record<SortField, string> = {
  first_name: 'First name',
  last_name: 'Last name',
  age: 'Age',
  nationality: 'Nationality',
};

interface SortControlsProps {
  sortBy: SortField;
  sortDir: SortDir;
  onChange: (sortBy: SortField, sortDir: SortDir) => void;
}

export default function SortControls({ sortBy, sortDir, onChange }: SortControlsProps) {
  return (
    <div className="flex shrink-0 items-center gap-2">
      <label
        htmlFor="sort-field"
        className="hidden font-mono text-[11px] uppercase tracking-[0.08em] text-muted sm:inline"
      >
        Sort
      </label>
      <select
        id="sort-field"
        value={sortBy}
        onChange={(e) => onChange(e.target.value as SortField, sortDir)}
        className="rounded-[3px] border border-ink/25 bg-white py-2 pl-3 pr-8 text-sm text-ink focus:border-cobalt focus:outline-none focus:ring-2 focus:ring-cobalt/25"
      >
        {SORT_FIELDS.map((field) => (
          <option key={field} value={field}>
            {FIELD_LABELS[field]}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={() => onChange(sortBy, sortDir === 'asc' ? 'desc' : 'asc')}
        aria-label={`Sort ${sortDir === 'asc' ? 'ascending' : 'descending'}; click to reverse`}
        title={sortDir === 'asc' ? 'Ascending' : 'Descending'}
        className="rounded-[3px] border border-ink/25 bg-white p-2 text-ink/70 hover:bg-paper focus:border-cobalt focus:outline-none focus:ring-2 focus:ring-cobalt/25"
      >
        <svg
          className="size-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          {sortDir === 'asc' ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 6h12M3 12h9M3 18h6m9 2V4m0 16 3-3m-3 3-3-3"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 6h6M3 12h9M3 18h12m3-14v16m0-16 3 3m-3-3-3 3"
            />
          )}
        </svg>
      </button>
    </div>
  );
}
