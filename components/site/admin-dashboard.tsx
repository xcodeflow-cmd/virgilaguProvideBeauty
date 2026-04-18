"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { CalendarDays, ImagePlus, Radio, Save, Trash2, Upload, UserRound } from "lucide-react";

import {
  addGalleryItem,
  addLiveSession,
  deleteGalleryItem,
  deleteLiveSession,
  updateCoursePricing,
  updateLiveSessionSchedule,
  updateSiteSettings
} from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { formatRomaniaDateTimeLocal } from "@/lib/romania-time";
import { formatLei } from "@/lib/utils";

type AdminLiveSession = {
  id: string;
  title: string;
  description?: string;
  thumbnailUrl: string;
  visibility: string;
  price: number | null;
  compareAtPrice: number | null;
  maxParticipants: number | null;
  purchasedCount: number;
  isLive: boolean;
  scheduledFor: string;
  recordingUrl: string;
};

type AdminUser = {
  id: string;
  email: string;
  role: string;
  createdAt: string;
};

type AdminCourse = {
  title: string;
  shortDescription?: string;
  dialogBody?: string;
  imageUrl?: string;
  externalLinkLabel?: string;
  externalLinkUrl?: string;
  description?: string[] | string;
  achievements?: string[];
  details?: string[];
  includes?: string[];
  outcomes?: string[];
  pricing?: {
    priceValue: number;
    compareAtPriceValue: number | null;
  };
};

type AdminCourseSettings = {
  beginner: AdminCourse;
  advanced: AdminCourse;
  liveExperience: AdminCourse;
};

type AdminPagesSettings = {
  about: {
    title: string;
    intro: string;
    body: string[];
    images: string[];
  };
};

type AdminGalleryItem = {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  createdAt: string;
};

function toTextarea(value?: string[] | string) {
  if (Array.isArray(value)) {
    return value.join("\n");
  }

  return value || "";
}

