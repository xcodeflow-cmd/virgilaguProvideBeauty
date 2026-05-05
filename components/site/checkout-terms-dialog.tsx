"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";

type CheckoutTermsDialogProps = {
  title: string;
  description: string;
  priceLabel: string;
  compareAtPriceLabel?: string | null;
  checkoutPath: string;
  triggerLabel: string;
  triggerClassName?: string;
};

export function CheckoutTermsDialog({
  title,
  description,
  priceLabel,
  compareAtPriceLabel,
  checkoutPath,
  triggerLabel,
  triggerClassName
}: CheckoutTermsDialogProps) {
  const [accepted, setAccepted] = useState(false);

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button type="button" className={triggerClassName}>
          {triggerLabel}
        </Button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/[0.82] backdrop-blur-[12px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[70] max-h-[90vh] w-[94vw] max-w-4xl -translate-x-1/2 -translate-y-1/2 overflow-auto rounded-[2.3rem] border border-white/10 bg-[#070707] p-5 shadow-[0_44px_140px_rgba(0,0,0,0.5)] sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.35em] text-[#d6b98c]">Confirmare plata</p>
              <Dialog.Title className="mt-4 text-3xl leading-[0.92] text-white sm:text-4xl">{title}</Dialog.Title>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/60 sm:text-base">{description}</p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                {compareAtPriceLabel ? <span className="text-sm text-white/35 line-through">{compareAtPriceLabel}</span> : null}
                <div className="inline-flex rounded-full border border-red-500/30 bg-red-500/15 px-5 py-3 text-base font-semibold text-red-100 shadow-[0_18px_40px_rgba(185,28,28,0.24)]">
                  {priceLabel}
                </div>
              </div>
            </div>
            <Dialog.Close className="rounded-full border border-white/10 bg-white/[0.04] p-3 text-white/70 transition hover:bg-white/[0.1] hover:text-white">
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>

          <div className="mt-8 grid gap-6">
            <div className="rounded-[1.8rem] border border-white/10 bg-black/20 p-5 sm:p-6">
              <h2 className="text-2xl text-white">Termeni si conditii / Plati, rambursari si drepturi de autor</h2>
              <div className="mt-5 space-y-4 text-sm leading-7 text-white/65">
                <p>Prin achizitionarea oricarui produs sau serviciu (acces la live-uri, cursuri sau continut video), utilizatorul este de acord cu urmatoarele conditii:</p>
                <p>1. Acces live si continut video</p>
                <p>Sumele achitate pentru acces la sesiuni live sau pentru achizitionarea de continut video nu sunt rambursabile.</p>
                <p>Exceptie: rambursarea poate fi acordata exclusiv in cazul unor probleme tehnice majore care au impiedicat accesul sau vizionarea, dovedite prin dovezi concrete (capturi, inregistrari, erori evidente).</p>
                <p>2. Cursuri - plati efectuate din greseala</p>
                <p>In cazul in care o plata pentru un curs a fost efectuata din eroare, aceasta poate fi rambursata doar daca utilizatorul nu a participat la niciun curs si nu a accesat continutul aferent.</p>
                <p>3. Conditii generale pentru rambursari</p>
                <p>* Cererile de rambursare trebuie transmise intr-un interval rezonabil de timp de la efectuarea platii</p>
                <p>* Fiecare solicitare este analizata individual</p>
                <p>* Decizia finala apartine furnizorului platformei</p>
                <p>4. Drepturi de autor si utilizare continut</p>
                <p>Toate materialele disponibile pe platforma (inclusiv, dar fara a se limita la: sesiuni live, inregistrari video, cursuri, materiale media) sunt protejate prin drepturi de autor si apartin exclusiv furnizorului platformei.</p>
                <p>Este strict interzisa:</p>
                <p>* copierea, inregistrarea, distribuirea sau republicarea continutului</p>
                <p>* transmiterea accesului catre alte persoane</p>
                <p>* utilizarea materialelor in scop comercial sau public</p>
                <p>Orice incalcare a acestor prevederi (inclusiv distribuirea sau utilizarea neautorizata a continutului sau a conturilor) va atrage demersuri legale impotriva persoanelor implicate.</p>
                <p>Prin continuarea utilizarii platformei si efectuarea unei plati, confirmati ca ati citit si sunteti de acord cu acesti termeni si conditii.</p>
              </div>
            </div>

            <label className="flex items-start gap-3 rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5 text-sm text-white/75">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(event) => setAccepted(event.target.checked)}
                className="mt-1 h-4 w-4 rounded border-white/20 bg-transparent text-[#d6b98c]"
              />
              Confirm ca am citit si accept termenii si conditiile, inclusiv platile, rambursarile si drepturile de autor.
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

                  window.location.href = checkoutPath;
                }}
              >
                Continua catre checkout
              </Button>
              <Dialog.Close asChild>
                <Button type="button" variant="secondary" className="min-h-12 px-8">
                  Inapoi
                </Button>
              </Dialog.Close>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
