import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export default async function WorkspaceManageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth-portal");
  }

  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  if (user.email !== adminEmail) {
    redirect("/auth-portal");
  }

  return (
    <main className="p-4 md:p-8 min-h-screen bg-slate-50">
      {children}
    </main>
  );
}
