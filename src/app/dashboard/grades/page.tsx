"use client";

import { useState, useEffect } from "react";
import Modal from "@/components/dashboard/Modal";
import ConfirmDialog from "@/components/dashboard/ConfirmDialog";
import { useToast } from "@/components/dashboard/ToastProvider";
import { IGrade } from "@/types";
import { FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";

interface StudentOption {
  _id: string;
  name: string;
  email: string;
}

export default function GradesManagerPage() {
  const [grades, setGrades] = useState<IGrade[]>([]);
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<IGrade | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<IGrade | null>(null);
  const [saving, setSaving] = useState(false);
  const [filterTerm, setFilterTerm] = useState("all");
  const [role, setRole] = useState("");
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
      const res = await fetch("/api/grades");
      const data = await res.json();
      if (data.success) setGrades(data.data);
    } catch {
      showToast("Failed to fetch grades", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrades();
    fetch("/api/students")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setStudents(d.data);
      });
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setRole(d.data.role);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

      const res = await fetch(url, {
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
      const res = await fetch(`/api/grades/${deleteTarget._id}`, { method: "DELETE" });
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

  const getStudentName = (g: IGrade) =>
    typeof g.studentId === "object" ? g.studentId.name : "Unknown";

  const filtered =
    filterTerm === "all" ? grades : grades.filter((g) => g.term === filterTerm);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const canEdit = role === "teacher" || role === "admin";

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Grades Manager</h1>
        <div className="flex items-center gap-3">
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

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <p className="text-gray-500">No grades recorded yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Subject</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Score</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Term</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Remarks</th>
                  {canEdit && (
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((g) => (
                  <tr key={g._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900 text-sm">{getStudentName(g)}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{g.subject}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                        g.score >= 75 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}>
                        {g.score}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-gray-500">{g.term}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 hidden md:table-cell">{g.remarks || "—"}</td>
                    {canEdit && (
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => openEditModal(g)} className="p-2 text-gray-400 hover:text-blue-600 transition-colors" title="Edit">
                            <FiEdit2 size={15} />
                          </button>
                          <button onClick={() => setDeleteTarget(g)} className="p-2 text-gray-400 hover:text-red-600 transition-colors" title="Delete">
                            <FiTrash2 size={15} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
        message={`Are you sure you want to delete this grade record?`}
        loading={saving}
      />
    </div>
  );
}
