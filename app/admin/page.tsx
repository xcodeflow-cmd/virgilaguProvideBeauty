/* eslint-disable @typescript-eslint/no-unused-vars */
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AdminDashboard } from "@/components/site/admin-dashboard";
import { SectionHeading } from "@/components/section-heading";
import { Button } from "@/components/ui/button";
import { courses as defaultCourses, subscriptionPlans as defaultSubscriptionPlans } from "@/lib/data";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/site-content";
import { addGalleryItem, addLiveSession, deleteGalleryItem, deleteLiveSession, updateSiteSettings } from "@/app/admin/actions";

async function getAdminData() {
  try {
    const [gallery, sessions, users, settings] = await Promise.all([
      prisma.galleryItem.findMany({ orderBy: { createdAt: "desc" } }),
      prisma.liveSession.findMany({ orderBy: [{ scheduledFor: "asc" }] }),
      prisma.user.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
      getSiteSettings()
    ]);

    return { gallery, sessions, users, settings };
  } catch {
    const settings = await getSiteSettings();

    return {
      gallery: [],
      sessions: [],
      users: [],
      settings
    };
  }
}

function toTextarea(items: string[]) {
  return items.join("\n");
}

async function LegacyAdminPageUnused() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const data = await getAdminData();
  const plans = data.settings.subscriptionPlans.length ? data.settings.subscriptionPlans : defaultSubscriptionPlans;
  const courses = data.settings.courses || defaultCourses;

  return (
    <section className="section-shell py-16 sm:py-20">
      <SectionHeading
        eyebrow="Admin"
        title="Admin dashboard pentru continut, galerie si live."
        description="Un singur cont de administrator gestioneaza site-ul: galerie, sesiuni live, achizitii individuale si continutul cursurilor."
      />

      <div className="mt-10 grid gap-6 xl:grid-cols-2">
        <div className="glass-panel rounded-[1.75rem] p-6">
          <h2 className="text-2xl text-white">Adauga poza in galerie</h2>
          <form action={addGalleryItem} className="mt-6 space-y-4">
            <input name="title" required placeholder="Titlu" className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none" />
            <input name="category" required placeholder="Categorie" className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none" />
            <input name="imageUrl" required placeholder="URL imagine" className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none" />
            <label className="flex items-center gap-3 text-sm text-white/70">
              <input type="checkbox" name="featured" />
              Featured
            </label>
            <Button type="submit">Adauga imagine</Button>
          </form>
          <div className="mt-8 space-y-3">
            {data.gallery.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                <div>
                  <p className="text-white">{item.title}</p>
                  <p className="text-sm text-white/50">{item.category}</p>
                </div>
                <form action={deleteGalleryItem}>
                  <input type="hidden" name="id" value={item.id} />
                  <Button type="submit" variant="secondary">Sterge</Button>
                </form>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel rounded-[1.75rem] p-6">
          <h2 className="text-2xl text-white">Adauga sesiune live</h2>
          <form action={addLiveSession} className="mt-6 space-y-4">
            <input name="title" required placeholder="Titlu live" className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none" />
            <textarea name="description" required placeholder="Descriere" rows={4} className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none" />
            <input name="scheduledFor" type="datetime-local" required className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none" />
            <input type="hidden" name="visibility" value="ONE_TIME" />
            <input name="price" type="number" min="1" step="1" required placeholder="Pret in lei, ex 50" className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none" />
            <Button type="submit">Adauga live</Button>
          </form>
          <div className="mt-8 space-y-3">
            {data.sessions.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                <div>
                  <p className="text-white">{item.title}</p>
                  <p className="text-sm text-white/50">{item.visibility} • {item.isLive ? "LIVE" : "scheduled"}</p>
                </div>
                <form action={deleteLiveSession}>
                  <input type="hidden" name="id" value={item.id} />
                  <Button type="submit" variant="secondary">Sterge</Button>
                </form>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 glass-panel rounded-[1.75rem] p-6">
        <h2 className="text-2xl text-white">Abonamente si cursuri</h2>
        <form action={updateSiteSettings} className="mt-6 space-y-8">
          <div className="grid gap-6 xl:grid-cols-2">
            <div className="space-y-4">
              <h3 className="text-xl text-white">Abonament 1</h3>
              <input name="sub_name_1" defaultValue={plans[0]?.name || ""} className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none" />
              <input name="sub_price_1" defaultValue={plans[0]?.price || ""} className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none" />
              <textarea name="sub_description_1" defaultValue={plans[0]?.description || ""} rows={3} className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none" />
              <textarea name="sub_features_1" defaultValue={toTextarea(plans[0]?.features || [])} rows={5} className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none" />
            </div>
            <div className="space-y-4">
              <h3 className="text-xl text-white">Abonament 2</h3>
              <input name="sub_name_2" defaultValue={plans[1]?.name || ""} className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none" />
              <input name="sub_price_2" defaultValue={plans[1]?.price || ""} className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none" />
              <textarea name="sub_description_2" defaultValue={plans[1]?.description || ""} rows={3} className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none" />
              <textarea name="sub_features_2" defaultValue={toTextarea(plans[1]?.features || [])} rows={5} className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none" />
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            <div className="space-y-4">
              <h3 className="text-xl text-white">Beginner Course</h3>
              <input name="beginner_title" defaultValue={courses.beginner.title} className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none" />
              <textarea name="beginner_description" defaultValue={toTextarea(courses.beginner.description)} rows={6} className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none" />
              <textarea name="beginner_achievements" defaultValue={toTextarea(courses.beginner.achievements)} rows={5} className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none" />
              <textarea name="beginner_details" defaultValue={toTextarea(courses.beginner.details)} rows={4} className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none" />
            </div>
            <div className="space-y-4">
              <h3 className="text-xl text-white">Advanced Course</h3>
              <input name="advanced_title" defaultValue={courses.advanced.title} className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none" />
              <textarea name="advanced_description" defaultValue={courses.advanced.description} rows={4} className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none" />
              <textarea name="advanced_includes" defaultValue={toTextarea(courses.advanced.includes)} rows={6} className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none" />
              <textarea name="advanced_outcomes" defaultValue={toTextarea(courses.advanced.outcomes)} rows={5} className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none" />
            </div>
            <div className="space-y-4">
              <h3 className="text-xl text-white">LIVE Barber Experience</h3>
              <input name="live_title" defaultValue={courses.liveExperience.title} className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none" />
              <textarea name="live_description" defaultValue={courses.liveExperience.description} rows={4} className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none" />
              <textarea name="live_includes" defaultValue={toTextarea(courses.liveExperience.includes)} rows={6} className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none" />
              <textarea name="live_outcomes" defaultValue={toTextarea(courses.liveExperience.outcomes)} rows={4} className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none" />
              <textarea name="live_details" defaultValue={toTextarea(courses.liveExperience.details)} rows={4} className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none" />
            </div>
          </div>

          <Button type="submit">Salveaza continutul</Button>
        </form>
      </div>

      <div className="mt-6 glass-panel rounded-[1.75rem] p-6">
        <h2 className="text-2xl text-white">Utilizatori recenți</h2>
        <div className="mt-6 space-y-3">
          {data.users.map((user) => (
            <div key={user.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-white">{user.email}</p>
              <p className="text-sm text-white/50">{user.role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  let galleryItems: Awaited<ReturnType<typeof prisma.galleryItem.findMany>> = [];
  let liveSessions: Array<
    Awaited<ReturnType<typeof prisma.liveSession.findMany>>[number] & {
      _count: {
        purchases: number;
      };
    }
  > = [];
  let users: Awaited<ReturnType<typeof prisma.user.findMany>> = [];
  const settings = await getSiteSettings();

  try {
    [galleryItems, liveSessions, users] = await Promise.all([
      prisma.galleryItem.findMany({
        orderBy: { createdAt: "desc" }
      }),
      prisma.liveSession.findMany({
        orderBy: [{ scheduledFor: "asc" }, { createdAt: "desc" }],
        include: {
          _count: {
            select: {
              purchases: true
            }
          }
        }
      }),
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 12
      })
    ]);
  } catch {
    galleryItems = [];
    liveSessions = [];
    users = [];
  }

  return (
    <AdminDashboard
      galleryItems={galleryItems.map((item) => ({
        id: item.id,
        title: item.title,
        category: item.category,
        imageUrl: item.imageUrl,
        createdAt: item.createdAt.toISOString()
      }))}
      liveSessions={liveSessions.map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        thumbnailUrl: item.thumbnailUrl,
        visibility: item.visibility,
        price: item.price,
        compareAtPrice: item.compareAtPrice,
        maxParticipants: item.maxParticipants,
        purchasedCount: item._count.purchases,
        isLive: item.isLive,
        scheduledFor: item.scheduledFor.toISOString(),
        recordingUrl: item.recordingUrl || ""
      }))}
      users={users.map((item) => ({
        id: item.id,
        email: item.email || "Fara email",
        role: item.role,
        createdAt: item.createdAt.toISOString()
      }))}
      courseSettings={settings.courses}
      pagesSettings={settings.pages}
    />
  );
}
