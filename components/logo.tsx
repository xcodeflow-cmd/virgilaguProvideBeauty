export function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-full border border-gold/30 bg-gold/10 text-lg font-semibold text-gold">
        TN
      </div>
      <div>
        <p className="font-display text-xl text-white">Tudor Noir</p>
        <p className="text-xs uppercase tracking-[0.4em] text-white/45">
          Barber Studio
        </p>
      </div>
    </div>
  );
}
