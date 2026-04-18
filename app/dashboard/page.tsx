import { redirect } from "next/navigation";
import Link from "next/link";

import { auth } from "@/auth";
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

async function getAdminDashboardData() {
  try {
    const [users, liveSessions, purchases] = await Promise.all([
      prisma.user.count(),
      prisma.liveSession.count(),
      prisma.purchase.count()
    ]);

    return { users, liveSessions, purchases };
  } catch {
    return { users: 0, liveSessions: 0, purchases: 0 };
  }
}

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  if (session.user.role === "ADMIN") {
    const adminData = await getAdminDashboardData();

    return (
      <section className="section-shell section-space">
        <div className="overflow-hidden rounded-[2.5rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(214,185,140,0.14),transparent_26%),linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.012))] shadow-luxury">
          <div className="grid gap-0 xl:grid-cols-[1.02fr_0.98fr]">
            <div className="border-b border-white/10 p-8 sm:p-10 xl:border-b-0 xl:border-r xl:p-14">
              <p className="text-xs uppercase tracking-[0.42em] text-[#d6b98c]">Dashboard admin</p>
              <h1 className="mt-6 max-w-4xl text-5xl leading-[0.84] text-white sm:text-6xl lg:text-7xl">
                Control pentru live-uri, utilizatori si replay-uri.
              </h1>
              <div className="mt-10 flex flex-wrap gap-3">
                <Button asChild className="px-7">
                  <Link href="/admin">Mergi in admin</Link>
                </Button>
                <Button asChild variant="secondary" className="px-7">
                  <Link href="/live">Vezi pagina live</Link>
                </Button>
              </div>
            </div>

            <div className="grid gap-4 p-8 sm:grid-cols-3 sm:p-10 xl:p-14">
              <div className="rounded-[1.7rem] border border-white/10 bg-white/[0.03] p-5">
                <p className="dashboard-label">Utilizatori</p>
                <p className="mt-3 text-3xl text-white">{adminData.users}</p>
              </div>
              <div className="rounded-[1.7rem] border border-white/10 bg-white/[0.03] p-5">
                <p className="dashboard-label">Live-uri</p>
                <p className="mt-3 text-3xl text-white">{adminData.liveSessions}</p>
              </div>
              <div className="rounded-[1.7rem] border border-white/10 bg-white/[0.03] p-5">
                <p className="dashboard-label">Achizitii</p>
                <p className="mt-3 text-3xl text-white">{adminData.purchases}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const data = await getDashboardData(session.user.id);
  const activeSubscription = data.subscriptions.find(
    (item: (typeof data.subscriptions)[number]) => ["active", "trialing"].includes(item.status)
  );

  return (
    <section className="section-shell section-space">
      <div className="overflow-hidden rounded-[2.5rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(214,185,140,0.14),transparent_26%),linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.012))] shadow-luxury">
        <div className="grid gap-0 xl:grid-cols-[1.02fr_0.98fr]">
          <div className="border-b border-white/10 p-8 sm:p-10 xl:border-b-0 xl:border-r xl:p-14">
            <p className="text-xs uppercase tracking-[0.42em] text-[#d6b98c]">Dashboard</p>
            <h1 className="mt-6 max-w-4xl text-5xl leading-[0.84] text-white sm:text-6xl lg:text-7xl">
              Bine ai revenit, {session.user.name || "membru"}.
            </h1>
            <div className="mt-10 flex flex-wrap gap-3">
              <Button asChild className="px-7">
                <Link href="/live">Vezi LIVE</Link>
              </Button>
              <Button asChild variant="secondary" className="px-7">
                <Link href="/courses">Vezi cursuri</Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-4 p-8 sm:grid-cols-3 sm:p-10 xl:p-14">
            <div className="rounded-[1.7rem] border border-white/10 bg-white/[0.03] p-5">
              <p className="dashboard-label">Subscription</p>
              <p className="mt-3 text-3xl text-white">{activeSubscription ? activeSubscription.status : "Inactive"}</p>
            </div>
            <div className="rounded-[1.7rem] border border-white/10 bg-white/[0.03] p-5">
              <p className="dashboard-label">Purchases</p>
              <p className="mt-3 text-3xl text-white">{data.purchases.length}</p>
            </div>
            <div className="rounded-[1.7rem] border border-white/10 bg-white/[0.03] p-5">
              <p className="dashboard-label">Bookings</p>
              <p className="mt-3 text-3xl text-white">{data.bookings.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <div className="premium-card p-7 sm:p-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="dashboard-label">Acces activ</p>
              <h2 className="mt-3 text-4xl text-white">
                {activeSubscription ? activeSubscription.status : "No active plan"}
              </h2>
            </div>
            <Button asChild variant="secondary">
              <Link href="/courses">Manage Access</Link>
            </Button>
          </div>
          <p className="mt-5 max-w-xl text-sm leading-7 text-white/[0.58]">
            {activeSubscription?.currentPeriodEnd
              ? `Renews until ${formatDate(activeSubscription.currentPeriodEnd)}`
              : "No recurring plan attached yet."}
          </p>
        </div>

        <div className="premium-card p-7 sm:p-8">
          <p className="dashboard-label">Continut</p>
          <h2 className="mt-3 text-4xl text-white">Video, replay, booking.</h2>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="premium-card p-7 sm:p-8">
          <h3 className="text-3xl text-white">Session purchases</h3>
          <div className="mt-7 space-y-4">
            {data.purchases.length ? data.purchases.map((purchase: (typeof data.purchases)[number]) => (
              <div key={purchase.id} className="rounded-[1.6rem] border border-white/10 bg-black/20 p-5 text-white/[0.68]">
                <p className="text-lg text-white">{purchase.liveSession?.title || purchase.type}</p>
                <p className="mt-2 text-sm">Purchased on {formatDate(purchase.createdAt)}</p>
                {purchase.liveSession ? (
                  <div className="mt-4">
                    <Button asChild variant="secondary" className="min-h-11">
                      <Link href={`/live#replay-${purchase.liveSession.id}`}>Deschide live-ul</Link>
                    </Button>
                  </div>
                ) : null}
              </div>
            )) : <p className="text-sm text-white/50">No purchases yet.</p>}
          </div>
        </div>
        <div className="premium-card p-7 sm:p-8">
          <h3 className="text-3xl text-white">Recent bookings</h3>
          <div className="mt-7 space-y-4">
            {data.bookings.length ? data.bookings.map((booking: (typeof data.bookings)[number]) => (
              <div key={booking.id} className="rounded-[1.6rem] border border-white/10 bg-black/20 p-5 text-white/[0.68]">
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


