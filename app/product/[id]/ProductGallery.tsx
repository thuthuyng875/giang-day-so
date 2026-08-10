"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ProductGalleryProps {
  images: string[];
  productName: string;
  isDynamic?: boolean;
  infoContent?: React.ReactNode;
  actionContent?: React.ReactNode;
}

export function ProductGallery({ images, productName, isDynamic, infoContent, actionContent }: ProductGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const mainImage = images[currentIndex] || null;
  const hasImages = images.length > 0;

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start w-full">
      {/* Left Column: Image & Thumbnails */}
      <div className="lg:col-span-5 w-full flex flex-col">

        {/* Outer Wrapper for Image & Thumbnails */}
        <div className="w-full bg-white border border-[#ECECEC] rounded-[16px] p-5 lg:p-6 flex flex-col gap-6 relative">

          {/* Main Image Container */}
          <div className="relative w-full flex items-center justify-center">

            {/* Arrows (Positioned at edges of container) */}
            {images.length > 1 && (
              <button
                onClick={prevImage}
                className="absolute left-0 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-white border border-[#ECECEC] text-slate-600 hover:bg-slate-50 hover:text-[#2563EB] transition-colors z-30 shadow-sm"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}

            {images.length > 1 && (
              <button
                onClick={nextImage}
                className="absolute right-0 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-white border border-[#ECECEC] text-slate-600 hover:bg-slate-50 hover:text-[#2563EB] transition-colors z-30 shadow-sm"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}

            {/* Actual Main Image with Book Shadow */}
            <div className="relative w-full max-w-[260px] flex justify-center mx-auto group">
              {isDynamic && (
                <div className="absolute top-2 right-2 z-20">
                  <Badge className="bg-amber-400 text-amber-900 font-bold px-2.5 py-0.5 text-[10px] shadow-sm border-none rounded-full">
                    ⚡ Cập nhật
                  </Badge>
                </div>
              )}
              {mainImage ? (
                <div className="relative inline-block rounded-md overflow-hidden bg-white shadow-[4px_4px_16px_rgba(0,0,0,0.1)] border border-gray-100 transition-transform duration-500 group-hover:scale-[1.02]">
                  {/* Fake Book Spine effect */}
                  <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-black/5 z-10" />

                  <img
                    src={mainImage}
                    alt={productName}
                    referrerPolicy="no-referrer"
                    className="w-full h-auto min-h-[240px] max-h-[260px] object-contain block text-transparent"
                  />
                </div>
              ) : (
                <div className="w-full aspect-square flex items-center justify-center text-sm text-[#94A3B8] border border-dashed border-gray-300 rounded-md bg-white">
                  Chưa có ảnh bìa
                </div>
              )}
            </div>
          </div>

          {/* Thumbnail Carousel */}
          {hasImages && (
            <div className="flex items-center justify-center gap-3 w-full">
              <div className="flex items-center gap-3 overflow-hidden justify-center flex-1">
                {images.slice(0, 3).map((img, idx) => {
                  const isLastVisible = idx === 2 && images.length >= 3;

                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        if (isLastVisible) {
                          document.getElementById('preview-btn-desktop')?.click();
                        } else {
                          setCurrentIndex(idx);
                        }
                      }}
                      className={`w-[60px] h-[60px] rounded-[10px] overflow-hidden relative cursor-pointer bg-white transition-all shrink-0 shadow-sm flex items-center justify-center ${currentIndex === idx && !isLastVisible
                        ? "border-2 border-[#2563EB]"
                        : "border border-[#ECECEC] opacity-70 hover:opacity-100"
                        }`}
                    >
                      <img src={img} alt={`Thumb ${idx + 1}`} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                      {isLastVisible && (
                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white">
                          <span className="text-[14px] font-bold">+</span>
                          <span className="text-[9px] font-semibold mt-0.5">Xem thêm</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Info & Actions */}
      <div className="lg:col-span-7 w-full flex flex-col min-w-0">
        {infoContent}
        {actionContent}
      </div>
    </div>
  );
}
