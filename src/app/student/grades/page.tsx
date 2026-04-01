"use client";

import { useState, useEffect } from "react";
import { IGrade } from "@/types";

export default function StudentGradesPage() {
  const [grades, setGrades] = useState<IGrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTerm, setFilterTerm] = useState("all");

  useEffect(() => {
    fetch("/api/grades")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setGrades(d.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = filterTerm === "all" ? grades : grades.filter((g) => g.term === filterTerm);

  const average = filtered.length > 0
    ? Math.round(filtered.reduce((a, g) => a + g.score, 0) / filtered.length)
    : 0;

  const subjects = [...new Set(grades.map((g) => g.subject))];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Grades</h1>
        <div className="flex items-center gap-3">
          <select
            value={filterTerm}
            onChange={(e) => setFilterTerm(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
          >
            <option value="all">All Terms</option>
            <option value="1st">1st Term</option>
            <option value="2nd">2nd Term</option>
            <option value="3rd">3rd Term</option>
            <option value="4th">4th Term</option>
            <option value="final">Final</option>
          </select>
        </div>
      </div>

      {/* Average Score Card */}
      <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl p-5 mb-6 text-white flex items-center justify-between">
        <div>
          <p className="text-emerald-100 text-sm">Overall Average</p>
          <p className="text-3xl font-bold">{average}%</p>
        </div>
        <div className="text-right">
          <p className="text-emerald-100 text-sm">{filtered.length} grades</p>
          <p className="text-emerald-100 text-sm">{subjects.length} subjects</p>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <p className="text-gray-500">No grades available yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Subject</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Score</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Term</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Remarks</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Teacher</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((g) => {
                  const teacherName = typeof g.teacherId === "object" ? g.teacherId.name : "—";
                  return (
                    <tr key={g._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900 text-sm">{g.subject}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                          g.score >= 75 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}>
                          {g.score}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-gray-500">{g.term}</td>
                      <td className="px-4 py-3 text-sm text-gray-500 hidden md:table-cell">{g.remarks || "—"}</td>
                      <td className="px-4 py-3 text-sm text-gray-500 hidden md:table-cell">{teacherName}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
