interface ActiveFilterChipsProps {
  hobbies: string[];
  nationalities: string[];
  onRemoveHobby: (hobby: string) => void;
  onRemoveNationality: (nationality: string) => void;
  onClearAll: () => void;
}

function Chip({ label, kind, onRemove }: { label: string; kind: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-[2px] border border-cobalt/50 bg-cobalt/[0.06] py-0.5 pl-2 pr-1 font-mono text-[11px] uppercase tracking-[0.06em] text-cobalt">
      {label}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${kind} filter: ${label}`}
        className="rounded-[2px] p-0.5 hover:bg-cobalt/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cobalt"
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
        className="ml-1 text-xs text-muted underline decoration-line underline-offset-2 hover:text-ink"
      >
        Clear all
      </button>
    </div>
  );
}
