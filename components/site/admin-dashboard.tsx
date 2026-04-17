"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { CalendarDays, ImagePlus, Radio, Trash2, Upload, UserRound } from "lucide-react";

import { addGalleryItem, addLiveSession, deleteGalleryItem, deleteLiveSession, updateCoursePricing, updateLiveSessionSchedule } from "@/app/admin/actions";
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

type AdminCourseSettings = {
  beginner: {
    title: string;
    pricing?: {
      priceValue: number;
      compareAtPriceValue: number | null;
    };
  };
  advanced: {
    title: string;
    pricing?: {
      priceValue: number;
      compareAtPriceValue: number | null;
    };
  };
  liveExperience: {
    title: string;
    pricing?: {
      priceValue: number;
      compareAtPriceValue: number | null;
    };
  };
};

type AdminGalleryItem = {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  createdAt: string;
};

export function AdminDashboard({
  galleryItems,
  liveSessions,
  users,
  courseSettings
}: {
  galleryItems: AdminGalleryItem[];
  liveSessions: AdminLiveSession[];
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

  return (
    <section className="section-shell py-8 sm:py-12">
      <div className="grid gap-6 xl:grid-cols-[19rem_minmax(0,1fr)]">
        <aside className="xl:sticky xl:top-28 xl:self-start">
          <div className="premium-card p-5 sm:p-6">
            <p className="hidden">
              Navigarea, programarea LIVE si managementul galeriei sunt prioritizate pentru atingere,
              viteză si vizibilitate.
            </p>
            <nav className="grid gap-2.5">
              {[ 
                { href: "#overview", label: "Overview" },
                { href: "#live", label: "Live timer" },
                { href: "#gallery", label: "Gallery" },
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
                  <h2 className="mt-3 text-2xl text-white sm:text-3xl">Seteaza, editeaza sau reseteaza countdown-ul.</h2>
                </div>
                <div className="rounded-full bg-[#d6b98c]/10 px-4 py-2 text-[11px] uppercase tracking-[0.32em] text-[#f0dbba]">
                  Acces per sesiune
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
                <input type="hidden" name="visibility" value="ONE_TIME" />
                <input name="price" type="number" min="1" step="1" required placeholder="Pret in lei, ex 50" className="premium-input" />
                <Button type="submit" className="min-h-12 w-full sm:w-auto">
                  Adauga sesiune live
                </Button>
              </form>
            </div>

            <div className="space-y-6">
              <div ref={liveEditorRef} className="premium-card p-5 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="dashboard-label">Countdown editor</p>
                    <h3 className="mt-3 text-2xl text-white">Timer activ pentru LIVE</h3>
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
                      <textarea
                        name="description"
                        rows={4}
                        defaultValue={selectedLiveSession.description || ""}
                        className="premium-input"
                      />
                    </label>
                    <label className="space-y-2">
                      <span className="text-sm text-white/60">Pret live</span>
                      <input
                        name="price"
                        type="number"
                        min="1"
                        step="1"
                        defaultValue={selectedLiveSession.price || ""}
                        className="premium-input"
                      />
                      <p className="text-xs leading-5 text-white/45">
                        Valoarea se salveaza direct in lei. Exemplu: 50 = 50 RON. Daca salvezi un pret mai mic decat cel anterior,
                        site-ul afiseaza automat reducerea cu pretul vechi taiat.
                      </p>
                    </label>
                    {selectedLiveSession.compareAtPrice && selectedLiveSession.price && selectedLiveSession.compareAtPrice > selectedLiveSession.price ? (
                      <div className="rounded-[1.35rem] border border-[#d6b98c]/20 bg-[#d6b98c]/10 px-4 py-4 text-sm text-[#f3dfbf]">
                        Reducere activa: {formatLei(selectedLiveSession.compareAtPrice || 0)} {"->"} {formatLei(selectedLiveSession.price || 0)}
                      </div>
                    ) : null}
                    <label className="space-y-2">
                      <span className="text-sm text-white/60">Tip acces</span>
                      <select
                        name="visibility"
                        defaultValue={selectedLiveSession.visibility}
                        className="premium-input"
                      >
                        <option value="ONE_TIME">One time</option>
                        <option value="PUBLIC">Public</option>
                      </select>
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
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="dashboard-label">Sesiuni</p>
                  </div>
                </div>
                <div className="mt-6 grid gap-3">
                  {liveSessions.length ? (
                    liveSessions.map((session) => {
                      const hasDiscount = Boolean(session.compareAtPrice && session.price && session.compareAtPrice > session.price);
                      const discountPercent = hasDiscount
                        ? Math.round((((session.compareAtPrice || 0) - (session.price || 0)) / (session.compareAtPrice || 1)) * 100)
                        : 0;

                      return (
                        <div
                        key={session.id}
                        className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4"
                      >
                        <div className="relative mb-4 aspect-[16/10] overflow-hidden rounded-[1.2rem] border border-white/10 bg-black/25">
                          <Image src={session.thumbnailUrl} alt={session.title} fill className="object-cover" />
                        </div>
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <p className="text-base text-white">{session.title}</p>
                            <p className="mt-2 text-sm leading-6 text-white/[0.52]">
                              {session.visibility} • {session.isLive ? "LIVE" : "programat"} •{" "}
                              {new Date(session.scheduledFor).toLocaleString("ro-RO", { timeZone: "Europe/Bucharest" })}
                            </p>
                            {session.price ? (
                              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                                {hasDiscount ? (
                                  <span className="text-white/35 line-through">{formatLei(session.compareAtPrice || 0)}</span>
                                ) : null}
                                <span className="text-white/[0.58]">{formatLei(session.price)}</span>
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
                <h2 className="mt-3 text-2xl text-white sm:text-3xl">Reduceri vizibile si pe site-ul public.</h2>
              </div>
              <div className="rounded-full bg-[#d6b98c]/10 px-4 py-2 text-[11px] uppercase tracking-[0.32em] text-[#f0dbba]">
                Public + checkout
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
                      <div className="mt-4 rounded-[1.2rem] border border-[#d6b98c]/20 bg-[#d6b98c]/10 px-4 py-4 text-sm text-[#f3dfbf]">
                        {formatLei(course.compareAt || 0)} {"->"} {formatLei(course.price)}
                      </div>
                    ) : (
                      <p className="mt-4 text-sm text-white/45">
                        Daca setezi un pret mai mic decat cel anterior, reducerea apare automat pe homepage, pagina de cursuri si checkout.
                      </p>
                    )}
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

          <section id="gallery" className="premium-card p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="dashboard-label">Gallery</p>
                <h2 className="mt-3 text-2xl text-white sm:text-3xl">Upload in galerie.</h2>
              </div>
              <div className="rounded-full bg-white/[0.04] px-4 py-2 text-[11px] uppercase tracking-[0.32em] text-white/[0.48]">
                Global sync
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
                  <span className="text-xs uppercase tracking-[0.28em] text-white/[0.35]">PNG, JPG, WEBP</span>
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


