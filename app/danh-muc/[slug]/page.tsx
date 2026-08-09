'use client';

import { useParams, useSearchParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { Filter, X, ChevronRight, List, Grid3X3, Flame, CheckCircle2, ShieldCheck, Star, FileText, ShoppingCart, Heart, Atom, ChevronUp, ChevronDown } from 'lucide-react';
import { getSubjectFromSlug } from '@/lib/taxonomy';
import { supabase } from '@/lib/supabase/client';

export interface Grade { id: string; name: string; slug: string; }
export interface DocumentType { id: string; name: string; slug: string; }
export interface Product {
  id: string;
  title: string;
  description: string;
  original_price: number;
  sale_price: number;
  preview_pages_count: number;
  total_views: number;
  grades: Grade[];
  document_types: DocumentType[];
  image_url?: string;
}

// Keep existing type for db fetch, but map it to our new Product interface later or adjust the type.
type ProductRow = {
  id: string;
  name: string;
  original_price: number;
  sale_price: number;
  image_url: string | null;
  category?: string | null;
  categories?: { name?: string | null } | Array<{ name?: string | null }> | null;
  preview_url?: string | null;
  view_count?: number | null;
  grade?: number | null;
  category_id?: string | null;
  docType?: string | null;
  description?: string | null;
  created_at?: string;
  preview_pages_count?: number;
};

function mapRowToProduct(row: ProductRow): Product {
  return {
    id: row.id,
    title: row.name,
    description: row.description || '',
    original_price: row.original_price || 0,
    sale_price: row.sale_price || 0,
    preview_pages_count: row.preview_pages_count || 0,
    created_at: row.created_at || new Date().toISOString(),
    total_views: row.view_count || 0,
    grades: row.grade ? [{ id: String(row.grade), name: String(row.grade).startsWith('Lớp') ? String(row.grade) : `Lớp ${row.grade}`, slug: `lop-${row.grade}` }] : [],
    document_types: row.docType ? [{ id: 'doc', name: row.docType, slug: 'doc' }] : [],
    image_url: row.image_url || undefined,
  };
}

const MOCK_GRADES: Grade[] = [
  { id: '1', name: 'Lớp 1', slug: 'lop-1' },
  { id: '2', name: 'Lớp 2', slug: 'lop-2' },
  { id: '3', name: 'Lớp 3', slug: 'lop-3' },
  { id: '4', name: 'Lớp 4', slug: 'lop-4' },
  { id: '5', name: 'Lớp 5', slug: 'lop-5' },
  { id: '6', name: 'Lớp 6', slug: 'lop-6' },
  { id: '7', name: 'Lớp 7', slug: 'lop-7' },
  { id: '8', name: 'Lớp 8', slug: 'lop-8' },
  { id: '9', name: 'Lớp 9', slug: 'lop-9' },
  { id: '10', name: 'Lớp 10', slug: 'lop-10' },
  { id: '11', name: 'Lớp 11', slug: 'lop-11' },
  { id: '12', name: 'Lớp 12', slug: 'lop-12' },
];

const MOCK_DOC_TYPES: DocumentType[] = [
  { id: '1', name: 'Tất cả', slug: 'tat-ca' },
  { id: '2', name: 'Chuyên đề bài tập', slug: 'chuyen-de-bai-tap' },
  { id: '3', name: 'Đề kiểm tra GK - CK', slug: 'de-kiem-tra-gk-ck' },
  { id: '4', name: 'Ôn thi TN THPTQG', slug: 'on-thi-tn-thptqg' },
  { id: '5', name: 'Ôn thi HSG', slug: 'on-thi-hsg' },
  { id: '6', name: 'Bài giảng PowerPoint', slug: 'bai-giang-powerpoint' },
  { id: '7', name: 'Giáo án Word', slug: 'giao-an-word' },
];

function ProductCard({ product }: { product: Product }) {
  const discount = Math.round(100 - (product.sale_price / product.original_price * 100));
  const savings = product.original_price - product.sale_price;

  return (
    <Link href={`/product/${product.id}`} className="flex flex-col md:flex-row items-center gap-3 p-3 border-b border-slate-100 last:border-b-0 hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all relative bg-white z-0 hover:z-10 cursor-pointer first:rounded-t-lg last:rounded-b-lg group">
      {/* 1. Left Media */}
      <div className="relative w-full md:w-[84px] h-[116px] shrink-0">
        <div className="w-full h-full bg-white rounded overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center justify-center relative">
          {product.image_url ? (
            <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
          ) : (
            <div className="text-slate-400 text-[9px] font-medium uppercase tracking-widest">IMG</div>
          )}
        </div>
        {product.grades.length > 0 && (
          <div className="absolute -top-1.5 -left-1.5 bg-[#0066cc] text-white text-[9px] font-bold px-1 py-0 leading-tight rounded-none shadow-sm z-20">
            {product.grades[0].name}
          </div>
        )}
        {discount > 0 && (
          <div className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold px-1 py-0 leading-tight rounded-none shadow-sm z-20">
            -{discount}%
          </div>
        )}
      </div>

      {/* 2. Middle Content (Info) */}
      <div className="flex-1 flex flex-col min-w-0 md:border-r border-slate-200 md:pr-3">
        <h3 className="text-[14px] font-bold text-slate-800 leading-snug mb-1 group-hover:text-[#0066cc] transition-colors line-clamp-2">
          {product.title}
        </h3>
        <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
          {product.document_types.length > 0 && (
            <span className="bg-[#f0f7ff] text-[#0066cc] text-[10px] font-semibold px-1.5 py-0.5 rounded">
              {product.document_types[0].name}
            </span>
          )}
          <span className="bg-yellow-50 text-yellow-500 text-[10px] font-semibold px-1.5 py-0.5 rounded flex items-center border border-yellow-200">
            • {product.preview_pages_count} trang xem thử
          </span>
        </div>
        <p className="text-[11px] text-gray-600 line-clamp-2 leading-tight">
          {product.description}
        </p>
        {/* Features matching grid view */}
        <div className="flex items-center gap-3 mt-1.5 text-gray-500 text-[10px] font-medium shrink-0">
          <div className="flex items-center gap-0.5">
            <div className="w-3 h-3 rounded bg-gray-100 flex items-center justify-center font-bold text-[7px] text-gray-600">W</div>
            100% Word
          </div>
          <div className="flex items-center gap-0.5">
            <CheckCircle2 className="w-2.5 h-2.5" />
            Có đáp án
          </div>
        </div>
      </div>

      {/* 3. Price */}
      <div className="w-full md:w-[110px] shrink-0 flex flex-col items-center justify-center text-center pt-2 md:pt-0">
        <div className="text-[16px] font-bold text-red-500 leading-none mb-1">
          {new Intl.NumberFormat('vi-VN').format(product.sale_price)}đ
        </div>
        <div className="text-[11px] font-medium text-slate-400 line-through mb-1">
          {new Intl.NumberFormat('vi-VN').format(product.original_price)}đ
        </div>
        {savings > 0 && (
          <div className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
            Tiết kiệm {new Intl.NumberFormat('vi-VN').format(savings)}đ
          </div>
        )}
      </div>

      {/* 4. CTA Button */}
      <div className="w-full md:w-[120px] shrink-0 flex items-center justify-center pt-2 md:pt-0 md:pl-2">
        <div className="flex justify-center items-center py-1 px-2.5 rounded-[5px] font-bold text-[11px] bg-white border border-yellow-400 text-yellow-500 hover:bg-yellow-50 transition-colors w-full md:w-auto gap-0.5">
          Xem chi tiết <ChevronRight className="w-2.5 h-2.5" />
        </div>
      </div>
    </Link>
  );
}

function DualRangeSlider({ min, max, value, onChange }: { min: number, max: number, value: [number, number], onChange: (val: [number, number]) => void }) {
  const [minVal, setMinVal] = useState(value[0]);
  const [maxVal, setMaxVal] = useState(value[1]);

  useEffect(() => {
    setMinVal(value[0]);
    setMaxVal(value[1]);
  }, [value]);

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.min(Number(e.target.value), maxVal - 1000);
    setMinVal(val);
    onChange([val, maxVal]);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.max(Number(e.target.value), minVal + 1000);
    setMaxVal(val);
    onChange([minVal, val]);
  };

  const getPercent = (val: number) => Math.round(((val - min) / (max - min)) * 100);

  return (
    <div className="relative w-full h-[2px] bg-gray-200 rounded my-3">
      <div
        className="absolute h-[2px] bg-[#0066cc] rounded"
        style={{ left: `${getPercent(minVal)}%`, width: `${getPercent(maxVal) - getPercent(minVal)}%` }}
      />
      <input
        type="range" min={min} max={max} value={minVal} onChange={handleMinChange} step={1000}
        className="absolute top-1/2 -translate-y-1/2 w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#0066cc] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer z-10"
      />
      <input
        type="range" min={min} max={max} value={maxVal} onChange={handleMaxChange} step={1000}
        className="absolute top-1/2 -translate-y-1/2 w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#0066cc] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer z-20"
      />
    </div>
  );
}

