"use client";

import { useState, useCallback } from "react";
import Modal from "@/components/dashboard/Modal";
import { useToast } from "@/components/dashboard/ToastProvider";
import { IStudentApplication } from "@/types";
import { FiCheck, FiX, FiEye } from "react-icons/fi";
import { apiFetch, useRefreshData } from "@/lib/hooks";

export default function ApplicationsManagerPage() {
  const [applications, setApplications] = useState<IStudentApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [detailApp, setDetailApp] = useState<IStudentApplication | null>(null);
  const { showToast } = useToast();

  const fetchApplications = async () => {
    try {
      const res = await apiFetch("/api/applications");
      const data = await res.json();
      if (data.success) setApplications(data.data);
    } catch {
      showToast("Failed to fetch applications", "error");
    } finally {
      setLoading(false);
    }
  };

  useRefreshData(useCallback(() => {
    fetchApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []));

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await apiFetch(`/api/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Application ${status}!`, "success");
        fetchApplications();
        if (detailApp && detailApp._id === id) {
          setDetailApp({ ...detailApp, status: status as IStudentApplication["status"] });
        }
      } else {
        showToast(data.error || "Failed to update", "error");
      }
    } catch {
      showToast("Failed to update application", "error");
    }
  };

  const getFullName = (app: IStudentApplication) => {
    const parts = [app.lastName, app.firstName, app.middleName, app.suffix].filter(Boolean);
    return parts.join(", ") || app.lastName || "N/A";
  };

  const filtered =
    filter === "all"
      ? applications
      : applications.filter((a) => a.status === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Student Applications
        </h1>
        <div className="flex items-center space-x-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="all">All ({applications.length})</option>
            <option value="pending">
              Pending ({applications.filter((a) => a.status === "pending").length})
            </option>
            <option value="approved">
              Approved ({applications.filter((a) => a.status === "approved").length})
            </option>
            <option value="rejected">
              Rejected ({applications.filter((a) => a.status === "rejected").length})
            </option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <p className="text-gray-500">No applications found.</p>
        </div>
      ) : (
        <>
          {/* Mobile Card View */}
          <div className="space-y-3 md:hidden">
            {filtered.map((app) => (
              <div key={app._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{getFullName(app)}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{app.contactNumber}</p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${
                      app.status === "approved"
                        ? "bg-green-100 text-green-700"
                        : app.status === "rejected"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                  <span>Grade: {app.gradeLevel}</span>
                  <span>{new Date(app.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-end gap-1 mt-3 pt-3 border-t border-gray-100">
                  <button onClick={() => setDetailApp(app)} className="p-2 text-gray-400 hover:text-blue-600" title="View Details"><FiEye size={16} /></button>
                  {app.status !== "approved" && (
                    <button onClick={() => updateStatus(app._id, "approved")} className="p-2 text-gray-400 hover:text-green-600" title="Approve"><FiCheck size={16} /></button>
                  )}
                  {app.status !== "rejected" && (
                    <button onClick={() => updateStatus(app._id, "rejected")} className="p-2 text-gray-400 hover:text-red-600" title="Reject"><FiX size={16} /></button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Student Name</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Grade</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((app) => (
                    <tr key={app._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900 text-sm">{getFullName(app)}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        <p>{app.contactNumber}</p>
                        {app.email && <p className="text-xs text-gray-400">{app.email}</p>}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{app.gradeLevel}</td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            app.status === "approved"
                              ? "bg-green-100 text-green-700"
                              : app.status === "rejected"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{new Date(app.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => setDetailApp(app)} className="p-2 text-gray-400 hover:text-blue-600 transition-colors" title="View Details"><FiEye size={16} /></button>
                          {app.status !== "approved" && (
                            <button onClick={() => updateStatus(app._id, "approved")} className="p-2 text-gray-400 hover:text-green-600 transition-colors" title="Approve"><FiCheck size={16} /></button>
                          )}
                          {app.status !== "rejected" && (
                            <button onClick={() => updateStatus(app._id, "rejected")} className="p-2 text-gray-400 hover:text-red-600 transition-colors" title="Reject"><FiX size={16} /></button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Detail Modal */}
      <Modal
        isOpen={!!detailApp}
        onClose={() => setDetailApp(null)}
        title="Application Details"
        size="lg"
      >
        {detailApp && (
          <div className="space-y-5">
            {/* Status Badge */}
            <div className="flex items-center justify-between">
              <span
                className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                  detailApp.status === "approved"
                    ? "bg-green-100 text-green-700"
                    : detailApp.status === "rejected"
                    ? "bg-red-100 text-red-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {detailApp.status.charAt(0).toUpperCase() + detailApp.status.slice(1)}
              </span>
              <span className="text-xs text-gray-400">
                Submitted {new Date(detailApp.createdAt).toLocaleDateString("en-US", {
                  year: "numeric", month: "long", day: "numeric"
                })}
              </span>
            </div>

            {/* Student Info */}
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Student Information</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-gray-400">Last Name:</span> <span className="font-medium text-gray-900">{detailApp.lastName}</span></div>
                <div><span className="text-gray-400">First Name:</span> <span className="font-medium text-gray-900">{detailApp.firstName}</span></div>
                <div><span className="text-gray-400">Middle Name:</span> <span className="font-medium text-gray-900">{detailApp.middleName || "—"}</span></div>
                <div><span className="text-gray-400">Suffix:</span> <span className="font-medium text-gray-900">{detailApp.suffix || "—"}</span></div>
                <div><span className="text-gray-400">Age:</span> <span className="font-medium text-gray-900">{detailApp.age}</span></div>
                <div><span className="text-gray-400">Date of Birth:</span> <span className="font-medium text-gray-900">{detailApp.dateOfBirth ? new Date(detailApp.dateOfBirth).toLocaleDateString() : "—"}</span></div>
                <div><span className="text-gray-400">Gender:</span> <span className="font-medium text-gray-900">{detailApp.gender}</span></div>
                <div><span className="text-gray-400">Grade Level:</span> <span className="font-medium text-gray-900">{detailApp.gradeLevel}</span></div>
              </div>
              <div className="mt-3 text-sm">
                <span className="text-gray-400">Address:</span> <span className="font-medium text-gray-900">{detailApp.address}</span>
              </div>
              {detailApp.previousSchool && (
                <div className="mt-2 text-sm">
                  <span className="text-gray-400">Previous School:</span> <span className="font-medium text-gray-900">{detailApp.previousSchool}</span>
                </div>
              )}
            </div>

            {/* Parent/Guardian Info */}
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Parent / Guardian</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-gray-400">Name:</span> <span className="font-medium text-gray-900">{detailApp.parentGuardianName}</span></div>
                <div><span className="text-gray-400">Relationship:</span> <span className="font-medium text-gray-900">{detailApp.parentGuardianRelationship}</span></div>
                <div><span className="text-gray-400">Contact:</span> <span className="font-medium text-gray-900">{detailApp.contactNumber}</span></div>
                <div><span className="text-gray-400">Email:</span> <span className="font-medium text-gray-900">{detailApp.email || "—"}</span></div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              {detailApp.status !== "approved" && (
                <button
                  onClick={() => updateStatus(detailApp._id, "approved")}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors text-sm font-medium"
                >
                  <FiCheck size={16} />
                  <span>Approve</span>
                </button>
              )}
              {detailApp.status !== "rejected" && (
                <button
                  onClick={() => updateStatus(detailApp._id, "rejected")}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors text-sm font-medium"
                >
                  <FiX size={16} />
                  <span>Reject</span>
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
