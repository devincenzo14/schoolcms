import dbConnect from "@/lib/db";
import Announcement from "@/models/Announcement";
import AnnouncementCard from "@/components/public/AnnouncementCard";
import AnnouncementsFilter from "@/components/public/AnnouncementsFilter";
import { IAnnouncement } from "@/types";

export const dynamic = "force-dynamic";

export default async function AnnouncementsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  await dbConnect();

  const now = new Date();
  const filter: Record<string, unknown> = {
    isPublished: true,
    $or: [{ scheduledAt: null }, { scheduledAt: { $lte: now } }],
    $and: [{ $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }] }],
  };

  if (category && ["Nursery", "Kinder", "Preschool"].includes(category)) {
    filter.category = { $in: [category, "All"] };
  }

  const announcements = await Announcement.find(filter)
    .sort({ createdAt: -1 })
    .lean();
  const data: IAnnouncement[] = JSON.parse(JSON.stringify(announcements));

  return (
    <div className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Announcements
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base">
            Stay updated with the latest news and events.
          </p>
        </div>

        <AnnouncementsFilter active={category || "All"} />

        {data.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {data.map((announcement) => (
              <AnnouncementCard
                key={announcement._id}
                announcement={announcement}
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-12">
            No announcements at the moment.
          </p>
        )}
      </div>
    </div>
  );
}
