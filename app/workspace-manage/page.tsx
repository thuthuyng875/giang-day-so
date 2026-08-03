import Link from "next/link";
import { PlusCircle, LayoutDashboard, Image as ImageIcon, FileText } from "lucide-react";

export default function WorkspaceDashboardPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center gap-3 border-b border-slate-200 pb-5">
        <div className="p-3 bg-slate-900 text-white rounded-xl shadow-md">
          <LayoutDashboard className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800">Trang Quản Trị Hệ Thống</h1>
          <p className="text-slate-500 mt-1">Tổng quan và điều hướng khu vực quản trị</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <h2 className="text-lg font-bold text-slate-800 mb-2">Thêm tài liệu mới</h2>
          <p className="text-sm text-slate-500 mb-6">
            Tải lên bản Xem thử, Bản gốc lên Google Drive và tạo bản ghi mới trên Supabase.
          </p>
          <Link
            href="/workspace-manage/add-product"
            className="inline-flex items-center justify-center w-full py-3 px-4 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            Đến trang Thêm mới
          </Link>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <h2 className="text-lg font-bold text-slate-800 mb-2">Quản lý Banner Trang chủ</h2>
          <p className="text-sm text-slate-500 mb-6">
            Cập nhật hình ảnh, đường dẫn và thứ tự các banner Carousel ở giao diện trang chủ.
          </p>
          <Link
            href="/workspace-manage/banners"
            className="inline-flex items-center justify-center w-full py-3 px-4 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
          >
            <ImageIcon className="w-5 h-5 mr-2" />
            Quản lý Banner
          </Link>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <h2 className="text-lg font-bold text-slate-800 mb-2">Quản lý Trang (CMS)</h2>
          <p className="text-sm text-slate-500 mb-6">
            Tạo và chỉnh sửa nội dung các trang thông tin (ví dụ: Giới thiệu, Chính sách, v.v.).
          </p>
          <Link
            href="/workspace-manage/cms"
            className="inline-flex items-center justify-center w-full py-3 px-4 rounded-xl font-bold text-white bg-purple-600 hover:bg-purple-700 transition-colors"
          >
            <FileText className="w-5 h-5 mr-2" />
            Đến trang CMS
          </Link>
        </div>
        
        {/* Placeholder for future features */}
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 border-dashed flex flex-col items-center justify-center text-center opacity-70">
          <p className="text-sm font-semibold text-slate-500">Tính năng sắp ra mắt</p>
          <p className="text-xs text-slate-400 mt-1">Quản lý Đơn hàng / Người dùng</p>
        </div>
      </div>
    </div>
  );
}
