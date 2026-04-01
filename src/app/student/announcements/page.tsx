"use client";

import { useState, useEffect } from "react";
import { IAnnouncement } from "@/types";
import Image from "next/image";

export default function StudentAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<IAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/announcements")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setAnnouncements(d.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Announcements</h1>

      {announcements.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <p className="text-gray-500">No announcements at the moment.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((a) => (
            <div key={a._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="text-xs text-emerald-600 font-medium mb-1">
                {new Date(a.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">{a.title}</h2>
              {a.images && a.images.length > 0 && (
                <div className="flex gap-2 mb-3 overflow-x-auto">
                  {a.images.map((img, i) => (
                    <div key={i} className="relative w-32 h-24 rounded-xl overflow-hidden shrink-0 border border-gray-100">
                      <Image src={img} alt="" fill className="object-cover" />
                    </div>
                  ))}
                </div>
              )}
              <div
                className="prose prose-sm max-w-none text-gray-600"
                dangerouslySetInnerHTML={{ __html: a.content }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
