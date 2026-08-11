import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, ChevronRight, CloudUpload, Download, Headphones, ShieldCheck, ShoppingCart, Flame, Clock, RefreshCw } from "lucide-react";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { formatCurrencyVND } from "@/lib/format";
import { HeroSlider, Banner } from "@/components/home/HeroSlider";
import { SubjectShowcase } from "@/components/SubjectShowcase";
import { ProductCardGrid } from "@/components/product-card-grid";

export const revalidate = 0;

// --- Types ---
type CategoryRow = {
  id: string;
  name: string;
  slug: string;
};


// --- Data Fetching ---
const POPULAR_CATEGORIES = [
  { id: "chuyen-de-bai-tap", name: "Chuyên đề bài tập", icon: "icon-chuyen-de.png.png", slug: "chuyen-de-bai-tap" },
  { id: "de-kiem-tra", name: "Đề kiểm tra GK - CK", icon: "icon-de-kiem-tra.png.png", slug: "de-kiem-tra" },
  { id: "on-thi-tn-thptqg", name: "Ôn thi TN THPTQG", icon: "icon-on-thi-tn-thptqg.png.png", slug: "on-thi-tn-thptqg" },
  { id: "on-thi-hsg", name: "Ôn thi HSG", icon: "icon-on-thi-hsg.png.png", slug: "on-thi-hsg" },
  { id: "bai-giang-powerpoint", name: "Bài giảng PowerPoint", icon: "icon-bai-giang-powerpoint.png.png", slug: "bai-giang-powerpoint" },
  { id: "giao-an-word", name: "Giáo án Word", icon: "icon-giao-an-word.png.png", slug: "giao-an-word" },
];

async function getBanners() {
  const supabase = getSupabaseServerClient();
  const { data } = await supabase
    .from("hero_banners")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  return (data || []) as Banner[];
}

async function getTopProducts() {
  const supabase = getSupabaseServerClient();
  const { data } = await supabase
    .from("products")
    .select("id, name, original_price, sale_price, image_url")
    .order("view_count", { ascending: false })
    .limit(3);
  return data || [];
}

async function getLatestProducts() {
  const supabase = getSupabaseServerClient();
  const { data } = await supabase
    .from("products")
    .select("id, name, grade, original_price, sale_price, image_url, preview_url")
    .order("created_at", { ascending: false })
    .limit(5);
  return data || [];
}

