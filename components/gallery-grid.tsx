"use client";

import Image from "next/image";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

export type GalleryImage = {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
};

export function GalleryGrid({ items }: { items: GalleryImage[] }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <Dialog.Root key={item.id}>
          <Dialog.Trigger asChild>
            <button className="group relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/5 text-left">
              <div className="relative aspect-[4/5] overflow-hidden">
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  fill
                  className="object-cover transition duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />
              </div>
              <div className="absolute inset-x-0 bottom-0 p-5">
                <p className="text-xs uppercase tracking-[0.35em] text-gold-light/85">{item.category}</p>
                <h3 className="mt-2 text-2xl text-white">{item.title}</h3>
              </div>
            </button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-sm" />
            <Dialog.Content className="fixed left-1/2 top-1/2 z-[70] w-[92vw] max-w-4xl -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[2rem] border border-white/10 bg-black">
              <div className="relative aspect-[4/3] w-full">
                <Image src={item.imageUrl} alt={item.title} fill className="object-cover" />
              </div>
              <div className="flex items-center justify-between p-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-gold-light/80">{item.category}</p>
                  <Dialog.Title className="mt-2 text-3xl text-white">{item.title}</Dialog.Title>
                </div>
                <Dialog.Close className="rounded-full border border-white/15 p-3 text-white/70 transition hover:border-gold/40 hover:text-white">
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
