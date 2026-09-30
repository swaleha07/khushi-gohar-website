'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  X,
  Upload,
  Trash2,
  RefreshCw,
  Plus,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Loader2,
  ImageIcon,
} from 'lucide-react';
import { Category } from '@/types';
import { useStore } from '@/context/StoreContext';

interface EditCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category;
}

interface ImageItem {
  id: string;
  url: string;
  file?: File;
  previewUrl: string;
  isNew?: boolean;
  isReplaced?: boolean;
}

export const EditCategoryModal: React.FC<EditCategoryModalProps> = ({
  isOpen,
  onClose,
  category,
}) => {
  const { updateCategory } = useStore();
  const [images, setImages] = useState<ImageItem[]>([]);
  const [name, setName] = useState(category.name);
  const [subtitle, setSubtitle] = useState(category.subtitle);
  const [description, setDescription] = useState(category.description);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const addFileInputRef = useRef<HTMLInputElement>(null);
  const replaceFileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});

  // Sync state whenever category or isOpen changes
  useEffect(() => {
    if (isOpen && category) {
      setName(category.name);
      setSubtitle(category.subtitle);
      setDescription(category.description);
      const initialImages: ImageItem[] = (category.images || []).map((url, idx) => ({
        id: `img-${idx}-${Date.now()}`,
        url,
        previewUrl: url,
        isNew: false,
        isReplaced: false,
      }));
      setImages(initialImages);
      setSuccessMessage(null);
      setErrorMessage(null);
    }
  }, [isOpen, category]);

  if (!isOpen) return null;

  // Handle replacing an existing image
  const handleFileReplace = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate image type
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (JPG, PNG, WebP, etc.)');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setImages((prev) =>
      prev.map((item, idx) =>
        idx === index
          ? {
              ...item,
              file,
              previewUrl,
              isReplaced: true,
            }
          : item
      )
    );
    setErrorMessage(null);
  };

  // Handle adding new image(s)
  const handleAddNewFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newItems: ImageItem[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        newItems.push({
          id: `new-${Date.now()}-${i}`,
          url: '',
          file,
          previewUrl: URL.createObjectURL(file),
          isNew: true,
        });
      }
    }

    if (newItems.length === 0) {
      setErrorMessage('Please select valid image files');
      return;
    }

    setImages((prev) => [...prev, ...newItems]);
    setErrorMessage(null);
    if (addFileInputRef.current) {
      addFileInputRef.current.value = '';
    }
  };

  // Handle deleting an image
  const handleDeleteImage = (index: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Move image position
  const handleMoveImage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= images.length) return;
    const reordered = [...images];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);
    setImages(reordered);
  };

  // Handle Save
  const handleSave = async () => {
    if (images.length === 0) {
      setErrorMessage('A category must have at least 1 image.');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const finalImageUrls: string[] = [];

      for (const item of images) {
        if (item.file) {
          // Upload to /api/upload
          const formData = new FormData();
          formData.append('file', item.file);

          const res = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });

          const data = await res.json();
          if (!res.ok || !data.success) {
            throw new Error(data.error || 'Failed to upload image file');
          }
          finalImageUrls.push(data.url);
        } else {
          // Unchanged existing image URL
          finalImageUrls.push(item.url);
        }
      }

      const updatedCat: Category = {
        ...category,
        name,
        subtitle,
        description,
        images: finalImageUrls,
      };

      await updateCategory(updatedCat);

      setSuccessMessage('Category images saved successfully!');
      setTimeout(() => {
        setIsSaving(false);
        onClose();
      }, 1000);
    } catch (err: any) {
      console.error('Error saving category:', err);
      setErrorMessage(err.message || 'Failed to save category changes. Please try again.');
      setIsSaving(false);
    }
  };

  // Handle Cancel
  const handleCancel = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-[#F8D7E3] shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden text-[#3A3034]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#F8D7E3] bg-[#FFF4F7]/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#D66B8B] text-white flex items-center justify-center shadow-pink-soft">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif-luxury text-lg sm:text-xl font-bold text-[#3A3034]">
                  Edit Category: {category.name}
                </h2>
                <span className="text-[10px] uppercase font-bold text-[#D66B8B] bg-[#FFF4F7] px-2 py-0.5 rounded-full border border-[#F8D7E3]">
                  {category.id}
                </span>
              </div>
              <p className="text-xs text-[#6E6266]">
                Replace existing images, upload new images, or rearrange image order.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCancel}
            disabled={isSaving}
            className="p-2 rounded-xl text-[#6E6266] hover:text-[#3A3034] hover:bg-white transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs">
          {/* Notifications */}
          {successMessage && (
            <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-red-50 text-red-800 border border-red-200 rounded-2xl flex items-center gap-2 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Category Images Management Section */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#F8D7E3]">
              <div>
                <h3 className="font-serif-luxury text-base font-bold text-[#3A3034] flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-[#D66B8B]" />
                  <span>Category Images ({images.length})</span>
                </h3>
                <p className="text-[11px] text-[#6E6266]">
                  Image 1 is the primary cover displayed in category grids and banners.
                </p>
              </div>

              {/* Add New Image Button in header */}
              <button
                type="button"
                onClick={() => addFileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#D66B8B] hover:bg-[#c25877] text-white rounded-xl text-xs font-bold transition-all shadow-pink-soft"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add New Image</span>
              </button>
            </div>

            {/* Hidden Add File Input */}
            <input
              ref={addFileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleAddNewFiles}
              className="hidden"
            />

            {/* Images List Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {images.map((item, index) => {
                return (
                  <div
                    key={item.id}
                    className={`relative p-3.5 rounded-2xl border transition-all ${
                      item.isNew
                        ? 'bg-emerald-50/40 border-emerald-300'
                        : item.isReplaced
                        ? 'bg-blue-50/40 border-blue-300'
                        : index === 0
                        ? 'bg-[#FFF4F7]/70 border-[#D66B8B]'
                        : 'bg-white border-[#F8D7E3]'
                    } shadow-xs flex gap-3.5 items-start`}
                  >
                    {/* Hidden Replace File Input for this specific item */}
                    <input
                      ref={(el) => {
                        replaceFileInputRefs.current[index] = el;
                      }}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileReplace(index, e)}
                      className="hidden"
                    />

                    {/* Image Thumbnail Preview */}
                    <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-gray-100 border border-[#F8D7E3] shrink-0">
                      <Image
                        src={item.previewUrl || '/images/products/extra_whitening_combo.jpg'}
                        alt={`Category image ${index + 1}`}
                        fill
                        className="object-cover"
                        unoptimized={item.previewUrl.startsWith('blob:') || item.previewUrl.startsWith('data:')}
                      />
                    </div>

                    {/* Image Controls & Info */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between h-full py-0.5">
                      <div>
                        {/* Title and Badges */}
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="font-bold text-xs text-[#3A3034]">
                            Image {index + 1}
                            {index === 0 && (
                              <span className="ml-1.5 text-[9px] font-bold text-[#D66B8B] bg-white border border-[#F8D7E3] px-1.5 py-0.5 rounded-md">
                                Primary Cover
                              </span>
                            )}
                          </span>

                          {item.isNew && (
                            <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-md">
                              New - Unsaved
                            </span>
                          )}
                          {item.isReplaced && (
                            <span className="text-[9px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded-md">
                              Replaced - Unsaved
                            </span>
                          )}
                        </div>

                        <p className="text-[10px] text-[#6E6266] truncate">
                          {item.file ? item.file.name : item.url.split('/').pop()}
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="pt-2 flex flex-wrap items-center gap-1.5 mt-2 border-t border-[#F8D7E3]/60">
                        {/* Replace Image Button */}
                        <button
                          type="button"
                          onClick={() => replaceFileInputRefs.current[index]?.click()}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-[#FFF4F7] text-[#3A3034] hover:text-[#D66B8B] border border-[#F8D7E3] rounded-lg text-[11px] font-semibold transition-colors shadow-xs"
                          title="Select new image from computer to replace this image"
                        >
                          <RefreshCw className="w-3 h-3 text-[#D66B8B]" />
                          <span>Replace Image</span>
                        </button>

                        {/* Delete Image Button */}
                        <button
                          type="button"
                          onClick={() => handleDeleteImage(index)}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-white hover:bg-red-50 text-[#6E6266] hover:text-red-600 border border-[#F8D7E3] hover:border-red-200 rounded-lg text-[11px] font-semibold transition-colors"
                          title="Delete this image"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete</span>
                        </button>

                        {/* Reorder Buttons */}
                        <div className="flex items-center ml-auto gap-0.5">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => handleMoveImage(index, index - 1)}
                            className="p-1 text-[#6E6266] hover:text-[#3A3034] disabled:opacity-30 rounded hover:bg-gray-100"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            disabled={index === images.length - 1}
                            onClick={() => handleMoveImage(index, index + 1)}
                            className="p-1 text-[#6E6266] hover:text-[#3A3034] disabled:opacity-30 rounded hover:bg-gray-100"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Add Image Card / Dropzone */}
              <div
                onClick={() => addFileInputRef.current?.click()}
                className="border-2 border-dashed border-[#F8D7E3] hover:border-[#D66B8B] bg-[#FFF4F7]/30 hover:bg-[#FFF4F7]/70 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-[120px] group"
              >
                <div className="w-10 h-10 rounded-full bg-white border border-[#F8D7E3] group-hover:scale-110 group-hover:border-[#D66B8B] flex items-center justify-center text-[#D66B8B] shadow-xs mb-2 transition-transform">
                  <Upload className="w-5 h-5" />
                </div>
                <span className="font-bold text-xs text-[#3A3034] group-hover:text-[#D66B8B]">
                  + Add New Image
                </span>
                <span className="text-[10px] text-[#6E6266] mt-0.5">
                  Select image from your computer (JPG, PNG, WebP)
                </span>
              </div>
            </div>
          </div>

          {/* Category Details (Optional editable text) */}
          <div className="bg-[#FFF4F7]/40 p-4 rounded-2xl border border-[#F8D7E3] space-y-3">
            <h4 className="font-bold text-xs text-[#3A3034]">Category Text & Info</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-[#6E6266] mb-1">Category Title</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-[#F8D7E3] text-[#3A3034] focus:outline-none focus:ring-1 focus:ring-[#D66B8B]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#6E6266] mb-1">Subtitle / Badge</label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-[#F8D7E3] text-[#3A3034] focus:outline-none focus:ring-1 focus:ring-[#D66B8B]"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-[#6E6266] mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-[#F8D7E3] text-[#3A3034] focus:outline-none focus:ring-1 focus:ring-[#D66B8B]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-[#F8D7E3] bg-[#FFF4F7]/60 flex items-center justify-between gap-3">
          <div className="text-[11px] text-[#6E6266]">
            {images.some((i) => i.isNew || i.isReplaced) && (
              <span className="text-[#D66B8B] font-semibold">
                ● You have unsaved image changes. Click &apos;Save Changes&apos; to persist.
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSaving}
              className="px-5 py-2.5 bg-white hover:bg-gray-50 text-[#3A3034] border border-[#F8D7E3] rounded-xl text-xs font-bold transition-all disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#D66B8B] hover:bg-[#c25877] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-pink-soft disabled:opacity-60"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
