"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Modal from "@/components/dashboard/Modal";
import ConfirmDialog from "@/components/dashboard/ConfirmDialog";
import { useToast } from "@/components/dashboard/ToastProvider";
import { IAboutMember } from "@/types";
import { FiPlus, FiEdit2, FiTrash2, FiUpload, FiX } from "react-icons/fi";

export default function AboutManagerPage() {
  const [members, setMembers] = useState<IAboutMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<IAboutMember | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<IAboutMember | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const { showToast } = useToast();

  const [form, setForm] = useState({
    name: "",
    role: "",
    bio: "",
    imageUrl: "",
  });

  const fetchMembers = async () => {
    try {
      const res = await fetch("/api/about");
      const data = await res.json();
      if (data.success) setMembers(data.data.filter((m: IAboutMember) => m.type === "teacher"));
    } catch {
      showToast("Failed to fetch teachers", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openAddModal = () => {
    setEditing(null);
    setForm({ name: "", role: "", bio: "", imageUrl: "" });
    setModalOpen(true);
  };

  const openEditModal = (member: IAboutMember) => {
    setEditing(member);
    setForm({
      name: member.name,
      role: member.role,
      bio: member.bio || "",
      imageUrl: member.imageUrl || "",
    });
    setModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast("Please select an image file", "error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast("File too large. Maximum size is 5MB.", "error");
      return;
    }

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) {
        setForm((prev) => ({ ...prev, imageUrl: data.data.url }));
      } else {
        showToast(data.error || "Upload failed", "error");
      }
    } catch {
      showToast("Upload failed", "error");
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  const handleSave = async () => {
    if (!form.name || !form.role) {
      showToast("Name and position are required", "error");
      return;
    }

    setSaving(true);
    try {
      const url = editing ? `/api/about/${editing._id}` : "/api/about";
      const method = editing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, type: "teacher", order: 0 }),
      });

      const data = await res.json();
      if (data.success) {
        showToast(editing ? "Teacher updated!" : "Teacher added!", "success");
        setModalOpen(false);
        fetchMembers();
      } else {
        showToast(data.error || "Failed to save", "error");
      }
    } catch {
      showToast("Failed to save teacher", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/about/${deleteTarget._id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        showToast("Teacher removed!", "success");
        setDeleteTarget(null);
        fetchMembers();
      } else {
        showToast(data.error || "Failed to delete", "error");
      }
    } catch {
      showToast("Failed to delete teacher", "error");
    } finally {
      setSaving(false);
    }
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Teachers</h1>
          <p className="text-sm text-gray-500 mt-1">Manage teachers displayed on the About page</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FiPlus size={18} />
          <span>Add Teacher</span>
        </button>
      </div>

      {members.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <p className="text-gray-400">No teachers added yet.</p>
          <button onClick={openAddModal} className="mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium">
            Add your first teacher
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {members.map((member) => (
            <div
              key={member._id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
            >
              {member.imageUrl ? (
                <div className="relative w-full h-40">
                  <Image src={member.imageUrl} alt={member.name} fill className="object-cover" />
                </div>
              ) : (
                <div className="w-full h-40 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                  <span className="text-4xl font-bold text-blue-300">{member.name.charAt(0)}</span>
                </div>
              )}
              <div className="p-3">
                <p className="font-semibold text-gray-900 text-sm truncate">{member.name}</p>
                <p className="text-xs text-blue-600 truncate">{member.role}</p>
                <div className="flex gap-2 mt-2 pt-2 border-t border-gray-100">
                  <button
                    onClick={() => openEditModal(member)}
                    className="flex-1 flex items-center justify-center gap-1 text-xs text-gray-500 hover:text-blue-600 py-1 rounded hover:bg-blue-50 transition-colors"
                  >
                    <FiEdit2 size={12} /> Edit
                  </button>
                  <button
                    onClick={() => setDeleteTarget(member)}
                    className="flex-1 flex items-center justify-center gap-1 text-xs text-gray-500 hover:text-red-600 py-1 rounded hover:bg-red-50 transition-colors"
                  >
                    <FiTrash2 size={12} /> Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Teacher" : "Add Teacher"}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Position *</label>
              <input
                type="text"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="e.g. Head Teacher, Kinder Teacher"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio (optional)</label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
              rows={3}
              placeholder="Short bio..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Photo</label>
            {form.imageUrl ? (
              <div className="relative inline-block">
                <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200">
                  <Image src={form.imageUrl} alt="Preview" fill className="object-cover" />
                </div>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, imageUrl: "" })}
                  className="absolute -top-2 -right-2 bg-red-500 text-white p-0.5 rounded-full hover:bg-red-600"
                >
                  <FiX size={12} />
                </button>
              </div>
            ) : (
              <label className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                {uploadingImage ? (
                  <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <FiUpload className="text-gray-400 mb-1" size={18} />
                    <span className="text-xs text-gray-400">Upload</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploadingImage}
                />
              </label>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
            >
              {saving ? "Saving..." : editing ? "Update" : "Add"}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Remove Teacher"
        message={`Are you sure you want to remove "${deleteTarget?.name}"?`}
        loading={saving}
      />
    </div>
  );
}

