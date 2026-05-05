import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { syncCheckoutSession } from "@/lib/stripe-sync";

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { sessionId?: string } | null;
  const sessionId = String(body?.sessionId || "").trim();

  if (!sessionId) {
    return NextResponse.json({ error: "Missing checkout session id." }, { status: 400 });
  }

  try {
    const checkoutSession = await syncCheckoutSession(sessionId);

    if (!checkoutSession) {
      return NextResponse.json({ error: "Checkout session not found." }, { status: 404 });
    }

    const ownerId = checkoutSession.metadata?.userId || checkoutSession.client_reference_id || "";

    if (ownerId !== session.user.id) {
      return NextResponse.json({ error: "Checkout session does not belong to this user." }, { status: 403 });
    }

    return NextResponse.json({
      ok: true,
      liveSessionId: checkoutSession.metadata?.liveSessionId || null,
      courseId: checkoutSession.metadata?.courseId || null,
      mode: checkoutSession.mode
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Checkout session could not be synchronized."
    }, { status: 500 });
  }
}
