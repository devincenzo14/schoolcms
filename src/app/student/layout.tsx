"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import StudentSidebar from "@/components/student/StudentSidebar";
import StudentHeader from "@/components/student/StudentHeader";
import { ToastProvider } from "@/components/dashboard/ToastProvider";

interface UserData {
  userId: string;
  name: string;
  email: string;
  role: string;
}

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          if (data.data.role !== "student") {
            router.push("/dashboard");
          } else {
            setUser(data.data);
          }
        } else {
          router.push("/login");
        }
      })
      .catch(() => router.push("/login"))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading student portal...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-50 flex">
        <StudentSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col min-w-0">
          <StudentHeader userName={user.name} onMenuToggle={() => setSidebarOpen(true)} />
          <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">{children}</main>
        </div>
      </div>
    </ToastProvider>
  );
}
