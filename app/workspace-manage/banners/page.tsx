import { BannerManager } from "./components/BannerManager";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function BannersPage() {
  const supabase = getSupabaseServerClient();
  const { data: initialBanners, error } = await supabase
    .from("hero_banners")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100">
          Lỗi tải danh sách banner: {error.message}. Hãy đảm bảo bạn đã chạy script tạo bảng SQL trong Supabase.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800">Quản lý Banner Trang chủ</h1>
        <p className="text-slate-500 mt-1">Thay đổi nội dung, thứ tự hoặc tải lên các hình ảnh Carousel (Hero Banner) mới.</p>
      </div>

      <BannerManager initialBanners={initialBanners || []} />
    </div>
  );
}
