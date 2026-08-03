import Image from "next/image";
import Link from "next/link";
import {
  Eye, ShoppingCart, CheckCircle2, MessageCircle,
  CalendarDays, HardDrive, User, FileText, ChevronRight, BookOpen, Star, ShieldCheck, Edit, GraduationCap, DownloadCloud
} from "lucide-react";

import { formatCurrencyVND } from "@/lib/format";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { dummyProducts } from "@/lib/dummy-products";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/product-card";
import { ProductTabs } from "./ProductTabs";
import { ProductGallery } from "./ProductGallery";
import { ProductDetailActions } from "./ProductDetailActions";

export const revalidate = 0;

type PageProps = {
  params: { id: string };
};

async function getProductById(id: string) {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      "id, name, category, grade, price, image_url, preview_url, view_count, description, included_files, category_id, is_dynamic, access_link, categories(name), created_at, file_size, tab_intro, tab_content, tab_audience"
    )
    .eq("id", id)
    .single();

  if (error) console.error("Supabase query error:", error);
  if (error || !data) return dummyProducts.find((p) => p.id === id) ?? null;

  const dummy = dummyProducts.find((p) => p.id === id);
  return dummy ? { ...dummy, ...data, included_files: data.included_files ?? null } : data;
}

async function getRelatedProducts(
  category: string,
  grade: string | number | null,
  excludeId: string
) {
  const supabase = getSupabaseServerClient();
  let query = supabase
    .from("products")
    .select("id, name, category, grade, price, image_url, preview_url, view_count, is_dynamic, access_link")
    .eq("category", category)
    .neq("id", excludeId)
    .limit(10);

  if (grade !== null && grade !== undefined) query = query.eq("grade", grade);

  const { data, error } = await query;
  if (error || !data || data.length === 0) {
    return dummyProducts.filter((p) => p.category === category && p.id !== excludeId).slice(0, 10);
  }
  return data;
}

const FEATURE_CARDS = [
  { icon: <FileText className="w-5 h-5 text-blue-600 mb-1.5" />, label: "File Word/PPT" },
  { icon: <Edit className="w-5 h-5 text-blue-600 mb-1.5" />, label: "Dễ dàng chỉnh sửa" },
  { icon: <ShieldCheck className="w-5 h-5 text-blue-600 mb-1.5" />, label: "Có lời giải chi tiết" },
  { icon: <GraduationCap className="w-5 h-5 text-blue-600 mb-1.5" />, label: "Chuẩn SGK mới" },
  { icon: <DownloadCloud className="w-5 h-5 text-blue-600 mb-1.5" />, label: "Tải file về tức thì" },
];

