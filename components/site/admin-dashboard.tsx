"use client";

import { useEffect, useMemo, useState, type ChangeEvent, type Dispatch, type SetStateAction } from "react";
import Image from "next/image";
import { CalendarDays, ImagePlus, Radio, Trash2, Upload, UserRound } from "lucide-react";

import { addLiveSession, deleteLiveSession, updateLiveSessionSchedule } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { useCleaningContent } from "@/components/site/use-cleaning-content";
import { defaultGalleryImages, getDefaultContentState } from "@/lib/cleaning-content";
import { formatRomaniaDateTimeLocal } from "@/lib/romania-time";

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

type AdminLiveSession = {
  id: string;
  title: string;
  description?: string;
  thumbnailUrl: string;
  visibility: string;
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

export function AdminDashboard({
  liveSessions,
  users
}: {
  liveSessions: AdminLiveSession[];
  users: AdminUser[];
}) {
  const { content, setContent } = useCleaningContent();
  const [galleryPreview, setGalleryPreview] = useState<{ title: string; subtitle: string; imageUrl: string } | null>(null);
  const [liveStartMode, setLiveStartMode] = useState<"NOW" | "SCHEDULE">("NOW");
  const [selectedLiveId, setSelectedLiveId] = useState<string | null>(liveSessions[0]?.id || null);
  const [newLiveThumbnailPreview, setNewLiveThumbnailPreview] = useState<string | null>(null);
  const [editLiveThumbnailPreview, setEditLiveThumbnailPreview] = useState<string | null>(null);

  const allGalleryItems = useMemo(
    () => [
      ...defaultGalleryImages.filter((item) => !content.hiddenAssetGalleryIds.includes(item.id)),
      ...content.uploadedGallery
    ],
    [content.hiddenAssetGalleryIds, content.uploadedGallery]
  );

  const selectedLiveSession = useMemo(
    () => liveSessions.find((session) => session.id === selectedLiveId) || liveSessions[0] || null,
    [liveSessions, selectedLiveId]
  );

  useEffect(() => {
    setEditLiveThumbnailPreview(null);
  }, [selectedLiveId]);

  const handleGalleryUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const imageUrl = await readFileAsDataUrl(file);
    const title = file.name.replace(/\.[^.]+$/, "");

    setGalleryPreview({ title, subtitle: "", imageUrl });
    event.target.value = "";
  };

  const handleLiveThumbnailUpload = async (
    event: ChangeEvent<HTMLInputElement>,
    setPreview: Dispatch<SetStateAction<string | null>>
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const imageUrl = await readFileAsDataUrl(file);
    setPreview(imageUrl);
  };

  const confirmGalleryUpload = () => {
    if (!galleryPreview || !galleryPreview.title.trim()) {
      return;
    }

    setContent((current) => ({
      ...current,
      uploadedGallery: [
        {
          id: `upload-${Date.now()}`,
          title: galleryPreview.title.trim(),
          subtitle: galleryPreview.subtitle.trim(),
          category: "Upload",
          imageUrl: galleryPreview.imageUrl,
          isUploaded: true
        },
        ...current.uploadedGallery
      ]
    }));

    setGalleryPreview(null);
  };

  const removeGalleryImage = (imageId: string, isUploaded: boolean) => {
    setContent((current) => ({
      ...current,
      uploadedGallery: isUploaded ? current.uploadedGallery.filter((item) => item.id !== imageId) : current.uploadedGallery,
      hiddenAssetGalleryIds:
        isUploaded || current.hiddenAssetGalleryIds.includes(imageId)
          ? current.hiddenAssetGalleryIds
          : [...current.hiddenAssetGalleryIds, imageId]
    }));
  };

  return (
    <section className="section-shell py-8 sm:py-12">
      <div className="grid gap-6 xl:grid-cols-[19rem_minmax(0,1fr)]">
        <aside className="xl:sticky xl:top-28 xl:self-start">
          <div className="premium-card p-5 sm:p-6">
            <p className="text-xs uppercase tracking-[0.36em] text-[#d6b98c]">Admin Control</p>
            <h1 className="mt-4 text-3xl leading-tight text-white sm:text-4xl">
              Mobil first, clar si rapid pentru operatiuni reale.
            </h1>
            <p className="mt-4 text-sm leading-7 text-white/[0.58]">
              Navigarea, programarea LIVE si managementul galeriei sunt prioritizate pentru atingere,
              viteză si vizibilitate.
            </p>
            <nav className="mt-6 grid gap-2.5">
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
            <Button
              type="button"
              variant="secondary"
              className="mt-6 min-h-12 w-full"
              onClick={() => {
                setContent(getDefaultContentState());
                setGalleryPreview(null);
                setNewLiveThumbnailPreview(null);
                setEditLiveThumbnailPreview(null);
              }}
            >
              Reseteaza continutul local
            </Button>
          </div>
        </aside>

        <div className="space-y-6">
          <section id="overview" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {[
              { label: "Users", value: users.length, icon: UserRound },
              { label: "Live Sessions", value: liveSessions.length, icon: Radio },
              { label: "Gallery Items", value: allGalleryItems.length, icon: ImagePlus }
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
                  Fara schimbari in logica live
                </div>
              </div>

              <form action={addLiveSession} encType="multipart/form-data" className="mt-6 space-y-4">
                <input name="title" required placeholder="Titlu live" className="premium-input" />
                <textarea name="description" required rows={4} placeholder="Descriere" className="premium-input" />
                <div className="grid gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
                  <label className="flex min-h-[11rem] cursor-pointer flex-col items-center justify-center gap-3 rounded-[1.5rem] border border-dashed border-white/[0.15] bg-white/[0.03] px-4 py-5 text-center text-sm text-white/75 transition hover:border-white/25 hover:text-white">
                    <Upload className="h-5 w-5" />
                    Upload thumbnail LIVE
                    <span className="text-xs uppercase tracking-[0.28em] text-white/[0.35]">PNG, JPG, WEBP</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(event) => void handleLiveThumbnailUpload(event, setNewLiveThumbnailPreview)}
                    />
                  </label>
                  <input type="hidden" name="thumbnailDataUrl" value={newLiveThumbnailPreview || ""} />
                  <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-black/25">
                    <div className="relative aspect-[16/10]">
                      {newLiveThumbnailPreview ? (
                        <Image src={newLiveThumbnailPreview} alt="Thumbnail preview" fill className="object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center px-4 text-center text-sm text-white/45">
                          Thumbnail-ul LIVE apare aici dupa upload.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
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
                <select name="visibility" defaultValue="SUBSCRIBERS" className="premium-input">
                  <option value="SUBSCRIBERS">Subscribers</option>
                  <option value="PUBLIC">Public</option>
                  <option value="ONE_TIME">One time</option>
                </select>
                <input name="price" type="number" placeholder="Pret in bani, ex 1900" className="premium-input" />
                <Button type="submit" className="min-h-12 w-full sm:w-auto">
                  Adauga sesiune live
                </Button>
              </form>
            </div>

            <div className="space-y-6">
              <div className="premium-card p-5 sm:p-6">
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
                  <form action={updateLiveSessionSchedule} encType="multipart/form-data" className="mt-6 space-y-4">
                    <input type="hidden" name="id" value={selectedLiveSession.id} />
                    <div className="grid gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
                      <label className="flex min-h-[11rem] cursor-pointer flex-col items-center justify-center gap-3 rounded-[1.5rem] border border-dashed border-white/[0.15] bg-white/[0.03] px-4 py-5 text-center text-sm text-white/75 transition hover:border-white/25 hover:text-white">
                        <Upload className="h-5 w-5" />
                        Schimba thumbnail-ul
                        <span className="text-xs uppercase tracking-[0.28em] text-white/[0.35]">Optional</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(event) => void handleLiveThumbnailUpload(event, setEditLiveThumbnailPreview)}
                        />
                      </label>
                      <input type="hidden" name="thumbnailDataUrl" value={editLiveThumbnailPreview || ""} />
                      <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-black/25">
                        <div className="relative aspect-[16/10]">
                          <Image
                            src={editLiveThumbnailPreview || selectedLiveSession.thumbnailUrl}
                            alt={selectedLiveSession.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </div>
                    </div>
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
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <Button type="submit" name="mode" value="UPDATE" className="min-h-12">
                        Salveaza timerul
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
                    liveSessions.map((session) => (
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
                              {session.visibility} • {session.isLive ? "LIVE" : "scheduled"} •{" "}
                              {new Date(session.scheduledFor).toLocaleString("ro-RO", { timeZone: "Europe/Bucharest" })}
                            </p>
                            {session.recordingUrl ? <p className="mt-2 text-xs uppercase tracking-[0.26em] text-white/[0.35]">VOD salvat</p> : null}
                          </div>
                          <div className="flex flex-col gap-2 sm:min-w-[11rem]">
                            <Button type="button" variant="secondary" className="min-h-11" onClick={() => setSelectedLiveId(session.id)}>
                              <CalendarDays className="h-4 w-4" />
                              Editeaza timer
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
                    ))
                  ) : (
                    <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] px-4 py-5 text-sm text-white/[0.55]">
                      Nu exista sesiuni live.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section id="gallery" className="premium-card p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="dashboard-label">Gallery</p>
                <h2 className="mt-3 text-2xl text-white sm:text-3xl">Upload poze noua in galerie.</h2>
              </div>
              <div className="rounded-full bg-white/[0.04] px-4 py-2 text-[11px] uppercase tracking-[0.32em] text-white/[0.48]">
                Touch friendly
              </div>
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-[20rem_minmax(0,1fr)]">
              <div className="space-y-4 rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5">
                <label className="flex min-h-[8rem] cursor-pointer flex-col items-center justify-center gap-3 rounded-[1.25rem] border border-dashed border-white/[0.15] bg-black/20 px-4 py-5 text-center text-sm text-white/75 transition hover:border-white/25 hover:text-white">
                  <Upload className="h-5 w-5" />
                  Adauga imagine din device
                  <span className="text-xs uppercase tracking-[0.28em] text-white/[0.35]">PNG, JPG, WEBP</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleGalleryUpload} />
                </label>

                {galleryPreview ? (
                  <div className="overflow-hidden rounded-[1.25rem] border border-white/10 bg-black/30">
                    <div className="relative aspect-[4/3]">
                      <Image src={galleryPreview.imageUrl} alt={galleryPreview.title} fill className="object-cover" />
                    </div>
                    <div className="flex flex-col gap-4 p-5">
                      <label className="space-y-2">
                        <span className="text-sm text-white/60">Titlu imagine</span>
                        <input
                          value={galleryPreview.title}
                          onChange={(event) =>
                            setGalleryPreview((current) => (current ? { ...current, title: event.target.value } : current))
                          }
                          placeholder="Titlu imagine"
                          className="premium-input"
                        />
                      </label>
                      <label className="space-y-2">
                        <span className="text-sm text-white/60">Subtitle imagine</span>
                        <input
                          value={galleryPreview.subtitle}
                          onChange={(event) =>
                            setGalleryPreview((current) => (current ? { ...current, subtitle: event.target.value } : current))
                          }
                          placeholder="Subtitle imagine"
                          className="premium-input"
                        />
                      </label>
                      <p className="text-sm text-white/50">Preview inainte de salvare</p>
                      <div className="flex flex-col gap-2">
                        <Button
                          type="button"
                          className="min-h-11"
                          onClick={confirmGalleryUpload}
                          disabled={!galleryPreview.title.trim()}
                        >
                          Adauga in galerie
                        </Button>
                        <Button type="button" variant="secondary" className="min-h-11" onClick={() => setGalleryPreview(null)}>
                          Anuleaza
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-[1.25rem] border border-white/10 bg-black/20 px-4 py-6 text-sm leading-7 text-white/[0.55]">
                    Alege o imagine pentru preview.
                  </div>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {allGalleryItems.map((item) => (
                  <div key={item.id} className="overflow-hidden rounded-[1.25rem] border border-white/10 bg-white/[0.03]">
                    <div className="relative aspect-square">
                      <Image src={item.imageUrl} alt={item.title} fill className="object-cover" />
                    </div>
                    <div className="space-y-3 p-4">
                      <div>
                        <p className="text-white">{item.title}</p>
                        {"subtitle" in item && item.subtitle ? <p className="mt-1 text-sm text-white/65">{item.subtitle}</p> : null}
                        <p className="text-sm text-white/50">{item.category}</p>
                      </div>
                      <Button
                        type="button"
                        variant="secondary"
                        className="min-h-11 w-full"
                        onClick={() => removeGalleryImage(item.id, "isUploaded" in item && item.isUploaded)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Sterge
                      </Button>
                    </div>
                  </div>
                ))}
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


