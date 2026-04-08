"use client";

import Image from "next/image";
import type { StaticImageData } from "next/image";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

export type GalleryImage = {
  id: string;
  title: string;
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
          : "grid gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4"
      }
    >
      {items.map((item) => (
        <Dialog.Root key={item.id}>
          <Dialog.Trigger asChild>
            <button className="group premium-card relative flex h-full flex-col overflow-hidden text-left hover:-translate-y-1.5 hover:shadow-luxury">
              <div className="relative aspect-square overflow-hidden">
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  fill
                  className="object-cover transition duration-700 group-hover:scale-[1.05]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />
              </div>
              <div className="absolute inset-x-0 bottom-0 p-6">
                <p className="text-[10px] uppercase tracking-[0.38em] text-accent/85">{item.category}</p>
                <h3 className="mt-2 max-w-[16rem] text-2xl leading-tight text-white sm:text-[1.9rem]">
                  {item.title}
                </h3>
              </div>
            </button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-sm" />
            <Dialog.Content className="fixed left-1/2 top-1/2 z-[70] w-[92vw] max-w-5xl -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[2rem] border border-white/10 bg-[#111111]">
              <div className="relative aspect-[4/3] w-full bg-black">
                <Image src={item.imageUrl} alt={item.title} fill className="object-contain" />
              </div>
              <div className="flex items-center justify-between p-6">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.38em] text-accent/80">{item.category}</p>
                  <Dialog.Title className="mt-2 text-3xl text-white">{item.title}</Dialog.Title>
                </div>
                <Dialog.Close className="rounded-full border border-white/15 p-3 text-white/70 transition hover:border-white/30 hover:text-white">
                  <X className="h-5 w-5" />
                </Dialog.Close>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      ))}
    </div>
  );
}
