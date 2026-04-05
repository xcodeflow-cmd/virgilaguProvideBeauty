import Image from "next/image";

import { FadeIn } from "@/components/motion-shell";
import { SectionHeading } from "@/components/section-heading";
import { brandImages } from "@/lib/data";
import { getSiteSettings } from "@/lib/site-content";

function CourseCard({
  title,
  description,
  listTitle,
  listItems,
  detailTitle,
  detailItems
}: {
  title: string;
  description?: string[];
  listTitle?: string;
  listItems?: string[];
  detailTitle?: string;
  detailItems?: string[];
}) {
  return (
    <article className="glass-panel rounded-[2rem] p-8">
      <h2 className="text-3xl text-white sm:text-4xl">{title}</h2>
      {description ? (
        <div className="mt-6 space-y-3 text-base leading-7 text-white/68">
          {description.map((item) => (
            <p key={item}>{item}</p>
          ))}
        </div>
      ) : null}
      {listTitle && listItems?.length ? (
        <div className="mt-8">
          <p className="text-xs uppercase tracking-[0.35em] text-accent/80">{listTitle}</p>
          <div className="mt-4 space-y-3 text-white/72">
            {listItems.map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                {item}
              </div>
            ))}
          </div>
        </div>
      ) : null}
      {detailTitle && detailItems?.length ? (
        <div className="mt-8">
          <p className="text-xs uppercase tracking-[0.35em] text-accent/80">{detailTitle}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            {detailItems.map((item) => (
              <span key={item} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/74">
                {item}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </article>
  );
}

export default async function CoursesPage() {
  const { courses } = await getSiteSettings();

  return (
    <section className="section-shell py-16 sm:py-20">
      <FadeIn>
        <SectionHeading
          eyebrow="Courses"
          title="Cursuri pentru incepatori, avansati si sesiuni live recurente."
          description="Pagina `courses` centralizeaza oferta educationala a lui Virgil Agu intr-un format clar, modular si premium."
        />
      </FadeIn>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="relative min-h-[24rem] overflow-hidden rounded-[2rem] border border-white/10">
          <Image src={brandImages.aboutSecondary} alt="Virgil Agu courses" fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        </div>
        <div className="glass-panel flex flex-col justify-between rounded-[2rem] p-8">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-accent/80">Trainer</p>
            <h2 className="mt-4 text-4xl text-white">Virgil Agu</h2>
            <p className="mt-4 text-base leading-7 text-white/65">
              Experienta de salon, concursuri, educatie si lucru direct cu oameni care vor sa treaca la urmatorul nivel.
            </p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
              <p className="text-3xl text-white">10+</p>
              <p className="mt-2 text-sm uppercase tracking-[0.25em] text-white/45">ani experienta</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
              <p className="text-3xl text-white">300+</p>
              <p className="mt-2 text-sm uppercase tracking-[0.25em] text-white/45">studenti</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 space-y-8">
        <CourseCard
          title={courses.beginner.title}
          description={courses.beginner.description}
          listTitle="Achievements"
          listItems={courses.beginner.achievements}
          detailTitle="Details"
          detailItems={courses.beginner.details}
        />

        <CourseCard
          title={courses.advanced.title}
          description={[courses.advanced.description]}
          listTitle="Include"
          listItems={courses.advanced.includes}
          detailTitle="Ce inveti"
          detailItems={courses.advanced.outcomes}
        />

        <CourseCard
          title={courses.liveExperience.title}
          description={[courses.liveExperience.description]}
          listTitle="Include"
          listItems={courses.liveExperience.includes}
          detailTitle="Ce inveti"
          detailItems={[...courses.liveExperience.outcomes, ...courses.liveExperience.details]}
        />
      </div>
    </section>
  );
}
