"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import Image from "next/image";
import { Pencil, Trash2, Upload } from "lucide-react";

import { addLiveSession, deleteLiveSession } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { useCleaningContent } from "@/components/site/use-cleaning-content";
import {
  cleaningAssetImages,
  defaultGalleryImages,
  getAssetImageById,
  getDefaultContentState,
  type ServiceItem
} from "@/lib/cleaning-content";

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

const emptyServiceDraft = {
  title: "",
  description: "",
  imageId: cleaningAssetImages[0].id
};

type AdminLiveSession = {
  id: string;
  title: string;
  visibility: string;
  isLive: boolean;
  scheduledFor: string;
  recordingUrl: string;
  isFeatured: boolean;
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
  const [serviceDraft, setServiceDraft] = useState(emptyServiceDraft);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [galleryPreview, setGalleryPreview] = useState<{ title: string; imageUrl: string } | null>(null);
  const [liveStartMode, setLiveStartMode] = useState<"NOW" | "SCHEDULE">("NOW");

  const allGalleryItems = useMemo(
    () => [...defaultGalleryImages, ...content.uploadedGallery],
    [content.uploadedGallery]
  );

  const resetDraft = () => {
    setServiceDraft(emptyServiceDraft);
    setEditingServiceId(null);
  };

  const handleServiceSave = () => {
    if (!serviceDraft.title.trim() || !serviceDraft.description.trim()) {
      return;
    }

    const nextService: ServiceItem = {
      id: editingServiceId || `service-${Date.now()}`,
      title: serviceDraft.title.trim(),
      description: serviceDraft.description.trim(),
      imageId: serviceDraft.imageId
    };

    setContent((current) => ({
      ...current,
      services: editingServiceId
        ? current.services.map((service) => (service.id === editingServiceId ? nextService : service))
        : [...current.services, nextService]
    }));

    resetDraft();
  };

  const handleEditService = (service: ServiceItem) => {
    setEditingServiceId(service.id);
    setServiceDraft({
      title: service.title,
      description: service.description,
      imageId: service.imageId
    });
  };

  const handleDeleteService = (serviceId: string) => {
    setContent((current) => ({
      ...current,
      services: current.services.filter((service) => service.id !== serviceId)
    }));
    if (editingServiceId === serviceId) {
      resetDraft();
    }
  };

  const handleGalleryUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const imageUrl = await readFileAsDataUrl(file);
    const title = file.name.replace(/\.[^.]+$/, "");

    setGalleryPreview({ title, imageUrl });
    event.target.value = "";
  };

  const confirmGalleryUpload = () => {
    if (!galleryPreview) {
      return;
    }

    setContent((current) => ({
      ...current,
      uploadedGallery: [
        {
          id: `upload-${Date.now()}`,
          title: galleryPreview.title,
          category: "Upload",
          imageUrl: galleryPreview.imageUrl,
          isUploaded: true
        },
        ...current.uploadedGallery
      ]
    }));

    setGalleryPreview(null);
  };

  const removeUploadedImage = (imageId: string) => {
    setContent((current) => ({
      ...current,
      uploadedGallery: current.uploadedGallery.filter((item) => item.id !== imageId)
    }));
  };

  return (
    <section className="section-shell py-12 sm:py-16">
      <div className="grid gap-8 xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="xl:sticky xl:top-28 xl:self-start">
          <div className="premium-card p-6">
            <p className="text-xs uppercase tracking-[0.36em] text-[#d6b98c]">Admin</p>
            <h1 className="mt-4 text-4xl leading-tight text-white">Dashboard SaaS pentru control vizual.</h1>
            <p className="mt-4 text-sm leading-7 text-white/58">
              UI nou pentru users, live, courses si gallery. Actiunile si logica raman neschimbate.
            </p>
            <nav className="mt-8 grid gap-2">
              <a href="#users" className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/72 transition hover:border-[#d6b98c]/35 hover:text-white">Users</a>
              <a href="#live" className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/72 transition hover:border-[#d6b98c]/35 hover:text-white">Live</a>
              <a href="#courses" className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/72 transition hover:border-[#d6b98c]/35 hover:text-white">Courses</a>
              <a href="#gallery" className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/72 transition hover:border-[#d6b98c]/35 hover:text-white">Gallery</a>
            </nav>
            <Button
              type="button"
              variant="secondary"
              className="mt-8 w-full"
              onClick={() => {
                setContent(getDefaultContentState());
                resetDraft();
                setGalleryPreview(null);
              }}
            >
              Reseteaza continutul local
            </Button>
          </div>
        </aside>

        <div className="space-y-8">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="premium-card p-5"><p className="dashboard-label">Users</p><p className="mt-3 text-3xl text-white">{users.length}</p></div>
            <div className="premium-card p-5"><p className="dashboard-label">Live Sessions</p><p className="mt-3 text-3xl text-white">{liveSessions.length}</p></div>
            <div className="premium-card p-5"><p className="dashboard-label">Gallery Items</p><p className="mt-3 text-3xl text-white">{allGalleryItems.length}</p></div>
          </div>

          <section id="users" className="premium-card overflow-hidden">
            <div className="border-b border-white/10 px-6 py-5">
              <p className="dashboard-label">Users</p>
              <h2 className="mt-3 text-2xl text-white">Utilizatori recenti</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-white/10 text-white/38">
                  <tr>
                    <th className="px-6 py-4 font-medium">Email</th>
                    <th className="px-6 py-4 font-medium">Rol</th>
                    <th className="px-6 py-4 font-medium">Creat la</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length ? users.map((user) => (
                    <tr key={user.id} className="border-b border-white/6 last:border-b-0">
                      <td className="px-6 py-4 text-white/82">{user.email}</td>
                      <td className="px-6 py-4 text-white/60">{user.role}</td>
                      <td className="px-6 py-4 text-white/45">{new Date(user.createdAt).toLocaleString("ro-RO")}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-white/45">Nu exista utilizatori disponibili.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <div className="grid gap-6 2xl:grid-cols-[1.05fr_0.95fr]">
            <section id="courses" className="premium-card p-6">
              <p className="dashboard-label">Courses</p>
              <h2 className="mt-3 text-2xl text-white">Carduri cursuri</h2>
              <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_280px]">
                <div className="space-y-4">
                  <input value={serviceDraft.title} onChange={(event) => setServiceDraft((current) => ({ ...current, title: event.target.value }))} placeholder="Titlu card" className="premium-input" />
                  <textarea value={serviceDraft.description} onChange={(event) => setServiceDraft((current) => ({ ...current, description: event.target.value }))} placeholder="Descriere card" rows={4} className="premium-input" />
                  <div className="grid gap-3 sm:grid-cols-2">
                    {cleaningAssetImages.map((image) => {
                      const active = image.id === serviceDraft.imageId;
                      return (
                        <button
                          key={image.id}
                          type="button"
                          onClick={() => setServiceDraft((current) => ({ ...current, imageId: image.id }))}
                          className={`overflow-hidden rounded-[1.25rem] border text-left transition ${active ? "border-[#d6b98c]/45 bg-[#d6b98c]/8" : "border-white/10 bg-white/[0.03] hover:border-white/20"}`}
                        >
                          <div className="relative aspect-[4/3]">
                            <Image src={image.src} alt={image.label} fill className="object-cover" />
                          </div>
                          <div className="px-4 py-3 text-sm text-white/75">{image.label}</div>
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button type="button" onClick={handleServiceSave}>{editingServiceId ? "Salveaza modificarile" : "Adauga card"}</Button>
                    {editingServiceId ? <Button type="button" variant="secondary" onClick={resetDraft}>Anuleaza</Button> : null}
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
                  <p className="dashboard-label">Preview</p>
                  <div className="mt-4 overflow-hidden rounded-[1.25rem] border border-white/10 bg-black/30">
                    <div className="relative aspect-[4/3]">
                      <Image src={getAssetImageById(serviceDraft.imageId).src} alt={serviceDraft.title || "Card preview"} fill className="object-cover" />
                    </div>
                    <div className="space-y-3 p-5">
                      <h3 className="text-2xl text-white">{serviceDraft.title || "Titlu card"}</h3>
                      <p className="text-sm leading-7 text-white/58">{serviceDraft.description || "Descrierea cardului apare aici inainte sa salvezi."}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 grid gap-4">
                {content.services.map((service) => (
                  <div key={service.id} className="flex flex-col gap-4 rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative h-16 w-20 overflow-hidden rounded-xl">
                        <Image src={getAssetImageById(service.imageId).src} alt={service.title} fill className="object-cover" />
                      </div>
                      <div>
                        <p className="text-white">{service.title}</p>
                        <p className="mt-1 text-sm text-white/50">{service.description}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button type="button" variant="secondary" onClick={() => handleEditService(service)}><Pencil className="h-4 w-4" />Editeaza</Button>
                      <Button type="button" variant="secondary" onClick={() => handleDeleteService(service.id)}><Trash2 className="h-4 w-4" />Sterge</Button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section id="live" className="overflow-hidden rounded-[2rem] bg-[radial-gradient(circle_at_top,rgba(214,185,140,0.12),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] p-6 shadow-[0_26px_80px_rgba(0,0,0,0.2)]">
              <p className="dashboard-label">Live</p>
              <h2 className="mt-3 text-3xl text-white">Programeaza urmatoarea sesiune LIVE</h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-white/60">Formularul de programare trebuie sa arate la fel de premium ca pagina pe care o controleaza.</p>
              <form action={addLiveSession} className="mt-6 space-y-4">
                <input name="title" required placeholder="Titlu live" className="premium-input" />
                <input name="slug" placeholder="slug-live" className="premium-input" />
                <textarea name="description" required rows={4} placeholder="Descriere" className="premium-input" />
                <input name="thumbnailUrl" required placeholder="URL thumbnail" className="premium-input" />
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="flex items-center gap-3 rounded-[1.5rem] bg-white/[0.04] px-4 py-4 text-sm text-white/75 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                    <input type="radio" name="startMode" value="NOW" checked={liveStartMode === "NOW"} onChange={() => setLiveStartMode("NOW")} />
                    Start Now
                  </label>
                  <label className="flex items-center gap-3 rounded-[1.5rem] bg-white/[0.04] px-4 py-4 text-sm text-white/75 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                    <input type="radio" name="startMode" value="SCHEDULE" checked={liveStartMode === "SCHEDULE"} onChange={() => setLiveStartMode("SCHEDULE")} />
                    Schedule
                  </label>
                </div>
                <input name="scheduledFor" type="datetime-local" disabled={liveStartMode !== "SCHEDULE"} className="premium-input disabled:cursor-not-allowed disabled:opacity-50" />
                <select name="visibility" defaultValue="SUBSCRIBERS" className="premium-input">
                  <option value="SUBSCRIBERS">Subscribers</option>
                  <option value="PUBLIC">Public</option>
                  <option value="ONE_TIME">One time</option>
                </select>
                <input name="price" type="number" placeholder="Pret in bani, ex 1900" className="premium-input" />
                <label className="flex items-center gap-3 rounded-[1.5rem] bg-white/[0.04] px-4 py-4 text-sm text-white/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                  <input type="checkbox" name="isFeatured" />
                  Featured
                </label>
                <Button type="submit">Adauga live</Button>
              </form>

              <div className="mt-6 space-y-3">
                {liveSessions.map((session) => (
                  <div key={session.id} className="flex flex-col gap-4 rounded-[1.6rem] bg-white/[0.04] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-white">{session.title}</p>
                      <p className="mt-1 text-sm text-white/50">
                        {session.visibility} | {session.isLive ? "LIVE" : "scheduled"} | {new Date(session.scheduledFor).toLocaleString("ro-RO")}
                      </p>
                      {session.recordingUrl ? <p className="mt-1 text-xs text-white/40">VOD salvat</p> : null}
                    </div>
                    <form action={deleteLiveSession}>
                      <input type="hidden" name="id" value={session.id} />
                      <Button type="submit" variant="secondary">Sterge</Button>
                    </form>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <section id="gallery" className="premium-card p-6">
            <p className="dashboard-label">Gallery</p>
            <h2 className="mt-3 text-2xl text-white">Galerie locala</h2>
            <div className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
              <div className="space-y-4 rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5">
                <label className="flex cursor-pointer items-center justify-center gap-3 rounded-[1.25rem] border border-dashed border-white/15 bg-black/20 px-4 py-5 text-sm text-white/75 transition hover:border-white/25 hover:text-white">
                  <Upload className="h-4 w-4" />
                  Adauga imagine din PC
                  <input type="file" accept="image/*" className="hidden" onChange={handleGalleryUpload} />
                </label>
                {galleryPreview ? (
                  <div className="overflow-hidden rounded-[1.25rem] border border-white/10 bg-black/30">
                    <div className="relative aspect-[4/3]">
                      <Image src={galleryPreview.imageUrl} alt={galleryPreview.title} fill className="object-cover" />
                    </div>
                    <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-white">{galleryPreview.title}</p>
                        <p className="text-sm text-white/50">Preview inainte de salvare</p>
                      </div>
                      <div className="flex gap-2">
                        <Button type="button" onClick={confirmGalleryUpload}>Adauga in galerie</Button>
                        <Button type="button" variant="secondary" onClick={() => setGalleryPreview(null)}>Anuleaza</Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-[1.25rem] border border-white/10 bg-black/20 px-4 py-6 text-sm leading-7 text-white/55">
                    Alege o imagine pentru preview. Upload-ul este salvat local ca base64 in browserul curent.
                  </div>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {allGalleryItems.map((item) => (
                  <div key={item.id} className="overflow-hidden rounded-[1.25rem] border border-white/10 bg-white/[0.03]">
                    <div className="relative aspect-square">
                      <Image src={item.imageUrl} alt={item.title} fill className="object-cover" />
                    </div>
                    <div className="flex items-center justify-between gap-3 p-4">
                      <div>
                        <p className="text-white">{item.title}</p>
                        <p className="text-sm text-white/50">{item.category}</p>
                      </div>
                      {"isUploaded" in item && item.isUploaded ? (
                        <Button type="button" variant="secondary" onClick={() => removeUploadedImage(item.id)}><Trash2 className="h-4 w-4" />Sterge</Button>
                      ) : (
                        <span className="text-xs uppercase tracking-[0.3em] text-white/35">Asset</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
