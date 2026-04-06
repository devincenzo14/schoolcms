"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { apiFetch } from "@/lib/hooks";
import {
  FiHome,
  FiImage,
  FiBookOpen,
  FiCalendar,
  FiMessageSquare,
  FiUsers,
  FiFileText,
  FiX,
  FiExternalLink,
  FiClipboard,
  FiLayers,
  FiInfo,
  FiStar,
  FiHelpCircle,
  FiBriefcase,
} from "react-icons/fi";

interface SidebarProps {
  role: string;
  isOpen: boolean;
  onClose: () => void;
}

const allMenuItems = [
  { href: "/dashboard", label: "Dashboard", icon: FiHome, roles: ["admin", "principal", "teacher"], key: "" },
  { href: "/dashboard/carousel", label: "Carousel", icon: FiImage, roles: ["admin", "principal"], key: "" },
  { href: "/dashboard/programs", label: "Programs", icon: FiBookOpen, roles: ["admin", "principal", "teacher"], key: "" },
  { href: "/dashboard/events", label: "Events", icon: FiCalendar, roles: ["admin", "principal", "teacher"], key: "" },
  { href: "/dashboard/announcements", label: "Announcements", icon: FiMessageSquare, roles: ["admin", "principal", "teacher"], key: "announcements" },
  { href: "/dashboard/about", label: "About", icon: FiInfo, roles: ["admin"], key: "" },
  { href: "/dashboard/testimonials", label: "Testimonials", icon: FiStar, roles: ["admin"], key: "" },
  { href: "/dashboard/applications", label: "Applications", icon: FiFileText, roles: ["admin", "principal"], key: "applications" },
  { href: "/dashboard/classes", label: "Classes", icon: FiLayers, roles: ["admin", "principal", "teacher"], key: "" },
  { href: "/dashboard/grades", label: "Grades", icon: FiClipboard, roles: ["admin", "principal", "teacher"], key: "grades" },
  { href: "/dashboard/teachers", label: "Teachers", icon: FiBriefcase, roles: ["admin", "principal"], key: "" },
  { href: "/dashboard/students", label: "Students", icon: FiUsers, roles: ["admin", "principal", "teacher"], key: "" },
  { href: "/dashboard/users", label: "Users", icon: FiUsers, roles: ["admin"], key: "" },
  { href: "/dashboard/instructions", label: "Help Page", icon: FiHelpCircle, roles: ["admin", "principal", "teacher"], key: "" },
];

export default function Sidebar({ role, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [badges, setBadges] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchBadges = () => {
      apiFetch("/api/notifications")
        .then((r) => r.json())
        .then((d) => {
          if (d.success) setBadges(d.data);
        })
        .catch(() => {});
    };

    fetchBadges();
    const interval = setInterval(fetchBadges, 30000);
    return () => clearInterval(interval);
  }, []);

  const menuItems = allMenuItems.filter((item) => item.roles.includes(role));

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 shrink-0 bg-gradient-to-b from-gray-900 to-gray-800 text-white transition-transform duration-300 ease-in-out lg:sticky lg:top-0 lg:h-screen lg:z-auto ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo & Brand */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <Image
              src="/logo.png"
              alt="Edulinks"
              width={36}
              height={36}
              className="rounded-lg"
            />
            <div>
              <h2 className="text-base font-bold leading-tight">Edulinks CMS</h2>
              <p className="text-xs text-blue-300 capitalize font-medium">{role} Panel</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Close menu"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-3 flex-1">
          <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-3">
            Menu
          </p>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
            const badgeCount = item.key ? badges[item.key] || 0 : 0;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg mb-1 transition-all duration-200 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                    : "text-gray-400 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon size={18} />
                <span className="font-medium text-sm flex-1">{item.label}</span>
                {badgeCount > 0 && (
                  <span className="min-w-[20px] h-5 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5">
                    {badgeCount > 99 ? "99+" : badgeCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Link */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <Link
            href="/"
            className="flex items-center justify-center space-x-2 text-gray-400 hover:text-white transition-colors text-sm py-2.5 border border-white/10 rounded-lg hover:bg-white/5 hover:border-white/20"
          >
            <FiExternalLink size={14} />
            <span>View Website</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