// --- Page Component ---
export default async function Home() {
  const [banners, topProducts, latestProducts] = await Promise.all([
    getBanners(),
    getTopProducts(),
    getLatestProducts(),
  ]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 pt-4 px-4 xl:px-0">
      {/* =====================================================
          SECTION 1: HERO (Categories + Dynamic Banner)
      ====================================================== */}
      <section className="flex flex-col lg:flex-row gap-6">
        {/* Left Column: Categories */}
        <div className="w-full lg:w-[300px] shrink-0 bg-white border border-gray-200 rounded-lg p-4 flex flex-col">
          <h2 className="text-[#0066cc] font-bold text-sm uppercase mb-4 text-center">
            Danh mục tài liệu phổ biến
          </h2>
          <div className="grid grid-cols-3 gap-2">
            {POPULAR_CATEGORIES.map((cat) => (
              <Link 
                key={cat.id} 
                href={`/danh-muc/${cat.slug}`}
                className="flex flex-col items-center justify-start text-center p-2 border border-transparent hover:border-blue-100 hover:bg-blue-50/50 rounded-lg transition-colors gap-1.5"
              >
                <img src={`/images/${cat.icon}`} alt={cat.name} className="w-10 h-10 object-contain" />
                <span className="text-[10px] font-semibold text-gray-700 leading-tight">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Right Column: Hero Banner */}
        <div className="flex-1 min-w-0 flex items-start justify-center">
          <HeroSlider banners={banners} />
        </div>
      </section>

      {/* =====================================================
          SECTION 2: HOT PRODUCTS (Sidebar + Main Grid)
      ====================================================== */}
      <section className="flex flex-col lg:flex-row gap-6">
        {/* Left Column: Top Viewed */}
        <div className="w-full lg:w-[300px] shrink-0 bg-white border border-gray-200 rounded-lg p-4 flex flex-col">
          <h2 className="text-[#0F172A] font-bold text-sm uppercase mb-4 text-center">
            Tài liệu xem nhiều nhất tuần
          </h2>
          <div className="flex flex-col gap-3">
            {topProducts.map((p: any, index: number) => {
              const price = p.sale_price ?? p.original_price ?? 0;
              return (
                <Link key={p.id} href={`/product/${p.id}`} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors group">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {index + 1}
                  </div>
                  <div className="w-10 h-14 bg-gray-100 rounded shrink-0 border border-gray-200 overflow-hidden flex items-center justify-center">
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[8px] text-gray-400">IMG</span>
                    )}
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-xs font-semibold text-gray-800 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                      {p.name}
                    </span>
                    <span className="text-red-500 font-bold text-xs mt-1">
                      {formatCurrencyVND(price)}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right Column: Latest Products */}
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex items-center gap-2 mb-4 px-1">
            <Flame className="w-5 h-5 text-red-500 fill-red-500" />
            <h2 className="text-[16px] font-bold text-[#0F172A] uppercase">
              Tài liệu hot mới cập nhật
            </h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 relative">
            {latestProducts.map((p: any) => (
              <ProductCardGrid key={p.id} product={p} />
            ))}
            
            {/* Fake Slider Arrow */}
            <button className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-white border border-gray-200 rounded-full items-center justify-center shadow hover:bg-gray-50 transition-colors z-10">
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      </section>

      {/* =====================================================
          SECTION 3: TRUST BADGES
      ====================================================== */}
      <section className="w-full bg-[#f4f7fe] rounded-2xl p-4 md:p-6 mb-6 mt-4">
        <h2 className="text-center text-[#1e3a8a] text-base md:text-lg font-bold mb-5">
          Vì sao giáo viên tin chọn GiangDaySo.com?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {/* Badge 1 */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm text-blue-600">
              <Clock className="w-5 h-5" />
            </div>
            <div className="flex flex-col pt-0.5">
              <span className="font-bold text-[13px] text-[#1e3a8a] mb-0.5">Tiết kiệm thời gian</span>
              <span className="text-xs text-slate-500 leading-snug">
                Tài liệu đầy đủ, chất lượng, giúp thầy cô chuẩn bị bài giảng nhanh hơn
              </span>
            </div>
          </div>
          
          {/* Badge 2 */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm text-blue-600">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div className="flex flex-col pt-0.5">
              <span className="font-bold text-[13px] text-[#1e3a8a] mb-0.5">Nội dung cập nhật</span>
              <span className="text-xs text-slate-500 leading-snug">
                Liên tục cập nhật tài liệu mới theo chương trình và kỳ thi mới nhất
              </span>
            </div>
          </div>
          
          {/* Badge 3 */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm text-blue-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="flex flex-col pt-0.5">
              <span className="font-bold text-[13px] text-[#1e3a8a] mb-0.5">Đảm bảo chất lượng</span>
              <span className="text-xs text-slate-500 leading-snug">
                Tài liệu được chọn lọc kỹ, bám sát chuẩn cấu trúc đề thi
              </span>
            </div>
          </div>
          
          {/* Badge 4 */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm text-blue-600">
              <Headphones className="w-5 h-5" />
            </div>
            <div className="flex flex-col pt-0.5">
              <span className="font-bold text-[13px] text-[#1e3a8a] mb-0.5">Hỗ trợ nhanh chóng</span>
              <span className="text-xs text-slate-500 leading-snug">
                Đội ngũ hỗ trợ tận tâm, giải đáp mọi thắc mắc 24/7
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          SECTION 4: SUBJECT SHOWCASE
      ====================================================== */}
      <SubjectShowcase />
    </div>
  );
}
