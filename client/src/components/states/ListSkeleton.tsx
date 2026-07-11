export default function ListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-3 px-4 py-4" aria-label="Loading users">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="animate-pulse rounded-[3px] border border-line bg-white p-4">
          <div className="flex gap-4">
            <div className="size-14 shrink-0 rounded-[2px] bg-line/60" />
            <div className="flex-1 space-y-2 py-1">
              <div className="h-4 w-1/3 rounded-[2px] bg-line/60" />
              <div className="h-3 w-1/2 rounded-[2px] bg-line/40" />
              <div className="h-5 w-2/5 rounded-[2px] bg-line/30" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
