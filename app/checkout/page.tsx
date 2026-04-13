import { notFound } from "next/navigation";

import { CheckoutConfirmation } from "@/components/site/checkout-confirmation";
import { getManagedCourseOffers } from "@/lib/course-offers";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/site-content";
import { formatLei } from "@/lib/utils";

export default async function CheckoutPage({
  searchParams
}: {
  searchParams: Promise<{ mode?: string; liveSessionId?: string; courseId?: string }>;
}) {
  const params = await searchParams;
  const mode = params.mode === "payment" ? "payment" : "subscription";
  const liveSessionId = params.liveSessionId || "";
  const courseId = params.courseId || "";

  if (mode !== "payment") {
    notFound();
  }

  if (courseId) {
    const settings = await getSiteSettings();
    const offers = getManagedCourseOffers(settings.courses);
    const course = offers.find((item) => item.id === courseId);

    if (!course) {
      notFound();
    }

    return (
      <CheckoutConfirmation
        title={course.title}
        description={course.description}
        priceLabel={course.price}
        compareAtPriceLabel={course.compareAtPrice}
        checkoutPath={`/api/stripe/checkout?mode=payment&courseId=${course.id}`}
      />
    );
  }

  if (!liveSessionId) {
    notFound();
  }

  const liveSession = await prisma.liveSession.findUnique({
    where: { id: liveSessionId },
    select: {
      id: true,
      title: true,
      description: true,
      price: true,
      compareAtPrice: true,
      visibility: true
    }
  });

  if (!liveSession || liveSession.visibility !== "ONE_TIME" || !liveSession.price) {
    notFound();
  }

  return (
      <CheckoutConfirmation
        title={liveSession.title}
        description={liveSession.description}
        priceLabel={formatLei(liveSession.price)}
        compareAtPriceLabel={
          liveSession.compareAtPrice && liveSession.compareAtPrice > liveSession.price
            ? formatLei(liveSession.compareAtPrice)
            : null
        }
        checkoutPath={`/api/stripe/checkout?mode=payment&liveSessionId=${liveSession.id}`}
      />
  );
}
