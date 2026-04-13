import { FadeIn } from "@/components/motion-shell";
import { VideoGalleryGrid } from "@/components/video-gallery-grid";
import { getOrderedFeedbackVideos } from "@/lib/media-library";

export default function ReviewsPage() {
  const videos = getOrderedFeedbackVideos();

  return (
    <section className="section-shell section-space">
      <FadeIn className="max-w-5xl">
        <p className="text-xs uppercase tracking-[0.42em] text-[#f0b35b]">Feedback cursuri</p>
        <h1 className="mt-6 max-w-6xl text-5xl leading-[0.84] text-white sm:text-6xl lg:text-7xl">
          Feedback video, pus curat in pagina si lasat sa vorbeasca singur.
        </h1>
      </FadeIn>

      <div className="mx-auto mt-16 max-w-[92rem] space-y-10">
        <div className="overflow-hidden rounded-[2.6rem] border border-[#f0b35b]/18 bg-[radial-gradient(circle_at_top_left,rgba(240,179,91,0.16),transparent_26%),linear-gradient(180deg,#120d06,#070707)] p-7 shadow-[0_36px_120px_rgba(0,0,0,0.34)] sm:p-10">
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <p className="text-[11px] uppercase tracking-[0.38em] text-[#f0b35b]">Ordine fixa</p>
              <h2 className="mt-4 text-4xl leading-[0.9] text-white sm:text-5xl">1, 2, 4, 3, 5, apoi feedback.</h2>
            </div>
            <p className="max-w-2xl text-base leading-8 text-white/68 sm:text-lg">
              Pagina ramane foarte curata, focusata pe clipuri si fara carduri aglomerate. Materialele video sunt luate direct din
              `assets/videos`.
            </p>
          </div>
        </div>

        <VideoGalleryGrid items={videos} accent="feedback" />
      </div>
    </section>
  );
}
