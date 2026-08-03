"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, KeyRound, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

export default function AuthPortal() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setErrorMsg("Email hoặc mật khẩu không chính xác. Vui lòng thử lại.");
        setIsLoading(false);
        return;
      }

      const user = data?.user;
      if (!user) {
        setErrorMsg("Không thể lấy thông tin người dùng.");
        setIsLoading(false);
        return;
      }

      const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
      
      if (user.email === adminEmail) {
        // Thành công: Redirect tới trang Admin
        router.push("/workspace-manage");
        router.refresh();
      } else {
        // Không phải admin: Đăng xuất ngay và báo lỗi
        await supabase.auth.signOut();
        setErrorMsg("Bạn không có quyền truy cập khu vực này.");
      }
    } catch (err: any) {
      console.error("Login Exception:", err);
      setErrorMsg("Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        <div className="bg-slate-900 p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
          <div className="relative z-10 flex justify-center mb-4">
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
              <Lock className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white relative z-10">Cổng Quản Trị</h1>
          <p className="text-slate-400 mt-2 text-sm relative z-10">Khu vực dành riêng cho quản trị viên hệ thống</p>
        </div>

        <div className="p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-shadow text-slate-800 bg-slate-50 focus:bg-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Mật khẩu
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-shadow text-slate-800 bg-slate-50 focus:bg-white"
                  required
                />
              </div>
            </div>

            {errorMsg && (
              <p className="text-red-500 text-sm mt-2 text-center font-medium animate-in fade-in slide-in-from-top-2">
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center py-3 px-4 rounded-lg font-bold text-white bg-slate-900 hover:bg-slate-800 focus:ring-4 focus:ring-slate-900/20 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg disabled:shadow-none"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                "Đăng nhập hệ thống"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
