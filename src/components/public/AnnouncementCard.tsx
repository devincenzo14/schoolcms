import Link from "next/link";
import Image from "next/image";
import { IAnnouncement } from "@/types";

interface AnnouncementCardProps {
  announcement: IAnnouncement;
}

export default function AnnouncementCard({
  announcement,
}: AnnouncementCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {announcement.images && announcement.images.length > 0 && (
        <div className="relative h-44 w-full">
          <Image
            src={announcement.images[0]}
            alt={announcement.title}
            fill
            className="object-cover"
          />
          {announcement.images.length > 1 && (
            <span className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
              +{announcement.images.length - 1} more
            </span>
          )}
        </div>
      )}
      <div className="p-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm text-blue-600 font-medium">
            {new Date(announcement.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
          {announcement.category && announcement.category !== "All" && (
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
              announcement.category === "Nursery" ? "bg-pink-100 text-pink-700" :
              announcement.category === "Kinder" ? "bg-purple-100 text-purple-700" :
              "bg-blue-100 text-blue-700"
            }`}>
              {announcement.category}
            </span>
          )}
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          {announcement.title}
        </h3>
        <div
          className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-4"
          dangerouslySetInnerHTML={{
            __html: announcement.content.replace(/<[^>]*>/g, "").substring(0, 150) + "...",
          }}
        />
        <Link
          href={`/announcements/${announcement._id}`}
          className="text-blue-600 hover:text-blue-700 font-medium text-sm"
        >
          Read More &rarr;
        </Link>
      </div>
    </div>
  );
}
