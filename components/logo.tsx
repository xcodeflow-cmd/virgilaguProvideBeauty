import Image from "next/image";

import profileImage from "@/assets/about me/pozaProfil.png";

export function Logo() {
  return (
    <div className="flex items-center gap-4">
      <div className="relative h-14 w-24 shrink-0 overflow-hidden rounded-[1rem]">
        <Image src={profileImage} alt="Virgil Agu" fill className="object-cover" />
      </div>
      <div>
        <p className="font-display text-xl font-semibold tracking-[0.12em] text-white sm:text-[1.65rem]">
          Virgil Agu
        </p>
        <p className="text-[10px] uppercase tracking-[0.58em] text-white/[0.46]">
          Education & Barbering
        </p>
      </div>
    </div>
  );
}


