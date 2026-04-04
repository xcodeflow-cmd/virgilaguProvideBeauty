import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { SectionHeading } from "@/components/section-heading";
import { prisma } from "@/lib/prisma";

async function getAdminData() {
  try {
    const [gallery, sessions, users] = await Promise.all([
      prisma.galleryItem.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
      prisma.liveSession.findMany({ orderBy: { scheduledFor: "desc" }, take: 6 }),
      prisma.user.findMany({ orderBy: { createdAt: "desc" }, take: 6 })
    ]);

    return { gallery, sessions, users };
  } catch {
    return { gallery: [], sessions: [], users: [] };
  }
}

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const data = await getAdminData();

  return (
    <section className="section-shell py-16 sm:py-20">
      <SectionHeading
        eyebrow="Admin"
        title="Content and member controls."
        description="Basic admin surface for managing gallery items, live sessions, and users. Extend with server actions or a richer CMS flow as needed."
      />
      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        <div className="glass-panel rounded-[1.75rem] p-6">
          <h2 className="text-2xl text-white">Gallery</h2>
          <div className="mt-5 space-y-3 text-sm text-white/62">
            {data.gallery.map((item) => <p key={item.id}>{item.title}</p>)}
          </div>
        </div>
        <div className="glass-panel rounded-[1.75rem] p-6">
          <h2 className="text-2xl text-white">Live Sessions</h2>
          <div className="mt-5 space-y-3 text-sm text-white/62">
            {data.sessions.map((item) => <p key={item.id}>{item.title}</p>)}
          </div>
        </div>
        <div className="glass-panel rounded-[1.75rem] p-6">
          <h2 className="text-2xl text-white">Users</h2>
          <div className="mt-5 space-y-3 text-sm text-white/62">
            {data.users.map((item) => <p key={item.id}>{item.email}</p>)}
          </div>
        </div>
      </div>
    </section>
  );
}
