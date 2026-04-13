"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";

type CheckoutConfirmationProps = {
  title: string;
  description: string;
  priceLabel: string;
  checkoutPath: string;
};

const terms = [
  "1. Acces live si continut video: sumele achitate pentru acces la sesiuni live sau pentru achizitionarea de continut video nu sunt rambursabile. Exceptie: rambursarea poate fi acordata exclusiv in cazul unor probleme tehnice majore care au impiedicat accesul sau vizionarea, dovedite prin dovezi concrete (capturi, inregistrari, erori evidente).",
  "2. Cursuri si plati efectuate din greseala: in cazul in care o plata pentru un curs a fost efectuata din eroare, aceasta poate fi rambursata doar daca utilizatorul nu a participat la niciun curs si nu a accesat continutul aferent.",
  "3. Conditii generale pentru rambursari: cererile de rambursare trebuie transmise intr-un interval rezonabil de timp de la efectuarea platii, fiecare solicitare este analizata individual, iar decizia finala apartine furnizorului platformei."
];

export function CheckoutConfirmation({
  title,
  description,
  priceLabel,
  checkoutPath
}: CheckoutConfirmationProps) {
  const [accepted, setAccepted] = useState(false);
  const normalizedCheckoutPath = useMemo(() => checkoutPath, [checkoutPath]);

  return (
    <section className="section-shell section-space">
      <div className="mx-auto max-w-4xl overflow-hidden rounded-[2.4rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(214,185,140,0.16),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] shadow-luxury">
        <div className="border-b border-white/10 p-7 sm:p-10">
          <p className="text-[11px] uppercase tracking-[0.35em] text-[#d6b98c]">Confirmare plata</p>
          <h1 className="mt-4 text-4xl leading-[0.92] text-white sm:text-5xl">{title}</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/60 sm:text-base">{description}</p>
          <div className="mt-6 inline-flex rounded-full border border-[#d6b98c]/20 bg-[#d6b98c]/10 px-4 py-2 text-sm text-[#f3dfbf]">
            {priceLabel}
          </div>
        </div>

        <div className="grid gap-6 p-7 sm:p-10">
          <div className="rounded-[1.8rem] border border-white/10 bg-black/20 p-5 sm:p-6">
            <h2 className="text-2xl text-white">Termeni si conditii / Plati si rambursari</h2>
            <div className="mt-5 space-y-4 text-sm leading-7 text-white/65">
              {terms.map((term) => (
                <p key={term}>{term}</p>
              ))}
              <p>Prin continuarea utilizarii platformei si efectuarea unei plati, confirmati ca ati citit si acceptat acesti termeni.</p>
            </div>
          </div>

          <label className="flex items-start gap-3 rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5 text-sm text-white/75">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(event) => setAccepted(event.target.checked)}
              className="mt-1 h-4 w-4 rounded border-white/20 bg-transparent text-[#d6b98c]"
            />
            Confirm ca am citit si accept termenii si conditiile de plata si rambursare.
          </label>

          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              className="min-h-12 px-8"
              disabled={!accepted}
              onClick={() => {
                if (!accepted) {
                  return;
                }

                window.location.href = normalizedCheckoutPath;
              }}
            >
              Continua catre checkout
            </Button>
            <Button type="button" variant="secondary" className="min-h-12 px-8" onClick={() => window.history.back()}>
              Inapoi
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
