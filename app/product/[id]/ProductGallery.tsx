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
    <div className="w-full flex flex-col gap-5">
      {/* Top Row: Image & Info */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-5 w-full flex flex-col h-full">
          {/* Ảnh Bìa chính */}
          <div className="relative w-full aspect-square lg:aspect-auto lg:h-full rounded-[18px] border border-[#ECECEC] bg-white overflow-hidden flex items-center justify-center p-4 group">
            {isDynamic && (
              <div className="absolute top-4 right-4 z-20">
                <Badge className="bg-amber-400 text-amber-900 font-bold px-3 py-1 text-xs shadow-sm border-none rounded-full">
                  ⚡ Cập nhật
                </Badge>
              </div>
            )}
            {mainImage ? (
              <div className="relative w-full h-full rounded-xl overflow-hidden">
                <Image
                  src={mainImage}
                  alt={productName}
                  fill
                  sizes="(max-width: 1024px) 100vw, 360px"
                  className="object-contain transition-transform duration-500 group-hover:scale-[1.02]"
                  priority
                />
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-[#94A3B8]">
                Chưa có ảnh bìa
              </div>
            )}
          </div>
        </div>
        <div className="lg:col-span-7 flex flex-col h-full min-w-0">
          {infoContent}
        </div>
      </div>

      {/* Bottom Row: Thumbnails & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5 w-full">
          {/* Thumbnail Carousel */}
          {hasImages && (
            <div className="flex items-center justify-center gap-2 relative px-8 -mt-2.5">
              {images.length > 1 && (
                <button
                  onClick={prevImage}
                  className="absolute left-0 w-7 h-7 flex items-center justify-center rounded-full bg-white border border-[#ECECEC] text-slate-600 hover:bg-slate-50 transition-colors z-10 shadow-sm"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}

              <div className="flex items-center gap-3 overflow-hidden justify-center flex-1">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`w-[64px] h-[64px] rounded-[12px] overflow-hidden relative cursor-pointer bg-white transition-all shrink-0 ${
                      currentIndex === idx
                        ? "border-2 border-[#2563EB]"
                        : "border border-[#ECECEC] opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Image src={img} alt={`Thumb ${idx + 1}`} fill className="object-cover" />
                  </div>
                ))}
              </div>

              {images.length > 1 && (
                <button
                  onClick={nextImage}
                  className="absolute right-0 w-7 h-7 flex items-center justify-center rounded-full bg-white border border-[#ECECEC] text-slate-600 hover:bg-slate-50 transition-colors z-10 shadow-sm"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
        <div className="lg:col-span-7 w-full flex flex-col">
          {actionContent}
        </div>
      </div>
    </div>
  );
}
