"use client";

import { useMemo, useState } from "react";
import { ProductCard } from "@/components/product-card";
import { dummyProducts as dummyProductsFromLib } from "@/lib/dummy-products";

type ProductRow = {
  id: string;
  name: string;
  category: string | null;
  grade?: number | null;
  preview_url?: string | null;
  view_count?: number | null;
  download_count?: number | null;
  price: number;
  image_url: string | null;
  is_dynamic?: boolean;
  drive_file_id?: string;
  description?: string | null;
};

type CatalogViewProps = {
  products: ProductRow[];
  showSidebar?: boolean; // Kept for backwards compatibility if used elsewhere
};

export function CatalogView({ products }: CatalogViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const dataSource = products.length > 0 ? products : dummyProductsFromLib;

  // Derive categories
  const categories = useMemo(() => {
    return [...new Set(dataSource.map((item) => item.category).filter(Boolean))].sort(
      (a, b) => String(a).localeCompare(String(b), "vi"),
    ) as string[];
  }, [dataSource]);

  const filteredProducts = useMemo(() => {
    return dataSource.filter((product) => {
      const matchCategory = !selectedCategory || product.category === selectedCategory;
      return matchCategory;
    });
  }, [selectedCategory, dataSource]);

  // Simulated sections
  const bestSellers = dataSource.slice(0, 4);
  const latestDocs = dataSource.slice(4, 8);

  return (
    <div className="space-y-8 py-2">
      {/* Best Sellers Section */}
      <section>
        <div className="mb-5 flex items-center gap-4">
          <div className="flex flex-col">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-widest text-orange-500 uppercase mb-1">
              <span className="inline-block h-2 w-2 rounded-full bg-orange-400"></span>
              Nổi bật
            </span>
            <h2 className="text-lg font-extrabold text-slate-800 tracking-tight uppercase">
              Sản phẩm bán chạy
            </h2>
          </div>
          <div className="ml-auto h-px flex-1 bg-gradient-to-r from-orange-200 to-transparent"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bestSellers.map((product) => (
            <ProductCard key={product.id} product={product} layout="horizontal" />
          ))}
        </div>
      </section>

      {/* Latest Documents Section */}
      <section>
        <div className="mb-5 flex items-center gap-4">
          <div className="flex flex-col">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-widest text-blue-500 uppercase mb-1">
              <span className="inline-block h-2 w-2 rounded-full bg-blue-400"></span>
              Mới nhất
            </span>
            <h2 className="text-lg font-extrabold text-slate-800 tracking-tight uppercase">
              Sản phẩm mới nhất
            </h2>
          </div>
          <div className="ml-auto h-px flex-1 bg-gradient-to-r from-blue-200 to-transparent"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {latestDocs.map((product) => (
            <ProductCard key={product.id} product={product} layout="horizontal" />
          ))}
        </div>
      </section>

      {/* Explore by Subject Section (Dynamic Tabs) */}
      <section>
        <div className="mb-8 text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight mb-6 uppercase">
            Khám phá theo môn học
          </h2>
          
          <div className="flex flex-wrap justify-center gap-3 md:gap-4 max-w-4xl mx-auto">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`rounded-full px-5 py-2 text-[13px] md:text-sm font-bold transition-all duration-300 ${
                selectedCategory === null 
                  ? "bg-slate-800 text-white shadow-lg scale-105" 
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-800 hover:border-slate-300"
              }`}
            >
              Tất cả
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-5 py-2 text-[13px] md:text-sm font-bold transition-all duration-300 ${
                  selectedCategory === cat 
                    ? "bg-slate-800 text-white shadow-lg scale-105" 
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-800 hover:border-slate-300"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
            <p className="text-[14px]">Không có sản phẩm phù hợp với môn học này.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} layout="horizontal" />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
