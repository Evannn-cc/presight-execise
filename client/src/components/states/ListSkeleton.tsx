export default function ListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-3 px-4 py-4" aria-label="Loading users">
      {Array.from({ length: rows }, (_, i) => (
        <div
          key={i}
          className="flex animate-pulse gap-4 rounded-xl border border-slate-200 bg-white p-4"
        >
          <div className="size-12 shrink-0 rounded-full bg-slate-200" />
          <div className="flex-1 space-y-2 py-1">
            <div className="h-4 w-1/3 rounded bg-slate-200" />
            <div className="h-3 w-1/2 rounded bg-slate-100" />
            <div className="h-5 w-2/5 rounded-full bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}
