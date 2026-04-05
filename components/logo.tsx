export function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/8 text-lg font-semibold text-white">
        VA
      </div>
      <div>
        <p className="font-display text-xl text-white">Virgil Agu</p>
        <p className="text-xs uppercase tracking-[0.4em] text-white/45">
          Barber Studio
        </p>
      </div>
    </div>
  );
}
