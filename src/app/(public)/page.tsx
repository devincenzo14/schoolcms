import dbConnect from "@/lib/db";
import Carousel from "@/models/Carousel";
import Program from "@/models/Program";
import Gallery from "@/models/Gallery";
import Announcement from "@/models/Announcement";
import Testimonial from "@/models/Testimonial";
import HeroCarousel from "@/components/public/HeroCarousel";
import ProgramCard from "@/components/public/ProgramCard";
import AnnouncementCard from "@/components/public/AnnouncementCard";
import GalleryGrid from "@/components/public/GalleryGrid";
import TestimonialSection from "@/components/public/TestimonialSection";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function getData() {
  await dbConnect();

  const [slides, programs, galleryImages, announcements, testimonials] = await Promise.all([
    Carousel.find({ isActive: true }).sort({ order: 1 }).lean(),
    Program.find().sort({ order: 1 }).lean(),
    Gallery.find().sort({ createdAt: -1 }).limit(8).lean(),
    Announcement.find({ isPublished: true })
      .sort({ createdAt: -1 })
      .limit(3)
      .lean(),
    Testimonial.find({ isPublished: true })
      .sort({ createdAt: -1 })
      .limit(6)
      .lean(),
  ]);

  return {
    slides: JSON.parse(JSON.stringify(slides)),
    programs: JSON.parse(JSON.stringify(programs)),
    galleryImages: JSON.parse(JSON.stringify(galleryImages)),
    announcements: JSON.parse(JSON.stringify(announcements)),
    testimonials: JSON.parse(JSON.stringify(testimonials)),
  };
}

export default async function HomePage() {
  const { slides, programs, galleryImages, announcements, testimonials } = await getData();

  return (
    <div>
      {/* Hero Carousel */}
      <HeroCarousel slides={slides} />

      {/* Programs Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Programs
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover our comprehensive educational programs designed to nurture
              every student&apos;s potential.
            </p>
          </div>
          {programs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {programs.map((program: Record<string, unknown>) => (
                <ProgramCard
                  key={program._id as string}
                  program={program as unknown as import("@/types").IProgram}
                />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">
              Programs coming soon.
            </p>
          )}
          <div className="text-center mt-8">
            <Link
              href="/programs"
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              View All Programs &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Announcements Section */}
      {announcements.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Latest Announcements
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Stay updated with the latest news and events from our school.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {announcements.map((announcement: Record<string, unknown>) => (
                <AnnouncementCard
                  key={announcement._id as string}
                  announcement={
                    announcement as unknown as import("@/types").IAnnouncement
                  }
                />
              ))}
            </div>
            <div className="text-center mt-8">
              <Link
                href="/announcements"
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                View All Announcements &rarr;
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Events Preview */}
      {galleryImages.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Recent Events
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Glimpses of life at Edulinks Learning Center.
              </p>
            </div>
            <GalleryGrid
              images={
                galleryImages as unknown as import("@/types").IGallery[]
              }
            />
            <div className="text-center mt-8">
              <Link
                href="/events"
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                View All Events &rarr;
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Testimonials Section */}
      {testimonials.length > 0 && (
        <TestimonialSection testimonials={testimonials} />
      )}

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-orange-500 to-red-500">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Join Edulinks?
          </h2>
          <p className="text-orange-100 text-lg mb-8">
            Start your journey towards academic excellence today.
          </p>
          <Link
            href="/apply"
            className="inline-flex items-center gap-2 bg-white text-orange-600 px-8 py-3 rounded-lg text-lg font-bold hover:bg-gray-100 transition-colors shadow-lg"
          >
            Enroll Now
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          </Link>
        </div>
      </section>
    </div>
  );
}
