'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Sparkles, Edit3, ImageIcon, Maximize2, X } from 'lucide-react';

interface CategoryImageGalleryProps {
  images: string[];
  categoryName: string;
  onEditClick?: () => void;
}

export const CategoryImageGallery: React.FC<CategoryImageGalleryProps> = ({
  images,
  categoryName,
  onEditClick,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const validImages = images && images.length > 0 ? images : ['/images/banners/hero_banner.jpg'];
  const activeImage = validImages[currentIndex] || validImages[0];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? validImages.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === validImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="relative mb-12">
      {/* Category Gallery Container */}
      <div className="bg-white rounded-3xl border border-[#F8D7E3] shadow-pink-card p-4 sm:p-6 overflow-hidden">
        {/* Gallery Top Info Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-[#F8D7E3] mb-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FFF4F7] text-[11px] font-bold uppercase tracking-wider text-[#D66B8B] border border-[#F8D7E3]">
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Category Gallery ({validImages.length} {validImages.length === 1 ? 'Image' : 'Images'})</span>
            </span>
          </div>

          {onEditClick && (
            <button
              type="button"
              onClick={onEditClick}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#FFF4F7] hover:bg-[#D66B8B] text-[#D66B8B] hover:text-white border border-[#F8D7E3] rounded-full text-xs font-bold transition-all shadow-xs"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Category Images</span>
            </button>
          )}
        </div>

        {/* Main Display Area */}
        <div className="relative aspect-[16/8] sm:aspect-[21/9] w-full rounded-2xl overflow-hidden bg-[#FFF4F7]/40 border border-[#F8D7E3] group">
          <Image
            src={activeImage}
            alt={`${categoryName} image ${currentIndex + 1}`}
            fill
            priority
            className="object-cover transition-all duration-500 group-hover:scale-102"
          />

          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 pointer-events-none" />

          {/* Image Tag / Index */}
          <div className="absolute bottom-4 left-4 z-10">
            <span className="text-white text-xs font-bold px-3 py-1 bg-black/40 backdrop-blur-md rounded-full border border-white/20">
              {currentIndex + 1} / {validImages.length}
            </span>
          </div>

          {/* Fullscreen Lightbox Trigger */}
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            className="absolute top-4 right-4 z-10 p-2 bg-white/80 hover:bg-white text-[#3A3034] rounded-full backdrop-blur-sm transition-transform active:scale-95 shadow-sm"
            title="View full size"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          {/* Navigation Arrows (if > 1 image) */}
          {validImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/80 hover:bg-white text-[#3A3034] shadow-md transition-transform active:scale-90 opacity-90 group-hover:opacity-100"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/80 hover:bg-white text-[#3A3034] shadow-md transition-transform active:scale-90 opacity-90 group-hover:opacity-100"
                aria-label="Next image"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        {/* Thumbnail Reel (if multiple images) */}
        {validImages.length > 1 && (
          <div className="flex items-center gap-3 mt-4 overflow-x-auto pb-1">
            {validImages.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`relative w-20 h-16 sm:w-24 sm:h-18 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                  currentIndex === idx
                    ? 'border-[#D66B8B] ring-2 ring-[#D66B8B]/30 scale-105'
                    : 'border-[#F8D7E3] opacity-70 hover:opacity-100'
                }`}
              >
                <Image src={img} alt={`Thumbnail ${idx + 1}`} fill className="object-cover" />
                <span className="absolute bottom-1 right-1 text-[9px] font-bold text-white bg-black/60 px-1 rounded">
                  #{idx + 1}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute top-6 right-6 p-2 rounded-full bg-white/20 text-white hover:bg-white/40"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="relative max-w-5xl max-h-[85vh] w-full h-[80vh]">
            <Image
              src={activeImage}
              alt={categoryName}
              fill
              className="object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};
