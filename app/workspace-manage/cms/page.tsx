import Link from "next/link";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import { createClient } from "@/utils/supabase/server";

export const revalidate = 0; // Disable cache for admin page

export default async function CMSManagePage() {
  const supabase = await createClient();
  const { data: pages, error } = await supabase
    .from("cms_pages")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching CMS pages:", error);
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800">Quản lý Trang (CMS)</h1>
          <p className="text-slate-500 mt-1">Quản lý nội dung các trang tĩnh của hệ thống</p>
        </div>
        <Link
          href="/workspace-manage/cms/add"
          className="inline-flex items-center justify-center py-2 px-4 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          <PlusCircle className="w-5 h-5 mr-2" />
          Thêm Trang mới
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th scope="col" className="px-6 py-4 font-semibold">Tiêu đề</th>
                <th scope="col" className="px-6 py-4 font-semibold">Slug (Đường dẫn)</th>
                <th scope="col" className="px-6 py-4 font-semibold">Trạng thái</th>
                <th scope="col" className="px-6 py-4 font-semibold">Vị trí hiển thị</th>
                <th scope="col" className="px-6 py-4 font-semibold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {pages && pages.length > 0 ? (
                pages.map((page) => (
                  <tr key={page.id} className="bg-white border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {page.title}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      /{page.slug}
                    </td>
                    <td className="px-6 py-4">
                      {page.is_active ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                          Đã xuất bản
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                          Bản nháp
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {page.display_location === 'header' ? 'Header' : 
                       page.display_location === 'footer' ? 'Footer' : 'Không hiển thị'}
                      {page.display_location !== 'none' && ` (Thứ tự: ${page.sort_order})`}
                    </td>
                    <td className="px-6 py-4 text-right space-x-3">
                      <Link
                        href={`/workspace-manage/cms/${page.id}`}
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                      >
                        <Edit className="w-4 h-4 mr-1" /> Sửa
                      </Link>
                      <button className="inline-flex items-center text-red-600 hover:text-red-800 font-medium">
                        <Trash2 className="w-4 h-4 mr-1" /> Xóa
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    Chưa có trang nào. Hãy tạo trang đầu tiên!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
