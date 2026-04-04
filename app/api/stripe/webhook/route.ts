import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

function getStripeId(value: string | Stripe.Customer | Stripe.DeletedCustomer | null | undefined) {
  return typeof value === "string" ? value : value?.id;
}

function toDate(timestamp?: number | null) {
  return timestamp ? new Date(timestamp * 1000) : null;
}

async function upsertSubscriptionFromStripe(subscription: Stripe.Subscription) {
  const stripeCustomerId = getStripeId(subscription.customer);
  const userId = subscription.metadata.userId;

  if (!stripeCustomerId || !userId) {
    return;
  }

  const existingBySubscriptionId = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: subscription.id }
  });

  if (existingBySubscriptionId) {
    await prisma.subscription.update({
      where: { id: existingBySubscriptionId.id },
      data: {
        userId,
        stripeCustomerId,
        stripePriceId: subscription.items.data[0]?.price.id,
        stripeSubscriptionId: subscription.id,
        status: subscription.status,
        currentPeriodEnd: toDate(subscription.current_period_end)
      }
    });
    return;
  }

  const existingByCustomerId = await prisma.subscription.findUnique({
    where: { stripeCustomerId }
  });

  if (existingByCustomerId) {
    await prisma.subscription.update({
      where: { id: existingByCustomerId.id },
      data: {
        userId,
        stripeCustomerId,
        stripePriceId: subscription.items.data[0]?.price.id,
        stripeSubscriptionId: subscription.id,
        status: subscription.status,
        currentPeriodEnd: toDate(subscription.current_period_end)
      }
    });
    return;
  }

  await prisma.subscription.create({
    data: {
      userId,
      stripeCustomerId,
      stripePriceId: subscription.items.data[0]?.price.id,
      stripeSubscriptionId: subscription.id,
      status: subscription.status,
      currentPeriodEnd: toDate(subscription.current_period_end)
    }
  });
}

async function recordOneTimePurchase(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId || session.client_reference_id;
  const liveSessionId = session.metadata?.liveSessionId || null;
  const paymentIntentId =
    typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;

  if (!userId || !paymentIntentId || session.payment_status !== "paid") {
    return;
  }

  await prisma.purchase.upsert({
    where: {
      stripePaymentId: paymentIntentId
    },
    update: {
      userId,
      liveSessionId,
      type: "ONE_TIME",
      amount: session.amount_total || 0,
      currency: session.currency || "eur"
    },
    create: {
      userId,
      liveSessionId,
      stripePaymentId: paymentIntentId,
      type: "ONE_TIME",
      amount: session.amount_total || 0,
      currency: session.currency || "eur"
    }
  });
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing webhook signature or secret." }, { status: 400 });
  }

  try {
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
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Webhook signature invalid." }, { status: 400 });
  }
}
