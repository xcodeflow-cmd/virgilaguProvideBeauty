import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { upsertSubscriptionFromStripe, recordOneTimePurchase } from "@/lib/stripe-sync";

function toDate(timestamp?: number | null) {
  return timestamp ? new Date(timestamp * 1000) : null;
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing webhook signature or secret." }, { status: 400 });
  }

  try {
    const stripe = getStripe();
    const event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      if (session.mode === "subscription" && typeof session.subscription === "string") {
        const subscription = await stripe.subscriptions.retrieve(session.subscription);
        await upsertSubscriptionFromStripe(subscription);
      }

      if (session.mode === "payment") {
        await recordOneTimePurchase(session);
      }
    }

    if (event.type === "customer.subscription.created" || event.type === "customer.subscription.updated") {
      const subscription = event.data.object as Stripe.Subscription;
      await upsertSubscriptionFromStripe(subscription);
    }

    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;
      const existingSubscription = await prisma.subscription.findUnique({
        where: { stripeSubscriptionId: subscription.id }
      });

      if (existingSubscription) {
        await prisma.subscription.update({
          where: { id: existingSubscription.id },
          data: {
            status: subscription.status,
            currentPeriodEnd: toDate(subscription.current_period_end)
          }
        });

        await prisma.user.update({
          where: { id: existingSubscription.userId },
          data: { isSubscribed: false }
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Webhook signature invalid." }, { status: 400 });
  }
}