function ProductCardGrid({ product }: { product: Product }) {
  const discount = Math.round(100 - (product.sale_price / product.original_price * 100));

  return (
    <div className="bg-white rounded-xl border border-gray-100 hover:shadow-md flex flex-col p-2 transition-shadow relative group h-full">
      {/* Top Tags & Image */}
      <div className="relative w-full h-[130px] mb-2 flex flex-col shrink-0">
        <div className="absolute top-0 left-0 right-0 flex justify-between items-start z-10 pointer-events-none">
          {product.grades.length > 0 ? (
            <div className="bg-blue-50 text-[#0066cc] text-[9px] font-bold px-1.5 py-0.5 rounded-none pointer-events-auto leading-none">
              {product.grades[0].name}
            </div>
          ) : <div />}
          {discount > 0 && (
            <div className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-none pointer-events-auto leading-none">
              -{discount}%
            </div>
          )}
        </div>

        <Link href={`/product/${product.id}`} className="w-full h-full flex items-center justify-center pt-5 pb-0 px-2">
          {product.image_url ? (
            <img src={product.image_url} alt={product.title} className="max-w-full max-h-full object-contain drop-shadow-sm group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="text-slate-300 font-medium text-xs">IMG</div>
          )}
        </Link>
      </div>

      {/* Title */}
      <Link href={`/product/${product.id}`} className="text-[12px] font-bold text-gray-800 line-clamp-2 mt-0.5 group-hover:text-[#0066cc] transition-colors leading-snug">
        {product.title}
      </Link>

      {/* Secondary Info */}
      <div className="flex items-center gap-4 mt-1.5 text-gray-500 text-[10px] font-medium shrink-0">
        <div className="flex items-center gap-0.5">
          <div className="w-3 h-3 rounded bg-gray-100 flex items-center justify-center font-bold text-[7px]">W</div>
          100% Word
        </div>
        <div className="flex items-center gap-0.5">
          <CheckCircle2 className="w-2.5 h-2.5" />
          Có đáp án
        </div>
      </div>

      {/* Pricing & Cart */}
      <div className="flex items-center justify-between mt-auto pt-2 shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="text-red-500 font-bold text-[13px] leading-none">
            {new Intl.NumberFormat('vi-VN').format(product.sale_price)}đ
          </span>
          <span className="text-gray-400 line-through text-[10px] leading-none">
            {new Intl.NumberFormat('vi-VN').format(product.original_price)}đ
          </span>
        </div>
        <button className="text-[#0066cc] bg-[#0066cc]/10 hover:bg-[#0066cc]/20 p-1 rounded-md transition-colors shrink-0 ml-1">
          <ShoppingCart className="w-3 h-3" />
        </button>
      </div>

      {/* CTA Button */}
      <Link href={`/product/${product.id}`} className="mt-2 w-[80%] border border-yellow-400 text-yellow-500 hover:bg-yellow-50 py-0.5 rounded text-[11px] font-bold flex items-center justify-center gap-1 transition-colors shrink-0 self-start">
        Xem chi tiết <ChevronRight className="w-2.5 h-2.5" />
      </Link>
    </div>
  );
}

