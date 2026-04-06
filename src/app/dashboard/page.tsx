"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import StatCard from "@/components/dashboard/StatCard";
import { FiImage, FiBookOpen, FiMessageSquare, FiFileText, FiUsers, FiArrowRight } from "react-icons/fi";
import { apiFetch, useRefreshData } from "@/lib/hooks";

interface Stats {
  carousel: number;
  programs: number;
  announcements: number;
  applications: number;
  users: number;
}

export default function DashboardHomePage() {
  const [stats, setStats] = useState<Stats>({
    carousel: 0,
    programs: 0,
    announcements: 0,
    applications: 0,
    users: 0,
  });
  const [role, setRole] = useState("");
  const [userName, setUserName] = useState("");

  useRefreshData(useCallback(() => {
    apiFetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setRole(d.data.role);
          setUserName(d.data.name);
        }
      });

    const endpoints = [
      { key: "carousel", url: "/api/carousel" },
      { key: "programs", url: "/api/programs" },
      { key: "announcements", url: "/api/announcements" },
    ];

    endpoints.forEach(({ key, url }) => {
      apiFetch(url)
        .then((r) => r.json())
        .then((d) => {
          if (d.success) {
            setStats((prev) => ({ ...prev, [key]: d.data.length }));
          }
        });
    });

    apiFetch("/api/applications")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setStats((prev) => ({ ...prev, applications: d.data.length }));
      });

    apiFetch("/api/users")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setStats((prev) => ({ ...prev, users: d.data.length }));
      });
  }, []));

  const statCards = [
    { title: "Carousel Slides", value: stats.carousel, icon: <FiImage size={22} className="text-purple-600" />, color: "bg-purple-50", href: "/dashboard/carousel", roles: ["admin", "principal"] },
    { title: "Programs", value: stats.programs, icon: <FiBookOpen size={22} className="text-blue-600" />, color: "bg-blue-50", href: "/dashboard/programs", roles: ["admin", "principal", "teacher"] },
    { title: "Announcements", value: stats.announcements, icon: <FiMessageSquare size={22} className="text-amber-600" />, color: "bg-amber-50", href: "/dashboard/announcements", roles: ["admin", "principal"] },
    { title: "Applications", value: stats.applications, icon: <FiFileText size={22} className="text-cyan-600" />, color: "bg-cyan-50", href: "/dashboard/applications", roles: ["admin", "principal"] },
    { title: "Users", value: stats.users, icon: <FiUsers size={22} className="text-rose-600" />, color: "bg-rose-50", href: "/dashboard/users", roles: ["admin"] },
  ];

  const filteredCards = statCards.filter((card) => card.roles.includes(role));

  return (
    <div className="max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 md:p-8 mb-8 text-white">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">
          Welcome back, {userName || "Admin"}!
        </h1>
        <p className="text-blue-100 text-sm md:text-base">
          Here&apos;s an overview of your school content management system.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
        {filteredCards.map((card) => (
          <Link key={card.title} href={card.href} className="group">
            <StatCard
              title={card.title}
              value={card.value}
              icon={card.icon}
              color={card.color}
            />
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {role !== "teacher" && (
            <Link
              href="/dashboard/carousel"
              className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:bg-blue-50 hover:border-blue-200 transition-all group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                  <FiImage className="text-purple-600" size={18} />
                </div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">Manage Carousel</span>
              </div>
              <FiArrowRight className="text-gray-300 group-hover:text-blue-500 transition-colors" size={16} />
            </Link>
          )}
          <Link
            href="/dashboard/programs"
            className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:bg-blue-50 hover:border-blue-200 transition-all group"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <FiBookOpen className="text-blue-600" size={18} />
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">Manage Programs</span>
            </div>
            <FiArrowRight className="text-gray-300 group-hover:text-blue-500 transition-colors" size={16} />
          </Link>
          {role !== "teacher" && (
            <Link
              href="/dashboard/announcements"
              className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:bg-blue-50 hover:border-blue-200 transition-all group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                  <FiMessageSquare className="text-amber-600" size={18} />
                </div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">Manage Announcements</span>
              </div>
              <FiArrowRight className="text-gray-300 group-hover:text-blue-500 transition-colors" size={16} />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
