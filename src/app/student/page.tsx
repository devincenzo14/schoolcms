"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { FiClipboard, FiMessageSquare, FiBookOpen, FiFileText, FiArrowRight } from "react-icons/fi";
import { apiFetch, useRefreshData } from "@/lib/hooks";

interface Stats {
  grades: number;
  announcements: number;
  classes: number;
  averageScore: number;
}

export default function StudentDashboardPage() {
  const [userName, setUserName] = useState("");
  const [stats, setStats] = useState<Stats>({ grades: 0, announcements: 0, classes: 0, averageScore: 0 });

  useRefreshData(useCallback(() => {
    apiFetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setUserName(d.data.name);
      });

    apiFetch("/api/grades")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          const grades = d.data;
          const avg = grades.length > 0 ? Math.round(grades.reduce((a: number, g: { score: number }) => a + g.score, 0) / grades.length) : 0;
          setStats((prev) => ({ ...prev, grades: grades.length, averageScore: avg }));
        }
      });

    apiFetch("/api/announcements")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setStats((prev) => ({ ...prev, announcements: d.data.length }));
      });

    apiFetch("/api/classes")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setStats((prev) => ({ ...prev, classes: d.data.length }));
      });
  }, []));

  const cards = [
    { title: "My Grades", value: stats.grades, desc: `Average: ${stats.averageScore}%`, icon: <FiClipboard size={22} className="text-blue-600" />, color: "bg-blue-50", href: "/student/grades" },
    { title: "Subjects", value: stats.classes, desc: "Enrolled classes", icon: <FiBookOpen size={22} className="text-emerald-600" />, color: "bg-emerald-50", href: "/student/subjects" },
    { title: "Announcements", value: stats.announcements, desc: "School updates", icon: <FiMessageSquare size={22} className="text-amber-600" />, color: "bg-amber-50", href: "/student/announcements" },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-2xl p-6 md:p-8 mb-8 text-white">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome, {userName || "Student"}!</h1>
        <p className="text-emerald-100 text-sm md:text-base">Here&apos;s your academic overview at a glance.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-8">
        {cards.map((card) => (
          <Link key={card.title} href={card.href} className="group">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-11 h-11 rounded-xl ${card.color} flex items-center justify-center`}>
                  {card.icon}
                </div>
                <FiArrowRight className="text-gray-300 group-hover:text-blue-500 transition-colors" size={16} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              <p className="text-sm text-gray-500">{card.title}</p>
              <p className="text-xs text-gray-400 mt-1">{card.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/student/enrollment" className="flex items-center justify-between p-5 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
              <FiFileText className="text-purple-600" size={18} />
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">Enrollment Status</span>
              <p className="text-xs text-gray-400">Check your application</p>
            </div>
          </div>
          <FiArrowRight className="text-gray-300 group-hover:text-blue-500 transition-colors" size={16} />
        </Link>
        <Link href="/student/grades" className="flex items-center justify-between p-5 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <FiClipboard className="text-blue-600" size={18} />
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">View Grades</span>
              <p className="text-xs text-gray-400">See your academic performance</p>
            </div>
          </div>
          <FiArrowRight className="text-gray-300 group-hover:text-blue-500 transition-colors" size={16} />
        </Link>
      </div>
    </div>
  );
}
