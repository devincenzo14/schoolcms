"use client";

import Image from "next/image";
import Link from "next/link";
import { ITestimonial } from "@/types";
import { FiStar } from "react-icons/fi";

interface TestimonialSectionProps {
  testimonials: ITestimonial[];
}

export default function TestimonialSection({
  testimonials,
}: TestimonialSectionProps) {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            What Parents Say
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Trusted by families across Minglanilla and Cebu.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t._id}
              className="bg-white rounded-2xl shadow-md p-6 flex flex-col hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <FiStar
                    key={i}
                    size={14}
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
        <div className="text-center mt-8">
          <Link
            href="/testimonials"
            className="text-blue-600 hover:text-blue-700 font-semibold"
          >
            View All Testimonials &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
