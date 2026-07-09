interface ActiveFilterChipsProps {
  hobbies: string[];
  nationalities: string[];
  onRemoveHobby: (hobby: string) => void;
  onRemoveNationality: (nationality: string) => void;
  onClearAll: () => void;
}

function Chip({ label, kind, onRemove }: { label: string; kind: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 py-1 pl-3 pr-1.5 text-xs font-medium text-indigo-800">
      {label}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${kind} filter: ${label}`}
        className="rounded-full p-0.5 hover:bg-indigo-200"
      >
        <svg
          className="size-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
        </svg>
      </button>
    </span>
  );
}

export default function ActiveFilterChips({
  hobbies,
  nationalities,
  onRemoveHobby,
  onRemoveNationality,
  onClearAll,
}: ActiveFilterChipsProps) {
  if (hobbies.length === 0 && nationalities.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {nationalities.map((n) => (
        <Chip key={`n-${n}`} label={n} kind="nationality" onRemove={() => onRemoveNationality(n)} />
      ))}
      {hobbies.map((h) => (
        <Chip key={`h-${h}`} label={h} kind="hobby" onRemove={() => onRemoveHobby(h)} />
      ))}
      <button
        type="button"
        onClick={onClearAll}
        className="ml-1 text-xs font-medium text-slate-500 underline-offset-2 hover:text-slate-700 hover:underline"
      >
        Clear all
      </button>
    </div>
  );
}
