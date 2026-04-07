"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import Image from "next/image";
import { Pencil, Trash2, Upload, Video } from "lucide-react";

import { Button } from "@/components/ui/button";
import { GalleryGrid } from "@/components/gallery-grid";
import { SectionHeading } from "@/components/section-heading";
import { useCleaningContent } from "@/components/site/use-cleaning-content";
import {
  cleaningAssetImages,
  defaultGalleryImages,
  getAssetImageById,
  getDefaultContentState,
  getYoutubeEmbedUrl,
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

export function AdminDashboard() {
  const { content, setContent } = useCleaningContent();
  const [serviceDraft, setServiceDraft] = useState(emptyServiceDraft);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [galleryPreview, setGalleryPreview] = useState<{ title: string; imageUrl: string } | null>(null);

  const allGalleryItems = useMemo(
    () => [...defaultGalleryImages, ...content.uploadedGallery],
    [content.uploadedGallery]
  );

  const currentEmbedUrl = getYoutubeEmbedUrl(content.live.url);

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
        title="Admin simplu pentru servicii, galerie si live YouTube."
        description="Toate modificarile sunt salvate local in browser, fara backend, fara storage extern si fara sa schimbe tema actuala."
      />

      <div className="mt-10 space-y-6">
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="glass-panel rounded-[1.75rem] p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl text-white">Services</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/60">
                  Adauga, editeaza sau sterge servicii. Imaginile pot fi selectate doar din assets.
                </p>
              </div>
              <Button type="button" variant="secondary" onClick={() => {
                setContent(getDefaultContentState());
                resetDraft();
                setGalleryPreview(null);
              }}>
                Reset local data
              </Button>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_280px]">
              <div className="space-y-4">
                <input
                  value={serviceDraft.title}
                  onChange={(event) => setServiceDraft((current) => ({ ...current, title: event.target.value }))}
                  placeholder="Service title"
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
                />
                <textarea
                  value={serviceDraft.description}
                  onChange={(event) => setServiceDraft((current) => ({ ...current, description: event.target.value }))}
                  placeholder="Service description"
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
                    {editingServiceId ? "Save changes" : "Add service"}
                  </Button>
                  {editingServiceId ? (
                    <Button type="button" variant="secondary" onClick={resetDraft}>
                      Cancel
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
                      alt={serviceDraft.title || "Service preview"}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="space-y-3 p-5">
                    <h3 className="text-2xl text-white">{serviceDraft.title || "Service title"}</h3>
                    <p className="text-sm leading-7 text-white/58">
                      {serviceDraft.description || "Descrierea serviciului apare aici inainte sa salvezi."}
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
                      Edit
                    </Button>
                    <Button type="button" variant="secondary" onClick={() => handleDeleteService(service.id)}>
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel rounded-[1.75rem] p-6">
            <h2 className="text-2xl text-white">Live stream</h2>
            <p className="mt-2 text-sm leading-6 text-white/60">
              Lipeste URL-ul de YouTube live. Daca nu exista un URL valid, pagina live va afisa mesajul de indisponibilitate.
            </p>
            <input
              value={content.live.url}
              onChange={(event) =>
                setContent((current) => ({
                  ...current,
                  live: { url: event.target.value }
                }))
              }
              placeholder="https://www.youtube.com/watch?v=..."
              className="mt-6 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
            />
            <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-white/10 bg-black/20">
              {currentEmbedUrl ? (
                <iframe
                  src={currentEmbedUrl}
                  title="Live stream preview"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="aspect-video w-full bg-black"
                />
              ) : (
                <div className="flex aspect-video items-center justify-center px-6 text-center text-white/55">
                  No live stream available right now
                </div>
              )}
              <div className="flex items-center gap-3 p-4 text-sm text-white/60">
                <Video className="h-4 w-4 text-accent" />
                Preview salvat local pentru pagina Live.
              </div>
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-[1.75rem] p-6">
          <h2 className="text-2xl text-white">Gallery management</h2>
          <p className="mt-2 text-sm leading-6 text-white/60">
            Galeria combina imaginile statice din assets cu upload-urile locale salvate in browser.
          </p>

          <div className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <div className="space-y-4 rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
              <label className="flex cursor-pointer items-center justify-center gap-3 rounded-2xl border border-dashed border-white/15 bg-black/30 px-4 py-5 text-sm text-white/75 transition hover:border-white/25 hover:text-white">
                <Upload className="h-4 w-4" />
                Upload image from PC
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
                      <p className="text-sm text-white/50">Preview before adding</p>
                    </div>
                    <div className="flex gap-2">
                      <Button type="button" onClick={confirmGalleryUpload}>Add to gallery</Button>
                      <Button type="button" variant="secondary" onClick={() => setGalleryPreview(null)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-6 text-sm leading-7 text-white/55">
                  Alege o imagine din calculator pentru preview. Upload-ul va fi salvat ca base64 in localStorage.
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
                        Delete
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
