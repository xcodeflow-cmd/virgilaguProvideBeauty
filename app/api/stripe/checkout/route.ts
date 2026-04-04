import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { stripe } from "@/lib/stripe";

const subscriptionPriceId = process.env.STRIPE_SUBSCRIPTION_PRICE_ID || "price_subscription_placeholder";
const oneTimePriceId = process.env.STRIPE_ONE_TIME_PRICE_ID || "price_single_placeholder";

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode") === "payment" ? "payment" : "subscription";

  try {
    const checkout = await stripe.checkout.sessions.create({
      mode,
      customer_email: session.user.email,
      line_items: [
        {
          price: mode === "subscription" ? subscriptionPriceId : oneTimePriceId,
          quantity: 1
        }
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/live?checkout=cancelled`
    });

    return NextResponse.redirect(checkout.url || new URL("/dashboard", request.url));
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Stripe checkout could not be created." }, { status: 500 });
  }
}
