"use client";

import Image from "next/image";
import type { StaticImageData } from "next/image";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

export type GalleryImage = {
  id: string;
  title: string;
  subtitle?: string;
  category: string;
  imageUrl: string | StaticImageData;
};

export function GalleryGrid({
  items,
  columns = "full"
}: {
  items: GalleryImage[];
  columns?: "preview" | "full";
}) {
  return (
    <div
      className={
        columns === "preview"
          ? "grid gap-6 md:grid-cols-2"
          : "grid auto-rows-[18rem] gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4"
      }
    >
      {items.map((item, index) => {
        const spanClass = columns === "preview"
          ? ""
          : index % 5 === 0
            ? "sm:col-span-2 sm:row-span-2"
            : index % 4 === 0
              ? "lg:row-span-2"
              : "";

        return (
          <Dialog.Root key={item.id}>
            <Dialog.Trigger asChild>
              <button
                className={`group flex h-full flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-[#080808] text-left shadow-panel transition duration-500 hover:-translate-y-1 hover:shadow-luxury ${spanClass}`}
              >
                <div className="relative h-full min-h-[18rem] overflow-hidden">
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    unoptimized
                    className="object-cover transition duration-700 group-hover:scale-[1.05]"
                  />
                </div>
                <div className="space-y-3 p-6">
                  <p className="text-[10px] uppercase tracking-[0.34em] text-[#d6b98c]">{item.category}</p>
                  <h3 className="text-2xl leading-tight text-white sm:text-[2rem]">{item.title}</h3>
                  {item.subtitle ? <p className="text-sm text-white/65">{item.subtitle}</p> : null}
                </div>
              </button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/[0.92] backdrop-blur-[12px]" />
              <Dialog.Content className="fixed inset-4 z-[70] overflow-hidden rounded-[2.2rem] bg-[#060606] shadow-[0_40px_120px_rgba(0,0,0,0.45)] lg:inset-8">
                <div className="relative h-[78vh] w-full bg-black">
                  <Image src={item.imageUrl} alt={item.title} fill unoptimized className="object-contain" />
                </div>
                <div className="flex items-center justify-between p-6">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.38em] text-accent/80">{item.category}</p>
                    <Dialog.Title className="mt-2 text-3xl text-white">{item.title}</Dialog.Title>
                    {item.subtitle ? <p className="mt-2 text-sm text-white/70">{item.subtitle}</p> : null}
                  </div>
                  <Dialog.Close className="rounded-full bg-white/[0.05] p-3 text-white/70 transition hover:bg-white/[0.1] hover:text-white">
                    <X className="h-5 w-5" />
                  </Dialog.Close>
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        );
      })}
    </div>
  );
}


