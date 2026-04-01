import dbConnect from "@/lib/db";
import Gallery from "@/models/Gallery";
import GalleryGrid from "@/components/public/GalleryGrid";
import { IGallery } from "@/types";
import EventsFilter from "@/components/public/EventsFilter";

export const dynamic = "force-dynamic";

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  await dbConnect();

  const filter: Record<string, string> = {};
  if (category && ["Nursery", "Kinder", "Preschool"].includes(category)) {
    filter.category = category;
  }

  const images = await Gallery.find(filter).sort({ createdAt: -1 }).lean();
  const data: IGallery[] = JSON.parse(JSON.stringify(images));

  return (
    <div className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Events</h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base">
            Browse events and activities at Edulinks Learning Center.
          </p>
        </div>

        <EventsFilter active={category || "All"} />

        <GalleryGrid images={data} />
      </div>
    </div>
  );
}
