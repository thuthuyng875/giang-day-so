"use client";
import Link from "next/link";
import Image from "next/image";
import { Eye, User } from "lucide-react";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

import { formatCurrencyVND } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { usePayment } from "@/components/payment/PaymentProvider";

type ProductCardProps = {
  product: {
    id: string;
    name: string;
    category: string | null;
    price?: number;
    sale_price?: number;
    original_price?: number;
    image_url: string | null;
    preview_url?: string | null;
    view_count?: number | null;
    is_dynamic?: boolean;
    drive_file_id?: string;
    description?: string | null;
  };
  layout?: "vertical" | "horizontal";
};

function CartIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
      <circle cx="9" cy="20" r="1.6" />
      <circle cx="18" cy="20" r="1.6" />
      <path d="M3 4h2l2.4 10.2a2 2 0 0 0 2 1.6h8.9a2 2 0 0 0 2-1.5L22 7H7.4" />
    </svg>
  );
}

export function ProductCard({ product, layout = "vertical" }: ProductCardProps) {
  const previewHref = product.preview_url ?? "https://drive.google.com/file/d/1-demo-preview-fallback/view";
  const viewCount = product.view_count ?? 0;
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { openPaymentModal } = usePayment();

  useEffect(() => {
    setMounted(true);
  }, []);

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
  
  const getEmbedUrl = (url: string) => {
    if (!url || typeof url !== 'string') return '';
    
    // Tìm File ID bằng Regex linh hoạt hơn (hỗ trợ nhiều dạng link Drive)
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
  
  // Debug log để kiểm tra link
  if (isPreviewOpen) {
    console.log("Link xem thử của sản phẩm:", product.name, previewHref);
  }

  const modalNode = mounted && isPreviewOpen && createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 md:p-8" onClick={(e) => { e.preventDefault(); setIsPreviewOpen(false); }}>
      <button 
        type="button"
        onClick={(e) => { e.preventDefault(); setIsPreviewOpen(false); }}
        className="absolute top-4 right-4 md:top-6 md:right-6 text-white hover:text-orange-500 bg-slate-800/50 hover:bg-slate-800 p-2 rounded-full transition-colors z-[100000]"
      >
        ✕ Đóng
      </button>
      
      <div className="w-full max-w-5xl h-[80vh] md:h-[90vh] bg-white rounded-xl overflow-hidden shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
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

  const currentPrice = product.sale_price ?? product.price ?? 0;
  const oldPrice = product.original_price ?? (Math.round((currentPrice * 1.22) / 5000) * 5000);

  if (layout === "horizontal") {
    return (
      <div className="flex flex-row gap-3 p-3 border border-slate-200/80 rounded-xl bg-white shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-300 relative group overflow-hidden cursor-pointer">
        <Link 
          href={`/product/${product.id}`} 
          className="absolute inset-0 z-10" 
          aria-label={`Xem chi tiết tài liệu ${product.name}`}
          title={product.name}
        />
        {product.is_dynamic && (
          <div className="relative z-10 absolute top-2 left-2">
            <Badge className="bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-900 font-extrabold px-2 py-0.5 text-[9px] sm:text-[10px] shadow-sm border-none animate-float rounded-md">
              ⚡ Cập nhật liên tục
            </Badge>
          </div>
        )}
        <div title={product.name} className="relative z-10 w-24 h-32 sm:w-28 sm:h-36 shrink-0 bg-slate-50 rounded-lg overflow-hidden border border-slate-100 pointer-events-none shadow-inner">
          {isImageLoading && product.image_url && (
            <div className="absolute inset-0 bg-slate-200 animate-pulse" />
          )}
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 256px"
              className={`object-cover transition-transform duration-500 ease-out group-hover:scale-105 transition-opacity duration-300 ${isImageLoading ? 'opacity-0' : 'opacity-100'}`}
              onLoad={() => setIsImageLoading(false)}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-slate-400">
              Chưa có ảnh sản phẩm
            </div>
          )}
        </div>

        <div className="relative z-10 flex flex-col flex-1 min-w-0 justify-between">
          <div className="pointer-events-none space-y-1">
            <div className="flex flex-wrap items-center gap-1.5">
              {product.category ? (
                <span className="inline-block bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded text-[10px] font-semibold leading-none">
                  {product.category}
                </span>
              ) : null}
            </div>
            <h3 title={product.name} className="text-[13px] sm:text-sm font-bold text-slate-800 leading-snug group-hover:text-[#0066cc] transition-colors duration-200 line-clamp-2">
              {product.name}
            </h3>
            
            {/* Uploader (Admin) */}
            <div className="flex items-center gap-1 text-[11px] sm:text-xs text-slate-500">
              <User className="h-3.5 w-3.5 text-slate-400" />
              <span>Admin</span>
            </div>

            {/* 5 Golden Stars */}
            <div className="flex items-center gap-0.5 text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <svg key={i} aria-hidden="true" className="h-3.5 w-3.5 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>

            {/* Prices */}
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-red-600 font-extrabold text-sm">
                {formatCurrencyVND(currentPrice)}
              </span>
              <span className="text-[11px] text-slate-400 line-through font-normal">
                {formatCurrencyVND(oldPrice)}
              </span>
            </div>
          </div>

          {/* Action buttons — compact, right-aligned */}
          <div className="flex flex-row gap-2 mt-2 pt-2 border-t border-slate-100 justify-end">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setIsPreviewOpen(true); }}
              className="inline-flex items-center justify-center py-1.5 px-3 rounded-lg text-xs font-bold border border-[#0066cc] bg-white text-[#0066cc] hover:bg-blue-50 transition-colors shadow-sm whitespace-nowrap"
            >
              Xem thử
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); openPaymentModal(product); }}
              className="inline-flex items-center justify-center py-1.5 px-3 rounded-lg text-xs font-bold bg-[#0066cc] hover:bg-blue-800 text-white transition-colors shadow-sm whitespace-nowrap"
            >
              Mua ngay
            </button>
          </div>
        </div>
        {modalNode}
      </div>
    );
  }

  // Vertical layout
  return (
    <Card className="relative group overflow-hidden rounded-2xl bg-white border border-slate-200/60 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-300 flex flex-col h-full cursor-pointer">
      <Link 
        href={`/product/${product.id}`} 
        className="absolute inset-0 z-10" 
        aria-label={`Xem chi tiết tài liệu ${product.name}`}
        title={product.name}
      />

      {product.is_dynamic && (
        <div className="absolute top-3 right-3 z-20">
          <Badge className="bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-900 font-extrabold shadow-md border-none animate-float rounded-md">
            ⚡ Cập nhật liên tục
          </Badge>
        </div>
      )}

      <div title={product.name} className="relative aspect-square w-full bg-slate-50 overflow-hidden border-b border-slate-100">
        {isImageLoading && product.image_url && (
          <div className="absolute inset-0 z-0 bg-slate-200 animate-pulse" />
        )}
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            width={640}
            height={800}
            className={`h-full w-full object-cover relative z-10 transition-transform duration-500 ease-out group-hover:scale-105 transition-opacity duration-300 ${isImageLoading ? 'opacity-0' : 'opacity-100'}`}
            onLoad={() => setIsImageLoading(false)}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            Chưa có ảnh sản phẩm
          </div>
        )}
      </div>

      <CardContent className="relative flex-1 flex flex-col p-2.5 pb-1 text-left">
        <div className="flex flex-wrap items-center gap-1.5">
          {product.category ? (
            <span className="inline-block bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded text-[10px] font-semibold leading-none">
              {product.category}
            </span>
          ) : null}
        </div>
        <h3
          title={product.name}
          className="mt-1.5 line-clamp-2 text-[13px] font-bold leading-snug text-slate-800 group-hover:text-[#0066cc] transition-colors duration-200"
        >
          {product.name}
        </h3>
        
        {/* Uploader (Admin) */}
        <div className="flex items-center gap-1 text-[11px] sm:text-xs text-slate-500 mt-1">
          <User className="h-3.5 w-3.5 text-slate-400" />
          <span>Admin</span>
        </div>

        {/* 5 Golden Stars */}
        <div className="flex items-center gap-0.5 text-yellow-400 mt-0.5">
          {[...Array(5)].map((_, i) => (
            <svg key={i} aria-hidden="true" className="h-3.5 w-3.5 fill-current" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>

        {/* Prices */}
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-red-600 font-extrabold text-sm">
            {formatCurrencyVND(currentPrice)}
          </span>
          <span className="text-[11px] text-slate-400 line-through font-normal">
            {formatCurrencyVND(oldPrice)}
          </span>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-2 p-2.5 pt-2 mt-auto">
        <div className="flex gap-2 w-full justify-end">
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); setIsPreviewOpen(true); }}
            className="relative z-20 inline-flex items-center justify-center py-1.5 px-3 text-xs font-bold rounded-lg border border-[#0066cc] bg-white text-[#0066cc] hover:bg-blue-50 transition-colors shadow-sm whitespace-nowrap"
          >
            Xem thử
          </button>
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); openPaymentModal(product); }}
            className="relative z-20 inline-flex items-center justify-center py-1.5 px-3 text-xs font-bold rounded-lg bg-[#0066cc] text-white hover:bg-blue-800 transition-colors shadow-sm whitespace-nowrap"
          >
            <span>Mua ngay</span>
          </button>
        </div>
      </CardFooter>
      {modalNode}
    </Card>
  );
}
