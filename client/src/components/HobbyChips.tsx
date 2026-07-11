const VISIBLE_COUNT = 2;

export default function HobbyChips({ hobbies }: { hobbies: string[] }) {
  if (hobbies.length === 0) return null;

  const visible = hobbies.slice(0, VISIBLE_COUNT);
  const remaining = hobbies.length - visible.length;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {visible.map((hobby) => (
        <span
          key={hobby}
          className="rounded-[2px] border border-line bg-white px-2 py-0.5 text-xs text-ink/80"
        >
          {hobby}
        </span>
      ))}
      {remaining > 0 && (
        <span
          className="rounded-[2px] bg-paper px-1.5 py-0.5 font-mono text-[11px] text-muted"
          title={hobbies.slice(VISIBLE_COUNT).join(', ')}
        >
          +{remaining}
        </span>
      )}
    </div>
  );
}
