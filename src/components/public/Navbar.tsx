"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { FiMenu, FiX, FiGrid, FiArrowRight } from "react-icons/fi";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/programs", label: "Programs" },
  { href: "/events", label: "Events" },
  { href: "/announcements", label: "Announcements" },
  { href: "/testimonials", label: "Testimonials" },
  { href: "/about", label: "About" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("");
  const pathname = usePathname();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        setIsLoggedIn(data.success === true);
        if (data.success) setUserRole(data.data.role);
      })
      .catch(() => setIsLoggedIn(false));
  }, []);

  const dashboardHref = userRole === "student" ? "/student" : "/dashboard";

  return (
    <nav className="bg-white/95 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3">
              <Image
                src="/logo.png"
                alt="Edulinks Learning Center"
                width={40}
                height={40}
                className="rounded-lg"
              />
              <span className="text-xl font-bold text-gray-900 hidden sm:inline">
                Edulinks <span className="text-blue-600">Learning Center</span>
              </span>
              <span className="text-xl font-bold text-gray-900 sm:hidden">
                Edulinks
              </span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link
              href="/apply"
              className="ml-1 flex items-center gap-1.5 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all text-sm font-bold shadow-md hover:shadow-lg animate-pulse hover:animate-none"
            >
              <span>Enroll Now</span>
              <FiArrowRight size={14} />
            </Link>
            {isLoggedIn ? (
              <Link
                href={dashboardHref}
                className="ml-1 flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                <FiGrid size={16} />
                <span>{userRole === "student" ? "Portal" : "Dashboard"}</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="ml-1 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {isOpen && (
          <div className="md:hidden pb-4 pt-2 space-y-1 border-t border-gray-100">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block py-2.5 px-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link
              href="/apply"
              className="flex items-center justify-center gap-2 mt-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2.5 rounded-lg text-center hover:from-orange-600 hover:to-red-600 transition-all text-sm font-bold shadow-md"
              onClick={() => setIsOpen(false)}
            >
              <span>Enroll Now</span>
              <FiArrowRight size={14} />
            </Link>
            {isLoggedIn ? (
              <Link
                href={dashboardHref}
                className="flex items-center justify-center space-x-2 mt-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-center hover:bg-blue-700 transition-colors text-sm font-medium"
                onClick={() => setIsOpen(false)}
              >
                <FiGrid size={16} />
                <span>{userRole === "student" ? "Portal" : "Dashboard"}</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="block mt-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-center hover:bg-blue-700 transition-colors text-sm font-medium"
                onClick={() => setIsOpen(false)}
              >
                Login
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
