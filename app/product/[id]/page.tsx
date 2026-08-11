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
      "id, name, category, grade, original_price, sale_price, image_url, preview_url, view_count, description, included_files, category_id, is_dynamic, drive_file_id, categories(name), created_at, file_size, tab_intro, tab_content, tab_audience"
    )
    .eq("id", id)
    .single();

  if (error) console.error("Supabase query error:", error);
  if (error || !data) return dummyProducts.find((p) => p.id === id) ?? null;

  const dummy = dummyProducts.find((p) => p.id === id);
  return dummy ? { ...dummy, ...data, included_files: data.included_files ?? null } : data;
}

async function getRelatedProducts(
  categoryId: string | null,
  categoryName: string,
  grade: string | number | null,
  excludeId: string
) {
  const supabase = getSupabaseServerClient();
  let query = supabase
    .from("products")
    .select("id, name, category, grade, original_price, sale_price, image_url, preview_url, view_count, is_dynamic, drive_file_id")
    .neq("id", excludeId)
    .limit(12);

  if (categoryId) {
    query = query.eq("category_id", categoryId);
  } else {
    query = query.eq("category", categoryName);
  }

  if (grade !== null && grade !== undefined) query = query.eq("grade", grade);

  const { data, error } = await query;
  if (error || !data || data.length === 0) {
    return dummyProducts.filter((p) => p.category === categoryName && p.id !== excludeId).slice(0, 12);
  }
  return data;
}

const FEATURE_CARDS = [
  { icon: <FileText className="w-4 h-4 text-blue-600 mb-1" />, label: "File Word/PPT" },
  { icon: <Edit className="w-4 h-4 text-blue-600 mb-1" />, label: "Dễ dàng chỉnh sửa" },
  { icon: <ShieldCheck className="w-4 h-4 text-blue-600 mb-1" />, label: "Có lời giải chi tiết" },
  { icon: <GraduationCap className="w-4 h-4 text-blue-600 mb-1" />, label: "Chuẩn SGK mới" },
  { icon: <DownloadCloud className="w-4 h-4 text-blue-600 mb-1" />, label: "Tải file về tức thì" },
];

