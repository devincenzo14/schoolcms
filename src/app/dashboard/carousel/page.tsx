"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import Modal from "@/components/dashboard/Modal";
import ConfirmDialog from "@/components/dashboard/ConfirmDialog";
import ImageUpload from "@/components/dashboard/ImageUpload";
import { useToast } from "@/components/dashboard/ToastProvider";
import { ICarousel } from "@/types";
import { FiPlus, FiEdit2, FiTrash2, FiArrowUp, FiArrowDown, FiImage } from "react-icons/fi";
import { apiFetch, useRefreshData } from "@/lib/hooks";

export default function CarouselManagerPage() {
  const [slides, setSlides] = useState<ICarousel[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<ICarousel | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ICarousel | null>(null);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    imageUrl: "",
    buttonText: "",
    buttonLink: "",
    isActive: true,
  });

  const fetchSlides = async () => {
    try {
      const res = await apiFetch("/api/carousel");
      const data = await res.json();
      if (data.success) setSlides(data.data);
    } catch {
      showToast("Failed to fetch slides", "error");
    } finally {
      setLoading(false);
    }
  };

  useRefreshData(useCallback(() => {
    fetchSlides();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []));

  const openAddModal = () => {
    setEditingSlide(null);
    setForm({
      title: "",
      subtitle: "",
      imageUrl: "",
      buttonText: "",
      buttonLink: "",
      isActive: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (slide: ICarousel) => {
    setEditingSlide(slide);
    setForm({
      title: slide.title,
      subtitle: slide.subtitle,
      imageUrl: slide.imageUrl,
      buttonText: slide.buttonText,
      buttonLink: slide.buttonLink,
      isActive: slide.isActive,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.imageUrl) {
      showToast("Title and image are required", "error");
      return;
    }

    setSaving(true);
    try {
      const url = editingSlide
        ? `/api/carousel/${editingSlide._id}`
        : "/api/carousel";
      const method = editingSlide ? "PUT" : "POST";

      const res = await apiFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (data.success) {
        showToast(
          editingSlide ? "Slide updated!" : "Slide added!",
          "success"
        );
        setModalOpen(false);
        fetchSlides();
      } else {
        showToast(data.error || "Failed to save", "error");
      }
    } catch {
      showToast("Failed to save slide", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      const res = await apiFetch(`/api/carousel/${deleteTarget._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        showToast("Slide deleted!", "success");
        setDeleteTarget(null);
        fetchSlides();
      } else {
        showToast(data.error || "Failed to delete", "error");
      }
    } catch {
      showToast("Failed to delete slide", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleReorder = async (index: number, direction: "up" | "down") => {
    const newSlides = [...slides];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= newSlides.length) return;

    [newSlides[index], newSlides[swapIndex]] = [newSlides[swapIndex], newSlides[index]];

    const items = newSlides.map((s, i) => ({ id: s._id, order: i }));
    setSlides(newSlides);

    try {
      await apiFetch("/api/carousel/reorder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      showToast("Order updated!", "success");
    } catch {
      showToast("Failed to reorder", "error");
      fetchSlides();
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
        <h1 className="text-2xl font-bold text-gray-900">Carousel Manager</h1>
        <button
          onClick={openAddModal}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FiPlus size={18} />
          <span>Add Slide</span>
        </button>
      </div>

      {slides.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <FiImage size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No carousel slides yet.</p>
          <button
            onClick={openAddModal}
            className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
          >
            Add your first slide
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {slides.map((slide, index) => (
            <div
              key={slide._id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-4"
            >
              {/* Reorder */}
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => handleReorder(index, "up")}
                  disabled={index === 0}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                >
                  <FiArrowUp size={16} />
                </button>
                <button
                  onClick={() => handleReorder(index, "down")}
                  disabled={index === slides.length - 1}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                >
                  <FiArrowDown size={16} />
                </button>
              </div>

              {/* Thumbnail */}
              <div className="relative w-24 h-16 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={slide.imageUrl}
                  alt={slide.title}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">
                  {slide.title}
                </h3>
                <p className="text-sm text-gray-500 truncate">
                  {slide.subtitle || "No subtitle"}
                </p>
              </div>

              {/* Status */}
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  slide.isActive
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {slide.isActive ? "Active" : "Inactive"}
              </span>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditModal(slide)}
                  className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                  title="Edit"
                >
                  <FiEdit2 size={16} />
                </button>
                <button
                  onClick={() => setDeleteTarget(slide)}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  title="Delete"
                >
                  <FiTrash2 size={16} />
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
        title={editingSlide ? "Edit Slide" : "Add Slide"}
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
              placeholder="Slide title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subtitle
            </label>
            <input
              type="text"
              value={form.subtitle}
              onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Slide subtitle"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image *
            </label>
            <p className="text-xs text-amber-600 mb-2 flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Use a landscape-oriented image (e.g. 1920×600) for best results.
            </p>
            <ImageUpload
              currentImage={form.imageUrl}
              onImageUploaded={(url) => setForm({ ...form, imageUrl: url })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Button Text
              </label>
              <input
                type="text"
                value={form.buttonText}
                onChange={(e) =>
                  setForm({ ...form, buttonText: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Learn More"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Button Link
              </label>
              <input
                type="text"
                value={form.buttonLink}
                onChange={(e) =>
                  setForm({ ...form, buttonLink: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="/programs"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isActive"
              checked={form.isActive}
              onChange={(e) =>
                setForm({ ...form, isActive: e.target.checked })
              }
              className="rounded border-gray-300"
            />
            <label htmlFor="isActive" className="text-sm text-gray-700">
              Active (visible on website)
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
              {saving ? "Saving..." : editingSlide ? "Update" : "Add Slide"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Slide"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        loading={saving}
      />
    </div>
  );
}
