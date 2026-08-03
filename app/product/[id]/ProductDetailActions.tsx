"use client";

import { Eye, ShoppingCart } from "lucide-react";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { usePayment } from "@/components/payment/PaymentProvider";

interface ProductDetailActionsProps {
  product: any;
  previewHref: string;
}

export function ProductDetailActions({ product, previewHref }: ProductDetailActionsProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { openPaymentModal } = usePayment();

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const getEmbedUrl = (url: string) => {
    if (!url || typeof url !== "string") return "";
    const regExp = /[-\w]{25,}/;
    const match = url.match(regExp);
    if (match && match[0]) {
      if (match[0] === "1-demo-preview-fallback") return "";
      return `https://drive.google.com/file/d/${match[0]}/preview`;
    }
    if (url.includes("/preview")) return url;
    return "";
  };

  const iframeSrc = getEmbedUrl(previewHref);

  const modalNode =
    mounted &&
    isPreviewOpen &&
    createPortal(
      <div
        className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 md:p-8"
        onClick={(e) => {
          e.preventDefault();
          setIsPreviewOpen(false);
        }}
      >
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            setIsPreviewOpen(false);
          }}
          className="absolute top-4 right-4 md:top-6 md:right-6 text-white hover:text-orange-500 bg-slate-800/50 hover:bg-slate-800 p-2 rounded-full transition-colors z-[100000]"
        >
          ✕ Đóng
        </button>

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
    );

  return (
    <>
      {/* Desktop Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => setIsPreviewOpen(true)}
          className="flex-1 py-2.5 rounded-[12px] border-2 border-[#2563EB] text-[#2563EB] flex items-center justify-center text-sm font-semibold gap-2 hover:bg-[#F8FAFC] hover:-translate-y-[1px] transition-all bg-white"
        >
          <Eye className="w-4 h-4" /> XEM THỬ
        </button>
        <button
          onClick={() => openPaymentModal(product)}
          className="flex-1 py-2.5 rounded-[12px] bg-[#FBBF24] text-[#0F172A] flex items-center justify-center text-sm font-semibold gap-2 shadow-[0_4px_12px_rgba(251,191,36,0.2)] hover:bg-[#F59E0B] hover:-translate-y-[1px] transition-all"
        >
          <ShoppingCart className="w-4 h-4" /> MUA NGAY
        </button>
      </div>

      {/* Mobile Sticky Bottom Bar Buttons */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#ECECEC] p-4 flex gap-3 z-50 shadow-[0_-4px_20px_rgba(15,23,42,0.05)]">
        <button
          onClick={() => setIsPreviewOpen(true)}
          className="h-[50px] flex-[2] flex items-center justify-center gap-2 rounded-[12px] border-2 border-[#2563EB] text-[#2563EB] font-bold text-[14px] bg-white"
        >
          <Eye className="w-[18px] h-[18px]" />
          <span>XEM THỬ</span>
        </button>
        <button
          onClick={() => openPaymentModal(product)}
          className="h-[50px] flex-[3] flex items-center justify-center gap-2 rounded-[12px] bg-[#FBBF24] text-[#0F172A] font-bold text-[14px] shadow-sm"
        >
          <ShoppingCart className="w-[18px] h-[18px]" />
          <span>MUA NGAY</span>
        </button>
      </div>

      {modalNode}
    </>
  );
}
