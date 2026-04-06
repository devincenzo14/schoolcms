"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import Modal from "@/components/dashboard/Modal";
import ConfirmDialog from "@/components/dashboard/ConfirmDialog";
import ImageUpload from "@/components/dashboard/ImageUpload";
import { useToast } from "@/components/dashboard/ToastProvider";
import { IProgram } from "@/types";
import { FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";
import { apiFetch, useRefreshData } from "@/lib/hooks";

export default function ProgramsManagerPage() {
  const [programs, setPrograms] = useState<IProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<IProgram | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<IProgram | null>(null);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const [form, setForm] = useState({
    title: "",
    description: "",
    imageUrl: "",
  });

  const fetchPrograms = async () => {
    try {
      const res = await apiFetch("/api/programs");
      const data = await res.json();
      if (data.success) setPrograms(data.data);
    } catch {
      showToast("Failed to fetch programs", "error");
    } finally {
      setLoading(false);
    }
  };

  useRefreshData(useCallback(() => {
    fetchPrograms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []));

  const openAddModal = () => {
    setEditing(null);
    setForm({ title: "", description: "", imageUrl: "" });
    setModalOpen(true);
  };

  const openEditModal = (program: IProgram) => {
    setEditing(program);
    setForm({
      title: program.title,
      description: program.description,
      imageUrl: program.imageUrl,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.description || !form.imageUrl) {
      showToast("All fields are required", "error");
      return;
    }

    setSaving(true);
    try {
      const url = editing ? `/api/programs/${editing._id}` : "/api/programs";
      const method = editing ? "PUT" : "POST";

      const res = await apiFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (data.success) {
        showToast(editing ? "Program updated!" : "Program added!", "success");
        setModalOpen(false);
        fetchPrograms();
      } else {
        showToast(data.error || "Failed to save", "error");
      }
    } catch {
      showToast("Failed to save program", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      const res = await apiFetch(`/api/programs/${deleteTarget._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        showToast("Program deleted!", "success");
        setDeleteTarget(null);
        fetchPrograms();
      } else {
        showToast(data.error || "Failed to delete", "error");
      }
    } catch {
      showToast("Failed to delete program", "error");
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Programs Manager</h1>
        <button
          onClick={openAddModal}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FiPlus size={18} />
          <span>Add Program</span>
        </button>
      </div>

      {programs.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <p className="text-gray-500">No programs yet.</p>
          <button
            onClick={openAddModal}
            className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
          >
            Add your first program
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map((program) => (
            <div
              key={program._id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <div className="relative h-40">
                <Image
                  src={program.imageUrl}
                  alt={program.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2">
                  {program.title}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                  {program.description}
                </p>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => openEditModal(program)}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Edit"
                  >
                    <FiEdit2 size={16} />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(program)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete"
                  >
                    <FiTrash2 size={16} />
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
        title={editing ? "Edit Program" : "Add Program"}
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
              placeholder="e.g. Elementary Program"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
              placeholder="Describe the program..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image *
            </label>
            <ImageUpload
              currentImage={form.imageUrl}
              onImageUploaded={(url) => setForm({ ...form, imageUrl: url })}
            />
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
              {saving ? "Saving..." : editing ? "Update" : "Add Program"}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Program"
        message={`Are you sure you want to delete "${deleteTarget?.title}"?`}
        loading={saving}
      />
    </div>
  );
}
