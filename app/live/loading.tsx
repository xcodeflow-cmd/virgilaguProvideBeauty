export default function LiveLoading() {
  return (
    <section className="section-shell py-4 sm:py-8 lg:py-10">
      <div className="animate-pulse space-y-4 sm:space-y-6">
        <div className="overflow-hidden rounded-[1.8rem] border border-white/10 bg-white/[0.03]">
          <div className="h-[18rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] sm:h-[24rem]" />
          <div className="grid gap-3 border-t border-white/10 px-4 py-4 sm:px-6 sm:py-5 lg:grid-cols-[minmax(0,1fr)_auto]">
            <div className="space-y-3">
              <div className="h-4 w-32 rounded-full bg-white/10" />
              <div className="h-4 w-full max-w-[32rem] rounded-full bg-white/10" />
            </div>
            <div className="h-11 w-40 rounded-full bg-white/10" />
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.68fr)_22rem]">
          <div className="h-[18rem] rounded-[1.8rem] border border-white/10 bg-white/[0.03]" />
          <div className="hidden h-[18rem] rounded-[1.8rem] border border-white/10 bg-white/[0.03] xl:block" />
        </div>
      </div>
    </section>
  );
}
