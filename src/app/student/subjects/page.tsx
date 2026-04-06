"use client";

import { useState, useCallback } from "react";
import { IClass } from "@/types";
import { FiUsers, FiClock } from "react-icons/fi";
import { apiFetch, useRefreshData } from "@/lib/hooks";

export default function StudentSubjectsPage() {
  const [classes, setClasses] = useState<IClass[]>([]);
  const [loading, setLoading] = useState(true);

  useRefreshData(useCallback(() => {
    apiFetch("/api/classes")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setClasses(d.data);
      })
      .finally(() => setLoading(false));
  }, []));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Subjects</h1>

      {classes.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <p className="text-gray-500">You are not enrolled in any classes yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {classes.map((cls) => {
            const teacherName = typeof cls.teacherId === "object" ? cls.teacherId.name : "N/A";
            return (
              <div key={cls._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-gray-900 mb-1">{cls.subject}</h3>
                <p className="text-sm text-gray-500 mb-3">{cls.name}{cls.section ? ` - Section ${cls.section}` : ""}</p>
                <div className="space-y-1.5 text-sm">
                  <p className="text-gray-600"><span className="text-gray-400">Teacher:</span> {teacherName}</p>
                  {cls.schedule && (
                    <p className="flex items-center gap-1.5 text-gray-600">
                      <FiClock size={13} className="text-gray-400" />
                      {cls.schedule}
                    </p>
                  )}
                  <p className="flex items-center gap-1.5 text-gray-500">
                    <FiUsers size={13} className="text-gray-400" />
                    {cls.students.length} classmate{cls.students.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
