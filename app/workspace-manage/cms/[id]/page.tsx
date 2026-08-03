import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import CmsForm from "../components/CmsForm";

export default async function EditCmsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  
  const { data: page, error } = await supabase
    .from("cms_pages")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !page) {
    notFound();
  }

  return (
    <div className="max-w-6xl mx-auto">
      <CmsForm initialData={page} />
    </div>
  );
}
