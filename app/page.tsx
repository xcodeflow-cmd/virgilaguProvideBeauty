import { HomepageContent } from "@/components/site/homepage-content";
import { getManagedCourseOffers } from "@/lib/course-offers";
import { getSiteSettings } from "@/lib/site-content";

export default async function HomePage() {
  const settings = await getSiteSettings();
  const offers = getManagedCourseOffers(settings.courses);

  return <HomepageContent offers={offers} />;
}