function RelatedProductCard({ product }: { product: any }) {
  const currentPrice = product.sale_price ?? product.original_price ?? 0;
  const oldPrice = product.original_price ?? currentPrice;
  const discount = oldPrice > currentPrice ? Math.round(100 - (currentPrice / oldPrice * 100)) : 0;

  return (
    <div className="bg-white rounded-xl border border-gray-100 hover:shadow-md flex flex-col p-2 transition-shadow relative group h-full">
      {/* Top Tags & Image */}
      <div className="relative w-full h-[130px] mb-2 flex flex-col shrink-0">
        <div className="absolute top-0 left-0 right-0 flex justify-between items-start z-10 pointer-events-none">
          {product.grade ? (
            <div className="bg-blue-50 text-[#0066cc] text-[9px] font-bold px-1.5 py-0.5 rounded-none pointer-events-auto leading-none">
              {product.grade}
            </div>
          ) : <div />}
          {discount > 0 && (
            <div className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-none pointer-events-auto leading-none">
              -{discount}%
            </div>
          )}
        </div>

        <Link href={`/product/${product.id}`} className="w-full h-full flex items-center justify-center pt-5 pb-0 px-2">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="max-w-full max-h-full object-contain drop-shadow-sm group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="text-slate-300 font-medium text-xs">IMG</div>
          )}
        </Link>
      </div>

      {/* Title */}
      <Link href={`/product/${product.id}`} className="text-[12px] font-bold text-gray-800 line-clamp-2 mt-0.5 group-hover:text-[#0066cc] transition-colors leading-snug">
        {product.name}
      </Link>

      {/* Secondary Info */}
      <div className="flex items-center gap-4 mt-1.5 text-gray-500 text-[10px] font-medium shrink-0">
        <div className="flex items-center gap-0.5">
          <div className="w-3 h-3 rounded bg-gray-100 flex items-center justify-center font-bold text-[7px]">W</div>
          100% Word
        </div>
        <div className="flex items-center gap-0.5">
          <CheckCircle2 className="w-2.5 h-2.5" />
          Có đáp án
        </div>
      </div>

      {/* Pricing & Cart */}
      <div className="flex items-center justify-between mt-auto pt-2 shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="text-red-500 font-bold text-[13px] leading-none">
            {formatCurrencyVND(currentPrice)}
          </span>
          {oldPrice > currentPrice && (
            <span className="text-gray-400 line-through text-[10px] leading-none">
              {formatCurrencyVND(oldPrice)}
            </span>
          )}
        </div>
        <button className="text-[#0066cc] bg-[#0066cc]/10 hover:bg-[#0066cc]/20 p-1 rounded-md transition-colors shrink-0 ml-1">
          <ShoppingCart className="w-3 h-3" />
        </button>
      </div>

      {/* CTA Button */}
      <Link href={`/product/${product.id}`} className="mt-2 w-[80%] border border-yellow-400 text-yellow-500 hover:bg-yellow-50 py-0.5 rounded text-[11px] font-bold flex items-center justify-center gap-1 transition-colors shrink-0 self-start">
        Xem chi tiết <ChevronRight className="w-2.5 h-2.5" />
      </Link>
    </div>
  );
}

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
  const oldPrice = product.original_price ?? Math.round((product.sale_price ?? 0) / 0.8);
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
    // Push a 3rd image (duplicate of pdf thumbnail) to act as the "View more pages" trigger
    galleryImages.push(pdfThumbnail);
  }
  const filteredImages = galleryImages.filter(Boolean);

  const finalTabIntro = (product as any).tab_intro ?? (product as any).description ?? "";
  const tabContent = (product as any).tab_content ?? "";
  const tabAudience = (product as any).tab_audience ?? "";
  const includedFiles = (product as any).included_files ?? null;

  const relatedProducts = await getRelatedProducts(
    (product as any).category_id ?? null,
    category,
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
        <nav className="flex items-center gap-2 text-[12px] text-[#777] mb-4">
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
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 lg:gap-10 items-start">

          {/* =====================================================
              CỘT TRÁI (3/4)
          ====================================================== */}
          <div className="lg:col-span-7 flex flex-col gap-5">

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
                    <h1 className="text-2xl font-bold text-gray-900 leading-snug line-clamp-2 mb-3">
                      {product.name}
                    </h1>

                    {/* Rating */}
                    <div className="flex items-center flex-wrap gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-[#FBBF24] text-[#FBBF24]" />
                          ))}
                        </div>
                        <span className="text-sm font-bold text-[#EF4444]">4.9</span>
                        <span className="text-sm text-[#94A3B8]">(128 đánh giá)</span>
                      </div>
                    </div>

                    {/* Feature Boxes */}
                    <div className="grid grid-cols-5 gap-3 lg:gap-4 mb-4">
                      {FEATURE_CARDS.map((card, i) => (
                        <div key={i} className="flex flex-col items-center justify-center text-center px-3 py-2.5 border border-gray-200 rounded-xl bg-white hover:border-blue-300 hover:shadow-sm transition-all h-full">
                          {card.icon}
                          <span className="text-[10px] text-gray-800 leading-[1.3] text-center mt-1">
                            {card.label}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Pricing */}
                    <div className="flex items-center gap-3 mt-4 mb-4 flex-wrap">
                      <span className="text-3xl font-bold text-[#EF4444] leading-none tracking-tight">
                        {formatCurrencyVND(product.sale_price)}
                      </span>
                      <span className="text-sm font-medium text-[#94A3B8] line-through leading-none">
                        {formatCurrencyVND(oldPrice)}
                      </span>
                      <span className="px-2 py-1 bg-[#16A34A]/10 text-[#16A34A] text-[11px] font-bold rounded-full flex items-center leading-none">
                        Tiết kiệm 20%
                      </span>
                    </div>
                  </>
                }
                actionContent={
                  <div className="flex flex-col pt-1">
                    {/* CTA Buttons */}
                    <ProductDetailActions product={product} previewHref={previewHref} />

                    {/* Quick Meta */}
                    <div className="flex flex-row items-center justify-between w-full bg-blue-50/50 p-2 rounded-lg mt-3 text-[11px] text-gray-600">
                      <span className="flex items-center gap-1 whitespace-nowrap">
                        <CalendarDays className="w-3 h-3 text-[#94A3B8]" />
                        Cập nhật: <strong className="text-[#0F172A] ml-1">{publishDate}</strong>
                      </span>
                      <span className="flex items-center gap-1 whitespace-nowrap">
                        <HardDrive className="w-3 h-3 text-[#94A3B8]" />
                        Dung lượng: <strong className="text-[#0F172A] ml-1">{fileSize}</strong>
                      </span>
                      <span className="flex items-center gap-1 whitespace-nowrap">
                        <User className="w-3 h-3 text-[#94A3B8]" />
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
            <div className="grid grid-cols-2 md:grid-cols-4 bg-white rounded-xl border border-[#ECECEC] shadow-sm py-2 px-3 gap-2">
              <div className="flex flex-col items-center justify-center text-center border-b md:border-b-0 border-r-0 md:border-r border-[#ECECEC] pb-2 md:pb-0">
                <div className="flex items-center gap-1 mb-1">
                  <Star className="w-4 h-4 fill-[#FBBF24] text-[#FBBF24]" />
                  <span className="text-lg font-bold text-[#0F172A] leading-none">4.9<span className="text-xs text-[#94A3B8]">/5</span></span>
                </div>
                <span className="text-[11px] text-gray-500 font-medium">(128 đánh giá)</span>
              </div>
              <div className="flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-[#ECECEC] pb-2 md:pb-0">
                <div className="flex items-center gap-1 mb-1 text-[#2563EB]">
                  <User className="w-4 h-4" />
                  <span className="text-lg font-bold text-[#0F172A] leading-none">3.251+</span>
                </div>
                <span className="text-[11px] text-gray-500 font-medium">Lượt tải</span>
              </div>
              <div className="flex flex-col items-center justify-center text-center border-r-0 md:border-r border-[#ECECEC] pt-2 md:pt-0">
                <div className="flex items-center gap-1 mb-1 text-[#EF4444]">
                  <span className="text-base">🔥</span>
                  <span className="text-lg font-bold text-[#0F172A] leading-none">128</span>
                </div>
                <span className="text-[11px] text-gray-500 font-medium">Lượt mua tuần này</span>
              </div>
              <div className="flex flex-col items-center justify-center text-center pt-2 md:pt-0">
                <div className="flex items-center gap-1 mb-1 text-[#16A34A]">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-lg font-bold text-[#0F172A] leading-none">1000+</span>
                </div>
                <span className="text-[11px] text-gray-500 font-medium">Giáo viên tin dùng</span>
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

          </div>{/* end lg:col-span-8 */}

          {/* =====================================================
            CỘT PHẢI (1/4)
        ====================================================== */}
          <div className="lg:col-span-3 flex flex-col gap-5">

            {/* Widget 1: HƯỚNG DẪN - HỖ TRỢ */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="divide-y divide-gray-100 p-1">
                <Link href="/huong-dan-mua" className="flex items-center gap-2.5 p-2.5 hover:bg-gray-50 transition-colors rounded-lg">
                  <div className="bg-blue-50 rounded-md p-1 shrink-0">
                    <BookOpen className="w-4 h-4 text-[#2563EB]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[13px] font-semibold text-gray-800">Hướng dẫn mua</span>
                    <span className="text-[11px] text-gray-500">Cách thanh toán, tải file</span>
                  </div>
                </Link>
                <a href="https://zalo.me" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 p-2.5 hover:bg-gray-50 transition-colors rounded-lg">
                  <div className="bg-blue-50 rounded-md p-1 shrink-0">
                    <MessageCircle className="w-4 h-4 text-[#2563EB]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[13px] font-semibold text-gray-800">Liên hệ hỗ trợ</span>
                    <span className="text-[11px] text-gray-500">Tư vấn qua Zalo 24/7</span>
                  </div>
                </a>
              </div>
            </div>

            {/* Widget 2: TẠI SAO CHỌN CHÚNG TÔI? */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm pb-3">
              <h3 className="text-[11px] font-bold text-gray-500 mb-2 px-3 pt-3 uppercase tracking-wider">
                Tại sao chọn chúng tôi?
              </h3>
              <ul className="flex flex-col gap-2 px-3">
                {[
                  { label: "Cam kết chất lượng", desc: "Tài liệu biên soạn tỉ mỉ, chuẩn đẹp." },
                  { label: "Thanh toán tự động", desc: "Quét mã QR chuyển khoản, nhận link tải tức thì." },
                  { label: "Dễ dàng chỉnh sửa", desc: "100% file Word/PowerPoint không khóa pass." },
                  { label: "CSKH tận tâm", desc: "Đội ngũ tư vấn và hỗ trợ trực tuyến 24/7." },
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2563EB] shrink-0 mt-0.5" />
                    <div className="flex flex-col">
                      <strong className="text-xs text-gray-800 leading-tight mb-0.5">{item.label}</strong>
                      <span className="text-[11px] text-gray-500 leading-tight">{item.desc}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Widget 3: ĐÁNH GIÁ TỪ GIÁO VIÊN */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
              <div className="px-3 pt-3 pb-2 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-gray-800 leading-none">4.9</span>
                  <div className="flex flex-col">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-[#FBBF24] text-[#FBBF24]" />
                      ))}
                    </div>
                    <span className="text-[10px] text-gray-500 font-medium mt-0.5">Trên 128 đánh giá</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col">
                <div className="p-3 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs shrink-0">
                      T
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-gray-800 leading-none">Thầy Nguyễn Quốc Tuấn</span>
                      <span className="text-[10px] text-gray-500 mt-0.5">Giáo viên Toán</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-700 leading-relaxed">
                    Tài liệu soạn rất kỹ, bám sát đề minh họa. Hình vẽ sắc nét, dễ dàng sử dụng để dạy thêm.
                  </p>
                </div>

                <div className="p-3 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-xs shrink-0">
                      H
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-gray-800 leading-none">Cô Lê Thị Hương</span>
                      <span className="text-[10px] text-gray-500 mt-0.5">Giáo viên Vật Lý</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-700 leading-relaxed">
                    Rất ưng ý, file tải về là Word nguyên bản, các công thức toán học gõ Mathtype cực kỳ cẩn thận.
                  </p>
                </div>
              </div>
            </div>

          </div>{/* end lg:col-span-1 */}

        </div>{/* end lg:grid-cols-12 */}

        {/* =====================================================
          RELATED PRODUCTS (FULL WIDTH)
        ====================================================== */}
        {relatedProducts.length > 0 && (
          <section className="mt-10 pt-8 border-t border-[#ECECEC]">
            <h2 className="text-[18px] font-bold text-[#0F172A] mb-5">
              Tài liệu khác cùng danh mục {category}{grade ? ` – ${grade}` : ""}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {relatedProducts.map((p) => (
                <RelatedProductCard key={p.id} product={p as any} />
              ))}
            </div>
          </section>
        )}
      </div>{/* end max-w-7xl mx-auto */}
    </div>
  );
}