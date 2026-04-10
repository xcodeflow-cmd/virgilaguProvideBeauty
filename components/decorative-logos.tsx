import Image from "next/image";

import siteLogo from "@/assets/logo.png";

const logoPositions = [
  { key: "left-top", className: "left-[-2.5rem] top-[11rem] h-24 w-24 rotate-[-16deg] sm:h-28 sm:w-28 lg:left-[-1rem]" },
  { key: "right-upper", className: "right-[-2.75rem] top-[23rem] h-20 w-20 rotate-[12deg] sm:h-24 sm:w-24 lg:right-[-1.25rem]" },
  { key: "left-lower", className: "left-[-2rem] top-[58%] h-16 w-16 rotate-[18deg] sm:h-20 sm:w-20 lg:left-[0.25rem]" },
  { key: "right-bottom", className: "right-[-2.5rem] bottom-[7rem] h-28 w-28 rotate-[-10deg] sm:h-32 sm:w-32 lg:right-[-0.75rem]" }
];

export function DecorativeLogos() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {logoPositions.map((item) => (
        <div key={item.key} className={`absolute opacity-[0.08] blur-[0.3px] ${item.className}`}>
          <Image src={siteLogo} alt="" fill className="object-contain" sizes="(max-width: 768px) 96px, 128px" />
        </div>
      ))}
    </div>
  );
}
