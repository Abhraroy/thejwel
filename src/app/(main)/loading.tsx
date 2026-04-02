export default function MainLoading() {
  return (
    <div
      className="min-h-[50vh] w-full px-4 sm:px-6 lg:px-8 py-8"
      aria-busy="true"
      aria-label="Loading page"
    >
      <div className="max-w-6xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-[#360000]/10 rounded-md" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="aspect-3/4 rounded-lg bg-[#360000]/10"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
