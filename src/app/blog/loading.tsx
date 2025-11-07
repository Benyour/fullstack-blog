import { Container } from "@/components/layout/container";

const skeletonCards = Array.from({ length: 4 });

export default function BlogLoading() {
  return (
    <div className="py-16">
      <Container>
        <header className="max-w-2xl animate-pulse space-y-4">
          <div className="h-8 w-40 rounded-full bg-[var(--surface-muted)]" />
          <div className="h-16 w-full rounded-2xl bg-[var(--surface-muted)]" />
        </header>

        <div className="mt-8 flex flex-wrap gap-3">
          <div className="h-8 w-20 rounded-full bg-[var(--surface-muted)]" />
          <div className="h-8 w-24 rounded-full bg-[var(--surface-muted)]" />
          <div className="h-8 w-28 rounded-full bg-[var(--surface-muted)]" />
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {skeletonCards.map((_, index) => (
            <div key={index} className="panel flex flex-col gap-4 p-6">
              <div className="flex items-center justify-between text-[0.78rem]">
                <div className="h-3 w-28 rounded-full bg-[var(--surface-muted)]" />
                <div className="h-6 w-24 rounded-full bg-[var(--surface-muted)]" />
              </div>
              <div className="h-6 w-3/4 rounded-full bg-[var(--surface-muted)]" />
              <div className="h-6 w-2/3 rounded-full bg-[var(--surface-muted)]" />
              <div className="h-20 w-full rounded-2xl bg-[var(--surface-muted)]" />
              <div className="h-4 w-24 rounded-full bg-[var(--surface-muted)]" />
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}


