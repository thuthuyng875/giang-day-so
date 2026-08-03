"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export type Banner = {
  id: string;
  image_url: string;
  target_link: string | null;
  is_active: boolean;
  sort_order: number;
};

export function HeroSlider({ banners }: { banners: Banner[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Lọc chỉ các banner đang active
  const activeBanners = banners.filter(b => b.is_active).sort((a,b) => a.sort_order - b.sort_order);

  useEffect(() => {
    if (activeBanners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % activeBanners.length);
    }, 5000); // 5000ms theo yêu cầu

    return () => clearInterval(interval);
  }, [activeBanners.length]);

  if (activeBanners.length === 0) {
    return (
      <div className="w-full aspect-[21/9] md:aspect-[4/1] lg:aspect-[5/1] bg-slate-200 animate-pulse rounded-[12px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-[21/9] md:aspect-[4/1] lg:aspect-[5/1] rounded-[12px] overflow-hidden group">
      {/* Slides Wrapper */}
      <div 
        className="flex w-full h-full transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {activeBanners.map((banner, index) => {
          const slideContent = (
            <Image
              src={banner.image_url}
              alt={`Banner ${index + 1}`}
              fill
              priority={index === 0}
              className="object-cover"
            />
          );

          return (
            <div
              key={banner.id}
              className="w-full h-full flex-shrink-0 relative"
            >
              {banner.target_link ? (
                <Link href={banner.target_link} className="w-full h-full block">
                  {slideContent}
                </Link>
              ) : (
                slideContent
              )}
            </div>
          );
        })}
      </div>

      {/* Pagination Dots */}
      {activeBanners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
          {activeBanners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`transition-all rounded-full ${
                index === currentIndex 
                  ? "w-6 h-2 bg-[#0066cc]" 
                  : "w-2 h-2 bg-slate-300 hover:bg-slate-400"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
