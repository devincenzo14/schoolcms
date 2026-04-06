"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Modal from "@/components/dashboard/Modal";
import ConfirmDialog from "@/components/dashboard/ConfirmDialog";
import { useToast } from "@/components/dashboard/ToastProvider";
import { IGrade, IClass } from "@/types";
import { FiPlus, FiEdit2, FiTrash2, FiCheck, FiX, FiAward, FiArrowLeft, FiChevronRight } from "react-icons/fi";
import { apiFetch, useRefreshData } from "@/lib/hooks";

interface StudentOption {
  _id: string;
  name: string;
  email: string;
}

// Philippine DepEd grading descriptors
function getPhGradeDescriptor(score: number) {
  if (score >= 90) return { label: "Outstanding", color: "text-amber-700 bg-amber-100" };
  if (score >= 85) return { label: "Very Satisfactory", color: "text-green-700 bg-green-100" };
  if (score >= 80) return { label: "Satisfactory", color: "text-blue-700 bg-blue-100" };
  if (score >= 75) return { label: "Fairly Satisfactory", color: "text-yellow-700 bg-yellow-100" };
  return { label: "Did Not Meet Expectations", color: "text-red-700 bg-red-100" };
}

export default function GradesManagerPage() {
  const [grades, setGrades] = useState<IGrade[]>([]);
  const [classes, setClasses] = useState<IClass[]>([]);
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<IGrade | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<IGrade | null>(null);
  const [saving, setSaving] = useState(false);
  const [filterTerm, setFilterTerm] = useState("all");
  const [filterLevel, setFilterLevel] = useState("all");
  const [filterSection, setFilterSection] = useState("all");
  const [role, setRole] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const { showToast } = useToast();

  const [form, setForm] = useState({
    studentId: "",
    subject: "",
    score: "",
    term: "1st" as string,
    remarks: "",
  });

  const fetchGrades = async () => {
    try {
      const res = await apiFetch("/api/grades");
      const data = await res.json();
      if (data.success) setGrades(data.data);
    } catch {
      showToast("Failed to fetch grades", "error");
    } finally {
      setLoading(false);
    }
  };

  useRefreshData(useCallback(() => {
    fetchGrades();
    apiFetch("/api/students")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setStudents(d.data);
      });
    apiFetch("/api/classes")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setClasses(d.data);
      });
    apiFetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setRole(d.data.role);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []));

  // Map studentId -> { level, section }
  const studentClassMap = useMemo(() => {
    const map: Record<string, { level: string; section: string }> = {};
    for (const cls of classes) {
      const studs = cls.students as { _id: string; name: string; email: string }[];
      if (Array.isArray(studs)) {
        for (const s of studs) {
          const sid = typeof s === "object" ? s._id : s;
          if (!map[sid]) {
            map[sid] = { level: cls.name, section: cls.section };
          }
        }
      }
    }
    return map;
  }, [classes]);

  const gradeLevels = useMemo(() => {
    const levels = new Set<string>();
    classes.forEach((c) => levels.add(c.name));
    return Array.from(levels).sort();
  }, [classes]);

  const sections = useMemo(() => {
    const secs = new Set<string>();
    classes
      .filter((c) => filterLevel === "all" || c.name === filterLevel)
      .forEach((c) => secs.add(c.section));
    return Array.from(secs).sort();
  }, [classes, filterLevel]);

  // Compute per-student average (approved grades only)
  const studentAverages = useMemo(() => {
    const map: Record<string, { total: number; count: number }> = {};
    for (const g of grades) {
      if (g.status !== "approved") continue;
      const sid = typeof g.studentId === "object" ? g.studentId._id : g.studentId;
      if (!map[sid]) map[sid] = { total: 0, count: 0 };
      map[sid].total += g.score;
      map[sid].count += 1;
    }
    const avgs: Record<string, number> = {};
    for (const [sid, { total, count }] of Object.entries(map)) {
      avgs[sid] = Math.round(total / count);
    }
    return avgs;
  }, [grades]);

  const getStudentId = (g: IGrade) =>
    typeof g.studentId === "object" ? g.studentId._id : g.studentId;

  const getStudentName = (g: IGrade) =>
    typeof g.studentId === "object" ? g.studentId.name : "Unknown";

  const openAddModal = () => {
    setEditing(null);
    setForm({ studentId: "", subject: "", score: "", term: "1st", remarks: "" });
    setModalOpen(true);
  };

  const openEditModal = (grade: IGrade) => {
    setEditing(grade);
    const sid = typeof grade.studentId === "object" ? grade.studentId._id : grade.studentId;
    setForm({
      studentId: sid,
      subject: grade.subject,
      score: String(grade.score),
      term: grade.term,
      remarks: grade.remarks || "",
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.studentId || !form.subject || !form.score) {
      showToast("Student, subject, and score are required", "error");
      return;
    }

    setSaving(true);
    try {
      const url = editing ? `/api/grades/${editing._id}` : "/api/grades";
      const method = editing ? "PUT" : "POST";

      const res = await apiFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, score: Number(form.score) }),
      });

      const data = await res.json();
      if (data.success) {
        showToast(editing ? "Grade updated!" : "Grade added!", "success");
        setModalOpen(false);
        fetchGrades();
      } else {
        showToast(data.error || "Failed to save", "error");
      }
    } catch {
      showToast("Failed to save grade", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      const res = await apiFetch(`/api/grades/${deleteTarget._id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        showToast("Grade deleted!", "success");
        setDeleteTarget(null);
        fetchGrades();
      } else {
        showToast(data.error || "Failed to delete", "error");
      }
    } catch {
      showToast("Failed to delete grade", "error");
    } finally {
      setSaving(false);
    }
  };

  const canEdit = role === "teacher" || role === "admin";
  const canApprove = role === "admin" || role === "principal";

  const handleApproval = async (gradeId: string, action: "approve" | "reject") => {
    try {
      const res = await apiFetch(`/api/grades/${gradeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(action === "approve" ? "Grade approved!" : "Grade rejected & reverted!", "success");
        fetchGrades();
      } else {
        showToast(data.error || "Failed", "error");
      }
    } catch {
      showToast("Failed to process", "error");
    }
  };

  // Apply filters to grades
  const filtered = useMemo(() => {
    let result = grades;
    if (filterTerm !== "all") result = result.filter((g) => g.term === filterTerm);
    if (filterLevel !== "all") {
      result = result.filter((g) => {
        const sid = getStudentId(g);
        return studentClassMap[sid]?.level === filterLevel;
      });
    }
    if (filterSection !== "all") {
      result = result.filter((g) => {
        const sid = getStudentId(g);
        return studentClassMap[sid]?.section === filterSection;
      });
    }
    return result;
  }, [grades, filterTerm, filterLevel, filterSection, studentClassMap]);

  // Group by level → section → student list (unique students with their averages)
  const groupedStudents = useMemo(() => {
    const map: Record<string, Record<string, Record<string, { name: string; grades: IGrade[] }>>> = {};
    for (const g of filtered) {
      const sid = getStudentId(g);
      const info = studentClassMap[sid];
      const level = info?.level || "Unassigned";
      const section = info?.section || "—";
      if (!map[level]) map[level] = {};
      if (!map[level][section]) map[level][section] = {};
      if (!map[level][section][sid]) {
        map[level][section][sid] = { name: getStudentName(g), grades: [] };
      }
      map[level][section][sid].grades.push(g);
    }
    return map;
  }, [filtered, studentClassMap]);

  const sortedLevels = useMemo(() => {
    const keys = Object.keys(groupedStudents);
    return keys.sort((a, b) => {
      if (a === "Unassigned") return 1;
      if (b === "Unassigned") return -1;
      return a.localeCompare(b);
    });
  }, [groupedStudents]);

  // === STUDENT DETAIL VIEW ===
  const selectedStudentGrades = useMemo(() => {
    if (!selectedStudentId) return [];
    return grades.filter((g) => getStudentId(g) === selectedStudentId);
  }, [grades, selectedStudentId]);

  const selectedStudentName = useMemo(() => {
    if (!selectedStudentId || selectedStudentGrades.length === 0) return "";
    return getStudentName(selectedStudentGrades[0]);
  }, [selectedStudentId, selectedStudentGrades]);

  // Group student grades by subject, then by term
  const studentSubjectData = useMemo(() => {
    const subjectMap: Record<string, Record<string, IGrade>> = {};
    for (const g of selectedStudentGrades) {
      if (!subjectMap[g.subject]) subjectMap[g.subject] = {};
      subjectMap[g.subject][g.term] = g;
    }
    return subjectMap;
  }, [selectedStudentGrades]);

  const terms = ["1st", "2nd", "3rd", "4th", "final"] as const;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ====== STUDENT DETAIL VIEW ======
  if (selectedStudentId) {
    const classInfo = studentClassMap[selectedStudentId];
    const genAvg = studentAverages[selectedStudentId] || 0;
    const genDesc = getPhGradeDescriptor(genAvg);

    // Per-subject averages
    const subjectAverages: { subject: string; avg: number }[] = [];
    for (const [subject, termGrades] of Object.entries(studentSubjectData)) {
      const approved = Object.values(termGrades).filter((g) => g.status === "approved");
      if (approved.length > 0) {
        const avg = Math.round(approved.reduce((s, g) => s + g.score, 0) / approved.length);
        subjectAverages.push({ subject, avg });
      }
    }
    const subjects = Object.keys(studentSubjectData).sort();

    return (
      <div>
        <button
          onClick={() => setSelectedStudentId(null)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium text-sm mb-4 transition-colors"
        >
          <FiArrowLeft size={16} />
          Back to Grade Levels
        </button>

        {/* Student Header */}
        <div className={`rounded-2xl p-5 mb-6 ${genAvg >= 90 ? "bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200" : "bg-white border border-gray-100 shadow-sm"}`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                {genAvg >= 90 && <FiAward size={20} className="text-amber-500" />}
                <h1 className="text-xl font-bold text-gray-900">{selectedStudentName}</h1>
              </div>
              {classInfo && (
                <p className="text-sm text-gray-500 mt-1">{classInfo.level} — Section {classInfo.section}</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 mb-1">General Average</p>
              <div className="flex items-center gap-2 justify-end">
                <span className="text-2xl font-bold text-gray-900">{genAvg || "—"}</span>
                {genAvg > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${genDesc.color}`}>
                    {genDesc.label}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Grades by Subject & Term */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-700">Subject Grades by Term</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Subject</th>
                  {terms.map((t) => (
                    <th key={t} className="text-center px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t}</th>
                  ))}
                  <th className="text-center px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-blue-50">Average</th>
                  <th className="text-center px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-blue-50">Descriptor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {subjects.map((subject) => {
                  const termGrades = studentSubjectData[subject];
                  const approved = Object.values(termGrades).filter((g) => g.status === "approved");
                  const subAvg = approved.length > 0 ? Math.round(approved.reduce((s, g) => s + g.score, 0) / approved.length) : 0;
                  const subDesc = getPhGradeDescriptor(subAvg);
                  const isSubOutstanding = subAvg >= 90;

                  return (
                    <tr key={subject} className={isSubOutstanding ? "bg-amber-50" : "hover:bg-gray-50"}>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{subject}</td>
                      {terms.map((t) => {
                        const g = termGrades[t];
                        if (!g) return <td key={t} className="px-3 py-3 text-center text-sm text-gray-300">—</td>;
                        return (
                          <td key={t} className="px-3 py-3 text-center">
                            <div className="flex flex-col items-center gap-0.5">
                              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${
                                g.score >= 90 ? "bg-amber-100 text-amber-700" :
                                g.score >= 75 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                              }`}>
                                {g.score}
                              </span>
                              {g.status === "pending" && (
                                <span className="text-[9px] text-yellow-600 font-medium">Pending</span>
                              )}
                            </div>
                          </td>
                        );
                      })}
                      <td className="px-3 py-3 text-center bg-blue-50/50">
                        <span className="text-sm font-bold text-gray-900">{subAvg || "—"}</span>
                      </td>
                      <td className="px-3 py-3 text-center bg-blue-50/50">
                        {subAvg > 0 && (
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${subDesc.color}`}>
                            {subDesc.label}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="border-t-2 border-gray-200 bg-gray-50">
                <tr>
                  <td className="px-4 py-3 text-sm font-bold text-gray-900">General Average</td>
                  {terms.map((t) => {
                    const termScores = subjects
                      .map((sub) => studentSubjectData[sub][t])
                      .filter((g) => g && g.status === "approved");
                    const termAvg = termScores.length > 0
                      ? Math.round(termScores.reduce((s, g) => s + g.score, 0) / termScores.length)
                      : 0;
                    return (
                      <td key={t} className="px-3 py-3 text-center text-sm font-bold text-gray-700">
                        {termAvg || "—"}
                      </td>
                    );
                  })}
                  <td className="px-3 py-3 text-center bg-blue-50">
                    <span className="text-base font-bold text-gray-900">{genAvg || "—"}</span>
                  </td>
                  <td className="px-3 py-3 text-center bg-blue-50">
                    {genAvg > 0 && (
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${genDesc.color}`}>
                        {genDesc.label}
                      </span>
                    )}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* All individual grade records with actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700">All Grade Records</h2>
            {canEdit && (
              <button
                onClick={() => {
                  setEditing(null);
                  setForm({ studentId: selectedStudentId, subject: "", score: "", term: "1st", remarks: "" });
                  setModalOpen(true);
                }}
                className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 text-xs font-medium transition-colors"
              >
                <FiPlus size={14} />
                Add Grade
              </button>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Subject</th>
                  <th className="text-center px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Score</th>
                  <th className="text-center px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Term</th>
                  <th className="text-center px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Remarks</th>
                  {(canEdit || canApprove) && (
                    <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {selectedStudentGrades.map((g) => (
                  <tr key={g._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-2.5 text-sm font-medium text-gray-900">{g.subject}</td>
                    <td className="px-3 py-2.5 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${
                        g.score >= 90 ? "bg-amber-100 text-amber-700" :
                        g.score >= 75 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}>
                        {g.score}
                      </span>
                      {g.status === "pending" && g.previousScore !== null && (
                        <span className="ml-1 text-[10px] text-gray-400">was {g.previousScore}</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-center text-sm text-gray-500">{g.term}</td>
                    <td className="px-3 py-2.5 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        g.status === "approved" ? "bg-green-100 text-green-700" :
                        g.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                        "bg-red-100 text-red-700"
                      }`}>
                        {g.status === "approved" ? "Approved" : g.status === "pending" ? "Pending" : "Rejected"}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-sm text-gray-500 hidden md:table-cell">{g.remarks || "—"}</td>
                    {(canEdit || canApprove) && (
                      <td className="px-4 py-2.5">
                        <div className="flex justify-end gap-1">
                          {canApprove && g.status === "pending" && (
                            <>
                              <button onClick={() => handleApproval(g._id, "approve")} className="p-1.5 text-green-500 hover:text-green-700 transition-colors" title="Approve">
                                <FiCheck size={14} />
                              </button>
                              <button onClick={() => handleApproval(g._id, "reject")} className="p-1.5 text-red-400 hover:text-red-600 transition-colors" title="Reject">
                                <FiX size={14} />
                              </button>
                            </>
                          )}
                          {canEdit && (
                            <>
                              <button onClick={() => openEditModal(g)} className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors" title="Edit">
                                <FiEdit2 size={14} />
                              </button>
                              <button onClick={() => setDeleteTarget(g)} className="p-1.5 text-gray-400 hover:text-red-600 transition-colors" title="Delete">
                                <FiTrash2 size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modals */}
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Grade" : "Add Grade"}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Student *</label>
              <select
                value={form.studentId}
                onChange={(e) => setForm({ ...form, studentId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                disabled={!!editing || !!selectedStudentId}
              >
                <option value="">Select student</option>
                {students.map((s) => (
                  <option key={s._id} value={s._id}>{s.name} ({s.email})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
              <input
                type="text"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                placeholder="e.g. Mathematics"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Score (0-100) *</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={form.score}
                  onChange={(e) => setForm({ ...form, score: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Term *</label>
                <select
                  value={form.term}
                  onChange={(e) => setForm({ ...form, term: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                >
                  <option value="1st">1st Term</option>
                  <option value="2nd">2nd Term</option>
                  <option value="3rd">3rd Term</option>
                  <option value="4th">4th Term</option>
                  <option value="final">Final</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
              <input
                type="text"
                value={form.remarks}
                onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                placeholder="Optional remarks"
              />
            </div>
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium text-sm">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 text-sm">
                {saving ? "Saving..." : editing ? "Update" : "Add Grade"}
              </button>
            </div>
          </div>
        </Modal>

        <ConfirmDialog
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          title="Delete Grade"
          message="Are you sure you want to delete this grade record?"
          loading={saving}
        />
      </div>
    );
  }

  // ====== MAIN LIST VIEW (Grade Level → Section → Students) ======
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Grades Manager</h1>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={filterLevel}
            onChange={(e) => { setFilterLevel(e.target.value); setFilterSection("all"); }}
            className="px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="all">All Grade Levels</option>
            {gradeLevels.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
          <select
            value={filterSection}
            onChange={(e) => setFilterSection(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="all">All Sections</option>
            {sections.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select
            value={filterTerm}
            onChange={(e) => setFilterTerm(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="all">All Terms</option>
            <option value="1st">1st Term</option>
            <option value="2nd">2nd Term</option>
            <option value="3rd">3rd Term</option>
            <option value="4th">4th Term</option>
            <option value="final">Final</option>
          </select>
          {canEdit && (
            <button
              onClick={openAddModal}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <FiPlus size={16} />
              <span>Add Grade</span>
            </button>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 mb-4 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <FiAward size={13} className="text-amber-500" />
          <span>Outstanding (avg ≥ 90)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          <span>Very Satisfactory (85-89)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          <span>Satisfactory (80-84)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-yellow-500" />
          <span>Fairly Satisfactory (75-79)</span>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <p className="text-gray-500">No grades recorded yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedLevels.map((level) => {
            const sectionMap = groupedStudents[level];
            const sortedSections = Object.keys(sectionMap).sort();
            return (
              <div key={level}>
                <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="inline-block w-1.5 h-5 bg-blue-600 rounded-full" />
                  {level}
                </h2>
                <div className="space-y-4">
                  {sortedSections.map((section) => {
                    const studentMap = sectionMap[section];
                    const studentEntries = Object.entries(studentMap).sort((a, b) => a[1].name.localeCompare(b[1].name));
                    return (
                      <div key={section} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200">
                          <h3 className="text-sm font-semibold text-gray-600">Section {section}</h3>
                        </div>
                        <div className="divide-y divide-gray-100">
                          {studentEntries.map(([sid, data]) => {
                            const avg = studentAverages[sid] || 0;
                            const desc = getPhGradeDescriptor(avg);
                            const isOuts = avg >= 90;
                            const gradeCount = data.grades.length;

                            return (
                              <button
                                key={sid}
                                onClick={() => setSelectedStudentId(sid)}
                                className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${
                                  isOuts ? "bg-amber-50 hover:bg-amber-100" : "hover:bg-gray-50"
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  {isOuts && <FiAward size={16} className="text-amber-500 shrink-0" />}
                                  <div className="min-w-0">
                                    <p className={`text-sm font-medium truncate ${isOuts ? "text-amber-800" : "text-gray-900"}`}>
                                      {data.name}
                                    </p>
                                    <p className="text-xs text-gray-400">{gradeCount} grade{gradeCount !== 1 ? "s" : ""}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                  {avg > 0 && (
                                    <div className="text-right">
                                      <p className="text-sm font-bold text-gray-900">{avg}</p>
                                      <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-semibold ${desc.color}`}>
                                        {desc.label}
                                      </span>
                                    </div>
                                  )}
                                  <FiChevronRight size={16} className="text-gray-300" />
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Grade" : "Add Grade"}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Student *</label>
            <select
              value={form.studentId}
              onChange={(e) => setForm({ ...form, studentId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
              disabled={!!editing}
            >
              <option value="">Select student</option>
              {students.map((s) => (
                <option key={s._id} value={s._id}>{s.name} ({s.email})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
            <input
              type="text"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
              placeholder="e.g. Mathematics"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Score (0-100) *</label>
              <input
                type="number"
                min={0}
                max={100}
                value={form.score}
                onChange={(e) => setForm({ ...form, score: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Term *</label>
              <select
                value={form.term}
                onChange={(e) => setForm({ ...form, term: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
              >
                <option value="1st">1st Term</option>
                <option value="2nd">2nd Term</option>
                <option value="3rd">3rd Term</option>
                <option value="4th">4th Term</option>
                <option value="final">Final</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
            <input
              type="text"
              value={form.remarks}
              onChange={(e) => setForm({ ...form, remarks: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
              placeholder="Optional remarks"
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium text-sm">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 text-sm">
              {saving ? "Saving..." : editing ? "Update" : "Add Grade"}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Grade"
        message="Are you sure you want to delete this grade record?"
        loading={saving}
      />
    </div>
  );
}
