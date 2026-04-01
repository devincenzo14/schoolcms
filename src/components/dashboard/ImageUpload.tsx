"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { FiUpload, FiX } from "react-icons/fi";

interface ImageUploadProps {
  currentImage?: string;
  onImageUploaded: (url: string) => void;
}

export default function ImageUpload({
  currentImage,
  onImageUploaded,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");

    // Client-side validation
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("File too large. Maximum size is 5MB.");
      return;
    }

    // Preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    // Upload with progress via XMLHttpRequest
    setUploading(true);
    setProgress(0);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const url = await new Promise<string>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/api/upload");
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setProgress(Math.round((e.loaded / e.total) * 100));
          }
        };
        xhr.onload = () => {
          try {
            const data = JSON.parse(xhr.responseText);
            if (data.success) resolve(data.data.url);
            else reject(new Error(data.error || "Upload failed"));
          } catch {
            reject(new Error("Upload failed"));
          }
        };
        xhr.onerror = () => reject(new Error("Upload failed"));
        xhr.send(formData);
      });

      onImageUploaded(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setPreview(currentImage || null);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const clearImage = () => {
    setPreview(null);
    onImageUploaded("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {preview ? (
        <div className="relative">
          <div className="relative h-48 rounded-lg overflow-hidden border border-gray-200">
            <Image
              src={preview}
              alt="Preview"
              fill
              className="object-cover"
            />
          </div>
          <button
            type="button"
            onClick={clearImage}
            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
          >
            <FiX size={16} />
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mt-2 text-sm text-blue-600 hover:text-blue-700"
            disabled={uploading}
          >
            {uploading ? `Uploading... ${progress}%` : "Change image"}
          </button>
          {uploading && (
            <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-colors"
          disabled={uploading}
        >
          {uploading ? (
            <>
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-2" />
              <span className="text-sm">Uploading... {progress}%</span>
              <div className="mt-2 w-32 bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </>
          ) : (
            <>
              <FiUpload size={24} className="mb-2" />
              <span className="text-sm">Click to upload image</span>
              <span className="text-xs mt-1">Max 5MB, JPG/PNG/GIF/WebP</span>
            </>
          )}
        </button>
      )}

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
}
