"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronDown, Menu, Phone, Search, X } from "lucide-react";

import { headerNavigationFallback } from "@/constants/navigation";
import { supabase } from "@/lib/supabase/client";

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  display_order: number | null;
  is_active: boolean | null;
};

export function Header() {
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [navigation, setNavigation] = useState(headerNavigationFallback);
  const [cmsHeaderLinks, setCmsHeaderLinks] = useState<{ id: string; title: string; slug: string }[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function hydrateNavigationFromDb() {
      try {
        const { data, error } = await supabase
          .from("categories")
          .select("id,name,slug,parent_id,display_order,is_active")
          .eq("is_active", true)
          .order("display_order", { ascending: true });

        if (error || !data || data.length === 0) {
          if (error) {
            console.error("Không thể tải categories cho header:", error.message);
          }
          return;
        }

        const categories = data as unknown as CategoryRow[];
        const bySlug = new Map(categories.map((c) => [c.slug, c]));
        const childrenOf = (parentId: string) =>
          categories
            .filter((c) => c.parent_id === parentId)
            .slice()
            .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));

        const next = {
          primary: headerNavigationFallback.primary.map((item) => {
            if ("items" in item) {
              const parent = bySlug.get(item.key);
              if (!parent) return item;
              const children = childrenOf(parent.id);
              if (children.length === 0) return item;
              return {
                key: item.key,
                label: item.label,
                items: children.map((c) => ({
                  key: c.slug,
                  label: c.name,
                  href: `/danh-muc/${c.slug}`,
                })),
              };
            }

            if ("columns" in item) {
              const nextColumns = item.columns.map((col) => {
                const parent = bySlug.get(col.key);
                if (!parent) return col;
                const children = childrenOf(parent.id);
                if (children.length === 0) return col;
                return {
                  key: col.key,
                  heading: parent.name || col.heading,
                  items: children.map((c) => ({
                    key: c.slug,
                    label: c.name,
                    href: `/danh-muc/${c.slug}`,
                  })),
                };
              }) as typeof item.columns;

              return {
                key: item.key,
                label: item.label,
                columns: nextColumns,
              };
            }

            return item;
          }),
        };

        if (isMounted) {
          setNavigation(next);
        }

        const { data: cmsData, error: cmsError } = await supabase
          .from("cms_pages")
          .select("id, title, slug")
          .eq("is_active", true)
          .eq("display_location", "header")
          .order("sort_order", { ascending: true });

        if (!cmsError && cmsData && isMounted) {
          setCmsHeaderLinks(cmsData);
        }
      } catch (e) {
        console.error("Lỗi hydrate menu header:", e);
      }
    }

    hydrateNavigationFromDb();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    function onScroll() {
      setIsScrolled(window.scrollY > 8);
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navTopLinks = navigation.primary.filter(
    (item) =>
      item.key === "huong-dan-mua" || item.key === "gioi-thieu",
  );

  const navBarLinks = navigation.primary.filter(
    (item) =>
      item.key === "tai-lieu-theo-mon" ||
      item.key === "de-thi-thu-tn-thptqg" ||
      item.key === "danh-gia-nang-luc-tu-duy" ||
      item.key === "de-luyen-thi-vao-10" ||
      item.key === "giao-an-cv5512-sgk-moi",
  );

  return (
    <header
      className={[
        "sticky top-0 z-40 bg-white text-slate-700 transition-all duration-300",
        isScrolled
          ? "bg-white/80 backdrop-blur-xl shadow-lg shadow-slate-200/60 border-b border-slate-200/60"
          : "shadow-sm border-b border-slate-100",
      ].join(" ")}
    >
      <div className="mx-auto flex w-full max-w-7xl flex-col px-4 md:px-6">
        <div className="flex items-center gap-4 py-1">
          {/* Logo + Search bar — bên trái */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <Link href="/" className="flex flex-shrink-0 items-center hover:opacity-90 transition-opacity duration-200">
              <Image
                src="/logo-giangdayso.png"
                alt="GiangDaySo.com - Tối ưu thời gian, nâng tầm bài giảng"
                width={320}
                height={120}
                priority
                unoptimized
                className="h-10 w-auto object-contain md:h-12"
              />
            </Link>

            {/* Search bar ngay cạnh logo */}
            <div className="relative hidden md:flex items-stretch w-72 lg:w-80 ml-6 lg:ml-12">
              <input
                type="search"
                placeholder="Tìm kiếm tài liệu, đề thi..."
                className="w-full rounded-l-lg border border-slate-300 border-r-0 bg-white py-1 px-3 text-[12px] text-slate-700 placeholder:text-slate-400 outline-none transition-all focus:border-[#1a7dd6]"
              />
              <button className="bg-[#0066cc] hover:bg-[#005bb5] px-3 rounded-r-lg text-white transition-colors flex items-center justify-center shadow-sm">
                <Search className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* CMS links (Giới thiệu...) — chiếm phần còn lại, căn giữa */}
          <div className="hidden lg:flex flex-1 items-center justify-center gap-5">
            {cmsHeaderLinks.map((item) => (
              <Link
                key={item.id}
                href={`/${item.slug}`}
                className="uppercase font-bold text-[12px] text-gray-700 hover:text-[#0066cc] transition-colors whitespace-nowrap"
              >
                {item.title}
              </Link>
            ))}
          </div>

          {/* Hotline — bên phải */}
          <div className="hidden items-center gap-2 md:flex flex-shrink-0 ml-auto lg:ml-0">
            <div className="p-1 bg-[#f0f7ff] text-[#0066cc] rounded-full">
              <Phone className="h-3 w-3" />
            </div>
            <div className="flex flex-col text-left leading-tight">
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Hotline</span>
              <span className="text-[12px] font-black text-slate-800">1900 88 88</span>
            </div>
          </div>

          {/* Mobile buttons */}
          <div className="flex items-center gap-2 md:hidden ml-auto">
            <button
              type="button"
              onClick={() => setIsMobileSearchOpen((v) => !v)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-all duration-200 hover:bg-[#f0f7ff] hover:text-[#0066cc]"
              aria-label="Tìm kiếm"
            >
              {isMobileSearchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
            </button>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-all duration-200 hover:bg-[#f0f7ff] hover:text-[#0066cc]"
              aria-label="Mở menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>

        {isMobileSearchOpen ? (
          <div className="border-t border-slate-100 bg-white pb-3 pt-3 md:hidden">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                placeholder="Tìm kiếm tài liệu, đề thi..."
                className="w-full rounded-full border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-[13px] text-slate-700 placeholder:text-slate-400 outline-none transition-all duration-200 focus:bg-white focus:border-[#66a8e6]"
              />
            </div>
          </div>
        ) : null}
      </div>

      {/* Nav bar like in reference photo */}
      <div className="hidden border-t border-[#005bb5] bg-[#0066cc] lg:block">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <nav className="flex w-full items-center justify-between">
            <Link
              href="/"
              className="relative whitespace-nowrap px-3 py-2 text-[12px] font-bold text-white hover:bg-[#005bb5] hover:text-[#FDFD96] transition-all duration-200"
            >
              TRANG CHỦ
            </Link>

            {navBarLinks.map((item) => {
              if ("href" in item) {
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    className="relative whitespace-nowrap px-3 py-2 text-[12px] font-bold text-white hover:bg-[#005bb5] hover:text-[#FDFD96] transition-all duration-200"
                  >
                    {item.label}
                  </Link>
                );
              }

              if ("items" in item) {
                return (
                  <div key={item.key} className="group relative px-0.5 py-0.5">
                    <button
                      type="button"
                      className="relative inline-flex whitespace-nowrap items-center gap-1.5 px-3 py-2 text-[12px] font-bold text-white hover:bg-[#005bb5] hover:text-[#FDFD96] transition-all duration-200"
                    >
                      {item.label}
                      <ChevronDown className="h-3 w-3 opacity-100 transition-transform duration-300 group-hover:rotate-180" />
                    </button>

                    <div className="invisible absolute left-0 top-full z-30 pt-2 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100">
                      <div className="w-60 translate-y-2 rounded-2xl border border-slate-100 bg-white p-2 shadow-2xl shadow-slate-200/80 ring-1 ring-slate-100 transition-all duration-200 group-hover:translate-y-0">
                        {item.items.map((child) => (
                          <Link
                            key={child.key}
                            href={child.href}
                            className={[
                              "flex items-center rounded-xl px-3 py-2 text-[13px] font-medium text-slate-600 transition-all duration-200 hover:bg-gradient-to-r hover:from-[#f0f7ff] hover:to-indigo-50 hover:text-[#0066cc]",
                              item.key === "danh-gia-nang-luc-tu-duy"
                                ? "whitespace-normal leading-5"
                                : "whitespace-nowrap",
                            ].join(" ")}
                          >
                            <span className="mr-2 text-[#66a8e6]">›</span>
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div key={item.key} className="group relative px-0.5 py-0.5">
                  <button
                    type="button"
                    className="relative inline-flex whitespace-nowrap items-center gap-1.5 px-3 py-2 text-[12px] font-bold text-white hover:bg-[#005bb5] hover:text-[#FDFD96] transition-all duration-200"
                  >
                    {item.label}
                    <ChevronDown className="h-3 w-3 opacity-100 transition-transform duration-300 group-hover:rotate-180" />
                  </button>

                  <div className="invisible absolute left-0 top-full z-30 pt-2 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100">
                    <div className="w-max translate-y-2 rounded-2xl border border-slate-100 bg-white p-4 shadow-2xl shadow-slate-200/80 ring-1 ring-slate-100 transition-all duration-200 group-hover:translate-y-0">
                      <div className="grid grid-cols-2 gap-5">
                        {item.columns.map((col) => (
                          <div key={col.key} className="space-y-1">
                            <div className="mb-2 whitespace-nowrap text-[10px] font-extrabold tracking-widest text-[#0066cc] uppercase border-b border-[#cce0f5] pb-1.5">
                              {col.heading}
                            </div>
                            <div className="grid gap-0.5">
                              {col.items.map((link) => (
                                <Link
                                  key={link.key}
                                  href={link.href}
                                  className="flex items-center whitespace-nowrap rounded-lg px-2 py-1 text-[13px] font-medium text-slate-600 transition-all duration-200 hover:bg-gradient-to-r hover:from-[#f0f7ff] hover:to-indigo-50 hover:text-[#0066cc]"
                                >
                                  <span className="mr-2 text-[#66a8e6]">›</span>
                                  {link.label}
                                </Link>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
