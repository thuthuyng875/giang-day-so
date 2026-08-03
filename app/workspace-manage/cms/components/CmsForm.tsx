"use client";

import { useState, useRef, useMemo } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Save, Loader2, ArrowLeft } from "lucide-react";
import { saveCmsPage, uploadCmsImage } from "../actions";
import Link from "next/link";
import 'react-quill-new/dist/quill.snow.css';

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

export default function CmsForm({ initialData = null }: { initialData?: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const quillRef = useRef<any>(null);

  const [formData, setFormData] = useState({
    id: initialData?.id || "",
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    content: initialData?.content || "",
    is_active: initialData?.is_active ?? false,
    display_location: initialData?.display_location || "none",
    sort_order: initialData?.sort_order || 0,
    meta_title: initialData?.meta_title || "",
    meta_description: initialData?.meta_description || "",
  });

  const generateSlug = (text: string) => {
    return text
      .toString()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove accents
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9 -]/g, "") // Remove invalid chars
      .replace(/\s+/g, "-") // Collapse whitespace and replace by -
      .replace(/-+/g, "-"); // Collapse dashes
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setFormData((prev) => ({
      ...prev,
      title: newTitle,
      slug: !initialData ? generateSlug(newTitle) : prev.slug,
    }));
  };

  const imageHandler = () => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = async () => {
      const file = input.files ? input.files[0] : null;
      if (!file) return;

      const fd = new FormData();
      fd.append("file", file);

      try {
        const url = await uploadCmsImage(fd);
        const editor = quillRef.current?.getEditor();
        if (editor) {
          const range = editor.getSelection();
          editor.insertEmbed(range?.index || 0, "image", url);
        }
      } catch (err) {
        console.error("Upload failed", err);
        alert("Có lỗi khi tải ảnh lên!");
      }
    };
  };

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        ["bold", "italic", "underline", "strike", "blockquote"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["link", "image"],
        ["clean"],
      ],
      handlers: {
        image: imageHandler,
      },
    },
  }), []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await saveCmsPage(formData);
      router.push("/workspace-manage/cms");
    } catch (err: any) {
      console.error(err);
      alert("Lỗi khi lưu trang: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/workspace-manage/cms" className="p-2 bg-white rounded-full border border-slate-200 hover:bg-slate-50 transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800">
              {initialData ? "Chỉnh sửa trang" : "Tạo trang mới"}
            </h1>
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center py-2.5 px-6 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          ) : (
            <Save className="w-5 h-5 mr-2" />
          )}
          Lưu Trang
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Khu vực Nội dung chính */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Nội dung chính</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Tiêu đề bài viết
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={handleTitleChange}
                  className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="Nhập tiêu đề..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Slug (Đường dẫn)
                </label>
                <div className="flex items-center">
                  <span className="px-4 py-2 bg-slate-100 border border-r-0 border-slate-300 rounded-l-xl text-slate-500">
                    /
                  </span>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="flex-1 px-4 py-2 rounded-r-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Nội dung
                </label>
                <div className="bg-white rounded-xl overflow-hidden border border-slate-300 [&_.ql-toolbar]:rounded-t-xl [&_.ql-container]:rounded-b-xl [&_.ql-editor]:min-h-[400px]">
                  <ReactQuill
                    ref={quillRef}
                    theme="snow"
                    value={formData.content}
                    onChange={(val) => setFormData({ ...formData, content: val })}
                    modules={modules}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Khu vực Hiển thị & Điều hướng */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Hiển thị & Điều hướng</h2>
            <div className="space-y-5">
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  />
                  <div className={`block w-14 h-8 rounded-full transition-colors ${formData.is_active ? 'bg-blue-600' : 'bg-slate-300'}`}></div>
                  <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${formData.is_active ? 'translate-x-6' : ''}`}></div>
                </div>
                <span className="font-semibold text-slate-700">Xuất bản trang này</span>
              </label>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Vị trí hiển thị menu
                </label>
                <select
                  value={formData.display_location}
                  onChange={(e) => setFormData({ ...formData, display_location: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="none">Không hiển thị</option>
                  <option value="header">Header (Menu chính)</option>
                  <option value="footer">Footer (Liên kết chân trang)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Thứ tự (Sort Order)
                </label>
                <input
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Khu vực Tối ưu SEO */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Tối ưu SEO</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Meta Title
                </label>
                <input
                  type="text"
                  value={formData.meta_title}
                  onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                  placeholder={formData.title || "Nhập thẻ title cho SEO..."}
                  className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-slate-500 mt-1">Tối ưu nhất dưới 60 ký tự</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Meta Description
                </label>
                <textarea
                  rows={4}
                  value={formData.meta_description}
                  onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                  placeholder="Mô tả nội dung trang cho Google Search..."
                  className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                ></textarea>
                <p className="text-xs text-slate-500 mt-1">Tối ưu nhất từ 150-160 ký tự</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
