function LiveLoadingBlock({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-[1.8rem] border border-white/8 bg-white/[0.04] ${className}`} />;
}

export default function LiveLoading() {
  return (
    <section className="section-shell py-4 sm:py-8 lg:py-10">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.68fr)_22rem] xl:items-start">
        <div className="space-y-5">
          <LiveLoadingBlock className="h-[40rem]" />
          <LiveLoadingBlock className="h-[18rem]" />
        </div>
        <LiveLoadingBlock className="hidden h-[38rem] xl:block" />
      </div>
    </section>
  );
}
