import Stripe from "stripe";

import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

function getStripeId(value: string | Stripe.Customer | Stripe.DeletedCustomer | null | undefined) {
  return typeof value === "string" ? value : value?.id;
}

function toDate(timestamp?: number | null) {
  return timestamp ? new Date(timestamp * 1000) : null;
}

export async function upsertSubscriptionFromStripe(subscription: Stripe.Subscription) {
  const stripeCustomerId = getStripeId(subscription.customer);
  const userId = subscription.metadata.userId;
  const isSubscribed = ["active", "trialing"].includes(subscription.status);

  if (!stripeCustomerId || !userId) {
    return null;
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
    await prisma.user.update({
      where: { id: userId },
      data: { isSubscribed }
    });
    return existingBySubscriptionId.id;
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
    await prisma.user.update({
      where: { id: userId },
      data: { isSubscribed }
    });
    return existingByCustomerId.id;
  }

  const created = await prisma.subscription.create({
    data: {
      userId,
      stripeCustomerId,
      stripePriceId: subscription.items.data[0]?.price.id,
      stripeSubscriptionId: subscription.id,
      status: subscription.status,
      currentPeriodEnd: toDate(subscription.current_period_end)
    }
  });

  await prisma.user.update({
    where: { id: userId },
    data: { isSubscribed }
  });

  return created.id;
}

export async function recordOneTimePurchase(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId || session.client_reference_id;
  const liveSessionId = session.metadata?.liveSessionId || null;
  const paymentIntentId =
    typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;

  if (!userId || !paymentIntentId || session.payment_status !== "paid") {
    return null;
  }

  const purchase = await prisma.purchase.upsert({
    where: {
      stripePaymentId: paymentIntentId
    },
    update: {
      userId,
      liveSessionId,
      type: "ONE_TIME",
      amount: session.amount_total || 0,
      currency: session.currency || "ron"
    },
    create: {
      userId,
      liveSessionId,
      stripePaymentId: paymentIntentId,
      type: "ONE_TIME",
      amount: session.amount_total || 0,
      currency: session.currency || "ron"
    }
  });

  return purchase.id;
}

export async function syncCheckoutSession(sessionId: string) {
  if (!sessionId) {
    return null;
  }

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["subscription", "payment_intent"]
  });

  if (session.mode === "subscription" && typeof session.subscription === "string") {
    const subscription = await stripe.subscriptions.retrieve(session.subscription);
    await upsertSubscriptionFromStripe(subscription);
  }

  if (session.mode === "payment") {
    await recordOneTimePurchase(session);
  }

  return session;
}
