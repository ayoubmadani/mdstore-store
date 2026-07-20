export default function PlanLoading() {
  return (
    <div className="min-h-screen py-20 px-4 bg-white dark:bg-brand-dark">
      <div className="max-w-5xl mx-auto grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 animate-pulse">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="rounded-[2rem] p-7 h-80 bg-gray-100 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800"
          />
        ))}
      </div>
    </div>
  );
}
