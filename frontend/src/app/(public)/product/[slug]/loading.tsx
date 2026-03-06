import { Skeleton } from "@/components/ui/skeleton";

export default function ProductDetailsLoading() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr] xl:gap-10">
        <div className="space-y-3">
          <Skeleton className="h-[58vh] min-h-[360px] w-full rounded-3xl" />
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={`thumb-${index}`} className="h-20 w-full rounded-xl sm:h-24" />
            ))}
          </div>
        </div>

        <div className="space-y-4 xl:sticky xl:top-24 xl:self-start">
          <Skeleton className="h-4 w-44 rounded-md" />
          <Skeleton className="h-8 w-3/4 rounded-md" />
          <Skeleton className="h-7 w-40 rounded-md" />
          <Skeleton className="h-36 w-full rounded-xl" />
          <Skeleton className="h-44 w-full rounded-2xl" />
          <div className="space-y-2 rounded-xl border border-border/50 p-3">
            <Skeleton className="h-4 w-full rounded-md" />
            <Skeleton className="h-4 w-[90%] rounded-md" />
            <Skeleton className="h-4 w-[80%] rounded-md" />
          </div>
        </div>
      </section>
    </main>
  );
}
