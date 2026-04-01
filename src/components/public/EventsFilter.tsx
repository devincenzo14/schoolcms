"use client";

import { useRouter } from "next/navigation";

const categories = ["All", "Nursery", "Kinder", "Preschool"];

export default function EventsFilter({ active }: { active: string }) {
  const router = useRouter();

  return (
    <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() =>
            router.push(cat === "All" ? "/events" : `/events?category=${cat}`)
          }
          className={`px-4 sm:px-5 py-2 rounded-full text-sm font-medium transition-all ${
            active === cat
              ? "bg-blue-600 text-white shadow-md"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
