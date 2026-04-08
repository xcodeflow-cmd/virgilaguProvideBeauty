"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import Image from "next/image";
import { Pencil, Trash2, Upload } from "lucide-react";
import { addLiveSession, deleteLiveSession } from "@/app/admin/actions";

import { Button } from "@/components/ui/button";
import { GalleryGrid } from "@/components/gallery-grid";
import { SectionHeading } from "@/components/section-heading";
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

export function AdminDashboard({ liveSessions }: { liveSessions: AdminLiveSession[] }) {
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
    <section className="section-shell py-16 sm:py-20">
      <SectionHeading
        eyebrow="Admin"
        title="Admin pentru cursuri, galerie si sesiuni LIVE."
        description="Continutul din site poate fi actualizat rapid: cursuri fizice, imagini de galerie si sesiunile LIVE programate."
      />

      <div className="mt-10 space-y-6">
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="glass-panel rounded-[1.75rem] p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl text-white">Cursuri si servicii</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/60">
                  Adauga, editeaza sau sterge cardurile principale. Imaginile raman selectate doar din assets.
                </p>
              </div>
              <Button type="button" variant="secondary" onClick={() => {
                setContent(getDefaultContentState());
                resetDraft();
                setGalleryPreview(null);
              }}>
                Reseteaza continutul local
              </Button>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_280px]">
              <div className="space-y-4">
                <input
                  value={serviceDraft.title}
                  onChange={(event) => setServiceDraft((current) => ({ ...current, title: event.target.value }))}
                  placeholder="Titlu card"
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
                />
                <textarea
                  value={serviceDraft.description}
                  onChange={(event) => setServiceDraft((current) => ({ ...current, description: event.target.value }))}
                  placeholder="Descriere card"
                  rows={4}
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  {cleaningAssetImages.map((image) => {
                    const active = image.id === serviceDraft.imageId;

                    return (
                      <button
                        key={image.id}
                        type="button"
                        onClick={() => setServiceDraft((current) => ({ ...current, imageId: image.id }))}
                        className={`overflow-hidden rounded-2xl border text-left transition ${
                          active
                            ? "border-accent bg-white/[0.08]"
                            : "border-white/10 bg-black/20 hover:border-white/20"
                        }`}
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
                  <Button type="button" onClick={handleServiceSave}>
                    {editingServiceId ? "Salveaza modificarile" : "Adauga card"}
                  </Button>
                  {editingServiceId ? (
                    <Button type="button" variant="secondary" onClick={resetDraft}>
                      Anuleaza
                    </Button>
                  ) : null}
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.35em] text-accent/80">Preview</p>
                <div className="mt-4 overflow-hidden rounded-[1.25rem] border border-white/10 bg-black/30">
                  <div className="relative aspect-[4/3]">
                    <Image
                      src={getAssetImageById(serviceDraft.imageId).src}
                      alt={serviceDraft.title || "Card preview"}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="space-y-3 p-5">
                    <h3 className="text-2xl text-white">{serviceDraft.title || "Titlu card"}</h3>
                    <p className="text-sm leading-7 text-white/58">
                      {serviceDraft.description || "Descrierea cardului apare aici inainte sa salvezi."}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-4">
              {content.services.map((service) => (
                <div
                  key={service.id}
                  className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-black/20 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
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
                    <Button type="button" variant="secondary" onClick={() => handleEditService(service)}>
                      <Pencil className="h-4 w-4" />
                      Editeaza
                    </Button>
                    <Button type="button" variant="secondary" onClick={() => handleDeleteService(service.id)}>
                      <Trash2 className="h-4 w-4" />
                      Sterge
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel rounded-[1.75rem] p-6">
            <h2 className="text-2xl text-white">Sesiuni LIVE</h2>
            <p className="mt-2 text-sm leading-6 text-white/60">
              Creeaza o sesiune LIVE pentru browser streaming. Adminul intra apoi pe pagina LIVE si porneste camera direct din telefon sau laptop.
            </p>
            <form action={addLiveSession} className="mt-6 space-y-4">
              <input
                name="title"
                required
                placeholder="Titlu live"
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
              />
              <input
                name="slug"
                placeholder="slug-live"
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
              />
              <textarea
                name="description"
                required
                rows={4}
                placeholder="Descriere"
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
              />
              <input
                name="thumbnailUrl"
                required
                placeholder="URL thumbnail"
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/75">
                  <input
                    type="radio"
                    name="startMode"
                    value="NOW"
                    checked={liveStartMode === "NOW"}
                    onChange={() => setLiveStartMode("NOW")}
                  />
                  Start Now
                </label>
                <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/75">
                  <input
                    type="radio"
                    name="startMode"
                    value="SCHEDULE"
                    checked={liveStartMode === "SCHEDULE"}
                    onChange={() => setLiveStartMode("SCHEDULE")}
                  />
                  Schedule
                </label>
              </div>
              <input
                name="scheduledFor"
                type="datetime-local"
                disabled={liveStartMode !== "SCHEDULE"}
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none disabled:cursor-not-allowed disabled:opacity-50"
              />
              <select
                name="visibility"
                defaultValue="SUBSCRIBERS"
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
              >
                <option value="SUBSCRIBERS">Subscribers</option>
                <option value="PUBLIC">Public</option>
                <option value="ONE_TIME">One time</option>
              </select>
              <input
                name="price"
                type="number"
                placeholder="Pret in bani, ex 1900"
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
              />
              <label className="flex items-center gap-3 text-sm text-white/70">
                <input type="checkbox" name="isFeatured" />
                Featured
              </label>
              <Button type="submit">Adauga live</Button>
            </form>
            <div className="mt-6 space-y-3">
              {liveSessions.map((session) => {
                const isActive = session.isLive;

                return (
                  <div
                    key={session.id}
                    className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-black/20 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="text-white">{session.title}</p>
                      <p className="mt-1 text-sm text-white/50">
                        {session.visibility} - {isActive ? "LIVE" : "scheduled"} - {new Date(session.scheduledFor).toLocaleString("ro-RO")}
                      </p>
                      {session.recordingUrl ? (
                        <p className="mt-1 text-xs text-white/40">VOD salvat</p>
                      ) : null}
                    </div>
                    <form action={deleteLiveSession}>
                      <input type="hidden" name="id" value={session.id} />
                      <Button type="submit" variant="secondary">Sterge</Button>
                    </form>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-[1.75rem] p-6">
          <h2 className="text-2xl text-white">Galerie</h2>
          <p className="mt-2 text-sm leading-6 text-white/60">
            Galeria combina imaginile statice din assets cu imaginile adaugate local, salvate in browserul curent.
          </p>

          <div className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <div className="space-y-4 rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
              <label className="flex cursor-pointer items-center justify-center gap-3 rounded-2xl border border-dashed border-white/15 bg-black/30 px-4 py-5 text-sm text-white/75 transition hover:border-white/25 hover:text-white">
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
                      <Button type="button" variant="secondary" onClick={() => setGalleryPreview(null)}>
                        Anuleaza
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-6 text-sm leading-7 text-white/55">
                  Alege o imagine pentru preview. Upload-ul este salvat local ca base64 in browserul curent.
                </div>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {allGalleryItems.map((item) => (
                <div key={item.id} className="overflow-hidden rounded-[1.25rem] border border-white/10 bg-black/20">
                  <div className="relative aspect-square">
                    <Image src={item.imageUrl} alt={item.title} fill className="object-cover" />
                  </div>
                  <div className="flex items-center justify-between gap-3 p-4">
                    <div>
                      <p className="text-white">{item.title}</p>
                      <p className="text-sm text-white/50">{item.category}</p>
                    </div>
                    {"isUploaded" in item && item.isUploaded ? (
                      <Button type="button" variant="secondary" onClick={() => removeUploadedImage(item.id)}>
                        <Trash2 className="h-4 w-4" />
                        Sterge
                      </Button>
                    ) : (
                      <span className="text-xs uppercase tracking-[0.3em] text-white/35">Asset</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <GalleryGrid items={allGalleryItems} />
          </div>
        </div>
      </div>
    </section>
  );
}
