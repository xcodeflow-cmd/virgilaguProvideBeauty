import Image from "next/image";

import { MobilePeekCarousel } from "@/components/mobile-peek-carousel";
import aboutImageMain from "@/assets/about me/premii.jpeg";
import aboutImage01 from "@/assets/about me/WhatsApp Image 2026-04-04 at 18.44.38.jpeg";
import aboutImage02 from "@/assets/about me/WhatsApp Image 2026-04-04 at 18.56.21.jpeg";
import aboutImage03 from "@/assets/about me/pozaProfil.png";
import aboutImage04 from "@/assets/about me/curs1.jpeg";
import { getSiteSettings } from "@/lib/site-content";

const fallbackImages = [aboutImageMain, aboutImage01, aboutImage02, aboutImage03, aboutImage04];

export default async function AboutPage() {
  const settings = await getSiteSettings();
  const about = settings.pages.about;
  const images = about.images.length ? about.images : fallbackImages;

  return (
    <section className="section-shell section-space">
      <div className="overflow-hidden rounded-[2.6rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(214,185,140,0.14),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.022),rgba(255,255,255,0.008))] shadow-luxury">
        <div className="grid gap-0 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="p-8 sm:p-10 lg:p-14">
            <p className="text-xs uppercase tracking-[0.42em] text-[#d6b98c]">Despre noi</p>
            <h1 className="mt-6 max-w-4xl text-5xl leading-[0.84] text-white sm:text-6xl lg:text-7xl">{about.title}</h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/[0.7]">{about.intro}</p>
            <div className="mt-8 space-y-5">
              {about.body.map((paragraph) => (
                <p key={paragraph} className="text-sm leading-8 text-white/[0.68] sm:text-base">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          <div className="hidden gap-3 p-3 sm:grid sm:grid-cols-2 sm:p-4">
            {images.slice(0, 4).map((image, index) => (
              <div key={index} className={`relative overflow-hidden rounded-[1.8rem] border border-white/10 bg-black/30 ${index === 0 ? "sm:col-span-2 aspect-[16/10]" : "aspect-[4/5]"}`}>
                <Image src={image} alt={`Provibe ${index + 1}`} fill className="object-cover" unoptimized={typeof image === "string"} />
              </div>
            ))}
          </div>

          <div className="py-3 sm:hidden">
            <MobilePeekCarousel
              ariaLabel="Despre noi"
              items={images.slice(0, 4).map((image, index) => (
                <div key={index} className="relative aspect-[4/5] overflow-hidden rounded-[1.8rem] border border-white/10 bg-black/30">
                  <Image src={image} alt={`Provibe ${index + 1}`} fill className="object-cover" unoptimized={typeof image === "string"} />
                </div>
              ))}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
