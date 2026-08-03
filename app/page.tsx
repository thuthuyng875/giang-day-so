import { CatalogView } from "@/components/catalog-view";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { HeroSlider, Banner } from "@/components/home/HeroSlider";

type ProductRow = {
  id: string;
  name: string;
  category: string | null;
  grade?: number | null;
  price: number;
  image_url: string | null;
  preview_url?: string | null;
  view_count?: number | null;
  description?: string | null;
};

async function getProducts() {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, name, category, grade, price, image_url, preview_url, view_count, description")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as ProductRow[];
}

async function getBanners() {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("hero_banners")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Error fetching banners", error);
    return [];
  }

  return (data ?? []) as Banner[];
}

export default async function Home() {
  let products: ProductRow[] = [];
  let banners: Banner[] = [];
  let errorMessage = "";

  try {
    const [productsData, bannersData] = await Promise.all([
      getProducts(),
      getBanners()
    ]);
    products = productsData;
    banners = bannersData;
  } catch (error) {
    errorMessage =
      error instanceof Error ? error.message : "Không thể tải danh sách tài liệu.";
  }

  return (
    <section className="space-y-6">
      <div className="max-w-7xl mx-auto">
        <HeroSlider banners={banners} />
      </div>

      {errorMessage ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Lỗi tải danh sách tài liệu: {errorMessage}
        </div>
      ) : null}

      <CatalogView products={products} showSidebar={false} />
    </section>
  );
}