export function AdminDashboard({
  galleryItems,
  liveSessions,
  pagesSettings,
  users,
  courseSettings
}: {
  galleryItems: AdminGalleryItem[];
  liveSessions: AdminLiveSession[];
  pagesSettings: AdminPagesSettings;
  users: AdminUser[];
  courseSettings: AdminCourseSettings;
}) {
  const [liveStartMode, setLiveStartMode] = useState<"NOW" | "SCHEDULE">("NOW");
  const [selectedLiveId, setSelectedLiveId] = useState<string | null>(liveSessions[0]?.id || null);
  const liveEditorRef = useRef<HTMLDivElement | null>(null);

  const selectedLiveSession = useMemo(
    () => liveSessions.find((session) => session.id === selectedLiveId) || liveSessions[0] || null,
    [liveSessions, selectedLiveId]
  );

  useEffect(() => {
    if (!liveSessions.length) {
      setSelectedLiveId(null);
      return;
    }

    setSelectedLiveId((current) => (current && liveSessions.some((session) => session.id === current) ? current : liveSessions[0].id));
  }, [liveSessions]);

  const courseCards = [
    {
      key: "beginner",
      titleName: "beginner_title",
      shortName: "beginner_short_description",
      dialogName: "beginner_dialog_body",
      imageUrlName: "beginner_image_url",
      imageFileName: "beginner_image_file",
      linkLabelName: "beginner_link_label",
      linkUrlName: "beginner_link_url",
      extra: [
        { label: "Puncte descriere", name: "beginner_description", rows: 5, value: toTextarea(courseSettings.beginner.description) },
        { label: "Achievements", name: "beginner_achievements", rows: 4, value: toTextarea(courseSettings.beginner.achievements) },
        { label: "Detalii", name: "beginner_details", rows: 3, value: toTextarea(courseSettings.beginner.details) }
      ],
      data: courseSettings.beginner
    },
    {
      key: "advanced",
      titleName: "advanced_title",
      shortName: "advanced_short_description",
      dialogName: "advanced_dialog_body",
      imageUrlName: "advanced_image_url",
      imageFileName: "advanced_image_file",
      extra: [
        { label: "Descriere lunga", name: "advanced_description", rows: 4, value: toTextarea(courseSettings.advanced.description) },
        { label: "Include", name: "advanced_includes", rows: 6, value: toTextarea(courseSettings.advanced.includes) },
        { label: "Rezultate", name: "advanced_outcomes", rows: 5, value: toTextarea(courseSettings.advanced.outcomes) }
      ],
      data: courseSettings.advanced
    },
    {
      key: "live",
      titleName: "live_title",
      shortName: "live_short_description",
      dialogName: "live_dialog_body",
      imageUrlName: "live_image_url",
      imageFileName: "live_image_file",
      extra: [
        { label: "Descriere lunga", name: "live_description", rows: 4, value: toTextarea(courseSettings.liveExperience.description) },
        { label: "Include", name: "live_includes", rows: 6, value: toTextarea(courseSettings.liveExperience.includes) },
        { label: "Rezultate", name: "live_outcomes", rows: 4, value: toTextarea(courseSettings.liveExperience.outcomes) },
        { label: "Detalii", name: "live_details", rows: 3, value: toTextarea(courseSettings.liveExperience.details) }
      ],
      data: courseSettings.liveExperience
    }
  ] as const;

  return (
    <section className="section-shell py-8 sm:py-12">
      <div className="grid gap-6 xl:grid-cols-[19rem_minmax(0,1fr)]">
        <aside className="xl:sticky xl:top-28 xl:self-start">
          <div className="premium-card p-5 sm:p-6">
            <nav className="grid gap-2.5">
              {[
                { href: "#overview", label: "Overview" },
                { href: "#live", label: "Live" },
                { href: "#content", label: "Continut" },
                { href: "#gallery", label: "Galerie" },
                { href: "#users", label: "Users" }
              ].map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/[0.72] transition hover:border-[#d6b98c]/[0.35] hover:text-white"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        <div className="space-y-6">
          <section id="overview" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {[
              { label: "Users", value: users.length, icon: UserRound },
              { label: "Live Sessions", value: liveSessions.length, icon: Radio },
              { label: "Gallery Items", value: galleryItems.length, icon: ImagePlus }
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.label} className="premium-card p-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="dashboard-label">{item.label}</p>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#d6b98c]/10 text-[#ecd4ac]">
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                  </div>
                  <p className="mt-4 text-3xl text-white">{item.value}</p>
                </div>
              );
            })}
          </section>

          <section id="live" className="grid gap-6 2xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
            <div className="premium-card p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="dashboard-label">Live timer</p>
                  <h2 className="mt-3 text-2xl text-white sm:text-3xl">Seteaza si editeaza live-urile.</h2>
                </div>
              </div>

              <form action={addLiveSession} className="mt-6 space-y-4">
                <input name="title" required placeholder="Titlu live" className="premium-input" />
                <textarea name="description" required rows={4} placeholder="Descriere" className="premium-input" />
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="flex min-h-14 items-center gap-3 rounded-[1.4rem] border border-white/10 bg-white/[0.03] px-4 text-sm text-white/75">
                    <input type="radio" name="startMode" value="NOW" checked={liveStartMode === "NOW"} onChange={() => setLiveStartMode("NOW")} />
                    Pornire imediata
                  </label>
                  <label className="flex min-h-14 items-center gap-3 rounded-[1.4rem] border border-white/10 bg-white/[0.03] px-4 text-sm text-white/75">
                    <input type="radio" name="startMode" value="SCHEDULE" checked={liveStartMode === "SCHEDULE"} onChange={() => setLiveStartMode("SCHEDULE")} />
                    Programeaza timer
                  </label>
                </div>
                <input
                  name="scheduledFor"
                  type="datetime-local"
                  disabled={liveStartMode !== "SCHEDULE"}
                  className="premium-input disabled:cursor-not-allowed disabled:opacity-50"
                />
                <select name="visibility" defaultValue="PUBLIC" className="premium-input">
                  <option value="PUBLIC">Public</option>
                  <option value="ONE_TIME">One time</option>
                </select>
                <input name="thumbnailUrl" placeholder="URL thumbnail optional" className="premium-input" />
                <label className="flex min-h-[7rem] cursor-pointer flex-col items-center justify-center gap-3 rounded-[1.25rem] border border-dashed border-white/[0.15] bg-black/20 px-4 py-5 text-center text-sm text-white/75 transition hover:border-white/25 hover:text-white">
                  <Upload className="h-5 w-5" />
                  Adauga poza optionala pentru live
                  <input type="file" name="thumbnailFile" accept="image/*" className="hidden" />
                </label>
                <input name="price" type="number" min="1" step="1" placeholder="Pret optional in lei" className="premium-input" />
                <input name="maxParticipants" type="number" min="1" step="1" placeholder="Participanti maximi" className="premium-input" />
                <Button type="submit" className="min-h-12 w-full sm:w-auto">
                  Adauga sesiune live
                </Button>
              </form>
            </div>

            <div className="space-y-6">
              <div ref={liveEditorRef} className="premium-card p-5 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="dashboard-label">Editor live</p>
                    <h3 className="mt-3 text-2xl text-white">Editare sesiune</h3>
                  </div>
                  {selectedLiveSession ? (
                    <div className="rounded-full bg-white/[0.04] px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/[0.55]">
                      {selectedLiveSession.isLive ? "Live acum" : "Programat"}
                    </div>
                  ) : null}
                </div>

                {selectedLiveSession ? (
                  <form key={selectedLiveSession.id} action={updateLiveSessionSchedule} className="mt-6 space-y-4">
                    <input type="hidden" name="id" value={selectedLiveSession.id} />
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="space-y-2">
                        <span className="text-sm text-white/60">Titlu</span>
                        <input name="title" defaultValue={selectedLiveSession.title} className="premium-input" />
                      </label>
                      <label className="space-y-2">
                        <span className="text-sm text-white/60">Data timer</span>
                        <input
                          name="scheduledFor"
                          type="datetime-local"
                          defaultValue={formatRomaniaDateTimeLocal(new Date(selectedLiveSession.scheduledFor))}
                          className="premium-input"
                        />
                      </label>
                    </div>
                    <label className="space-y-2">
                      <span className="text-sm text-white/60">Descriere</span>
                      <textarea name="description" rows={4} defaultValue={selectedLiveSession.description || ""} className="premium-input" />
                    </label>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="space-y-2">
                        <span className="text-sm text-white/60">Pret live</span>
                        <input name="price" type="number" min="1" step="1" defaultValue={selectedLiveSession.price || ""} className="premium-input" />
                      </label>
                      <label className="space-y-2">
                        <span className="text-sm text-white/60">Participanti maximi</span>
                        <input
                          name="maxParticipants"
                          type="number"
                          min="1"
                          step="1"
                          defaultValue={selectedLiveSession.maxParticipants || ""}
                          className="premium-input"
                        />
                      </label>
                    </div>
                    <label className="space-y-2">
                      <span className="text-sm text-white/60">Tip acces</span>
                      <select name="visibility" defaultValue={selectedLiveSession.visibility} className="premium-input">
                        <option value="ONE_TIME">One time</option>
                        <option value="PUBLIC">Public</option>
                      </select>
                    </label>
                    <label className="space-y-2">
                      <span className="text-sm text-white/60">URL thumbnail</span>
                      <input name="thumbnailUrl" defaultValue={selectedLiveSession.thumbnailUrl} placeholder="Lasa gol ca sa pastrezi valoarea curenta" className="premium-input" />
                    </label>
                    <label className="flex min-h-[7rem] cursor-pointer flex-col items-center justify-center gap-3 rounded-[1.25rem] border border-dashed border-white/[0.15] bg-black/20 px-4 py-5 text-center text-sm text-white/75 transition hover:border-white/25 hover:text-white">
                      <Upload className="h-5 w-5" />
                      Schimba poza live
                      <input type="file" name="thumbnailFile" accept="image/*" className="hidden" />
                    </label>
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <Button type="submit" name="mode" value="UPDATE" className="min-h-12">
                        Salveaza
                      </Button>
                      <Button type="submit" name="mode" value="RESET" variant="secondary" className="min-h-12">
                        Reseteaza countdown-ul
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="mt-6 rounded-[1.4rem] border border-white/10 bg-white/[0.03] px-4 py-5 text-sm text-white/[0.55]">
                    Nu exista sesiuni live disponibile pentru editare.
                  </div>
                )}
              </div>

              <div className="premium-card p-5 sm:p-6">
                <div className="mt-1 grid gap-3">
                  {liveSessions.length ? (
                    liveSessions.map((session) => {
                      const hasDiscount = Boolean(session.compareAtPrice && session.price && session.compareAtPrice > session.price);
                      const discountPercent = hasDiscount
                        ? Math.round((((session.compareAtPrice || 0) - (session.price || 0)) / (session.compareAtPrice || 1)) * 100)
                        : 0;

                      return (
                        <div key={session.id} className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
                          <div className="relative mb-4 aspect-[16/10] overflow-hidden rounded-[1.2rem] border border-white/10 bg-black/25">
                            {session.thumbnailUrl ? (
                              <Image src={session.thumbnailUrl} alt={session.title} fill className="object-cover" unoptimized />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_45%),linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] px-6 text-center text-sm text-white/45">
                                Fara thumbnail setat
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                              <p className="text-base text-white">{session.title}</p>
                              <p className="mt-2 text-sm leading-6 text-white/[0.52]">
                                {session.visibility} • {session.isLive ? "LIVE" : "programat"} •{" "}
                                {new Date(session.scheduledFor).toLocaleString("ro-RO", { timeZone: "Europe/Bucharest" })}
                              </p>
                              <p className="mt-2 text-sm text-white/[0.52]">
                                Achizitii: {session.purchasedCount}
                                {session.maxParticipants ? ` / ${session.maxParticipants}` : ""}
                              </p>
                              {session.price ? (
                                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                                  {hasDiscount ? <span className="text-white/35 line-through">{formatLei(session.compareAtPrice || 0)}</span> : null}
                                  <span className="text-white/[0.78]">{formatLei(session.price)}</span>
                                  {hasDiscount ? (
                                    <span className="rounded-full bg-[#d6b98c]/12 px-2 py-1 text-[10px] uppercase tracking-[0.22em] text-[#f3dfbf]">
                                      -{discountPercent}%
                                    </span>
                                  ) : null}
                                </div>
                              ) : null}
                              {session.recordingUrl ? <p className="mt-2 text-xs uppercase tracking-[0.26em] text-white/[0.35]">VOD salvat</p> : null}
                            </div>
                            <div className="flex flex-col gap-2 sm:min-w-[11rem]">
                              <Button
                                type="button"
                                variant="secondary"
                                className="min-h-11"
                                onClick={() => {
                                  setSelectedLiveId(session.id);
                                  liveEditorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                                }}
                              >
                                <CalendarDays className="h-4 w-4" />
                                Editeaza live
                              </Button>
                              <form action={deleteLiveSession}>
                                <input type="hidden" name="id" value={session.id} />
                                <Button type="submit" variant="secondary" className="min-h-11 w-full">
                                  <Trash2 className="h-4 w-4" />
                                  Sterge
                                </Button>
                              </form>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] px-4 py-5 text-sm text-white/[0.55]">
                      Nu exista sesiuni live.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="premium-card p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="dashboard-label">Preturi cursuri</p>
                <h2 className="mt-3 text-2xl text-white sm:text-3xl">Reduceri vizibile si pe site.</h2>
              </div>
            </div>

            <form action={updateCoursePricing} className="mt-6 grid gap-4 xl:grid-cols-3">
              {[
                {
                  key: "beginner_price",
                  title: courseSettings.beginner.title,
                  price: courseSettings.beginner.pricing?.priceValue || 0,
                  compareAt: courseSettings.beginner.pricing?.compareAtPriceValue || null
                },
                {
                  key: "advanced_price",
                  title: courseSettings.advanced.title,
                  price: courseSettings.advanced.pricing?.priceValue || 0,
                  compareAt: courseSettings.advanced.pricing?.compareAtPriceValue || null
                },
                {
                  key: "live_experience_price",
                  title: courseSettings.liveExperience.title,
                  price: courseSettings.liveExperience.pricing?.priceValue || 0,
                  compareAt: courseSettings.liveExperience.pricing?.compareAtPriceValue || null
                }
              ].map((course) => {
                const hasDiscount = Boolean(course.compareAt && course.compareAt > course.price);

                return (
                  <div key={course.key} className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5">
                    <p className="text-lg text-white">{course.title}</p>
                    <label className="mt-4 block space-y-2">
                      <span className="text-sm text-white/60">Pret actual in lei</span>
                      <input name={course.key} type="number" min="1" step="1" defaultValue={course.price} className="premium-input" />
                    </label>
                    {hasDiscount ? (
                      <div className="mt-4 rounded-[1.2rem] border border-red-500/30 bg-red-500/10 px-4 py-4 text-sm text-red-100">
                        {formatLei(course.compareAt || 0)} {"->"} {formatLei(course.price)}
                      </div>
                    ) : null}
                  </div>
                );
              })}

              <div className="xl:col-span-3">
                <Button type="submit" className="min-h-12">
                  Salveaza preturile cursurilor
                </Button>
              </div>
            </form>
          </section>

          <section id="content" className="premium-card p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="dashboard-label">Continut site</p>
                <h2 className="mt-3 text-2xl text-white sm:text-3xl">Cursuri si Despre noi</h2>
              </div>
            </div>

            <form action={updateSiteSettings} className="mt-6 space-y-8">
              <div className="grid gap-5 xl:grid-cols-3">
                {courseCards.map((course) => (
                  <div key={course.key} className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5">
                    <p className="text-lg text-white">{course.data.title}</p>
                    <div className="mt-4 space-y-4">
                      <label className="space-y-2">
                        <span className="text-sm text-white/60">Titlu</span>
                        <input name={course.titleName} defaultValue={course.data.title} className="premium-input" />
                      </label>
                      <label className="space-y-2">
                        <span className="text-sm text-white/60">Descriere scurta</span>
                        <textarea name={course.shortName} rows={4} defaultValue={course.data.shortDescription || ""} className="premium-input" />
                      </label>
                      <label className="space-y-2">
                        <span className="text-sm text-white/60">Descriere detaliata</span>
                        <textarea name={course.dialogName} rows={6} defaultValue={course.data.dialogBody || ""} className="premium-input" />
                      </label>
                      <label className="space-y-2">
                        <span className="text-sm text-white/60">URL poza</span>
                        <input name={course.imageUrlName} defaultValue={course.data.imageUrl || ""} className="premium-input" />
                      </label>
                      <label className="flex min-h-[7rem] cursor-pointer flex-col items-center justify-center gap-3 rounded-[1.25rem] border border-dashed border-white/[0.15] bg-black/20 px-4 py-5 text-center text-sm text-white/75 transition hover:border-white/25 hover:text-white">
                        <Upload className="h-5 w-5" />
                        Schimba poza cursului
                        <input type="file" name={course.imageFileName} accept="image/*" className="hidden" />
                      </label>
                      {course.key === "beginner" ? (
                        <>
                          <label className="space-y-2">
                            <span className="text-sm text-white/60">Eticheta link</span>
                            <input name="beginner_link_label" defaultValue={course.data.externalLinkLabel || ""} className="premium-input" />
                          </label>
                          <label className="space-y-2">
                            <span className="text-sm text-white/60">Link descriere</span>
                            <input name="beginner_link_url" defaultValue={course.data.externalLinkUrl || ""} className="premium-input" />
                          </label>
                        </>
                      ) : null}
                      {course.extra.map((field) => (
                        <label key={field.name} className="space-y-2">
                          <span className="text-sm text-white/60">{field.label}</span>
                          <textarea name={field.name} rows={field.rows} defaultValue={field.value} className="premium-input" />
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.03] p-5">
                <p className="text-lg text-white">{pagesSettings.about.title}</p>
                <div className="mt-5 grid gap-4 lg:grid-cols-2">
                  <label className="space-y-2 lg:col-span-2">
                    <span className="text-sm text-white/60">Titlu pagina</span>
                    <input name="about_title" defaultValue={pagesSettings.about.title} className="premium-input" />
                  </label>
                  <label className="space-y-2 lg:col-span-2">
                    <span className="text-sm text-white/60">Intro</span>
                    <textarea name="about_intro" rows={3} defaultValue={pagesSettings.about.intro} className="premium-input" />
                  </label>
                  <label className="space-y-2 lg:col-span-2">
                    <span className="text-sm text-white/60">Paragrafe</span>
                    <textarea name="about_body" rows={8} defaultValue={pagesSettings.about.body.join("\n")} className="premium-input" />
                  </label>
                  {[0, 1, 2, 3].map((index) => (
                    <div key={index} className="space-y-3 rounded-[1.25rem] border border-white/10 bg-black/20 p-4">
                      <label className="space-y-2">
                        <span className="text-sm text-white/60">URL poza {index + 1}</span>
                        <input name={`about_image_url_${index + 1}`} defaultValue={pagesSettings.about.images[index] || ""} className="premium-input" />
                      </label>
                      <label className="flex min-h-[7rem] cursor-pointer flex-col items-center justify-center gap-3 rounded-[1.25rem] border border-dashed border-white/[0.15] bg-white/[0.03] px-4 py-5 text-center text-sm text-white/75 transition hover:border-white/25 hover:text-white">
                        <Upload className="h-5 w-5" />
                        Schimba poza
                        <input type="file" name={`about_image_file_${index + 1}`} accept="image/*" className="hidden" />
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <Button type="submit" className="min-h-12">
                <Save className="h-4 w-4" />
                Salveaza continutul site-ului
              </Button>
            </form>
          </section>

          <section id="gallery" className="premium-card p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="dashboard-label">Gallery</p>
                <h2 className="mt-3 text-2xl text-white sm:text-3xl">Upload in galerie.</h2>
              </div>
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-[22rem_minmax(0,1fr)]">
              <form action={addGalleryItem} className="space-y-4 rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5">
                <label className="space-y-2">
                  <span className="text-sm text-white/60">Titlu imagine</span>
                  <input name="title" placeholder="Titlu imagine" className="premium-input" />
                </label>
                <label className="space-y-2">
                  <span className="text-sm text-white/60">Categorie</span>
                  <input name="category" defaultValue="Galerie" className="premium-input" />
                </label>
                <label className="flex min-h-[9rem] cursor-pointer flex-col items-center justify-center gap-3 rounded-[1.25rem] border border-dashed border-white/[0.15] bg-black/20 px-4 py-5 text-center text-sm text-white/75 transition hover:border-white/25 hover:text-white">
                  <Upload className="h-5 w-5" />
                  Adauga imagine din device
                  <input type="file" name="imageFile" accept="image/*" className="hidden" required />
                </label>
                <Button type="submit" className="min-h-12 w-full">
                  Adauga in galerie
                </Button>
              </form>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {galleryItems.length ? (
                  galleryItems.map((item) => (
                    <div key={item.id} className="overflow-hidden rounded-[1.25rem] border border-white/10 bg-white/[0.03]">
                      <div className="relative aspect-square">
                        <Image src={item.imageUrl} alt={item.title} fill className="object-cover" unoptimized />
                      </div>
                      <div className="space-y-3 p-4">
                        <div>
                          <p className="text-white">{item.title}</p>
                          <p className="mt-1 text-sm text-white/65">{item.category}</p>
                          <p className="mt-1 text-xs uppercase tracking-[0.24em] text-white/35">
                            {new Date(item.createdAt).toLocaleString("ro-RO")}
                          </p>
                        </div>
                        <form action={deleteGalleryItem}>
                          <input type="hidden" name="id" value={item.id} />
                          <Button type="submit" variant="secondary" className="min-h-11 w-full">
                            <Trash2 className="h-4 w-4" />
                            Sterge
                          </Button>
                        </form>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[1.25rem] border border-white/10 bg-black/20 px-4 py-6 text-sm leading-7 text-white/[0.55] sm:col-span-2 xl:col-span-3">
                    Nu exista imagini incarcate din admin.
                  </div>
                )}
              </div>
            </div>
          </section>

          <section id="users" className="premium-card overflow-hidden">
            <div className="border-b border-white/10 px-5 py-5 sm:px-6">
              <p className="dashboard-label">Users</p>
              <h2 className="mt-3 text-2xl text-white sm:text-3xl">Utilizatori recenti</h2>
            </div>
            <div className="grid gap-3 p-4 sm:p-6">
              {users.length ? (
                users.map((user) => (
                  <div key={user.id} className="rounded-[1.35rem] border border-white/10 bg-white/[0.03] p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <p className="truncate text-white">{user.email}</p>
                        <p className="mt-1 text-sm text-white/[0.55]">{user.role}</p>
                      </div>
                      <p className="text-sm text-white/[0.42]">{new Date(user.createdAt).toLocaleString("ro-RO")}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] px-4 py-5 text-sm text-white/[0.55]">
                  Nu exista utilizatori disponibili.
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
