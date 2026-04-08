import { redirect } from "next/navigation";
import Link from "next/link";

import { auth } from "@/auth";
import { SectionHeading } from "@/components/section-heading";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

async function getDashboardData(userId: string) {
  try {
    const [subscriptions, purchases, bookings] = await Promise.all([
      prisma.subscription.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }),
      prisma.purchase.findMany({ where: { userId }, include: { liveSession: true }, orderBy: { createdAt: "desc" } }),
      prisma.booking.findMany({ where: { userId }, orderBy: { createdAt: "desc" } })
    ]);

    return { subscriptions, purchases, bookings };
  } catch {
    return { subscriptions: [], purchases: [], bookings: [] };
  }
}

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const data = await getDashboardData(session.user.id);
  const activeSubscription = data.subscriptions.find(
    (item: (typeof data.subscriptions)[number]) => ["active", "trialing"].includes(item.status)
  );

  return (
    <section className="section-shell py-16 sm:py-20 lg:py-24">
      <SectionHeading
        eyebrow="Dashboard"
        title={`Bine ai revenit, ${session.user.name || "membru"}.`}
        description="Zona de cont urmareste accesul la abonament, achizitiile si programarile recente."
      />

      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        <div className="premium-card p-7 sm:p-8">
          <p className="text-xs uppercase tracking-[0.35em] text-accent/80">Subscription</p>
          <h2 className="mt-5 text-4xl text-white">{activeSubscription ? activeSubscription.status : "Not active"}</h2>
          <p className="mt-4 text-sm leading-7 text-white/58">
            {activeSubscription?.currentPeriodEnd
              ? `Renews until ${formatDate(activeSubscription.currentPeriodEnd)}`
              : "No recurring plan attached yet."}
          </p>
          <Button asChild className="mt-6">
            <Link href="/live">Manage Access</Link>
          </Button>
        </div>
        <div className="premium-card p-7 sm:p-8">
          <p className="text-xs uppercase tracking-[0.35em] text-accent/80">Purchases</p>
          <h2 className="mt-5 text-4xl text-white">{data.purchases.length}</h2>
          <p className="mt-4 text-sm leading-7 text-white/58">One-time session unlocks stored against your account.</p>
        </div>
        <div className="premium-card p-7 sm:p-8">
          <p className="text-xs uppercase tracking-[0.35em] text-accent/80">Bookings</p>
          <h2 className="mt-5 text-4xl text-white">{data.bookings.length}</h2>
          <p className="mt-4 text-sm leading-7 text-white/58">Recent appointment requests submitted through the website.</p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="premium-card p-7 sm:p-8">
          <h3 className="text-3xl text-white">Session purchases</h3>
          <div className="mt-7 space-y-4">
            {data.purchases.length ? data.purchases.map((purchase: (typeof data.purchases)[number]) => (
              <div key={purchase.id} className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5 text-white/68">
                <p className="text-lg text-white">{purchase.liveSession?.title || purchase.type}</p>
                <p className="mt-2 text-sm">Purchased on {formatDate(purchase.createdAt)}</p>
              </div>
            )) : <p className="text-sm text-white/50">No purchases yet.</p>}
          </div>
        </div>
        <div className="premium-card p-7 sm:p-8">
          <h3 className="text-3xl text-white">Recent bookings</h3>
          <div className="mt-7 space-y-4">
            {data.bookings.length ? data.bookings.map((booking: (typeof data.bookings)[number]) => (
              <div key={booking.id} className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5 text-white/68">
                <p className="text-lg text-white">{booking.service}</p>
                <p className="mt-2 text-sm">Preferred date {formatDate(booking.preferredAt)}</p>
              </div>
            )) : <p className="text-sm text-white/50">No bookings yet.</p>}
          </div>
        </div>
      </div>
    </section>
  );
}
