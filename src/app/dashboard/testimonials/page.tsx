"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Modal from "@/components/dashboard/Modal";
import ConfirmDialog from "@/components/dashboard/ConfirmDialog";
import { useToast } from "@/components/dashboard/ToastProvider";
import { ITestimonial } from "@/types";
import { FiPlus, FiEdit2, FiTrash2, FiUpload, FiX, FiStar, FiEye, FiEyeOff } from "react-icons/fi";

export default function TestimonialsManagerPage() {
  const [testimonials, setTestimonials] = useState<ITestimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ITestimonial | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ITestimonial | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const { showToast } = useToast();

  const [form, setForm] = useState({
    name: "",
    role: "",
    content: "",
    imageUrl: "",
    rating: 5,
    isPublished: true,
  });

  const fetchTestimonials = async () => {
    try {
      const res = await fetch("/api/testimonials");
      const data = await res.json();
      if (data.success) setTestimonials(data.data);
    } catch {
      showToast("Failed to fetch testimonials", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openAddModal = () => {
    setEditing(null);
    setForm({ name: "", role: "", content: "", imageUrl: "", rating: 5, isPublished: true });
    setModalOpen(true);
  };

  const openEditModal = (t: ITestimonial) => {
    setEditing(t);
    setForm({
      name: t.name,
      role: t.role,
      content: t.content,
      imageUrl: t.imageUrl || "",
      rating: t.rating,
      isPublished: t.isPublished,
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
    if (!form.name || !form.role || !form.content) {
      showToast("Name, role, and content are required", "error");
      return;
    }

    setSaving(true);
    try {
      const url = editing ? `/api/testimonials/${editing._id}` : "/api/testimonials";
      const method = editing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (data.success) {
        showToast(editing ? "Testimonial updated!" : "Testimonial created!", "success");
        setModalOpen(false);
        fetchTestimonials();
      } else {
        showToast(data.error || "Failed to save", "error");
      }
    } catch {
      showToast("Failed to save testimonial", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/testimonials/${deleteTarget._id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        showToast("Testimonial deleted!", "success");
        setDeleteTarget(null);
        fetchTestimonials();
      } else {
        showToast(data.error || "Failed to delete", "error");
      }
    } catch {
      showToast("Failed to delete testimonial", "error");
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async (t: ITestimonial) => {
    try {
      const res = await fetch(`/api/testimonials/${t._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !t.isPublished }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(t.isPublished ? "Hidden!" : "Published!", "success");
        fetchTestimonials();
      }
    } catch {
      showToast("Failed to update", "error");
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
          <h1 className="text-2xl font-bold text-gray-900">Testimonials</h1>
          <p className="text-sm text-gray-500 mt-1">Manage parent and student testimonials</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FiPlus size={18} />
          <span>Add Testimonial</span>
        </button>
      </div>

      {testimonials.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <FiStar size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-400">No testimonials yet.</p>
          <button onClick={openAddModal} className="mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium">
            Add your first testimonial
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {testimonials.map((t) => (
            <div
              key={t._id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col sm:flex-row sm:items-center gap-4"
            >
              <div className="flex items-center gap-3 flex-shrink-0">
                {t.imageUrl ? (
                  <div className="relative w-10 h-10 rounded-full overflow-hidden">
                    <Image src={t.imageUrl} alt={t.name} fill className="object-cover" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-sm">{t.name.charAt(0)}</span>
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">{t.name}</p>
                  <p className="text-xs text-gray-400 truncate">{t.role}</p>
                </div>
              </div>

              <p className="text-sm text-gray-600 flex-1 line-clamp-2 italic min-w-0">
                &ldquo;{t.content}&rdquo;
              </p>

              <div className="flex items-center gap-1 flex-shrink-0">
                {Array.from({ length: 5 }).map((_, i) => (
                  <FiStar
                    key={i}
                    size={12}
                    className={i < t.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}
                  />
                ))}
              </div>

              <div className="flex items-center gap-1 flex-shrink-0 border-t sm:border-t-0 sm:border-l border-gray-100 pt-3 sm:pt-0 sm:pl-3">
                <button
                  onClick={() => togglePublish(t)}
                  className={`p-2 rounded-lg transition-colors ${
                    t.isPublished
                      ? "text-green-600 hover:bg-green-50"
                      : "text-gray-400 hover:bg-gray-50"
                  }`}
                  title={t.isPublished ? "Published" : "Hidden"}
                >
                  {t.isPublished ? <FiEye size={15} /> : <FiEyeOff size={15} />}
                </button>
                <button
                  onClick={() => openEditModal(t)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Edit"
                >
                  <FiEdit2 size={15} />
                </button>
                <button
                  onClick={() => setDeleteTarget(t)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete"
                >
                  <FiTrash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Testimonial" : "Add Testimonial"}
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
                placeholder="e.g. Maria Santos"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
              <input
                type="text"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="e.g. Parent, Grade 2 Student"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Testimonial *</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
              rows={4}
              placeholder="What they said about Edulinks..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setForm({ ...form, rating: n })}
                    className="p-1"
                  >
                    <FiStar
                      size={20}
                      className={
                        n <= form.rating
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300"
                      }
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Photo (optional)</label>
              {form.imageUrl ? (
                <div className="relative inline-block">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden border border-gray-200">
                    <Image src={form.imageUrl} alt="Preview" fill className="object-cover" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, imageUrl: "" })}
                    className="absolute -top-1 -right-1 bg-red-500 text-white p-0.5 rounded-full hover:bg-red-600"
                  >
                    <FiX size={10} />
                  </button>
                </div>
              ) : (
                <label className="w-16 h-16 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-full cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                  {uploadingImage ? (
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <FiUpload className="text-gray-400" size={16} />
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
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isPublished"
              checked={form.isPublished}
              onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
              className="rounded border-gray-300"
            />
            <label htmlFor="isPublished" className="text-sm text-gray-700">
              Publish immediately
            </label>
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
        title="Delete Testimonial"
        message={`Are you sure you want to delete the testimonial from "${deleteTarget?.name}"?`}
        loading={saving}
      />
    </div>
  );
}
