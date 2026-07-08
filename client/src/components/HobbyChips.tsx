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
          className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600"
        >
          {hobby}
        </span>
      ))}
      {remaining > 0 && (
        <span
          className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-500"
          title={hobbies.slice(VISIBLE_COUNT).join(', ')}
        >
          +{remaining}
        </span>
      )}
    </div>
  );
}
