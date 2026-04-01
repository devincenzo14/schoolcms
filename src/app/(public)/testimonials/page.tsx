import dbConnect from "@/lib/db";
import Testimonial from "@/models/Testimonial";
import { ITestimonial } from "@/types";
import Image from "next/image";
import { FiStar } from "react-icons/fi";

export const dynamic = "force-dynamic";

export default async function TestimonialsPage() {
  await dbConnect();
  const testimonials = await Testimonial.find({ isPublished: true })
    .sort({ createdAt: -1 })
    .lean();
  const data: ITestimonial[] = JSON.parse(JSON.stringify(testimonials));

  return (
    <div className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-14">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Testimonials
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base">
            Hear what parents and students say about Edulinks Learning Center.
          </p>
        </div>

        {data.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.map((t) => (
              <div
                key={t._id}
                className="bg-white rounded-2xl shadow-md p-6 flex flex-col hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <FiStar
                      key={i}
                      size={16}
                      className={
                        i < t.rating
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-200"
                      }
                    />
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed flex-1 mb-5 italic">
                  &ldquo;{t.content}&rdquo;
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  {t.imageUrl ? (
                    <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                      <Image
                        src={t.imageUrl}
                        alt={t.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 font-bold text-sm">
                        {t.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">
                      {t.name}
                    </p>
                    <p className="text-gray-400 text-xs">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-12">
            No testimonials yet.
          </p>
        )}
      </div>
    </div>
  );
}
