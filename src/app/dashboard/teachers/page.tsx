"use client";

import { useState, useCallback } from "react";
import { useToast } from "@/components/dashboard/ToastProvider";
import { FiSearch, FiUsers, FiBookOpen, FiEye, FiArrowLeft } from "react-icons/fi";
import { apiFetch, useRefreshData } from "@/lib/hooks";

interface TeacherInfo {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
  subjects: string[];
  subjectCount: number;
  studentCount: number;
}

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<TeacherInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherInfo | null>(null);
  const { showToast } = useToast();

  const fetchTeachers = async () => {
    try {
      const res = await apiFetch("/api/teachers");
      const d = await res.json();
      if (d.success) setTeachers(d.data);
    } catch {
      showToast("Failed to fetch teachers", "error");
    } finally {
      setLoading(false);
    }
  };

  useRefreshData(useCallback(() => {
    fetchTeachers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []));

  const filtered = teachers.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.email.toLowerCase().includes(search.toLowerCase()) ||
      t.subjects.some((s) => s.toLowerCase().includes(search.toLowerCase()))
  );

  const totalStudents = new Set(
    teachers.flatMap(() => [])
  ).size;
  const totalSubjects = teachers.reduce((sum, t) => sum + t.subjectCount, 0);

  if (selectedTeacher) {
    return (
      <div>
        <button
          onClick={() => setSelectedTeacher(null)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
        >
          <FiArrowLeft size={18} />
          <span className="font-medium">Back to Teachers</span>
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800">{selectedTeacher.name}</h2>
          <p className="text-gray-500 mt-1">{selectedTeacher.email}</p>
          <p className="text-sm text-gray-400 mt-1">
            Joined {new Date(selectedTeacher.createdAt).toLocaleDateString()}
          </p>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-blue-600">{selectedTeacher.subjectCount}</p>
              <p className="text-sm text-blue-600 font-medium mt-1">Subjects Handled</p>
            </div>
            <div className="bg-emerald-50 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-emerald-600">{selectedTeacher.studentCount}</p>
              <p className="text-sm text-emerald-600 font-medium mt-1">Students Handled</p>
            </div>
          </div>
        </div>

        {selectedTeacher.subjects.length > 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Subjects</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {selectedTeacher.subjects.map((subject, i) => (
                <div
                  key={i}
                  className="flex items-center space-x-3 bg-gray-50 rounded-lg px-4 py-3 border border-gray-100"
                >
                  <FiBookOpen className="text-blue-500" size={18} />
                  <span className="text-sm font-medium text-gray-700">{subject}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <FiBookOpen size={36} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No subjects assigned yet.</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Teachers</h1>
          <p className="text-gray-500 text-sm mt-1">
            {teachers.length} teacher{teachers.length !== 1 ? "s" : ""} · {totalSubjects} subject{totalSubjects !== 1 ? "s" : ""} total
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <FiUsers size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{teachers.length}</p>
              <p className="text-sm text-gray-500">Total Teachers</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <FiBookOpen size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{totalSubjects}</p>
              <p className="text-sm text-gray-500">Total Subjects</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
              <FiUsers size={20} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">
                {teachers.reduce((sum, t) => sum + t.studentCount, 0)}
              </p>
              <p className="text-sm text-gray-500">Total Students Handled</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by name, email, or subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading teachers...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <FiUsers size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">{search ? "No teachers match your search." : "No teachers found."}</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Teacher</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Subjects</th>
                  <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">No. of Subjects</th>
                  <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">No. of Students</th>
                  <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((teacher) => (
                  <tr key={teacher._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-800 text-sm">{teacher.name}</p>
                        <p className="text-xs text-gray-500">{teacher.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {teacher.subjects.length > 0 ? (
                          teacher.subjects.slice(0, 3).map((s, i) => (
                            <span
                              key={i}
                              className="inline-block bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full"
                            >
                              {s}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-gray-400 italic">No subjects</span>
                        )}
                        {teacher.subjects.length > 3 && (
                          <span className="inline-block bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-full">
                            +{teacher.subjects.length - 3} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-50 text-blue-700 font-semibold text-sm rounded-full">
                        {teacher.subjectCount}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-emerald-50 text-emerald-700 font-semibold text-sm rounded-full">
                        {teacher.studentCount}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => setSelectedTeacher(teacher)}
                        className="text-blue-600 hover:text-blue-700 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <FiEye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