export default function CategoryListingPage() {
  const { slug } = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const rawSlug = decodeURIComponent(slug);
  const selectedGrades = searchParams.getAll('grade');
  const activeDocType = searchParams.get('docType') ?? null;

  const [products, setProducts] = useState<ProductRow[]>([]);
  const [latestProducts, setLatestProducts] = useState<ProductRow[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [categoryName, setCategoryName] = useState<string>('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const ITEMS_PER_PAGE = 24;

  const [hoveredTabId, setHoveredTabId] = useState<string | null>(null);
  const activeTabId = activeDocType || 'tat-ca';
  const tabsRef = React.useRef<Map<string, HTMLButtonElement>>(new Map());
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 });

  const [localPriceRange, setLocalPriceRange] = useState<[number, number]>([0, 500000]);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');

  // Read minPrice and maxPrice from URL on mount or change
  useEffect(() => {
    const minP = searchParams.get('minPrice');
    const maxP = searchParams.get('maxPrice');
    const newMin = minP ? parseInt(minP, 10) : 0;
    const newMax = maxP ? (parseInt(maxP, 10) >= 99999999 ? 500000 : parseInt(maxP, 10)) : 500000;
    setLocalPriceRange([newMin, newMax]);
  }, [searchParams]);

  // Debounce to URL
  useEffect(() => {
    const handler = setTimeout(() => {
      const currentMin = searchParams.get('minPrice') || '0';
      const currentMax = searchParams.get('maxPrice') || '99999999';

      const newMin = localPriceRange[0].toString();
      const newMax = (localPriceRange[1] >= 500000 ? 99999999 : localPriceRange[1]).toString();

      const isDefault = localPriceRange[0] === 0 && localPriceRange[1] >= 500000;
      const urlIsDefault = !searchParams.has('minPrice') && !searchParams.has('maxPrice');

      if (isDefault && urlIsDefault) return; // both default

      if (currentMin !== newMin || currentMax !== newMax) {
        const np = new URLSearchParams(searchParams.toString());
        if (isDefault) {
          np.delete('minPrice');
          np.delete('maxPrice');
        } else {
          np.set('minPrice', newMin);
          np.set('maxPrice', newMax);
        }
        router.replace(pathname + '?' + np.toString(), { scroll: false });
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [localPriceRange, pathname, router, searchParams]);

  useEffect(() => {
    const targetId = hoveredTabId || activeTabId;
    const targetEl = tabsRef.current.get(targetId);
    if (targetEl) {
      setIndicatorStyle({
        left: targetEl.offsetLeft,
        width: targetEl.offsetWidth,
        opacity: 1
      });
    }
  }, [hoveredTabId, activeTabId]);

  useEffect(() => {
    setPage(1);
    setProducts([]);
  }, [rawSlug, searchParams, selectedGrades.length, activeDocType]);

  useEffect(() => {
    let active = true;
    async function loadLatest() {
      const mappedSubject = getSubjectFromSlug(rawSlug);
      let query = supabase
        .from('products')
        .select('id,name,original_price,sale_price,image_url,created_at')
        .order('created_at', { ascending: false })
        .limit(3);
      if (mappedSubject) query = query.eq('subject', mappedSubject);

      const { data } = await query;
      if (active && data) {
        setLatestProducts(data as unknown as ProductRow[]);
      }
    }
    loadLatest();
    return () => { active = false; };
  }, [rawSlug]);

  useEffect(() => {
    let active = true;
    async function loadProducts() {
      setLoadingProducts(true);
      try {
        const mappedSubject = getSubjectFromSlug(rawSlug);
        if (active) setCategoryName(mappedSubject || 'Danh mục');
        let query = supabase
          .from('products')
          .select('id,name,original_price,sale_price,image_url,preview_url,view_count,category_id,categories(name),subject,grade,docType,description,created_at,preview_pages_count')
          .order('name', { ascending: true });

        if (mappedSubject) query = query.eq('subject', mappedSubject);
        if (selectedGrades.length > 0) query = query.in('grade', selectedGrades);
        if (activeDocType) query = query.eq('docType', activeDocType);

        const minP = searchParams.get('minPrice');
        const maxP = searchParams.get('maxPrice');
        if (minP) query = query.gte('sale_price', parseInt(minP, 10));
        if (maxP) query = query.lte('sale_price', parseInt(maxP, 10));

        const from = (page - 1) * ITEMS_PER_PAGE;
        const to = from + ITEMS_PER_PAGE - 1;
        query = query.range(from, to);

        const { data, error } = await query;
        if (!active) return;

        if (error || !data) {
          if (error) console.error('Load error:', error.message);
        } else {
          const fetchedProducts = data as unknown as ProductRow[];
          if (page === 1) {
            setProducts(fetchedProducts);
          } else {
            setProducts(prev => {
              const existingIds = new Set(prev.map(p => p.id));
              const newProducts = fetchedProducts.filter(p => !existingIds.has(p.id));
              return [...prev, ...newProducts];
            });
          }
          setHasMore(fetchedProducts.length === ITEMS_PER_PAGE);
        }
      } catch (e) { if (active) console.error(e); }
      finally { if (active) setLoadingProducts(false); }
    }
    loadProducts();
    return () => { active = false; };
  }, [page, rawSlug, searchParams, selectedGrades.length, activeDocType]);

  const headerTitle = categoryName || 'Danh mục';

  return (
    <div className="min-h-screen bg-white pb-12 pt-0">
      <div className="w-full">

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-3 mt-1 text-[12px] text-slate-500">
          <ol className="flex flex-wrap items-center gap-2">
            <li><Link href="/" className="hover:text-[#0066cc] transition-colors">Trang chủ</Link></li>
            <li><ChevronRight className="h-3 w-3" /></li>
            <li><Link href="#" className="hover:text-[#0066cc] transition-colors">Tài liệu theo môn</Link></li>
            <li><ChevronRight className="h-3 w-3" /></li>
            <li className="text-slate-800 font-medium">{headerTitle}</li>
          </ol>
        </nav>

        {/* Main Container: 2-column layout with compact grid */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[220px_1fr]">

          {/* LEFT SIDEBAR (FILTERS) */}
          <aside className="flex flex-col gap-4 bg-white p-3 rounded-lg border border-slate-200 h-fit shadow-sm">

            {/* Block 1: Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h2 className="text-xs font-bold text-slate-800 tracking-wide uppercase">BỘ LỌC</h2>
              <button
                onClick={() => router.replace(pathname)}
                className="text-[11px] text-slate-500 hover:text-[#0066cc] transition-colors flex items-center gap-1"
              >
                Xóa lọc <X className="w-3 h-3" />
              </button>
            </div>

            {/* Block 2: Khối Lớp */}
            <div className="space-y-2">
              <div className="flex items-center justify-between cursor-pointer">
                <h3 className="text-[11px] font-bold text-slate-800 uppercase tracking-wide">KHỐI LỚP</h3>
                <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
              </div>
              <div className="grid grid-cols-3 gap-1">
                {MOCK_GRADES.map((grade) => {
                  const isActive = selectedGrades.includes(grade.name);
                  return (
                    <button
                      key={grade.id}
                      onClick={() => {
                        const np = new URLSearchParams(searchParams.toString());
                        if (!isActive) { np.append('grade', grade.name); }
                        else {
                          const g = np.getAll('grade').filter(x => x !== grade.name);
                          np.delete('grade');
                          g.forEach(x => np.append('grade', x));
                        }
                        router.replace(pathname + '?' + np.toString(), { scroll: false });
                      }}
                      className={`py-1 px-1.5 text-[11px] font-medium rounded-md transition-colors text-center border ${isActive
                        ? 'bg-[#0066cc] text-white border-[#0066cc]'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-[#0066cc] hover:text-[#0066cc]'
                        }`}
                    >
                      {grade.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Block 3: Khoảng Giá */}
            <div className="space-y-3">
              <div className="flex items-center justify-between cursor-pointer">
                <h3 className="text-[11px] font-bold text-slate-800 uppercase tracking-wide">KHOẢNG GIÁ</h3>
                <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
              </div>
              <div className="px-1 mt-4 mb-2">
                <DualRangeSlider
                  min={0}
                  max={500000}
                  value={localPriceRange}
                  onChange={(val) => setLocalPriceRange(val)}
                />
                <div className="flex justify-between text-[11px] text-gray-500 mt-2 font-medium">
                  <span>0đ</span>
                  <span>500.000đ+</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {[
                  { label: 'Dưới 200k', min: 0, max: 200000 },
                  { label: '200k - 350k', min: 200000, max: 350000 },
                  { label: '350k - 500k', min: 350000, max: 500000 },
                  { label: 'Trên 500k', min: 500000, max: 99999999 }
                ].map((opt, idx) => {
                  const isActive = opt.min === localPriceRange[0] && (opt.max === localPriceRange[1] || (opt.max === 99999999 && localPriceRange[1] >= 500000));
                  return (
                    <button
                      key={idx}
                      onClick={() => setLocalPriceRange([opt.min, opt.max >= 99999999 ? 500000 : opt.max])}
                      className={`px-2 py-1 text-[11px] font-medium border rounded-md transition-colors ${isActive
                        ? 'border-[#0066cc] text-[#0066cc] bg-[#0066cc]/10'
                        : 'border-gray-200 text-gray-600 hover:border-[#0066cc] hover:text-[#0066cc]'
                        }`}
                    >
                      {opt.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Block 4: Tài liệu mới nhất */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-[#0066cc]" />
                <h3 className="text-[11px] font-bold text-[#005bb5] uppercase tracking-wide">
                  Tài liệu mới nhất
                </h3>
              </div>
              <div className="flex flex-col gap-3">
                {latestProducts.map((product, idx) => (
                  <Link href={`/product/${product.id}`} key={product.id} className="flex gap-2.5 items-start group cursor-pointer">
                    {/* Number Indicator + Thumbnail */}
                    <div className="relative shrink-0">
                      <div className="absolute -top-1.5 -left-1.5 w-4 h-4 bg-[#0066cc] text-white rounded-full flex items-center justify-center text-[9px] font-bold z-10 border border-white">
                        {idx + 1}
                      </div>
                      <div className="w-[50px] h-[70px] bg-slate-100 border border-slate-200 rounded-md flex items-center justify-center text-slate-400 text-xs overflow-hidden">
                        {product.image_url ? (
                          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-slate-200"></div>
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[11px] font-semibold text-slate-800 line-clamp-2 group-hover:text-[#0066cc] transition-colors leading-snug">
                        {product.name}
                      </h4>
                      <div className="text-red-500 font-bold text-[12px] mt-1">
                        {new Intl.NumberFormat('vi-VN').format(product.sale_price)}đ
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

          </aside>

          {/* MAIN CONTENT (RIGHT COLUMN) */}
          <main className="min-w-0 flex flex-col gap-2">


            {/* Task 2: Category Tabs */}
            <div className="flex flex-nowrap overflow-x-auto overflow-y-hidden gap-2 pb-1 scrollbar-hide">
              {MOCK_DOC_TYPES.map((docType) => {
                const isActive = docType.slug === activeTabId;
                return (
                  <button
                    key={docType.id}
                    ref={(el) => {
                      if (el) tabsRef.current.set(docType.slug, el);
                      else tabsRef.current.delete(docType.slug);
                    }}
                    onMouseEnter={() => setHoveredTabId(docType.slug)}
                    onMouseLeave={() => setHoveredTabId(null)}
                    onClick={() => {
                      const np = new URLSearchParams(searchParams.toString());
                      if (docType.slug === 'tat-ca') np.delete('docType');
                      else np.set('docType', docType.slug);
                      router.replace(pathname + '?' + np.toString(), { scroll: false });
                    }}
                    className={`py-1 px-2 text-[12px] font-medium rounded-md transition-colors text-center border whitespace-nowrap flex-shrink-0 ${isActive
                      ? 'bg-[#0066cc] text-white border-[#0066cc]'
                      : 'bg-white text-black border-slate-200 hover:border-[#0066cc] hover:text-[#0066cc]'
                      }`}
                  >
                    {docType.name}
                  </button>
                );
              })}
            </div>

            {/* Task 2: Control Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-3">
              <div className="flex items-center gap-5">
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="text-slate-500 font-medium">Sắp xếp theo:</span>
                  <div className="relative">
                    <select className="appearance-none bg-slate-50 border border-slate-200 text-slate-700 py-0.5 pl-1.5 pr-5 rounded focus:outline-none focus:border-[#0066cc] cursor-pointer hover:border-slate-300 transition-colors">
                      <option>Mới nhất</option>
                      <option>Cũ nhất</option>
                      <option>Giá cao đến thấp</option>
                      <option>Giá thấp đến cao</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="text-slate-500 font-medium">Hiển thị:</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-1 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-[#0066cc] text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-400 hover:text-[#0066cc] hover:border-[#0066cc]'}`}
                    >
                      <List className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-1 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-[#0066cc] text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-400 hover:text-[#0066cc] hover:border-[#0066cc]'}`}
                    >
                      <Grid3X3 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Task 3: Product List */}
            {viewMode === 'list' ? (
              <div className="flex flex-col bg-white rounded-lg border border-slate-200 shadow-sm">
                {products.length === 0 && !loadingProducts ? (
                  <div className="text-center py-12 text-slate-500">Không tìm thấy tài liệu nào.</div>
                ) : (
                  products.map((row) => (
                    <ProductCard key={row.id} product={mapRowToProduct(row)} />
                  ))
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {products.length === 0 && !loadingProducts ? (
                  <div className="col-span-full text-center py-12 text-slate-500 bg-white rounded-lg border border-slate-200 shadow-sm">Không tìm thấy tài liệu nào.</div>
                ) : (
                  products.map((row) => (
                    <ProductCardGrid key={row.id} product={mapRowToProduct(row)} />
                  ))
                )}
              </div>
            )}

            {/* Task 4: Load More */}
            {hasMore && products.length > 0 && (
              <div className="flex items-center justify-center pt-6 pb-2">
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={loadingProducts}
                  className="px-6 py-2 border border-[#0066cc] text-[#0066cc] rounded-md hover:bg-[#f0f7ff] font-medium transition-colors disabled:opacity-50"
                >
                  {loadingProducts ? 'Đang tải...' : 'Xem thêm tài liệu'}
                </button>
              </div>
            )}
          </main>

        </div>
      </div>
    </div>
  );
}