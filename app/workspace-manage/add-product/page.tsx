"use client";

import { useState } from "react";
import { UploadCloud, CheckCircle2, Loader2, AlertCircle, FileText, Tag, DollarSign, Package } from "lucide-react";
import { createProductAction } from "../actions";
import { supabase } from "@/lib/supabase/client";

const SUBJECTS = [
  "Toán học", "Vật lý", "Hóa học", "Sinh học", "KHTN",
  "Tiếng Anh", "Ngữ văn", "Lịch sử", "Địa lý", "GD KT&PL",
  "HSA", "VACT", "TSA", "SPT"
];

const GRADES = [
  "Lớp 12", "Lớp 11", "Lớp 10", "Lớp 9", "Lớp 8", "Lớp 7", "Lớp 6", "Lớp 5", "Lớp 4", "Lớp 3", "Lớp 2", "Lớp 1", "Tài liệu chung"
];

const DOC_TYPES = [
  "Tài liệu theo môn", "Đề thi thử TN THPT", "Đề thi thử ĐGNL", "Giáo án",
  "Chuyên đề bài tập", "Đề kiểm tra GK - CK", "Ôn thi TN THPTQG", "Ôn thi HSG", "Bài giảng PowerPoint", "Giáo án Word"
];

export default function AddProductPage() {
  const [name, setName] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [previewPagesCount, setPreviewPagesCount] = useState("");
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [grade, setGrade] = useState(GRADES[0]);
  const [docType, setDocType] = useState(DOC_TYPES[0]);
  const [isDynamic, setIsDynamic] = useState(false);
  const [description, setDescription] = useState("");
  const [includedFiles, setIncludedFiles] = useState("");
  const [fileSize, setFileSize] = useState("");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [sourceFile, setSourceFile] = useState<File | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !salePrice || !subject || !grade || !docType) {
      setMessage({ type: "error", text: "Vui lòng nhập đầy đủ thông tin cơ bản." });
      return;
    }

    if (!sourceFile) {
      setMessage({ type: "error", text: "Vui lòng chọn File Bản Gốc (Bắt buộc)." });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      let previewUrl = "";
      let accessLink = "";
      let imageUrl = "";

      const uploadTasks: Promise<any>[] = [];

      // 1. Upload Image to Supabase
      if (imageFile) {
        uploadTasks.push((async () => {
          const fileExt = imageFile.name.split('.').pop();
          const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('product-images')
            .upload(fileName, imageFile);

          if (uploadError) throw new Error("Lỗi upload ảnh bìa: " + uploadError.message);

          const { data: { publicUrl } } = supabase.storage
            .from('product-images')
            .getPublicUrl(fileName);

          return { type: 'image', url: publicUrl };
        })());
      }

      // 2. Upload Preview File to Drive
      if (previewFile) {
        uploadTasks.push((async () => {
          // Step A: Get uploadUrl
          const res = await fetch("/api/drive-upload-url", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              fileName: previewFile.name, 
              mimeType: previewFile.type || "application/pdf", 
              isSource: false 
            })
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Lỗi lấy URL upload bản xem thử");

          // Step B: PUT request directly to Google Drive
          const uploadRes = await fetch(data.uploadUrl, {
            method: "PUT",
            headers: { "Content-Type": previewFile.type || "application/pdf" },
            body: previewFile,
          });
          
          if (!uploadRes.ok) throw new Error("Lỗi upload bản xem thử lên Google Drive");
          
          // Step C: Extract ID and construct link
          const uploadData = await uploadRes.json();
          const fileId = uploadData.id;
          const webViewLink = `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;
          
          // Note: In a production environment where the parent folder doesn't have public permissions,
          // you would also need a backend route to set the permissions on this fileId.
          return { type: 'preview', url: webViewLink };
        })());
      }

      // 3. Upload Source File to Drive
      uploadTasks.push((async () => {
        // Step A: Get uploadUrl
        const res = await fetch("/api/drive-upload-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            fileName: sourceFile.name, 
            mimeType: sourceFile.type || "application/octet-stream", 
            isSource: true 
          })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Lỗi lấy URL upload bản gốc");

        // Step B: PUT request directly to Google Drive
        const uploadRes = await fetch(data.uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": sourceFile.type || "application/octet-stream" },
          body: sourceFile,
        });
        
        if (!uploadRes.ok) throw new Error("Lỗi upload bản gốc lên Google Drive");
        
        // Step C: Extract ID and construct link
        const uploadData = await uploadRes.json();
        const fileId = uploadData.id;
        const webContentLink = `https://drive.google.com/uc?export=download&id=${fileId}`;
        
        return { type: 'source', url: webContentLink };
      })());

      const results = await Promise.all(uploadTasks);

      results.forEach(res => {
        if (res.type === 'image') imageUrl = res.url;
        if (res.type === 'preview') previewUrl = res.url;
        if (res.type === 'source') accessLink = res.url;
      });

      // 4. Create Product in Supabase
      const newProduct = {
        name,
        original_price: originalPrice ? parseInt(originalPrice, 10) : 0,
        sale_price: salePrice ? parseInt(salePrice, 10) : 0,
        preview_pages_count: previewPagesCount ? parseInt(previewPagesCount, 10) : 0,
        subject,
        grade,
        docType,
        description,
        included_files: includedFiles,
        image_url: imageUrl || null,
        is_dynamic: isDynamic,
        preview_url: previewUrl || null,
        access_link: accessLink || null,
        file_size: fileSize || null,
        created_at: new Date().toISOString(),
      };

      try {
        await createProductAction(newProduct);
      } catch (insertError: any) {
        throw new Error(`Lỗi tạo sản phẩm: ${insertError.message}`);
      }

      setMessage({ type: "success", text: "🎉 Thêm sản phẩm thành công! Đã lưu file và tạo bản ghi." });

      // Clear form
      setName("");
      setOriginalPrice("");
      setSalePrice("");
      setPreviewPagesCount("");
      setDescription("");
      setIncludedFiles("");
      setSubject(SUBJECTS[0]);
      setGrade(GRADES[0]);
      setDocType(DOC_TYPES[0]);
      setIsDynamic(false);
      setFileSize("");
      setImageFile(null);
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
      setPreviewFile(null);
      setSourceFile(null);
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
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
      <div className="flex items-center gap-3 border-b border-slate-200 pb-5">
        <div className="p-3 bg-blue-600 text-white rounded-xl shadow-md">
          <Package className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800">Thêm Sản Phẩm Mới</h1>
          <p className="text-slate-500 mt-1">Quản lý và tải lên tài liệu vào hệ thống</p>
        </div>
      </div>

      <form onSubmit={handleUpload} className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Cột trái: Thông tin sản phẩm */}
        <div className="lg:col-span-5 space-y-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-slate-500" /> Thông tin cơ bản
          </h2>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Tên sản phẩm</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Đề thi thử THPT..."
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow text-slate-800"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1">
                Giá gốc (Original Price)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="number"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value)}
                  placeholder="VD: 100000"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow text-slate-800"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1">
                Giá bán (Sale Price)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="number"
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value)}
                  placeholder="VD: 80000"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow text-slate-800"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1">
              Môn học
            </label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow text-slate-800 bg-white"
              >
                {SUBJECTS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1">
              Khối lớp
            </label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow text-slate-800 bg-white"
              >
                {GRADES.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1">
                Dung lượng File
              </label>
              <div className="relative">
                <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={fileSize}
                  onChange={(e) => setFileSize(e.target.value)}
                  placeholder="VD: 2.5 MB"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow text-slate-800"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1">
                Số trang xem thử
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="number"
                  value={previewPagesCount}
                  onChange={(e) => setPreviewPagesCount(e.target.value)}
                  placeholder="VD: 5"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow text-slate-800"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1">
              Loại tài liệu
            </label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow text-slate-800 bg-white"
              >
                {DOC_TYPES.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="isDynamic"
              checked={isDynamic}
              onChange={(e) => setIsDynamic(e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
            />
            <label htmlFor="isDynamic" className="text-sm font-medium text-slate-700 cursor-pointer">
              Gói Season Pass (Cập nhật liên tục)
            </label>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Mô tả chi tiết
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nhập mô tả chi tiết tài liệu, nội dung nổi bật..."
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-shadow text-slate-800"
              rows={4}
            />
          </div>
        </div>

        {/* Cột phải: Upload File & Submit */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6">
              <UploadCloud className="w-5 h-5 text-blue-500" /> Tải lên tài liệu & Ảnh bìa
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Ảnh bìa */}
              <div className="col-span-1 md:col-span-2 relative p-5 rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/50 transition-colors group cursor-pointer">
                <label className="block cursor-pointer">
                  <span className="block text-sm font-bold text-slate-800 mb-3">
                    Ảnh bìa (Cover Image)
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setImageFile(file);
                        if (imagePreview) URL.revokeObjectURL(imagePreview);
                        setImagePreview(URL.createObjectURL(file));
                      } else {
                        setImageFile(null);
                        setImagePreview(null);
                      }
                    }}
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 transition-colors file:cursor-pointer cursor-pointer"
                  />
                </label>
                {imagePreview && (
                  <div className="mt-4">
                    <img src={imagePreview} alt="Preview" className="w-32 h-40 object-cover rounded-md border border-slate-200 shadow-sm" />
                  </div>
                )}
                <div className="mt-4 pt-3 border-t border-slate-200/60">
                  <p className="text-[11px] text-slate-500">Lưu ý: Đảm bảo bạn đã tạo bucket "product-images" ở chế độ Public trên Supabase.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Ô 1: Preview File */}
              <div className="relative p-5 rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/50 transition-colors group cursor-pointer">
                <label className="block cursor-pointer">
                  <span className="block text-sm font-bold text-slate-800 mb-3">
                    Bản Xem Thử (Preview)
                  </span>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setPreviewFile(e.target.files?.[0] || null)}
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 transition-colors file:cursor-pointer cursor-pointer"
                  />
                </label>
                <div className="mt-4 pt-3 border-t border-slate-200/60">
                  <p className="text-[11px] text-slate-500">File PDF. Khóa tải xuống tự động.</p>
                </div>
              </div>

              {/* Ô 2: Source File */}
              <div className="relative p-5 rounded-xl border-2 border-dashed border-slate-300 hover:border-emerald-400 bg-slate-50/50 hover:bg-emerald-50/50 transition-colors group cursor-pointer">
                <label className="block cursor-pointer">
                  <span className="block text-sm font-bold text-slate-800 mb-3">
                    Bản Gốc (Source) *
                  </span>
                  <input
                    type="file"
                    accept=".zip,.rar,.docx,.doc,.pdf"
                    onChange={(e) => setSourceFile(e.target.files?.[0] || null)}
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-100 file:text-emerald-700 hover:file:bg-emerald-200 transition-colors file:cursor-pointer cursor-pointer"
                    required
                  />
                </label>
                <div className="mt-4 pt-3 border-t border-slate-200/60">
                  <p className="text-[11px] text-slate-500">Bản chuẩn để bán cho khách hàng.</p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-bold text-slate-800 mb-2">
                Danh sách file bao gồm (Table of Contents)
              </label>
              <textarea
                value={includedFiles}
                onChange={(e) => setIncludedFiles(e.target.value)}
                placeholder="Nhập mỗi file trên một dòng. Ví dụ:&#10;Đề thi số 1&#10;Đề thi số 2"
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-shadow text-slate-800 min-h-[120px]"
                rows={5}
              />
              <p className="text-[11px] text-slate-500 mt-1">Lưu ý: Xuống dòng để tách biệt các file cho đẹp mắt trên trang chi tiết.</p>
            </div>
          </div>

          {message && (
            <div className={`p-4 rounded-xl flex items-start gap-3 border ${message.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'} animate-in fade-in slide-in-from-bottom-2`}>
              {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-600" /> : <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600" />}
              <p className="text-sm font-medium leading-relaxed">{message.text}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center py-4 px-6 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg disabled:shadow-none text-lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                Đang xử lý (Đang tải ảnh, tài liệu lên Drive và lưu dữ liệu)...
              </>
            ) : (
              "Lưu Sản Phẩm"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
