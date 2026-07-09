import { useEffect, useState } from 'react';
import { useDebouncedCallback } from '../hooks/useDebouncedCallback';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchInput({ value, onChange }: SearchInputProps) {
  const [draft, setDraft] = useState(value);
  const debouncedChange = useDebouncedCallback(onChange, 300);

  // Keep the input in sync when the URL changes from elsewhere (clear all, back/forward).
  useEffect(() => {
    setDraft(value);
  }, [value]);

  return (
    <div className="relative flex-1">
      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
        <svg
          className="size-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m21 21-4.35-4.35M17 11a6 6 0 1 1-12 0 6 6 0 0 1 12 0Z"
          />
        </svg>
      </span>
      <input
        type="search"
        value={draft}
        onChange={(e) => {
          setDraft(e.target.value);
          debouncedChange(e.target.value);
        }}
        placeholder="Search by first or last name…"
        aria-label="Search users by first or last name"
        className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
      />
    </div>
  );
}
