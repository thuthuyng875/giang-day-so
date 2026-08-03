"use client";

import { useState } from "react";
import { UploadCloud, CheckCircle2, Loader2, AlertCircle } from "lucide-react";

export function AdminUploadForm() {
  const [productId, setProductId] = useState("");
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!productId) {
      setMessage({ type: "error", text: "Vui lòng nhập Product ID." });
      return;
    }
    
    if (!previewFile && !sourceFile) {
      setMessage({ type: "error", text: "Vui lòng chọn ít nhất một file để upload." });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const uploadPromises = [];

      // Upload Bản Xem Thử (Preview)
      if (previewFile) {
        const previewFormData = new FormData();
        previewFormData.append("file", previewFile);
        previewFormData.append("productId", productId);
        previewFormData.append("fileType", "preview");

        uploadPromises.push(
          fetch("/api/upload-drive", {
            method: "POST",
            body: previewFormData,
          }).then(async (res) => {
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Lỗi upload bản xem thử");
            return data;
          })
        );
      }

      // Upload Bản Gốc (Source)
      if (sourceFile) {
        const sourceFormData = new FormData();
        sourceFormData.append("file", sourceFile);
        sourceFormData.append("productId", productId);
        sourceFormData.append("fileType", "source");

        uploadPromises.push(
          fetch("/api/upload-drive", {
            method: "POST",
            body: sourceFormData,
          }).then(async (res) => {
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Lỗi upload bản gốc");
            return data;
          })
        );
      }

      // Chạy song song cả 2 luồng upload
      await Promise.all(uploadPromises);

      setMessage({ type: "success", text: "🎉 Tải lên thành công! File đã được đẩy lên Google Drive và tự động cập nhật URL vào cơ sở dữ liệu." });
      
      // Xoá file đã chọn sau khi up xong
      setPreviewFile(null);
      setSourceFile(null);
      // Reset cả DOM input values
      const fileInputs = document.querySelectorAll('input[type="file"]');
      fileInputs.forEach((input) => {
        (input as HTMLInputElement).value = "";
      });
      
    } catch (error: any) {
      console.error(error);
      setMessage({ type: "error", text: error.message || "Đã xảy ra lỗi không xác định." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-6 md:p-8 bg-white rounded-2xl shadow-sm border border-slate-200">
      <div className="flex items-center gap-3 mb-8 border-b border-slate-100 pb-5">
        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
          <UploadCloud className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Tải lên Tài liệu Kỹ thuật số</h2>
          <p className="text-sm text-slate-500 mt-1">Đồng bộ tự động lên Google Drive & Supabase</p>
        </div>
      </div>

      <form onSubmit={handleUpload} className="space-y-8">
        {/* Product ID */}
        <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
          <label className="block text-sm font-bold text-slate-800 mb-2">
            ID Sản Phẩm (Product ID)
          </label>
          <input
            type="text"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            placeholder="Ví dụ: b3f2a1b9-8e4a-4d2c..."
            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-700 bg-white"
            required
          />
          <p className="text-xs text-slate-500 mt-2">
            Copy ID từ bảng <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-700 font-mono">products</code> trong Supabase.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Ô 1: Preview File */}
          <div className="relative p-5 rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/50 transition-colors group cursor-pointer">
            <label className="block cursor-pointer">
              <span className="block text-sm font-bold text-slate-800 mb-3">
                1. Bản Xem Thử (Preview)
              </span>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setPreviewFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 transition-colors file:cursor-pointer cursor-pointer"
              />
            </label>
            <div className="mt-4 pt-3 border-t border-slate-200/60">
              <p className="text-xs text-slate-500 flex items-start gap-1.5 leading-relaxed">
                <span className="text-orange-500 font-bold mt-0.5">Lưu ý:</span> 
                Định dạng PDF. File này sẽ bị khóa tính năng Tải Xuống/In (Disable Download) khi nhúng Iframe.
              </p>
            </div>
          </div>

          {/* Ô 2: Source File */}
          <div className="relative p-5 rounded-xl border-2 border-dashed border-slate-300 hover:border-emerald-400 bg-slate-50/50 hover:bg-emerald-50/50 transition-colors group cursor-pointer">
            <label className="block cursor-pointer">
              <span className="block text-sm font-bold text-slate-800 mb-3">
                2. Bản Gốc (Source)
              </span>
              <input
                type="file"
                accept=".zip,.rar,.docx,.doc,.pdf"
                onChange={(e) => setSourceFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-100 file:text-emerald-700 hover:file:bg-emerald-200 transition-colors file:cursor-pointer cursor-pointer"
              />
            </label>
            <div className="mt-4 pt-3 border-t border-slate-200/60">
              <p className="text-xs text-slate-500 flex items-start gap-1.5 leading-relaxed">
                <span className="text-emerald-600 font-bold mt-0.5">Lưu ý:</span>
                File thực tế bán cho khách. Chỉ tài khoản đã thanh toán mới có thể truy cập link này.
              </p>
            </div>
          </div>
        </div>

        {/* Message Alert */}
        {message && (
          <div className={`p-4 rounded-xl flex items-start gap-3 border ${message.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'} animate-in fade-in slide-in-from-bottom-2`}>
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-600" /> : <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600" />}
            <p className="text-sm font-medium leading-relaxed">{message.text}</p>
          </div>
        )}

        {/* Nút Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center py-4 px-6 rounded-xl font-bold text-white bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg disabled:shadow-none"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-3 animate-spin" />
              Đang xử lý & Tải lên Google Drive... (Có thể mất vài phút)
            </>
          ) : (
            "Bắt đầu Tải lên Tài liệu"
          )}
        </button>
      </form>
    </div>
  );
}
