"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import Modal from "@/components/dashboard/Modal";
import ConfirmDialog from "@/components/dashboard/ConfirmDialog";
import { useToast } from "@/components/dashboard/ToastProvider";
import { IAboutMember } from "@/types";
import { FiPlus, FiEdit2, FiTrash2, FiUpload, FiX, FiSave, FiTarget, FiEye, FiHeart } from "react-icons/fi";
import { apiFetch, useRefreshData } from "@/lib/hooks";

export default function AboutManagerPage() {
  const [allMembers, setAllMembers] = useState<IAboutMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"founder" | "teacher">("teacher");
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

  // Mission / Vision / Core Values state
  const [mvcForm, setMvcForm] = useState({ mission: "", vision: "", coreValues: "" });
  const [mvcSaving, setMvcSaving] = useState(false);

  const fetchMembers = async () => {
    try {
      const res = await apiFetch("/api/about");
      const data = await res.json();
      if (data.success) setAllMembers(data.data);
    } catch {
      showToast("Failed to fetch members", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchMvc = async () => {
    try {
      const res = await apiFetch("/api/site-settings");
      const data = await res.json();
      if (data.success) {
        setMvcForm({
          mission: data.data.mission || "",
          vision: data.data.vision || "",
          coreValues: data.data.coreValues || "",
        });
      }
    } catch {
      // silent
    }
  };

  useRefreshData(useCallback(() => {
    fetchMembers();
    fetchMvc();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []));

  const handleMvcSave = async () => {
    setMvcSaving(true);
    try {
      const res = await apiFetch("/api/site-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mvcForm),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Mission, Vision & Core Values updated!", "success");
      } else {
        showToast(data.error || "Failed to save", "error");
      }
    } catch {
      showToast("Failed to save", "error");
    } finally {
      setMvcSaving(false);
    }
  };

  const openAddModal = (type: "founder" | "teacher") => {
    setEditing(null);
    setModalType(type);
    setForm({ name: "", role: "", bio: "", imageUrl: "" });
    setModalOpen(true);
  };

  const openEditModal = (member: IAboutMember) => {
    setEditing(member);
    setModalType(member.type as "founder" | "teacher");
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
      const res = await apiFetch("/api/upload", { method: "POST", body: formData });
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

      const res = await apiFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, type: modalType, order: 0 }),
      });

      const data = await res.json();
      if (data.success) {
        const label = modalType === "founder" ? "Founder" : "Teacher";
        showToast(editing ? `${label} updated!` : `${label} added!`, "success");
        setModalOpen(false);
        fetchMembers();
      } else {
        showToast(data.error || "Failed to save", "error");
      }
    } catch {
      showToast("Failed to save", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      const res = await apiFetch(`/api/about/${deleteTarget._id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        showToast("Removed!", "success");
        setDeleteTarget(null);
        fetchMembers();
      } else {
        showToast(data.error || "Failed to delete", "error");
      }
    } catch {
      showToast("Failed to delete", "error");
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
      {/* Mission, Vision & Core Values */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Mission, Vision & Core Values</h2>
            <p className="text-sm text-gray-500 mt-0.5">Displayed on the public About page</p>
          </div>
          <button
            onClick={handleMvcSave}
            disabled={mvcSaving}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm font-medium"
          >
            <FiSave size={16} />
            <span>{mvcSaving ? "Saving..." : "Save Changes"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <FiTarget size={15} className="text-blue-600" />
              Mission
            </label>
            <textarea
              value={mvcForm.mission}
              onChange={(e) => setMvcForm({ ...mvcForm, mission: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none text-sm"
              rows={5}
              placeholder="Enter the school's mission statement..."
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <FiEye size={15} className="text-emerald-600" />
              Vision
            </label>
            <textarea
              value={mvcForm.vision}
              onChange={(e) => setMvcForm({ ...mvcForm, vision: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none resize-none text-sm"
              rows={5}
              placeholder="Enter the school's vision statement..."
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <FiHeart size={15} className="text-rose-600" />
              Core Values
            </label>
            <textarea
              value={mvcForm.coreValues}
              onChange={(e) => setMvcForm({ ...mvcForm, coreValues: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none resize-none text-sm"
              rows={5}
              placeholder="Enter core values (one per line)..."
            />
          </div>
        </div>
      </div>

      {/* Founders Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Founders</h2>
          <p className="text-sm text-gray-500 mt-1">Manage founders displayed on the About page</p>
        </div>
        <button
          onClick={() => openAddModal("founder")}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FiPlus size={18} />
          <span>Add Founder</span>
        </button>
      </div>

      {allMembers.filter((m) => m.type === "founder").length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center mb-8">
          <p className="text-gray-400">No founders added yet.</p>
          <button onClick={() => openAddModal("founder")} className="mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium">
            Add your first founder
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
          {allMembers.filter((m) => m.type === "founder").map((member) => (
            <div key={member._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {member.imageUrl ? (
                <div className="relative w-full h-40">
                  <Image src={member.imageUrl} alt={member.name} fill className="object-cover" />
                </div>
              ) : (
                <div className="w-full h-40 bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center">
                  <span className="text-4xl font-bold text-amber-300">{member.name.charAt(0)}</span>
                </div>
              )}
              <div className="p-3">
                <p className="font-semibold text-gray-900 text-sm truncate">{member.name}</p>
                <p className="text-xs text-amber-600 truncate">{member.role}</p>
                {member.bio && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{member.bio}</p>}
                <div className="flex gap-2 mt-2 pt-2 border-t border-gray-100">
                  <button onClick={() => openEditModal(member)} className="flex-1 flex items-center justify-center gap-1 text-xs text-gray-500 hover:text-blue-600 py-1 rounded hover:bg-blue-50 transition-colors">
                    <FiEdit2 size={12} /> Edit
                  </button>
                  <button onClick={() => setDeleteTarget(member)} className="flex-1 flex items-center justify-center gap-1 text-xs text-gray-500 hover:text-red-600 py-1 rounded hover:bg-red-50 transition-colors">
                    <FiTrash2 size={12} /> Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Teachers Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Teachers</h2>
          <p className="text-sm text-gray-500 mt-1">Manage teachers displayed on the About page</p>
        </div>
        <button
          onClick={() => openAddModal("teacher")}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FiPlus size={18} />
          <span>Add Teacher</span>
        </button>
      </div>

      {allMembers.filter((m) => m.type === "teacher").length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <p className="text-gray-400">No teachers added yet.</p>
          <button onClick={() => openAddModal("teacher")} className="mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium">
            Add your first teacher
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {allMembers.filter((m) => m.type === "teacher").map((member) => (
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
        title={editing ? `Edit ${modalType === "founder" ? "Founder" : "Teacher"}` : `Add ${modalType === "founder" ? "Founder" : "Teacher"}`}
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
        title={`Remove ${deleteTarget?.type === "founder" ? "Founder" : "Teacher"}`}
        message={`Are you sure you want to remove "${deleteTarget?.name}"?`}
        loading={saving}
      />
    </div>
  );
}

