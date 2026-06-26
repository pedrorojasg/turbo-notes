export default function NotesLoading() {
  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <header className="flex items-center justify-end px-8 pt-8 pb-2">
        {/* Skeleton for New Note button */}
        <div className="h-[43px] w-[133px] rounded-[46px] bg-accent/20 animate-pulse" />
      </header>

      <div className="flex flex-1 px-8 pb-8 gap-8">
        {/* Sidebar skeleton */}
        <aside className="w-[256px] shrink-0 flex flex-col gap-1 pt-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-[32px] rounded-md bg-accent/10 animate-pulse"
            />
          ))}
        </aside>

        {/* Cards skeleton */}
        <main className="flex-1 flex flex-wrap gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-[246px] w-[303px] rounded-[11px] bg-accent/10 animate-pulse"
            />
          ))}
        </main>
      </div>
    </div>
  );
}
