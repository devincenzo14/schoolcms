import dbConnect from "@/lib/db";
import Announcement from "@/models/Announcement";
import sanitizeHtml from "sanitize-html";
import Image from "next/image";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";

export const dynamic = "force-dynamic";

export default async function AnnouncementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await dbConnect();
  const announcement = await Announcement.findById(id).lean();

  if (!announcement || !announcement.isPublished) {
    return (
      <div className="py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Announcement Not Found
        </h1>
        <Link href="/announcements" className="text-blue-600 hover:text-blue-700">
          &larr; Back to Announcements
        </Link>
      </div>
    );
  }

  const safeContent = sanitizeHtml(announcement.content, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["h1", "h2", "h3", "img"]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ["src", "alt", "width", "height"],
    },
  });

  return (
    <div className="py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/announcements"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-8"
        >
          <FiArrowLeft className="mr-2" />
          Back to Announcements
        </Link>

        <article>
          <div className="text-sm text-blue-600 font-medium mb-2">
            {new Date(announcement.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
            {announcement.title}
          </h1>

          {announcement.images && announcement.images.length > 0 && (
            <div className="flex flex-wrap gap-4 mb-8">
              {announcement.images.map((img: string, i: number) => (
                <div key={i} className="relative w-full sm:w-64 h-48 rounded-lg overflow-hidden border border-gray-200">
                  <Image src={img} alt={`${announcement.title} photo ${i + 1}`} fill className="object-cover" />
                </div>
              ))}
            </div>
          )}

          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: safeContent }}
          />
        </article>
      </div>
    </div>
  );
}
