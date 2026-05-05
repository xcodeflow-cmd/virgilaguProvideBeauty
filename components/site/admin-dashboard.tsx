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
  label?: string;
  title: string;
  shortTitle?: string;
  note?: string;
  shortDescription?: string;
  dialogBody?: string;
  imageUrl?: string;
  externalLinkLabel?: string;
  externalLinkUrl?: string;
  includeTitle?: string;
  learnTitle?: string;
  advantage?: string;
  purchaseLabel?: string;
  inquiryLabel?: string;
  cardActionLabel?: string;
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

function splitDateTime(value: string) {
  const [date = "", time = ""] = value.split("T");

  return {
    date,
    time: time.slice(0, 5)
  };
}

export function AdminDashboard({
  galleryItems,
  liveSessions,
  pagesSettings: _pagesSettings,
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
  const [newLiveVisibility, setNewLiveVisibility] = useState<"PUBLIC" | "ONE_TIME">("PUBLIC");
  const [selectedLiveId, setSelectedLiveId] = useState<string | null>(liveSessions[0]?.id || null);
  const [editLiveVisibility, setEditLiveVisibility] = useState<"PUBLIC" | "ONE_TIME">(
    liveSessions[0]?.visibility === "ONE_TIME" ? "ONE_TIME" : "PUBLIC"
  );
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

  useEffect(() => {
    setEditLiveVisibility(selectedLiveSession?.visibility === "ONE_TIME" ? "ONE_TIME" : "PUBLIC");
  }, [selectedLiveSession?.id, selectedLiveSession?.visibility]);

  const courseCards = [
    {
      key: "beginner",
      labelName: "beginner_label",
      titleName: "beginner_title",
      shortTitleName: "beginner_short_title",
      noteName: "beginner_note",
      shortName: "beginner_short_description",
      detailName: "beginner_dialog_body",
      detailLabel: "Descriere detaliata",
      detailValue: courseSettings.beginner.dialogBody || "",
      imageUrlName: "beginner_image_url",
      imageFileName: "beginner_image_file",
      linkLabelName: "beginner_link_label",
      linkUrlName: "beginner_link_url",
      includeTitleName: "beginner_include_title",
      learnTitleName: "beginner_learn_title",
      purchaseLabelName: "beginner_purchase_label",
      inquiryLabelName: "beginner_inquiry_label",
      cardActionLabelName: "beginner_card_action_label",
      extra: [
        { label: "Puncte descriere", name: "beginner_description", rows: 5, value: toTextarea(courseSettings.beginner.description) },
        { label: "Achievements", name: "beginner_achievements", rows: 4, value: toTextarea(courseSettings.beginner.achievements) }
      ],
      data: courseSettings.beginner
    },
    {
      key: "advanced",
      labelName: "advanced_label",
      titleName: "advanced_title",
      shortTitleName: "advanced_short_title",
      noteName: "advanced_note",
      shortName: "advanced_short_description",
      detailName: "advanced_description",
      detailLabel: "Descriere detaliata",
      detailValue: toTextarea(courseSettings.advanced.description),
      imageUrlName: "advanced_image_url",
      imageFileName: "advanced_image_file",
      includeTitleName: "advanced_include_title",
      learnTitleName: "advanced_learn_title",
      advantageName: "advanced_advantage",
      purchaseLabelName: "advanced_purchase_label",
      inquiryLabelName: "advanced_inquiry_label",
      cardActionLabelName: "advanced_card_action_label",
      extra: [
        { label: "Descriere lunga", name: "advanced_dialog_body", rows: 4, value: courseSettings.advanced.dialogBody || "" },
        { label: "Include", name: "advanced_includes", rows: 6, value: toTextarea(courseSettings.advanced.includes) },
        { label: "Rezultate", name: "advanced_outcomes", rows: 5, value: toTextarea(courseSettings.advanced.outcomes) }
      ],
      data: courseSettings.advanced
    },
    {
      key: "live",
      labelName: "live_label",
      titleName: "live_title",
      shortTitleName: "live_short_title",
      noteName: "live_note",
      shortName: "live_short_description",
      detailName: "live_description",
      detailLabel: "Descriere detaliata",
      detailValue: toTextarea(courseSettings.liveExperience.description),
      imageUrlName: "live_image_url",
      imageFileName: "live_image_file",
      includeTitleName: "live_include_title",
      learnTitleName: "live_learn_title",
      advantageName: "live_advantage",
      purchaseLabelName: "live_purchase_label",
      inquiryLabelName: "live_inquiry_label",
      cardActionLabelName: "live_card_action_label",
      extra: [
        { label: "Descriere lunga", name: "live_dialog_body", rows: 4, value: courseSettings.liveExperience.dialogBody || "" },
        { label: "Include", name: "live_includes", rows: 6, value: toTextarea(courseSettings.liveExperience.includes) },
        { label: "Rezultate", name: "live_outcomes", rows: 4, value: toTextarea(courseSettings.liveExperience.outcomes) }
      ],
      data: courseSettings.liveExperience
    }
  ] as const;
  const selectedSchedule = selectedLiveSession ? splitDateTime(formatRomaniaDateTimeLocal(new Date(selectedLiveSession.scheduledFor))) : null;

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
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    name="scheduleDate"
                    type="date"
                    disabled={liveStartMode !== "SCHEDULE"}
                    className="premium-input min-h-[3.5rem] disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <input
                    name="scheduleTime"
                    type="time"
                    step="60"
                    disabled={liveStartMode !== "SCHEDULE"}
                    className="premium-input min-h-[3.5rem] disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
                <div className="space-y-2">
                  <span className="text-sm text-white/60">Tip acces</span>
                  <input type="hidden" name="visibility" value={newLiveVisibility} />
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      {
                        value: "PUBLIC" as const,
                        title: "Public",
                        description: "Fara plata. Live-ul si replay-ul sunt libere."
                      },
                      {
                        value: "ONE_TIME" as const,
                        title: "One time",
                        description: "Necesita plata. Replay doar pentru cumparator."
                      }
                    ].map((option) => {
                      const active = newLiveVisibility === option.value;

                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setNewLiveVisibility(option.value)}
                          className={`rounded-[1.35rem] border px-4 py-4 text-left transition ${
                            active
                              ? "border-[#d6b98c]/45 bg-[linear-gradient(180deg,rgba(214,185,140,0.18),rgba(214,185,140,0.08))] shadow-[0_18px_40px_rgba(214,185,140,0.12)]"
                              : "border-white/10 bg-white/[0.03] hover:border-white/20"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-base text-white">{option.title}</span>
                            <span className={`h-3.5 w-3.5 rounded-full border ${active ? "border-[#d6b98c] bg-[#d6b98c]" : "border-white/30 bg-transparent"}`} />
                          </div>
                          <p className="mt-2 text-sm leading-6 text-white/55">{option.description}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <input name="thumbnailUrl" placeholder="URL thumbnail optional" className="premium-input" />
                <label className="flex min-h-[7rem] cursor-pointer flex-col items-center justify-center gap-3 rounded-[1.25rem] border border-dashed border-white/[0.15] bg-black/20 px-4 py-5 text-center text-sm text-white/75 transition hover:border-white/25 hover:text-white">
                  <Upload className="h-5 w-5" />
                  Adauga poza optionala pentru live
                  <input type="file" name="thumbnailFile" accept="image/*" className="hidden" />
                </label>
                <input
                  name="price"
                  type="number"
                  min="1"
                  step="1"
                  required={newLiveVisibility === "ONE_TIME"}
                  disabled={newLiveVisibility !== "ONE_TIME"}
                  placeholder={newLiveVisibility === "ONE_TIME" ? "Pret obligatoriu in lei" : "Pret disponibil doar pentru one time"}
                  className="premium-input disabled:cursor-not-allowed disabled:opacity-50"
                />
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
                        <div className="grid gap-3">
                          <input
                            name="scheduleDate"
                            type="date"
                            defaultValue={selectedSchedule?.date || ""}
                            className="premium-input min-h-[3.5rem]"
                          />
                          <input
                            name="scheduleTime"
                            type="time"
                            step="60"
                            defaultValue={selectedSchedule?.time || ""}
                            className="premium-input min-h-[3.5rem]"
                          />
                        </div>
                      </label>
                    </div>
                    <label className="space-y-2">
                      <span className="text-sm text-white/60">Descriere</span>
                      <textarea name="description" rows={4} defaultValue={selectedLiveSession.description || ""} className="premium-input" />
                    </label>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="space-y-2">
                        <span className="text-sm text-white/60">Pret live</span>
                        <input
                          name="price"
                          type="number"
                          min="1"
                          step="1"
                          required={editLiveVisibility === "ONE_TIME"}
                          disabled={editLiveVisibility !== "ONE_TIME"}
                          defaultValue={selectedLiveSession.price || ""}
                          placeholder={editLiveVisibility === "ONE_TIME" ? "Pret obligatoriu in lei" : "Pret indisponibil pentru public"}
                          className="premium-input disabled:cursor-not-allowed disabled:opacity-50"
                        />
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
                      <input type="hidden" name="visibility" value={editLiveVisibility} />
                      <div className="grid gap-3 sm:grid-cols-2">
                        {[
                          {
                            value: "PUBLIC" as const,
                            title: "Public",
                            description: "Fara plata. Live-ul si replay-ul sunt libere."
                          },
                          {
                            value: "ONE_TIME" as const,
                            title: "One time",
                            description: "Necesita plata. Replay doar pentru cumparator."
                          }
                        ].map((option) => {
                          const active = editLiveVisibility === option.value;

                          return (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => setEditLiveVisibility(option.value)}
                              className={`rounded-[1.35rem] border px-4 py-4 text-left transition ${
                                active
                                  ? "border-[#d6b98c]/45 bg-[linear-gradient(180deg,rgba(214,185,140,0.18),rgba(214,185,140,0.08))] shadow-[0_18px_40px_rgba(214,185,140,0.12)]"
                                  : "border-white/10 bg-white/[0.03] hover:border-white/20"
                              }`}
                            >
                              <div className="flex items-center justify-between gap-3">
                                <span className="text-base text-white">{option.title}</span>
                                <span className={`h-3.5 w-3.5 rounded-full border ${active ? "border-[#d6b98c] bg-[#d6b98c]" : "border-white/30 bg-transparent"}`} />
                              </div>
                              <p className="mt-2 text-sm leading-6 text-white/55">{option.description}</p>
                            </button>
                          );
                        })}
                      </div>
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
                              <Image src={session.thumbnailUrl} alt={session.title} fill className="object-contain" unoptimized />
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
                <h2 className="mt-3 text-2xl text-white sm:text-3xl">Cursuri</h2>
              </div>
            </div>

            <form action={updateSiteSettings} className="mt-6 space-y-8">
              <div className="grid gap-5 xl:grid-cols-3">
                {courseCards.map((course) => (
                  <div key={course.key} className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5">
                    <p className="text-lg text-white">{course.data.title}</p>
                    <div className="mt-4 space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <label className="space-y-2">
                          <span className="text-sm text-white/60">Eticheta</span>
                          <input name={course.labelName} defaultValue={course.data.label || ""} className="premium-input" />
                        </label>
                        <label className="space-y-2">
                          <span className="text-sm text-white/60">Subtitlu scurt</span>
                          <input name={course.shortTitleName} defaultValue={course.data.shortTitle || ""} className="premium-input" />
                        </label>
                      </div>
                      <label className="space-y-2">
                        <span className="text-sm text-white/60">Titlu</span>
                        <input name={course.titleName} defaultValue={course.data.title} className="premium-input" />
                      </label>
                      <label className="space-y-2">
                        <span className="text-sm text-white/60">Nota card</span>
                        <input name={course.noteName} defaultValue={course.data.note || ""} className="premium-input" />
                      </label>
                      <label className="space-y-2">
                        <span className="text-sm text-white/60">Descriere scurta</span>
                        <textarea name={course.shortName} rows={4} defaultValue={course.data.shortDescription || ""} className="premium-input" />
                      </label>
                      <label className="space-y-2">
                        <span className="text-sm text-white/60">{course.detailLabel}</span>
                        <textarea name={course.detailName} rows={6} defaultValue={course.detailValue} className="premium-input" />
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
                          <div className="grid gap-4 sm:grid-cols-2">
                            <label className="space-y-2">
                              <span className="text-sm text-white/60">Titlu sectiune 1</span>
                              <input name={course.includeTitleName} defaultValue={course.data.includeTitle || ""} className="premium-input" />
                            </label>
                            <label className="space-y-2">
                              <span className="text-sm text-white/60">Titlu sectiune 2</span>
                              <input name={course.learnTitleName} defaultValue={course.data.learnTitle || ""} className="premium-input" />
                            </label>
                          </div>
                          <label className="space-y-2">
                            <span className="text-sm text-white/60">Eticheta link</span>
                            <input name="beginner_link_label" defaultValue={course.data.externalLinkLabel || ""} className="premium-input" />
                          </label>
                          <label className="space-y-2">
                            <span className="text-sm text-white/60">Link descriere</span>
                            <input name="beginner_link_url" defaultValue={course.data.externalLinkUrl || ""} className="premium-input" />
                          </label>
                          <div className="grid gap-4 sm:grid-cols-2">
                            <label className="space-y-2">
                              <span className="text-sm text-white/60">Text buton principal</span>
                              <input name={course.cardActionLabelName} defaultValue={course.data.cardActionLabel || ""} className="premium-input" />
                            </label>
                            <label className="space-y-2">
                              <span className="text-sm text-white/60">Text cere info</span>
                              <input name={course.inquiryLabelName} defaultValue={course.data.inquiryLabel || ""} className="premium-input" />
                            </label>
                          </div>
                        </>
                      ) : null}
                      {course.key !== "beginner" ? (
                        <>
                          <div className="grid gap-4 sm:grid-cols-2">
                            <label className="space-y-2">
                              <span className="text-sm text-white/60">Titlu sectiune 1</span>
                              <input name={course.includeTitleName} defaultValue={course.data.includeTitle || ""} className="premium-input" />
                            </label>
                            <label className="space-y-2">
                              <span className="text-sm text-white/60">Titlu sectiune 2</span>
                              <input name={course.learnTitleName} defaultValue={course.data.learnTitle || ""} className="premium-input" />
                            </label>
                          </div>
                          <label className="space-y-2">
                            <span className="text-sm text-white/60">Bloc avantaj</span>
                            <textarea name={course.advantageName} rows={4} defaultValue={course.data.advantage || ""} className="premium-input" />
                          </label>
                          <div className="grid gap-4 sm:grid-cols-2">
                            <label className="space-y-2">
                              <span className="text-sm text-white/60">Text buton cumparare</span>
                              <input name={course.purchaseLabelName} defaultValue={course.data.purchaseLabel || ""} className="premium-input" />
                            </label>
                            <label className="space-y-2">
                              <span className="text-sm text-white/60">Text cere info</span>
                              <input name={course.inquiryLabelName} defaultValue={course.data.inquiryLabel || ""} className="premium-input" />
                            </label>
                          </div>
                          <label className="space-y-2">
                            <span className="text-sm text-white/60">Text buton card</span>
                            <input name={course.cardActionLabelName} defaultValue={course.data.cardActionLabel || ""} className="premium-input" />
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
