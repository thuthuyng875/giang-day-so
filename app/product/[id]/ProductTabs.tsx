"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { FileListTable } from "./FileListTable";

interface ProductTabsProps {
  tabIntro?: string | null;
  tabContent?: string | null;
  tabAudience?: string | null;
  includedFiles?: string | null;
  product?: any;
}

const TABS = [
  { key: "intro", label: "GIỚI THIỆU" },
  { key: "content", label: "NỘI DUNG" },
  { key: "audience", label: "ĐỐI TƯỢNG" },
  { key: "guide", label: "HƯỚNG DẪN SỬ DỤNG" },
];

const PLACEHOLDERS: Record<string, string> = {
  intro: "Nội dung giới thiệu tài liệu đang được cập nhật.",
  content: "Danh mục nội dung chi tiết đang được cập nhật.",
  audience: "Thông tin về đối tượng phù hợp đang được cập nhật.",
  guide: "Hướng dẫn sử dụng tài liệu đang được cập nhật.",
};

function renderRichText(text: string) {
  const lines = text.split("\n").filter(Boolean);
  return (
    <div className="flex flex-col gap-1">
      {lines.map((line, i) => (
        <p key={i} className="text-[#475569] leading-[1.7]">{line}</p>
      ))}
    </div>
  );
}

export function ProductTabs({
  tabIntro,
  tabContent,
  tabAudience,
  includedFiles,
  product,
}: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState("intro");

  const tabContentMap: Record<string, string | null | undefined> = {
    intro: tabIntro,
    content: tabContent,
    audience: tabAudience,
    guide: null,
  };

  return (
    <div className="bg-white rounded-xl border border-[#ECECEC] p-6">
      {/* ── TAB NAV ── */}
      <div className="flex gap-6 border-b border-[#ECECEC] mb-6 overflow-x-auto scrollbar-hide">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`h-[48px] text-sm font-semibold whitespace-nowrap border-b-[3px] transition-all ${activeTab === tab.key
              ? "border-[#2563EB] text-[#2563EB]"
              : "border-transparent text-[#94A3B8] hover:text-[#475569]"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── TAB CONTENT ── */}
      <div className="flex flex-col w-full gap-8">

        {/* Top: Text content */}
        <div className="w-full flex flex-col gap-6">
          <div>
            <h3 className="text-base font-bold text-[#0F172A] mb-3">
              {activeTab === "intro" && "Giới thiệu tài liệu"}
              {activeTab === "content" && "Nội dung tài liệu"}
              {activeTab === "audience" && "Đối tượng phù hợp"}
              {activeTab === "guide" && "Hướng dẫn sử dụng"}
            </h3>
            <div className="text-[14px] leading-relaxed text-gray-600">
              {renderRichText(tabContentMap[activeTab] || PLACEHOLDERS[activeTab] || "")}
            </div>
          </div>
        </div>

        {/* Bottom: File list */}
        <div className="w-full">
          {includedFiles && (
            <div className="bg-white rounded-xl border border-[#ECECEC] p-5">
              <h3 className="text-base font-bold text-[#0F172A] mb-4">
                Danh sách file có trong bộ tài liệu
              </h3>
              <FileListTable includedFiles={includedFiles} product={product} />
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
