"use client";

import { useState, useEffect } from "react";
import Modal from "@/components/dashboard/Modal";
import ConfirmDialog from "@/components/dashboard/ConfirmDialog";
import { useToast } from "@/components/dashboard/ToastProvider";
import { IClass } from "@/types";
import { FiPlus, FiEdit2, FiTrash2, FiUsers } from "react-icons/fi";

interface UserOption {
  _id: string;
  name: string;
  email: string;
}

export default function ClassesManagerPage() {
  const [classes, setClasses] = useState<IClass[]>([]);
  const [teachers, setTeachers] = useState<UserOption[]>([]);
  const [students, setStudents] = useState<UserOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<IClass | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<IClass | null>(null);
  const [saving, setSaving] = useState(false);
  const [role, setRole] = useState("");
  const { showToast } = useToast();

  const [form, setForm] = useState({
    name: "",
    section: "",
    teacherId: "",
    subject: "",
    students: [] as string[],
    schedule: "",
  });

  const fetchClasses = async () => {
    try {
      const res = await fetch("/api/classes");
      const data = await res.json();
      if (data.success) setClasses(data.data);
    } catch {
      showToast("Failed to fetch classes", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setRole(d.data.role);
      });
    fetch("/api/students")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setStudents(d.data);
      });
    fetch("/api/users")
      .then((r) => r.json())
      .then((d) => {
        if (d.success)
          setTeachers(d.data.filter((u: UserOption & { role: string }) => u.role === "teacher"));
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canCreate = role === "admin" || role === "principal";

  const openAddModal = () => {
    setEditing(null);
    setForm({ name: "", section: "", teacherId: "", subject: "", students: [], schedule: "" });
    setModalOpen(true);
  };

  const openEditModal = (cls: IClass) => {
    setEditing(cls);
    const tid = typeof cls.teacherId === "object" ? cls.teacherId._id : cls.teacherId;
    const sids = cls.students.map((s) => (typeof s === "object" ? s._id : s));
    setForm({
      name: cls.name,
      section: cls.section,
      teacherId: tid,
      subject: cls.subject,
      students: sids,
      schedule: cls.schedule,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.teacherId || !form.subject) {
      showToast("Name, teacher, and subject are required", "error");
      return;
    }
    setSaving(true);
    try {
      const url = editing ? `/api/classes/${editing._id}` : "/api/classes";
      const method = editing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        showToast(editing ? "Class updated!" : "Class created!", "success");
        setModalOpen(false);
        fetchClasses();
      } else {
        showToast(data.error || "Failed to save", "error");
      }
    } catch {
      showToast("Failed to save class", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/classes/${deleteTarget._id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        showToast("Class deleted!", "success");
        setDeleteTarget(null);
        fetchClasses();
      }
    } catch {
      showToast("Failed to delete class", "error");
    } finally {
      setSaving(false);
    }
  };

  const toggleStudent = (id: string) => {
    setForm((prev) => ({
      ...prev,
      students: prev.students.includes(id)
        ? prev.students.filter((s) => s !== id)
        : [...prev.students, id],
    }));
  };

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
        <h1 className="text-2xl font-bold text-gray-900">Classes</h1>
        {canCreate && (
          <button onClick={openAddModal} className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium">
            <FiPlus size={16} />
            <span>New Class</span>
          </button>
        )}
      </div>

      {classes.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <p className="text-gray-500">No classes found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map((cls) => {
            const teacherName = typeof cls.teacherId === "object" ? cls.teacherId.name : "N/A";
            const studentCount = cls.students.length;
            return (
              <div key={cls._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{cls.name}</h3>
                    {cls.section && <p className="text-xs text-gray-400">Section {cls.section}</p>}
                  </div>
                  {canCreate && (
                    <div className="flex gap-1">
                      <button onClick={() => openEditModal(cls)} className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors" title="Edit">
                        <FiEdit2 size={14} />
                      </button>
                      <button onClick={() => setDeleteTarget(cls)} className="p-1.5 text-gray-400 hover:text-red-600 transition-colors" title="Delete">
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-600"><span className="text-gray-400">Subject:</span> {cls.subject}</p>
                  <p className="text-gray-600"><span className="text-gray-400">Teacher:</span> {teacherName}</p>
                  {cls.schedule && <p className="text-gray-600"><span className="text-gray-400">Schedule:</span> {cls.schedule}</p>}
                  <div className="flex items-center gap-1.5 text-gray-500 pt-1">
                    <FiUsers size={14} />
                    <span className="text-xs">{studentCount} student{studentCount !== 1 ? "s" : ""}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Class" : "New Class"} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Class Name *</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm" placeholder="e.g. Grade 10 - A" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
              <input type="text" value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm" placeholder="e.g. A" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
              <input type="text" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm" placeholder="e.g. Mathematics" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teacher *</label>
              <select value={form.teacherId} onChange={(e) => setForm({ ...form, teacherId: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm">
                <option value="">Select teacher</option>
                {teachers.map((t) => (
                  <option key={t._id} value={t._id}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Schedule</label>
            <input type="text" value={form.schedule} onChange={(e) => setForm({ ...form, schedule: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm" placeholder="e.g. MWF 8:00-9:00 AM" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Students ({form.students.length} selected)</label>
            <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-xl p-2 space-y-1">
              {students.length === 0 ? (
                <p className="text-xs text-gray-400 p-2">No students available. Create student accounts first.</p>
              ) : (
                students.map((s) => (
                  <label key={s._id} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-50 cursor-pointer text-sm">
                    <input type="checkbox" checked={form.students.includes(s._id)} onChange={() => toggleStudent(s._id)} className="rounded border-gray-300" />
                    <span className="text-gray-700">{s.name}</span>
                    <span className="text-xs text-gray-400">{s.email}</span>
                  </label>
                ))
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium text-sm">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 text-sm">
              {saving ? "Saving..." : editing ? "Update" : "Create Class"}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete Class" message={`Delete "${deleteTarget?.name}"?`} loading={saving} />
    </div>
  );
}
