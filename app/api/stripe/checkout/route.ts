import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

const subscriptionPriceId = process.env.STRIPE_SUBSCRIPTION_PRICE_ID || "price_subscription_placeholder";
const oneTimePriceId = process.env.STRIPE_ONE_TIME_PRICE_ID || "price_single_placeholder";
const hasConfiguredOneTimePriceId =
  !!process.env.STRIPE_ONE_TIME_PRICE_ID &&
  !process.env.STRIPE_ONE_TIME_PRICE_ID.includes("replace") &&
  process.env.STRIPE_ONE_TIME_PRICE_ID !== "price_single_placeholder";

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode") === "payment" ? "payment" : "subscription";
  const liveSessionId = searchParams.get("liveSessionId");

  if (mode === "payment" && !liveSessionId) {
    return NextResponse.json({ error: "Missing live session for one-time checkout." }, { status: 400 });
  }

  try {
    const liveSession = mode === "payment" && liveSessionId
      ? await prisma.liveSession.findUnique({
          where: { id: liveSessionId },
          select: { id: true, title: true, description: true, price: true, visibility: true }
        })
      : null;

    if (mode === "payment") {
      if (!liveSession || liveSession.visibility !== "ONE_TIME" || !liveSession.price) {
        return NextResponse.json({ error: "Selected live session is not available for one-time purchase." }, { status: 400 });
      }
    }

    const lineItems = mode === "subscription"
      ? [
          {
            price: subscriptionPriceId,
            quantity: 1
          }
        ]
      : [
          hasConfiguredOneTimePriceId
            ? {
                price: oneTimePriceId,
                quantity: 1
              }
            : {
                price_data: {
                  currency: "eur",
                  product_data: {
                    name: liveSession?.title || "Single live session access",
                    description: liveSession?.description
                  },
                  unit_amount: liveSession?.price || undefined
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
        liveSessionId: liveSessionId || ""
      },
      line_items: lineItems,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/live?checkout=cancelled`,
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
    return NextResponse.json({ error: "Stripe checkout could not be created." }, { status: 500 });
  }
}
