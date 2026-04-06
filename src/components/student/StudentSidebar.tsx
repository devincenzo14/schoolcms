"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  FiHome,
  FiClipboard,
  FiMessageSquare,
  FiBookOpen,
  FiFileText,
  FiUser,
  FiX,
  FiExternalLink,
} from "react-icons/fi";

interface StudentSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { href: "/student", label: "Dashboard", icon: FiHome },
  { href: "/student/grades", label: "My Grades", icon: FiClipboard },
  { href: "/student/subjects", label: "My Subjects", icon: FiBookOpen },
  { href: "/student/announcements", label: "Announcements", icon: FiMessageSquare },
  { href: "/student/enrollment", label: "Enrollment Status", icon: FiFileText },
  { href: "/student/profile", label: "My Profile", icon: FiUser },
];

export default function StudentSidebar({ isOpen, onClose }: StudentSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 shrink-0 bg-gradient-to-b from-emerald-900 to-emerald-800 text-white transition-transform duration-300 ease-in-out lg:sticky lg:top-0 lg:h-screen lg:z-auto ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <Image src="/logo.png" alt="Edulinks" width={36} height={36} className="rounded-lg" />
            <div>
              <h2 className="text-base font-bold leading-tight">Edulinks</h2>
              <p className="text-xs text-emerald-300 font-medium">Student Portal</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors" aria-label="Close menu">
            <FiX size={20} />
          </button>
        </div>

        <nav className="mt-6 px-3 flex-1">
          <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-emerald-400/60 mb-3">Menu</p>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.href === "/student" ? pathname === "/student" : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg mb-1 transition-all duration-200 ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
                    : "text-gray-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon size={18} />
                <span className="font-medium text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <Link href="/" className="flex items-center justify-center space-x-2 text-gray-400 hover:text-white transition-colors text-sm py-2.5 border border-white/10 rounded-lg hover:bg-white/5 hover:border-white/20">
            <FiExternalLink size={14} />
            <span>View Website</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
