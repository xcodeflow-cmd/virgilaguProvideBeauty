import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getStripe } from "@/lib/stripe";
import { canAccessLiveSession, isLiveSessionSoldOut } from "@/lib/live-access";
import { prisma } from "@/lib/prisma";
import { findCourseOfferById } from "@/lib/course-offers";
import { getSiteSettings } from "@/lib/site-content";

const subscriptionPriceId = process.env.STRIPE_SUBSCRIPTION_PRICE_ID || "price_subscription_placeholder";

function getBaseUrl(request: Request) {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();

  if (configured) {
    return configured.replace(/\/$/, "");
  }

  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user?.email || !session.user.id) {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode") === "payment" ? "payment" : "subscription";
  const liveSessionId = searchParams.get("liveSessionId");
  const courseId = searchParams.get("courseId");
  const settings = courseId ? await getSiteSettings() : null;
  const courseOffer = courseId && settings ? findCourseOfferById(courseId, settings.courses) : null;

  if (mode === "payment" && !liveSessionId && !courseOffer) {
    return NextResponse.json({ error: "Missing item for one-time checkout." }, { status: 400 });
  }

  if (courseOffer?.purchaseDisabled) {
    return NextResponse.json({ error: "Selected course is not available for checkout from this page." }, { status: 400 });
  }

  try {
    const stripe = getStripe();
    const baseUrl = getBaseUrl(request);
    const liveSession = mode === "payment" && liveSessionId
      ? await prisma.liveSession.findUnique({
          where: { id: liveSessionId },
          select: {
            id: true,
            title: true,
            description: true,
            price: true,
            compareAtPrice: true,
            visibility: true,
            recordingUrl: true,
            isLive: true,
            hasStarted: true
          }
        })
      : null;

    if (mode === "payment" && liveSessionId) {
      if (!liveSession || liveSession.visibility !== "ONE_TIME" || !liveSession.price) {
        return NextResponse.json({ error: "Selected live session is not available for one-time purchase." }, { status: 400 });
      }

      if (liveSession.recordingUrl || (liveSession.hasStarted && !liveSession.isLive)) {
        return NextResponse.json({ error: "Aceasta sesiune one-time nu mai poate fi achizitionata dupa incheierea live-ului." }, { status: 409 });
      }

      const alreadyHasAccess = await canAccessLiveSession({
        userId: session.user.id,
        role: session.user.role,
        liveSessionId: liveSession.id,
        visibility: liveSession.visibility
      });

      if (alreadyHasAccess) {
        return NextResponse.redirect(new URL("/live", request.url));
      }

      if (!liveSession.recordingUrl && await isLiveSessionSoldOut(liveSession.id)) {
        return NextResponse.json({ error: "Live session reached the maximum number of participants." }, { status: 409 });
      }
    }

    const lineItems = mode === "subscription"
      ? [
          {
            price: subscriptionPriceId,
            quantity: 1
          }
        ]
      : courseOffer
        ? [
            {
              price_data: {
                currency: "ron",
                product_data: {
                  name: courseOffer.title,
                  description: courseOffer.description
                },
                unit_amount: courseOffer.priceValue * 100
              },
              quantity: 1
            }
          ]
        : [
            {
              price_data: {
                currency: "ron",
                product_data: {
                  name: liveSession?.title || "Single live session access",
                  description: liveSession?.description
                },
                unit_amount: liveSession?.price ? liveSession.price * 100 : undefined
              },
              quantity: 1
            }
          ];

    const checkout = await stripe.checkout.sessions.create({
      mode,
      customer_email: session.user.email,
      client_reference_id: session.user.id,
      metadata: {
        userId: session.user.id,
        liveSessionId: liveSessionId || "",
        courseId: courseOffer?.id || ""
      },
      line_items: lineItems,
      success_url: liveSessionId
        ? `${baseUrl}/live?checkout=success&livePurchased=${liveSessionId}&session_id={CHECKOUT_SESSION_ID}`
        : `${baseUrl}/dashboard?checkout=success`,
      cancel_url: `${baseUrl}${courseOffer ? "/courses" : "/live"}?checkout=cancelled`,
      subscription_data: mode === "subscription"
        ? {
            metadata: {
              userId: session.user.id
            }
          }
        : undefined
    });

    return NextResponse.redirect(checkout.url || new URL("/dashboard", request.url));
  } catch (error) {
    console.error(error);
    return NextResponse.json({
      error: error instanceof Error ? `Stripe checkout could not be created: ${error.message}` : "Stripe checkout could not be created."
    }, { status: 500 });
  }
}
