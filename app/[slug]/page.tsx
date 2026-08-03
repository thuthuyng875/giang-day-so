import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { Metadata } from "next";

export const revalidate = 60; // Cache for 60 seconds

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: page } = await supabase
    .from("cms_pages")
    .select("title, meta_title, meta_description")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!page) {
    return {
      title: "Trang không tồn tại",
    };
  }

  return {
    title: page.meta_title || page.title,
    description: page.meta_description || "",
  };
}

export default async function CmsDynamicPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: page, error } = await supabase
    .from("cms_pages")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error || !page) {
    notFound();
  }

  // Sanitize HTML: replace &nbsp; (non-breaking spaces \u00a0) with regular spaces.
  // Quill editor inserts &nbsp; when user presses space at certain positions,
  // causing browser to treat long phrases as one unbreakable word -> mid-word line cuts.
  const sanitizedContent = (page.content || "")
    .replace(/\u00a0/g, " ")       // non-breaking space -> regular space
    .replace(/&nbsp;/gi, " ");     // &nbsp; entity -> regular space

  return (
    <div className="-mx-4 md:-mx-6 bg-slate-50 min-h-screen py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <article className="bg-white rounded-2xl shadow-sm border border-slate-200">
          {/* Header bài viết */}
          <div className="px-8 pt-10 pb-6 border-b border-slate-100">
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight">
              {page.title}
            </h1>
          </div>
          {/* Nội dung bài viết */}
          <div className="px-8 py-8">
            <div
              className="cms-article"
              dangerouslySetInnerHTML={{ __html: sanitizedContent }}
            />
          </div>
        </article>
      </div>
    </div>
  );
}
