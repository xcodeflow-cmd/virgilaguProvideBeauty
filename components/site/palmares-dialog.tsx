"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { palmaresDetails, palmaresHighlights } from "@/lib/course-offers";

export function PalmaresDialog() {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button className="premium-card grid content-start gap-5 rounded-[2rem] p-6 text-left sm:p-7">
          <p className="text-xs uppercase tracking-[0.35em] text-[#d6b98c]"></p>
          <p className="max-w-lg text-3xl leading-tight text-white sm:text-4xl">
            Rezultate reale din competitie, educatie si ani de executie constanta.
          </p>
          <div className="grid gap-3">
            {palmaresHighlights.map((item) => (
              <div
                key={item}
                className="rounded-[1.5rem] border border-white/10 bg-white/[0.035] px-5 py-4 text-sm uppercase tracking-[0.16em] text-white/[0.82] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
              >
                {item}
              </div>
            ))}
          </div>
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/[0.82] backdrop-blur-[12px]" />
        <Dialog.Content className="fixed left-1/2 top-[max(5.5rem,env(safe-area-inset-top))] z-[70] flex max-h-[calc(100dvh-6.5rem)] w-[94vw] max-w-3xl -translate-x-1/2 flex-col overflow-hidden rounded-[2.2rem] border border-white/10 bg-[#070707] shadow-[0_44px_140px_rgba(0,0,0,0.5)] sm:top-[max(6.5rem,env(safe-area-inset-top))] sm:max-h-[calc(100dvh-8rem)]">
          <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-white/10 bg-[#070707]/96 px-6 py-5 backdrop-blur-md sm:px-8 sm:py-6">
            <div className="pr-3">
              <p className="text-[10px] uppercase tracking-[0.38em] text-[#d6b98c]">Palmares</p>
              <Dialog.Title className="mt-3 text-4xl leading-tight text-white sm:text-5xl">
                Rezultate care sustin standardul.
              </Dialog.Title>
            </div>
            <Dialog.Close className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] p-3 text-white/70 transition hover:bg-white/[0.1] hover:text-white">
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>

          <div className="overflow-y-auto px-6 pb-6 pt-6 sm:px-8 sm:pb-8">
            <div className="grid gap-4">
              {palmaresHighlights.map((item) => (
                <div key={item} className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] px-5 py-4 text-white/[0.84]">
                  {item}
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-4">
              {palmaresDetails.map((item) => (
                <p key={item} className="border-l border-[#d6b98c]/20 pl-4 text-sm leading-7 text-white/[0.72]">
                  {item}
                </p>
              ))}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
