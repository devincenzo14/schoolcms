"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import ConfirmDialog from "@/components/dashboard/ConfirmDialog";
import { useToast } from "@/components/dashboard/ToastProvider";
import { IGallery } from "@/types";
import { FiPlus, FiTrash2, FiUpload, FiCalendar } from "react-icons/fi";

const CATEGORIES = ["Nursery", "Kinder", "Preschool"] as const;

export default function EventsManagerPage() {
  const [images, setImages] = useState<IGallery[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<IGallery | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [caption, setCaption] = useState("");
  const [category, setCategory] = useState<string>("Preschool");
  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [showUploadForm, setShowUploadForm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const fetchImages = async () => {
    try {
      const query = filterCategory !== "All" ? `?category=${filterCategory}` : "";
      const res = await fetch(`/api/gallery${query}`);
      const data = await res.json();
      if (data.success) setImages(data.data);
    } catch {
      showToast("Failed to fetch events", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterCategory]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    let successCount = 0;

    for (const file of Array.from(files)) {
      try {
        // Upload file first
        const formData = new FormData();
        formData.append("file", file);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const uploadData = await uploadRes.json();

        if (uploadData.success) {
          // Create gallery entry
          const galleryRes = await fetch("/api/gallery", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              imageUrl: uploadData.data.url,
              caption: caption,
              category: category,
            }),
          });
          const galleryData = await galleryRes.json();
          if (galleryData.success) successCount++;
        }
      } catch {
        // Continue with other files
      }
    }

    if (successCount > 0) {
      showToast(`${successCount} image(s) uploaded!`, "success");
      fetchImages();
    } else {
      showToast("Upload failed", "error");
    }

    setUploading(false);
    setCaption("");
    setCategory("Preschool");
    setShowUploadForm(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/gallery/${deleteTarget._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        showToast("Image deleted!", "success");
        setDeleteTarget(null);
        fetchImages();
      } else {
        showToast(data.error || "Failed to delete", "error");
      }
    } catch {
      showToast("Failed to delete image", "error");
    } finally {
      setDeleting(false);
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
        <h1 className="text-2xl font-bold text-gray-900">Events Manager</h1>
        <div className="flex items-center gap-3">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <button
            onClick={() => setShowUploadForm(!showUploadForm)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FiPlus size={18} />
            <span>Upload Images</span>
          </button>
        </div>
      </div>

      {/* Upload Form */}
      {showUploadForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Upload New Images</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Caption (optional, applies to all)
                </label>
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Add a caption..."
                />
              </div>
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-colors disabled:opacity-50"
              >
                <FiUpload size={24} className="mb-2" />
                <span className="text-sm">
                  {uploading
                    ? "Uploading..."
                    : "Click to select images (multiple allowed)"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {images.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <FiCalendar size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No event images yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image) => (
            <div
              key={image._id}
              className="relative group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <div className="relative aspect-square">
                <Image
                  src={image.imageUrl}
                  alt={image.caption || "Gallery image"}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                  <button
                    onClick={() => setDeleteTarget(image)}
                    className="opacity-0 group-hover:opacity-100 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-all"
                    title="Delete"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
              {image.caption && (
                <div className="p-2">
                  <p className="text-xs text-gray-600 truncate">
                    {image.caption}
                  </p>
                </div>
              )}
              <div className="px-2 pb-2">
                <span className="inline-block text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                  {image.category}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Image"
        message="Are you sure you want to delete this image?"
        loading={deleting}
      />
    </div>
  );
}
