"use client";

import { useState, useRef } from "react";
import { supabase } from "@/lib/supabase/client";
import { Trash2, Upload, Plus, Image as ImageIcon, Link as LinkIcon, Power } from "lucide-react";
import Image from "next/image";

type Banner = {
  id: string;
  image_url: string;
  target_link: string | null;
  is_active: boolean;
  sort_order: number;
};

export function BannerManager({ initialBanners }: { initialBanners: Banner[] }) {
  const [banners, setBanners] = useState<Banner[]>(initialBanners);
  const [isUploading, setIsUploading] = useState(false);
  const [newLink, setNewLink] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      // 1. Upload to Storage
      const { error: uploadError, data } = await supabase.storage
        .from('banners')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('banners')
        .getPublicUrl(filePath);

      // 3. Insert into DB
      const { data: insertData, error: dbError } = await supabase
        .from('hero_banners')
        .insert([
          { 
            image_url: publicUrl, 
            target_link: newLink || null, 
            sort_order: banners.length,
            is_active: true
          }
        ])
        .select()
        .single();

      if (dbError) throw dbError;

      if (insertData) {
        setBanners([...banners, insertData as Banner]);
        setNewLink(""); // Reset
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
      
      alert("Tải lên banner thành công!");
    } catch (error: any) {
      alert("Lỗi tải lên: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleToggleActive = async (banner: Banner) => {
    try {
      const { error } = await supabase
        .from('hero_banners')
        .update({ is_active: !banner.is_active })
        .eq('id', banner.id);

      if (error) throw error;

      setBanners(banners.map(b => 
        b.id === banner.id ? { ...b, is_active: !b.is_active } : b
      ));
    } catch (error: any) {
      alert("Lỗi cập nhật trạng thái: " + error.message);
    }
  };

  const handleDelete = async (banner: Banner) => {
    if (!confirm("Bạn có chắc muốn xoá banner này không?")) return;

    try {
      // Xoá record trong db
      const { error: dbError } = await supabase
        .from('hero_banners')
        .delete()
        .eq('id', banner.id);

      if (dbError) throw dbError;

      // Trích xuất filename từ publicUrl để xoá trong storage (không bắt buộc nhưng nên làm để dọn rác)
      const urlParts = banner.image_url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      await supabase.storage.from('banners').remove([fileName]);

      setBanners(banners.filter(b => b.id !== banner.id));
    } catch (error: any) {
      alert("Lỗi xoá: " + error.message);
    }
  };

  const handleUpdateLink = async (banner: Banner, link: string) => {
      try {
        const { error } = await supabase
          .from('hero_banners')
          .update({ target_link: link })
          .eq('id', banner.id);
  
        if (error) throw error;
        setBanners(banners.map(b => b.id === banner.id ? { ...b, target_link: link } : b));
      } catch (error: any) {
        alert("Lỗi cập nhật link: " + error.message);
      }
  };

  const handleUpdateSort = async (banner: Banner, sort: number) => {
    try {
      const { error } = await supabase
        .from('hero_banners')
        .update({ sort_order: sort })
        .eq('id', banner.id);

      if (error) throw error;
      setBanners(banners.map(b => b.id === banner.id ? { ...b, sort_order: sort } : b).sort((a,b) => a.sort_order - b.sort_order));
    } catch (error: any) {
      alert("Lỗi cập nhật thứ tự: " + error.message);
    }
  };

  return (
    <div className="space-y-8">
      {/* Upload Form */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Upload className="w-5 h-5 text-blue-600" />
          Thêm Banner Mới
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Link Đích (Tuỳ chọn)</label>
            <div className="relative">
              <LinkIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="https://..."
                value={newLink}
                onChange={(e) => setNewLink(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Hình ảnh</label>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleUpload}
                disabled={isUploading}
                className="hidden"
                id="banner-upload"
              />
              <label
                htmlFor="banner-upload"
                className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-white transition-all cursor-pointer ${
                  isUploading ? "bg-slate-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {isUploading ? (
                  "Đang tải lên..."
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    Chọn và Tải ảnh lên
                  </>
                )}
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-sm border-b border-slate-200">
                <th className="py-4 px-6 font-semibold">Hình ảnh</th>
                <th className="py-4 px-6 font-semibold">Đường dẫn đích</th>
                <th className="py-4 px-6 font-semibold w-24 text-center">Thứ tự</th>
                <th className="py-4 px-6 font-semibold w-32 text-center">Trạng thái</th>
                <th className="py-4 px-6 font-semibold w-24 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {banners.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    Chưa có banner nào. Hãy tải lên ảnh mới!
                  </td>
                </tr>
              ) : (
                banners.map((banner) => (
                  <tr key={banner.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="relative w-40 h-20 rounded-lg overflow-hidden border border-slate-200 shadow-sm">
                        <Image
                          src={banner.image_url}
                          alt="Banner"
                          fill
                          className="object-cover"
                        />
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <input 
                          type="text" 
                          value={banner.target_link || ""}
                          onChange={(e) => setBanners(banners.map(b => b.id === banner.id ? { ...b, target_link: e.target.value } : b))}
                          onBlur={(e) => handleUpdateLink(banner, e.target.value)}
                          className="w-full text-sm py-1.5 px-3 border border-slate-200 rounded-md focus:border-blue-500 outline-none" 
                          placeholder="Không có link"
                      />
                    </td>
                    <td className="py-4 px-6 text-center">
                        <input 
                          type="number" 
                          value={banner.sort_order}
                          onChange={(e) => setBanners(banners.map(b => b.id === banner.id ? { ...b, sort_order: Number(e.target.value) } : b))}
                          onBlur={(e) => handleUpdateSort(banner, Number(e.target.value))}
                          className="w-16 text-center text-sm py-1.5 px-2 border border-slate-200 rounded-md focus:border-blue-500 outline-none" 
                      />
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => handleToggleActive(banner)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                          banner.is_active 
                            ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" 
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        <Power className="w-3.5 h-3.5" />
                        {banner.is_active ? "Đang Bật" : "Đã Tắt"}
                      </button>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleDelete(banner)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Xoá banner"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
