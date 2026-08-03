"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";


export async function saveCmsPage(data: any) {
  const supabase = await createClient();
  
  if (data.id) {
    const { error } = await supabase
      .from("cms_pages")
      .update({
        title: data.title,
        slug: data.slug,
        content: data.content,
        is_active: data.is_active,
        display_location: data.display_location,
        sort_order: data.sort_order,
        meta_title: data.meta_title,
        meta_description: data.meta_description,
      })
      .eq("id", data.id);
      
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase
      .from("cms_pages")
      .insert([{
        title: data.title,
        slug: data.slug,
        content: data.content,
        is_active: data.is_active,
        display_location: data.display_location,
        sort_order: data.sort_order,
        meta_title: data.meta_title,
        meta_description: data.meta_description,
      }]);
      
    if (error) throw new Error(error.message);
  }

  revalidatePath("/workspace-manage/cms");
  revalidatePath("/");
  revalidatePath(`/${data.slug}`);
  
  return { success: true };
}

export async function uploadCmsImage(formData: FormData) {
  const supabase = await createClient();
  const file = formData.get("file") as File;
  
  if (!file) {
    throw new Error("No file provided");
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${crypto.randomUUID()}.${fileExt}`;
  const filePath = `cms/${fileName}`;

  const { data, error } = await supabase.storage
    .from("public") // Assuming there's a 'public' bucket. Or should we use 'images'? The prompt says "thông qua API Storage hiện tại".
    .upload(filePath, file);

  if (error) {
    throw new Error(error.message);
  }

  const { data: publicUrlData } = supabase.storage
    .from("public")
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
}
