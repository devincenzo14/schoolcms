"use client";

import { useState } from "react";
import Image from "next/image";
import { IGallery } from "@/types";
import { FiX } from "react-icons/fi";

interface GalleryGridProps {
  images: IGallery[];
}

export default function GalleryGrid({ images }: GalleryGridProps) {
  const [lightbox, setLightbox] = useState<IGallery | null>(null);

  if (images.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No images in the gallery yet.
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image) => (
          <div
            key={image._id}
            className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group"
            onClick={() => setLightbox(image)}
          >
            <Image
              src={image.imageUrl}
              alt={image.caption || "Gallery image"}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-300"
            />
            {image.caption && (
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                <p className="text-white text-sm">{image.caption}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            onClick={() => setLightbox(null)}
            aria-label="Close"
          >
            <FiX size={32} />
          </button>
          <div className="relative max-w-4xl max-h-[80vh] w-full h-full">
            <Image
              src={lightbox.imageUrl}
              alt={lightbox.caption || "Gallery image"}
              fill
              className="object-contain"
            />
          </div>
          {lightbox.caption && (
            <p className="absolute bottom-8 text-white text-lg text-center">
              {lightbox.caption}
            </p>
          )}
        </div>
      )}
    </>
  );
}
