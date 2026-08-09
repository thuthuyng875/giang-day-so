"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ProductCardGrid } from "@/components/product-card-grid";
import { supabase } from "@/lib/supabase/client";

// Types
type CategoryInfo = {
  name: string;
  slug: string;
  product_count: number;
};

// Utility to create a slug from a Vietnamese string
const slugify = (str: string) => {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
};

export function SubjectShowcase() {
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [products, setProducts] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);

  const ITEMS_PER_PAGE = 36;

  // 1. Fetch all available subjects and compute product counts
  useEffect(() => {
    async function fetchCategories() {
      setIsCategoriesLoading(true);
      try {
        // Fetch only subjects to compute categories
        const { data, error } = await supabase
          .from("products")
          .select("subject");

        if (error) throw error;

        if (data) {
          const counts: Record<string, number> = {};
          data.forEach((item) => {
            if (item.subject) {
              counts[item.subject] = (counts[item.subject] || 0) + 1;
            }
          });

          const cats = Object.keys(counts).map((subject) => ({
            name: subject,
            slug: slugify(subject),
            product_count: counts[subject],
          }));

          // Sort descending by product count
          cats.sort((a, b) => b.product_count - a.product_count);

          setCategories(cats);

          // Find 'Toán học' or just fallback to the first one
          const defaultSubject =
            cats.find((c) => c.slug.includes("toan-hoc")) || cats[0];
          
          if (defaultSubject) {
            setSelectedSubject(defaultSubject.name);
          }
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
      } finally {
        setIsCategoriesLoading(false);
      }
    }

    fetchCategories();
  }, []);

  // 2. Fetch products whenever selectedSubject or page changes
  useEffect(() => {
    if (!selectedSubject) return;

    async function fetchProducts() {
      setIsLoading(true);
      try {
        const start = page * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE - 1;

        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("subject", selectedSubject)
          .order("created_at", { ascending: false })
          .range(start, end);

        if (error) throw error;

        if (data) {
          if (page === 0) {
            setProducts(data);
          } else {
            setProducts((prev) => [...prev, ...data]);
          }

          if (data.length < ITEMS_PER_PAGE) {
            setHasMore(false);
          } else {
            setHasMore(true);
          }
        }
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProducts();
  }, [selectedSubject, page]);

  // Handle Tab Switch
  const handleTabClick = (subjectName: string) => {
    if (selectedSubject !== subjectName) {
      setSelectedSubject(subjectName);
      setPage(0);
      setProducts([]);
      setHasMore(true);
    }
  };

  if (isCategoriesLoading) {
    return (
      <div className="py-12 flex justify-center w-full">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  const selectedCategorySlug = slugify(selectedSubject);

  return (
    <section className="pb-8 w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <h2 className="text-[16px] font-bold text-[#0F172A] uppercase">Tài liệu theo môn học</h2>
        <Link href={`/danh-muc/${selectedCategorySlug}`} className="text-blue-600 text-xs font-medium hover:underline">
          Xem tất cả &gt;
        </Link>
      </div>

      {/* Category Tabs Wrapper */}
      <div 
        className="flex overflow-x-auto flex-nowrap gap-3 pb-4 w-full snap-x snap-mandatory px-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']"
      >
        {categories.map((category) => {
          const isActive = selectedSubject === category.name;
          return (
            <div
              key={category.slug}
              onClick={() => handleTabClick(category.name)}
              className={`flex-shrink-0 min-w-[100px] w-auto snap-start bg-white rounded-xl border px-3 py-2.5 cursor-pointer transition-all duration-300 ${
                isActive 
                  ? "border-blue-600 shadow-md ring-1 ring-blue-600/20" 
                  : "border-gray-200 hover:border-blue-300 hover:shadow-sm"
              }`}
            >
              <img 
                src={`/images/subjects/${category.slug}.png`} 
                alt={category.name} 
                className="w-8 h-8 mx-auto mb-1.5 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fallback = document.createElement('div');
                  fallback.className = 'w-8 h-8 mx-auto mb-1.5 bg-gray-100 rounded-full flex items-center justify-center text-[10px] text-gray-400 font-medium';
                  fallback.innerText = 'IMG';
                  e.currentTarget.parentElement?.insertBefore(fallback, e.currentTarget);
                }}
              />
              <div className="text-[13px] font-bold text-gray-900 text-center whitespace-nowrap" title={category.name}>
                {category.name}
              </div>
              <div className="text-[11px] text-gray-500 text-center mt-0.5">
                {category.product_count} tài liệu
              </div>
            </div>
          );
        })}
      </div>

      {/* Product Grid */}
      <div className="mt-8">
        {products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-4">
            {products.map((product) => (
              <ProductCardGrid key={product.id} product={product} />
            ))}
          </div>
        ) : (
          !isLoading && (
            <div className="py-12 text-center text-gray-500 bg-gray-50 rounded-xl border border-gray-100">
              Chưa có tài liệu nào cho môn học này.
            </div>
          )
        )}

        {/* Load More Button */}
        {hasMore && products.length > 0 && (
          <div className="flex justify-center mt-8">
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={isLoading}
              className="px-8 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading && <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>}
              Xem thêm
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
