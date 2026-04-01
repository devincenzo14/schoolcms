"use client";

import { useState, useEffect } from "react";
import { FiCheckCircle, FiClock, FiXCircle } from "react-icons/fi";

interface ApplicationData {
  _id: string;
  lastName: string;
  firstName: string;
  gradeLevel: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export default function StudentEnrollmentPage() {
  const [application, setApplication] = useState<ApplicationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setEmail(d.data.email);
      });
  }, []);

  useEffect(() => {
    if (!email) return;
    fetch("/api/applications")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          const myApp = d.data.find(
            (a: ApplicationData & { email?: string; contactNumber?: string }) =>
              a.email === email
          );
          if (myApp) setApplication(myApp);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [email]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const statusConfig = {
    pending: { icon: FiClock, color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-200", label: "Pending Review" },
    approved: { icon: FiCheckCircle, color: "text-green-600", bg: "bg-green-50", border: "border-green-200", label: "Approved" },
    rejected: { icon: FiXCircle, color: "text-red-600", bg: "bg-red-50", border: "border-red-200", label: "Rejected" },
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Enrollment Status</h1>

      {!application ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <FiClock className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-gray-500 mb-2">No enrollment application found for your account.</p>
          <p className="text-xs text-gray-400">Your account may have been created directly by an administrator.</p>
        </div>
      ) : (
        <div className={`rounded-2xl border ${statusConfig[application.status].border} ${statusConfig[application.status].bg} p-6`}>
          <div className="flex items-center gap-3 mb-4">
            {(() => {
              const Icon = statusConfig[application.status].icon;
              return <Icon size={28} className={statusConfig[application.status].color} />;
            })()}
            <div>
              <h2 className={`text-lg font-bold ${statusConfig[application.status].color}`}>
                {statusConfig[application.status].label}
              </h2>
              <p className="text-sm text-gray-500">
                Submitted on {new Date(application.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-400">Name:</span>{" "}
              <span className="font-medium text-gray-700">{application.firstName} {application.lastName}</span>
            </div>
            <div>
              <span className="text-gray-400">Grade Level:</span>{" "}
              <span className="font-medium text-gray-700">{application.gradeLevel}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