export default async function ProductDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const product = await getProductById(resolvedParams.id);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[#475569]">
        <p>Không tìm thấy sản phẩm.</p>
      </div>
    );
  }

  // ── Data derivation ──────────────────────────────────────────
  const category = (product as any).categories?.name ?? product.category ?? "Danh mục";
  const grade = product.grade ? `${product.grade}` : null;
  const isDynamic = (product as any).is_dynamic ?? false;
  const oldPrice = Math.round((product.price ?? 0) / 0.8);
  const publishDate = (product as any).created_at
    ? new Date((product as any).created_at).toLocaleDateString("vi-VN")
    : "N/A";
  const fileSize = (product as any).file_size ?? "N/A";
  const previewHref = (product as any).preview_url ?? "#";
  
  let pdfThumbnail = "";
  if (previewHref) {
    const match = previewHref.match(/[-\w]{25,}/);
    if (match && match[0] && match[0] !== "1-demo-preview-fallback") {
      pdfThumbnail = `https://drive.google.com/thumbnail?id=${match[0]}&sz=w800`;
    }
  }

  const galleryImages = [product.image_url];
  if (pdfThumbnail) {
    galleryImages.push(pdfThumbnail);
  }
  const filteredImages = galleryImages.filter(Boolean);

  const finalTabIntro = (product as any).tab_intro ?? (product as any).description ?? "";
  const tabContent = (product as any).tab_content ?? "";
  const tabAudience = (product as any).tab_audience ?? "";
  const includedFiles = (product as any).included_files ?? null;

  const relatedProducts = await getRelatedProducts(
    product.category ?? "",
    product.grade ?? null,
    product.id
  );

  // ── Render ───────────────────────────────────────────────────
  return (
    <div className="bg-white min-h-screen pb-20 md:pb-0 text-[#475569]">
      {/* =====================================================
          OUTER WRAPPER
      ====================================================== */}
      <div className="max-w-7xl mx-auto pt-0 pb-6 lg:pt-0 lg:pb-8 text-[14px]">
        {/* BREADCRUMB */}
        <nav className="flex items-center gap-2 text-[13px] text-[#777] mb-4">
          <Link href="/" className="hover:text-[#2563EB] transition-colors">Trang chủ</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href={`/category/${(product as any).category_id}`} className="hover:text-[#2563EB] transition-colors">{category}</Link>
          {grade && (
            <>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-[#0F172A]">{grade}</span>
            </>
          )}
        </nav>

        {/* =====================================================
            OUTER GRID: 3/4 content | 1/4 sidebar
        ====================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">

          {/* =====================================================
              CỘT TRÁI (3/4)
          ====================================================== */}
          <div className="lg:col-span-3 flex flex-col gap-5">

            {/* =====================================================
                MAIN HERO: Ảnh + Thông tin sản phẩm
            ====================================================== */}
            <div className="w-full">
              <ProductGallery
                images={filteredImages}
                productName={product.name}
                isDynamic={isDynamic}
                infoContent={
                  <>
                    {/* Category Tag */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="h-6 px-[10px] rounded-full bg-blue-50 text-[#2563EB] text-[12px] font-bold inline-flex items-center justify-center tracking-wide">
                        {grade || "Lớp 12"}
                      </span>
                    </div>

                    {/* Title */}
                    <h1 className="text-2xl font-bold text-[#0F172A] leading-snug line-clamp-2 mb-4">
                      {product.name}
                    </h1>

                    {/* Rating */}
                    <div className="flex items-center flex-wrap gap-4 mb-5">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i === 4 ? "fill-[#FBBF24]/50 text-[#FBBF24]" : "fill-[#FBBF24] text-[#FBBF24]"}`} />
                          ))}
                        </div>
                        <span className="font-bold text-[#EF4444]">4.9</span>
                        <span className="text-[#94A3B8]">(128 đánh giá)</span>
                      </div>
                    </div>

                    {/* Feature Boxes */}
                    <div className="grid grid-cols-5 gap-2 mb-5">
                      {FEATURE_CARDS.map((card, i) => (
                        <div key={i} className="flex flex-col items-center justify-center text-center p-2.5 border border-gray-200 rounded-xl bg-white hover:border-blue-300 hover:shadow-sm transition-all h-full">
                          {card.icon}
                          <strong className="font-bold text-[13px] text-gray-800 leading-tight mb-0.5">
                            {card.label}
                          </strong>
                        </div>
                      ))}
                    </div>

                    {/* Pricing */}
                    <div className="flex items-center gap-4 mt-auto flex-wrap">
                      <span className="text-3xl font-bold text-[#EF4444] leading-none tracking-tight">
                        {formatCurrencyVND(product.price)}
                      </span>
                      <span className="text-lg font-medium text-[#94A3B8] line-through leading-none">
                        {formatCurrencyVND(oldPrice)}
                      </span>
                      <span className="h-[26px] px-3 bg-[#16A34A]/10 text-[#16A34A] text-[12px] font-bold rounded-full flex items-center">
                        Tiết kiệm 20%
                      </span>
                    </div>
                  </>
                }
                actionContent={
                  <div className="flex flex-col h-full justify-end border-t border-[#ECECEC] pt-4 lg:border-t-0 lg:pt-0 lg:mt-0">
                    {/* CTA Buttons */}
                    <ProductDetailActions product={product} previewHref={previewHref} />

                    {/* Quick Meta */}
                    <div className="flex flex-row items-center justify-between w-full bg-blue-50/50 p-3 rounded-lg mt-4 text-[12px] text-gray-600">
                      <span className="flex items-center gap-1.5 whitespace-nowrap">
                        <CalendarDays className="w-3.5 h-3.5 text-[#94A3B8]" />
                        Cập nhật: <strong className="text-[#0F172A] ml-1">{publishDate}</strong>
                      </span>
                      <span className="flex items-center gap-1.5 whitespace-nowrap">
                        <HardDrive className="w-3.5 h-3.5 text-[#94A3B8]" />
                        Dung lượng: <strong className="text-[#0F172A] ml-1">{fileSize}</strong>
                      </span>
                      <span className="flex items-center gap-1.5 whitespace-nowrap">
                        <User className="w-3.5 h-3.5 text-[#94A3B8]" />
                        Tác giả: <strong className="text-[#0F172A] ml-1">Admin</strong>
                      </span>
                    </div>
                  </div>
                }
              />
            </div>

            {/* =====================================================
              SOCIAL PROOF STRIP
          ====================================================== */}
            <div className="grid grid-cols-2 md:grid-cols-4 bg-white rounded-xl border border-[#ECECEC] shadow-sm py-3 px-4 gap-4">
              <div className="flex flex-col items-center justify-center text-center border-b md:border-b-0 border-r-0 md:border-r border-[#ECECEC] pb-3 md:pb-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <Star className="w-5 h-5 fill-[#FBBF24] text-[#FBBF24]" />
                  <span className="text-lg font-bold text-[#0F172A] leading-none">4.9<span className="text-sm text-[#94A3B8]">/5</span></span>
                </div>
                <span className="text-xs text-gray-500 font-medium">(128 đánh giá)</span>
              </div>
              <div className="flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-[#ECECEC] pb-3 md:pb-0">
                <div className="flex items-center gap-1.5 mb-1 text-[#2563EB]">
                  <User className="w-5 h-5" />
                  <span className="text-lg font-bold text-[#0F172A] leading-none">3.251+</span>
                </div>
                <span className="text-xs text-gray-500 font-medium">Lượt tải</span>
              </div>
              <div className="flex flex-col items-center justify-center text-center border-r-0 md:border-r border-[#ECECEC] pt-3 md:pt-0">
                <div className="flex items-center gap-1.5 mb-1 text-[#EF4444]">
                  <span className="text-lg">🔥</span>
                  <span className="text-lg font-bold text-[#0F172A] leading-none">128</span>
                </div>
                <span className="text-xs text-gray-500 font-medium">Lượt mua tuần này</span>
              </div>
              <div className="flex flex-col items-center justify-center text-center pt-3 md:pt-0">
                <div className="flex items-center gap-1.5 mb-1 text-[#16A34A]">
                  <ShieldCheck className="w-5 h-5" />
                  <span className="text-lg font-bold text-[#0F172A] leading-none">1000+</span>
                </div>
                <span className="text-xs text-gray-500 font-medium">Giáo viên tin dùng</span>
              </div>
            </div>

            {/* =====================================================
              LOWER SECTION: TABS
          ====================================================== */}
            <div className="w-full">
              <ProductTabs
                tabIntro={finalTabIntro}
                tabContent={tabContent}
                tabAudience={tabAudience}
                includedFiles={includedFiles}
                product={product}
              />
            </div>

            {/* =====================================================
              RELATED PRODUCTS
          ====================================================== */}
            {relatedProducts.length > 0 && (
              <section className="pt-5 border-t border-[#ECECEC]">
                <h2 className="text-[18px] font-bold text-[#0F172A] mb-4">
                  Tài liệu khác cùng danh mục {category}{grade ? ` – ${grade}` : ""}
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {relatedProducts.map((p) => (
                    <ProductCard key={p.id} product={p as any} />
                  ))}
                </div>
              </section>
            )}

          </div>{/* end lg:col-span-3 */}

          {/* =====================================================
            CỘT PHẢI (1/4)
        ====================================================== */}
          <div className="lg:col-span-1 flex flex-col gap-5">

            {/* Widget 1: HƯỚNG DẪN - HỖ TRỢ */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="divide-y divide-gray-100 p-1">
                <Link href="/huong-dan-mua" className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors rounded-lg">
                  <div className="bg-blue-50 rounded-md p-1.5 shrink-0">
                    <BookOpen className="w-4 h-4 text-[#2563EB]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-800">Hướng dẫn mua</span>
                    <span className="text-xs text-gray-500">Cách thanh toán, tải file</span>
                  </div>
                </Link>
                <a href="https://zalo.me" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors rounded-lg">
                  <div className="bg-blue-50 rounded-md p-1.5 shrink-0">
                    <MessageCircle className="w-4 h-4 text-[#2563EB]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-800">Liên hệ hỗ trợ</span>
                    <span className="text-xs text-gray-500">Tư vấn qua Zalo 24/7</span>
                  </div>
                </a>
              </div>
            </div>

            {/* Widget 2: TẠI SAO CHỌN CHÚNG TÔI? */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm pb-4">
              <h3 className="text-xs font-bold text-gray-500 mb-3 px-4 pt-4 uppercase tracking-wider">
                Tại sao chọn chúng tôi?
              </h3>
              <ul className="flex flex-col gap-3 px-4">
                {[
                  { label: "Cam kết chất lượng", desc: "Tài liệu biên soạn tỉ mỉ, chuẩn đẹp, đưa vào giảng dạy được ngay." },
                  { label: "Thanh toán tự động", desc: "Quét mã QR chuyển khoản, nhận link tải tức thì mà không cần chờ." },
                  { label: "Dễ dàng chỉnh sửa", desc: "100% file Word/PowerPoint không khóa pass, tuỳ ý chỉnh sửa linh hoạt" },
                  { label: "CSKH tận tâm", desc: "Đội ngũ tư vấn và hỗ trợ trực tuyến 24/7." },
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
                    <div className="flex flex-col">
                      <strong className="text-[13px] text-gray-800 leading-tight mb-0.5">{item.label}</strong>
                      <span className="text-[12px] text-gray-500 leading-tight">{item.desc}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Widget 3: ĐÁNH GIÁ TỪ GIÁO VIÊN */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
              <div className="px-4 pt-4 pb-3 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold text-gray-800 leading-none">4.9</span>
                  <div className="flex flex-col">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-[#FBBF24] text-[#FBBF24]" />
                      ))}
                    </div>
                    <span className="text-[11px] text-gray-500 font-medium mt-0.5">Trên 128 đánh giá</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col">
                <div className="p-4 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm shrink-0">
                      T
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-gray-800 leading-none">Thầy Nguyễn Quốc Tuấn</span>
                      <span className="text-[11px] text-gray-500 mt-1">Giáo viên Toán</span>
                    </div>
                  </div>
                  <p className="text-[13px] text-gray-700 leading-relaxed">
                    Tài liệu soạn rất kỹ, bám sát đề minh họa. Hình vẽ sắc nét, dễ dàng sử dụng để dạy thêm.
                  </p>
                </div>

                <div className="p-4 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-sm shrink-0">
                      H
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-gray-800 leading-none">Cô Lê Thị Hương</span>
                      <span className="text-[11px] text-gray-500 mt-1">Giáo viên Vật Lý</span>
                    </div>
                  </div>
                  <p className="text-[13px] text-gray-700 leading-relaxed">
                    Rất ưng ý, file tải về là Word nguyên bản, các công thức toán học gõ Mathtype cực kỳ cẩn thận.
                  </p>
                </div>
              </div>
            </div>

          </div>{/* end lg:col-span-1 */}

        </div>{/* end lg:grid-cols-4 */}
      </div>{/* end max-w-7xl mx-auto */}
    </div>
  );
}