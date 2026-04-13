import { CoursesPageContent } from "@/components/site/courses-page-content";
import { getManagedCourseOffers } from "@/lib/course-offers";
import { getSiteSettings } from "@/lib/site-content";

export default async function CoursesPage() {
  const settings = await getSiteSettings();
  const offers = getManagedCourseOffers(settings.courses);

  return <CoursesPageContent offers={offers} />;
}
