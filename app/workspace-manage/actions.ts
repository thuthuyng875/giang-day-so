"use server";

import { getSupabaseServerClient } from "@/lib/supabase/server";
import { createClient } from "@/utils/supabase/server";

export async function createProductAction(newProduct: any) {
  // BẢO MẬT: Kiểm tra quyền Admin trước khi cho phép insert
  const authClient = await createClient();
  const { data: { user }, error: authError } = await authClient.auth.getUser();

  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  if (authError || !user || user.email !== adminEmail) {
    throw new Error("Unauthorized: Bạn không có quyền thực hiện thao tác này.");
  }

  // Nếu hợp lệ, sử dụng Service Role để bypass RLS
  const supabase = getSupabaseServerClient();
  
  const { data, error } = await supabase
    .from("products")
    .insert([newProduct])
    .select()
    .single();
    
  if (error) {
    throw new Error(error.message);
  }
  
  return data;
}
