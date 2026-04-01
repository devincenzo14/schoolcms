"use client";

import { useRouter } from "next/navigation";
import { FiMenu, FiLogOut, FiUser } from "react-icons/fi";

interface DashboardHeaderProps {
  userName: string;
  role: string;
  onMenuToggle: () => void;
}

export default function DashboardHeader({
  userName,
  role,
  onMenuToggle,
}: DashboardHeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-3 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center space-x-4">
        <button
          onClick={onMenuToggle}
          className="lg:hidden text-gray-500 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Toggle menu"
        >
          <FiMenu size={22} />
        </button>
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Dashboard</h1>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-3 bg-gray-50 rounded-lg px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            <FiUser size={16} className="text-blue-600" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-gray-900 leading-tight">{userName}</p>
            <p className="text-xs text-gray-500 capitalize">{role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center space-x-2 text-gray-500 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50"
          title="Logout"
        >
          <FiLogOut size={18} />
          <span className="hidden sm:inline text-sm font-medium">Logout</span>
        </button>
      </div>
    </header>
  );
}
