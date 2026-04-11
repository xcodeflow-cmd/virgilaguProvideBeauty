import Image from "next/image";

import profileImage from "@/assets/about me/pozaProfil.png";

export function Logo() {
  return (
    <div className="flex items-center gap-2.5 sm:gap-4">
      <div className="relative h-[3.75rem] w-[6.5rem] shrink-0 overflow-hidden rounded-[1rem] sm:h-16 sm:w-28">
        <Image src={profileImage} alt="Virgil Agu" fill className="object-cover" />
      </div>
      <div>
        <p className="font-display text-[1.05rem] font-semibold tracking-[0.1em] text-white sm:text-[1.65rem] sm:tracking-[0.12em]">
          Virgil Agu
        </p>
        <p className="text-[9px] uppercase tracking-[0.34em] text-white/[0.46] sm:text-[10px] sm:tracking-[0.58em]">
          Education & Barbering
        </p>
      </div>
    </div>
  );
}


