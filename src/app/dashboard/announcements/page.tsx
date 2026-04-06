"use client";

import { useState, useCallback } from "react";
import Modal from "@/components/dashboard/Modal";
import ConfirmDialog from "@/components/dashboard/ConfirmDialog";
import RichTextEditor from "@/components/dashboard/RichTextEditor";
import { useToast } from "@/components/dashboard/ToastProvider";
import { IAnnouncement } from "@/types";
import Image from "next/image";
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiEyeOff, FiUpload, FiX, FiImage, FiClock } from "react-icons/fi";
import { apiFetch, useRefreshData } from "@/lib/hooks";

const ANNOUNCEMENT_CATEGORIES = ["All", "Nursery", "Kinder", "Preschool"] as const;

export default function AnnouncementsManagerPage() {
  const [announcements, setAnnouncements] = useState<IAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<IAnnouncement | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<IAnnouncement | null>(null);
  const [saving, setSaving] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewContent, setPreviewContent] = useState<IAnnouncement | null>(
    null
  );
  const { showToast } = useToast();

  const [form, setForm] = useState({
    title: "",
    content: "",
    isPublished: false,
    images: [] as string[],
    category: "All" as string,
    scheduledAt: "" as string,
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fetchAnnouncements = async () => {
    try {
      const res = await apiFetch("/api/announcements/all");
      const data = await res.json();
      if (data.success) setAnnouncements(data.data);
    } catch {
      showToast("Failed to fetch announcements", "error");
    } finally {
      setLoading(false);
    }
  };

  useRefreshData(useCallback(() => {
    fetchAnnouncements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []));

  const openAddModal = () => {
    setEditing(null);
    setForm({ title: "", content: "", isPublished: false, images: [], category: "All", scheduledAt: "" });
    setModalOpen(true);
  };

  const openEditModal = (announcement: IAnnouncement) => {
    setEditing(announcement);
    setForm({
      title: announcement.title,
      content: announcement.content,
      isPublished: announcement.isPublished,
      images: announcement.images || [],
      category: announcement.category || "All",
      scheduledAt: announcement.scheduledAt
        ? new Date(announcement.scheduledAt).toISOString().slice(0, 16)
        : "",
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
    if (form.images.length >= 3) {
      showToast("Maximum 3 images allowed", "error");
      return;
    }

    setUploadingImage(true);
    setUploadProgress(0);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const url = await new Promise<string>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/api/upload");
        xhr.upload.onprogress = (ev) => {
          if (ev.lengthComputable) setUploadProgress(Math.round((ev.loaded / ev.total) * 100));
        };
        xhr.onload = () => {
          try {
            const data = JSON.parse(xhr.responseText);
            if (data.success) resolve(data.data.url);
            else reject(new Error(data.error || "Upload failed"));
          } catch { reject(new Error("Upload failed")); }
        };
        xhr.onerror = () => reject(new Error("Upload failed"));
        xhr.send(formData);
      });
      setForm((prev) => ({ ...prev, images: [...prev.images, url] }));
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Upload failed", "error");
    } finally {
      setUploadingImage(false);
      setUploadProgress(0);
      e.target.value = "";
    }
  };

  const removeImage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    if (!form.title || !form.content) {
      showToast("Title and content are required", "error");
      return;
    }

    setSaving(true);
    try {
      const url = editing
        ? `/api/announcements/${editing._id}`
        : "/api/announcements";
      const method = editing ? "PUT" : "POST";

      const res = await apiFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          scheduledAt: form.scheduledAt || null,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast(
          editing ? "Announcement updated!" : "Announcement created!",
          "success"
        );
        setModalOpen(false);
        fetchAnnouncements();
      } else {
        showToast(data.error || "Failed to save", "error");
      }
    } catch {
      showToast("Failed to save announcement", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      const res = await apiFetch(`/api/announcements/${deleteTarget._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        showToast("Announcement deleted!", "success");
        setDeleteTarget(null);
        fetchAnnouncements();
      } else {
        showToast(data.error || "Failed to delete", "error");
      }
    } catch {
      showToast("Failed to delete announcement", "error");
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async (announcement: IAnnouncement) => {
    try {
      const res = await apiFetch(`/api/announcements/${announcement._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !announcement.isPublished }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(
          announcement.isPublished ? "Unpublished!" : "Published!",
          "success"
        );
        fetchAnnouncements();
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Announcements Manager
        </h1>
        <button
          onClick={openAddModal}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FiPlus size={18} />
          <span>New Announcement</span>
        </button>
      </div>

      {announcements.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <p className="text-gray-500">No announcements yet.</p>
          <button
            onClick={openAddModal}
            className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
          >
            Create your first announcement
          </button>
        </div>
      ) : (
        <>
          {/* Mobile Card View */}
          <div className="space-y-3 md:hidden">
            {announcements.map((a) => (
              <div key={a._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{a.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full ${
                        a.category === "All" ? "bg-gray-100 text-gray-700" :
                        a.category === "Nursery" ? "bg-pink-100 text-pink-700" :
                        a.category === "Kinder" ? "bg-purple-100 text-purple-700" :
                        "bg-blue-100 text-blue-700"
                      }`}>{a.category || "All"}</span>
                      {a.images && a.images.length > 0 && (
                        <span className="inline-flex items-center gap-0.5 text-xs text-gray-400">
                          <FiImage size={10} /> {a.images.length}
                        </span>
                      )}
                      {a.scheduledAt && new Date(a.scheduledAt) > new Date() && (
                        <span className="text-xs text-orange-500"><FiClock size={10} /></span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => togglePublish(a)}
                    className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                      a.isPublished ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {a.isPublished ? "Published" : "Draft"}
                  </button>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-400">{new Date(a.createdAt).toLocaleDateString()}</p>
                  <div className="flex gap-1">
                    <button onClick={() => { setPreviewContent(a); setPreviewOpen(true); }} className="p-2 text-gray-400 hover:text-green-600" title="Preview"><FiEye size={15} /></button>
                    <button onClick={() => openEditModal(a)} className="p-2 text-gray-400 hover:text-blue-600" title="Edit"><FiEdit2 size={15} /></button>
                    <button onClick={() => setDeleteTarget(a)} className="p-2 text-gray-400 hover:text-red-600" title="Delete"><FiTrash2 size={15} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hidden md:block">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Title</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Category</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Date</th>
                  <th className="text-center px-4 py-3 text-sm font-medium text-gray-600">Status</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {announcements.map((a) => (
                  <tr key={a._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900 truncate max-w-xs">{a.title}</p>
                        {a.images && a.images.length > 0 && (
                          <span className="inline-flex items-center gap-0.5 text-xs text-gray-400"><FiImage size={12} />{a.images.length}</span>
                        )}
                        {a.scheduledAt && new Date(a.scheduledAt) > new Date() && (
                          <span className="inline-flex items-center gap-0.5 text-xs text-orange-500"><FiClock size={12} /></span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${
                        a.category === "All" ? "bg-gray-100 text-gray-700" :
                        a.category === "Nursery" ? "bg-pink-100 text-pink-700" :
                        a.category === "Kinder" ? "bg-purple-100 text-purple-700" :
                        "bg-blue-100 text-blue-700"
                      }`}>{a.category || "All"}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{new Date(a.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => togglePublish(a)}
                        className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                          a.isPublished ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {a.isPublished ? (<><FiEye size={12} /><span>Published</span></>) : (<><FiEyeOff size={12} /><span>Draft</span></>)}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => { setPreviewContent(a); setPreviewOpen(true); }} className="p-2 text-gray-400 hover:text-green-600 transition-colors" title="Preview"><FiEye size={16} /></button>
                        <button onClick={() => openEditModal(a)} className="p-2 text-gray-400 hover:text-blue-600 transition-colors" title="Edit"><FiEdit2 size={16} /></button>
                        <button onClick={() => setDeleteTarget(a)} className="p-2 text-gray-400 hover:text-red-600 transition-colors" title="Delete"><FiTrash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Announcement" : "New Announcement"}
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Announcement title"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                {ANNOUNCEMENT_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Schedule Post (optional)
              </label>
              <input
                type="datetime-local"
                value={form.scheduledAt}
                onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
              <p className="text-xs text-gray-400 mt-1">Leave empty to post immediately. Uses PH time (UTC+8).</p>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            <p className="text-xs text-amber-700">
              <strong>Note:</strong> All announcements are automatically deleted after 30 days from the post/scheduled date.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content *
            </label>
            <RichTextEditor
              value={form.content}
              onChange={(content) => setForm({ ...form, content })}
              placeholder="Write your announcement..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Photos (max 3)
            </label>
            <div className="flex flex-wrap gap-3 mb-2">
              {form.images.map((img, i) => (
                <div key={i} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200">
                  <Image src={img} alt={`Photo ${i + 1}`} fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 bg-red-500 text-white p-0.5 rounded-full hover:bg-red-600"
                  >
                    <FiX size={12} />
                  </button>
                </div>
              ))}
              {form.images.length < 3 && (
                <label className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                  {uploadingImage ? (
                    <div className="flex flex-col items-center">
                      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-1" />
                      <span className="text-xs text-blue-600 font-medium">{uploadProgress}%</span>
                    </div>
                  ) : (
                    <>
                      <FiUpload className="text-gray-400 mb-1" size={18} />
                      <span className="text-xs text-gray-400">Upload</span>
                      <span className="text-[10px] text-gray-300">Max 5MB</span>
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
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isPublished"
              checked={form.isPublished}
              onChange={(e) =>
                setForm({ ...form, isPublished: e.target.checked })
              }
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
              {saving ? "Saving..." : editing ? "Update" : "Create"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Preview Modal */}
      <Modal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title="Preview"
        size="lg"
      >
        {previewContent && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {previewContent.title}
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              {new Date(previewContent.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: previewContent.content }}
            />
            {previewContent.images && previewContent.images.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-3">
                {previewContent.images.map((img, i) => (
                  <div key={i} className="relative w-32 h-32 rounded-lg overflow-hidden border border-gray-200">
                    <Image src={img} alt={`Photo ${i + 1}`} fill className="object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Announcement"
        message={`Are you sure you want to delete "${deleteTarget?.title}"?`}
        loading={saving}
      />
    </div>
  );
}
