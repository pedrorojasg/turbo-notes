export default function NoteEditorLoading() {
  return (
    <div className="min-h-screen bg-cream flex flex-col animate-pulse">
      <header className="flex items-center justify-between px-8 pt-8 pb-4">
        <div className="h-5 w-16 rounded-full bg-accent/20" />
        <div className="h-8 w-36 rounded-full bg-accent/20" />
      </header>

      <main className="flex-1 px-8 pb-8 flex flex-col gap-4">
        <div className="h-10 w-2/3 rounded-md bg-accent/20" />
        <div className="h-px w-full bg-accent/10" />
        <div className="flex flex-col gap-3 flex-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-4 rounded-md bg-accent/10" style={{ width: `${85 - i * 8}%` }} />
          ))}
        </div>
      </main>

      <footer className="px-8 py-4">
        <div className="h-3 w-48 rounded-md bg-accent/10" />
      </footer>
    </div>
  );
}
