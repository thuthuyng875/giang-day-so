"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Eye } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export function PreviewButton({ previewHref }: { previewHref: string }) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  const getEmbedUrl = (url: string) => {
    if (!url || typeof url !== 'string') return '';
    
    // Tìm File ID bằng Regex linh hoạt hơn
    const regExp = /[-\w]{25,}/;
    const match = url.match(regExp);
    
    if (match && match[0]) {
      // Nếu là link demo fallback thì không hiển thị iframe
      if (match[0] === '1-demo-preview-fallback') return '';
      return `https://drive.google.com/file/d/${match[0]}/preview`;
    }
    
    // Nếu đã là link preview sẵn thì trả về luôn
    if (url.includes('/preview')) return url;
    
    return ''; 
  };

  const iframeSrc = getEmbedUrl(previewHref);

  // Debug log
  if (isPreviewOpen) {
    console.log("Link xem thử (Chi tiết):", previewHref);
  }

  // Ngăn scroll body khi mở modal
  useEffect(() => {
    if (isPreviewOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isPreviewOpen]);

  return (
    <>
      <button
        onClick={() => setIsPreviewOpen(true)}
        className={buttonVariants({
          variant: "outline",
          className: "flex-1 py-3 px-6 rounded-lg font-semibold text-base border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all",
        })}
      >
        <Eye className="h-5 w-5 mr-2" />
        Xem bản xem thử
      </button>

      {mounted && isPreviewOpen && createPortal(
        <div 
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 md:p-8"
          onClick={() => setIsPreviewOpen(false)}
        >
          {/* Nút đóng */}
          <button 
            onClick={() => setIsPreviewOpen(false)}
            className="absolute top-4 right-4 md:top-6 md:right-6 text-white hover:text-orange-500 bg-slate-800/50 hover:bg-slate-800 p-2 rounded-full transition-colors z-[100000]"
          >
            ✕ Đóng
          </button>
          
          {/* Khung Iframe */}
          <div 
            className="w-full max-w-5xl h-[80vh] md:h-[90vh] bg-white rounded-xl overflow-hidden shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            {iframeSrc ? (
              <iframe 
                src={iframeSrc} 
                className="w-full h-full border-0 rounded-lg shadow-inner" 
                allow="autoplay"
              ></iframe>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500">
                Chưa có bản xem thử cho tài liệu này.
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
