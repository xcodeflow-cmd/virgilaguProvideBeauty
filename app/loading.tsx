function LoadingCard({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-[1.8rem] border border-white/8 bg-white/[0.04] ${className}`} />;
}

export default function GlobalLoading() {
  return (
    <section className="section-shell section-space">
      <div className="space-y-6">
        <LoadingCard className="h-10 w-32" />
        <LoadingCard className="h-24 max-w-4xl" />
        <LoadingCard className="h-8 max-w-2xl" />
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <LoadingCard className="min-h-[24rem]" />
          <div className="space-y-6">
            <LoadingCard className="h-40" />
            <LoadingCard className="h-40" />
          </div>
        </div>
      </div>
    </section>
  );
}
