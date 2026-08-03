import Link from "next/link";
import { GraduationCap, Mail, MapPin, Phone } from "lucide-react";
import { createClient } from "@/utils/supabase/server";

const featuredLinks = [
  { label: "Giáo án CV5512", href: "#" },
  { label: "Đề thi thử THPT Quốc Gia", href: "#" },
  { label: "Đánh giá năng lực", href: "#" },
  { label: "Tài liệu theo môn", href: "#" },
] as const;

export async function Footer() {
  const supabase = await createClient();
  const { data: cmsPages } = await supabase
    .from("cms_pages")
    .select("id, title, slug")
    .eq("is_active", true)
    .eq("display_location", "footer")
    .order("sort_order", { ascending: true });

  const dynamicSupportLinks = cmsPages || [];

  return (
    <footer className="bg-slate-800 text-slate-200">
      <div className="mx-auto w-full max-w-7xl px-4 py-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500 text-white shadow-sm">
                <GraduationCap className="h-4 w-4" />
              </span>
              <span className="text-lg font-bold text-white">
                Tài Liệu Giảng Dạy 365
              </span>
            </Link>
            <p className="text-[13px] leading-relaxed text-slate-200">
              Nền tảng cung cấp tài liệu, giáo án và đề thi chất lượng cao dành
              cho giáo viên và học sinh toàn quốc. Cập nhật liên tục theo
              chương trình GDPT mới.
            </p>
          </div>

          <div>
            <h3 className="mb-3 text-[14px] text-white font-semibold">Thông tin hỗ trợ</h3>
            <ul className="space-y-2 text-[13px]">
              {dynamicSupportLinks.map((item) => (
                <li key={item.id}>
                  <Link
                    href={`/${item.slug}`}
                    className="transition-colors hover:text-orange-500"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-[14px] text-white font-semibold">Tài liệu nổi bật</h3>
            <ul className="space-y-2 text-[13px]">
              {featuredLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="transition-colors hover:text-orange-500"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-[14px] text-white font-semibold">Liên hệ</h3>
            <ul className="space-y-3 text-[13px]">
              <li className="flex gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <a
                  href="mailto:hotro@tailieugiangday365.com"
                  className="break-all transition-colors hover:text-orange-500"
                >
                  hotro@tailieugiangday365.com
                </a>
              </li>
              <li className="flex gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <span>09xx.xxx.xxx</span>
              </li>
              <li className="flex gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <span>Hà Nội, Việt Nam</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-800 pt-6 text-center text-[13px] text-slate-200">
          © 2026 Tài Liệu Giảng Dạy 365. Tất cả các quyền được bảo lưu.
        </div>
      </div>
    </footer>
  );
}
