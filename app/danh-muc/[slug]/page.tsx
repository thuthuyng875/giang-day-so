'use client';

import { useParams, useSearchParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { Filter, X, ChevronRight, List, Grid3X3, Flame } from 'lucide-react';
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
  price: number;
  image_url: string | null;
  category?: string | null;
  categories?: { name?: string | null } | Array<{ name?: string | null }> | null;
  preview_url?: string | null;
  view_count?: number | null;
  grade?: number | null;
  category_id?: string | null;
  description?: string | null;
};

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

const MOCK_TOP_PRODUCTS: Product[] = [
  {
    id: 't1',
    title: '500 Câu hỏi trắc nghiệm Vật lý 12 - Có đáp án',
    description: '',
    original_price: 210000,
    sale_price: 169000,
    preview_pages_count: 15,
    total_views: 1200,
    grades: [MOCK_GRADES[11]],
    document_types: [],
    image_url: ''
  },
  {
    id: 't2',
    title: 'Tổng hợp công thức Vật lý 12 đầy đủ nhất',
    description: '',
    original_price: 79000,
    sale_price: 59000,
    preview_pages_count: 15,
    total_views: 900,
    grades: [MOCK_GRADES[11]],
    document_types: [],
    image_url: ''
  },
  {
    id: 't3',
    title: 'Đề thi thử TN THPTQG môn Vật lý 2026 - Đề mới',
    description: '',
    original_price: 170000,
    sale_price: 119000,
    preview_pages_count: 15,
    total_views: 850,
    grades: [MOCK_GRADES[11]],
    document_types: [],
    image_url: ''
  }
];

const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p1',
    title: '500 Câu hỏi trắc nghiệm Vật lý 12 - Có đáp án',
    description: 'Tuyển chọn 500 câu hỏi trắc nghiệm Vật lý 12 có đáp án chi tiết, bám sát cấu trúc đề thi TN THPTQG. Tài liệu giúp học sinh luyện tập hiệu quả, nắm chắc kiến thức và tự tin chinh phục điểm cao.',
    original_price: 210000,
    sale_price: 169000,
    preview_pages_count: 15,
    total_views: 1248,
    grades: [MOCK_GRADES[11]], // Lớp 12
    document_types: [MOCK_DOC_TYPES[3]], // Ôn thi TN THPTQG
    image_url: '/placeholder.jpg'
  },
  {
    id: 'p2',
    title: 'Tổng hợp công thức Vật lý 12 đầy đủ nhất',
    description: 'Tổng hợp đầy đủ và chi tiết các công thức Vật lý 12 theo chủ đề, dễ tra cứu, dễ ghi nhớ. Tài liệu không thể thiếu cho quá trình học tập và ôn thi.',
    original_price: 79000,
    sale_price: 59000,
    preview_pages_count: 15,
    total_views: 950,
    grades: [MOCK_GRADES[11]],
    document_types: [MOCK_DOC_TYPES[1]], // Chuyên đề bài tập
    image_url: '/placeholder.jpg'
  },
  {
    id: 'p3',
    title: '15 chuyên đề Vật lý 12 trọng tâm ôn thi 2026',
    description: '15 chuyên đề trọng tâm Vật lý 12 kèm phương pháp giải nhanh và bài tập vận dụng. Giúp học sinh hệ thống kiến thức và bứt phá điểm số trong kỳ thi.',
    original_price: 175000,
    sale_price: 149000,
    preview_pages_count: 15,
    total_views: 1100,
    grades: [MOCK_GRADES[11]],
    document_types: [MOCK_DOC_TYPES[3]], 
    image_url: '/placeholder.jpg'
  }
];

function ProductCard({ product }: { product: Product }) {
  const discount = Math.round(100 - (product.sale_price / product.original_price * 100));
  const savings = product.original_price - product.sale_price;

  return (
    <div className="flex flex-col md:flex-row gap-3 bg-white rounded-lg border border-slate-200 p-3 hover:shadow-sm transition-shadow">
      {/* Left Media */}
      <div className="relative w-full md:w-[120px] h-[160px] shrink-0 bg-slate-100 rounded-md overflow-hidden border border-slate-200 flex flex-col items-center justify-center">
        {product.grades.length > 0 && (
          <div className="absolute top-0 left-0 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-br-md z-10">
            {product.grades[0].name}
          </div>
        )}
        {discount > 0 && (
          <div className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-md z-10">
            -{discount}%
          </div>
        )}
        <div className="text-slate-400 text-[10px] font-medium uppercase tracking-widest">IMG</div>
      </div>

      {/* Middle Content */}
      <div className="flex-1 flex flex-col py-0.5 min-w-0 justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-800 leading-snug mb-1.5 hover:text-blue-600 cursor-pointer line-clamp-2">
            {product.title}
          </h3>
          <div className="flex flex-wrap items-center gap-1.5 mb-2">
            {product.document_types.length > 0 && (
              <span className="bg-blue-50 text-blue-600 text-xs font-semibold px-2 py-0.5 rounded">
                {product.document_types[0].name}
              </span>
            )}
            <span className="bg-yellow-50 text-orange-500 text-xs font-semibold px-2 py-0.5 rounded flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-orange-400"></span>
              {product.preview_pages_count} trang xem thử
            </span>
          </div>
          <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>
      </div>

      {/* Right Content */}
      <div className="w-full md:w-auto shrink-0 flex flex-col md:flex-row md:items-center justify-center border-t md:border-t-0 md:border-l border-slate-100 md:pl-6 pt-3 md:pt-0 mt-2 md:mt-0 gap-4">
        <div className="flex flex-col md:items-end justify-center">
          <div className="text-xl font-bold text-red-500 leading-none">
            {new Intl.NumberFormat('vi-VN').format(product.sale_price)}đ
          </div>
          <div className="text-sm font-medium text-slate-400 line-through mt-1.5">
            {new Intl.NumberFormat('vi-VN').format(product.original_price)}đ
          </div>
          {savings > 0 && (
            <div className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded mt-1.5">
              Tiết kiệm {new Intl.NumberFormat('vi-VN').format(savings)}đ
            </div>
          )}
        </div>
        <div className="flex items-center mt-2 md:mt-0">
          <button className="w-full md:w-auto whitespace-nowrap flex justify-center items-center py-2 px-4 rounded-md font-bold text-sm border border-orange-500 text-orange-500 bg-transparent hover:bg-orange-50 transition-colors">
            Đọc thử ngay
          </button>
        </div>
      </div>
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
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [categoryName, setCategoryName] = useState<string>('');

  useEffect(() => {
    let active = true;
    async function loadProducts() {
      setLoadingProducts(true);
      try {
        const mappedSubject = getSubjectFromSlug(rawSlug);
        if (active) setCategoryName(mappedSubject || 'Danh mục');
        let query = supabase
          .from('products')
          .select('id,name,price,image_url,preview_url,view_count,category_id,categories(name),subject,grade,docType,description')
          .order('name', { ascending: true });
        if (mappedSubject) query = query.eq('subject', mappedSubject);
        if (selectedGrades.length > 0) query = query.in('grade', selectedGrades);
        if (activeDocType) query = query.eq('docType', activeDocType);
        const { data, error } = await query;
        if (!active) return;
        if (error || !data) { if (error) console.error('Load error:', error.message); setProducts([]); }
        else setProducts(data as unknown as ProductRow[]);
      } catch (e) { if (active) { console.error(e); setProducts([]); } }
      finally { if (active) setLoadingProducts(false); }
    }
    loadProducts();
    return () => { active = false; };
  }, [rawSlug, searchParams, selectedGrades.length, activeDocType]);

  const headerTitle = categoryName || 'Danh mục';

  return (
    <div className="min-h-screen bg-white pb-12 pt-4">
      <div className="w-full px-4 md:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-slate-500">
          <ol className="flex flex-wrap items-center gap-2">
            <li><Link href="/" className="hover:text-blue-600 transition-colors">Trang chủ</Link></li>
            <li><ChevronRight className="h-3.5 w-3.5" /></li>
            <li><Link href="#" className="hover:text-blue-600 transition-colors">Tài liệu theo môn</Link></li>
            <li><ChevronRight className="h-3.5 w-3.5" /></li>
            <li className="text-slate-800 font-medium">{headerTitle}</li>
          </ol>
        </nav>

        {/* Main Container: 2-column layout with compact grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr]">
          
          {/* LEFT SIDEBAR (FILTERS) */}
          <aside className="flex flex-col gap-6 bg-white p-4 rounded-xl border border-slate-200 h-fit">
            
            {/* Block 1: Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-800 tracking-wide uppercase">BỘ LỌC</h2>
              <button 
                onClick={() => router.replace(pathname)}
                className="text-[13px] text-slate-500 hover:text-blue-600 transition-colors flex items-center gap-1"
              >
                Xóa lọc <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Block 2: Khối Lớp */}
            <div className="space-y-4">
              <h3 className="text-[13px] font-bold text-slate-800 uppercase tracking-wide">KHỐI LỚP</h3>
              <div className="grid grid-cols-3 gap-2">
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
                      className={`py-1.5 px-1 text-[12px] font-medium rounded-lg transition-colors text-center border ${
                        isActive 
                          ? 'bg-blue-600 text-white border-blue-600' 
                          : 'bg-white text-slate-700 border-slate-200 hover:border-blue-600 hover:text-blue-600'
                      }`}
                    >
                      {grade.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Block 3: Khoảng Giá */}
            <div className="space-y-4">
              <h3 className="text-[13px] font-bold text-slate-800 uppercase tracking-wide">KHOẢNG GIÁ</h3>
              <div className="px-1">
                <input 
                  type="range" 
                  className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer" 
                  min="0" 
                  max="500000" 
                />
                <div className="flex justify-between text-[11px] text-slate-500 mt-2 font-medium">
                  <span>0đ</span>
                  <span>500.000đ+</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {['Dưới 50k', '50k - 150k', '150k - 300k', 'Trên 300k'].map((label, idx) => (
                  <button key={idx} className="px-2 py-1 text-[11px] font-medium text-slate-600 border border-slate-200 rounded hover:border-blue-600 hover:text-blue-600 transition-colors">
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Block 4: Tài liệu xem nhiều nhất tuần */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-blue-600" />
                <h3 className="text-[12px] font-bold text-blue-700 uppercase tracking-wide">
                  Tài liệu xem nhiều nhất tuần
                </h3>
              </div>
              <div className="flex flex-col gap-3">
                {MOCK_TOP_PRODUCTS.map((product, idx) => (
                  <div key={product.id} className="flex gap-2.5 items-start group cursor-pointer">
                    {/* Number Indicator + Thumbnail */}
                    <div className="relative shrink-0">
                      <div className="absolute -top-1.5 -left-1.5 w-4 h-4 bg-blue-600 text-white rounded-full flex items-center justify-center text-[9px] font-bold z-10 border border-white">
                        {idx + 1}
                      </div>
                      <div className="w-[50px] h-[70px] bg-slate-100 border border-slate-200 rounded-md flex items-center justify-center text-slate-400 text-xs overflow-hidden">
                         <div className="w-full h-full bg-slate-200"></div>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[12px] font-semibold text-slate-800 line-clamp-2 group-hover:text-blue-600 transition-colors leading-snug">
                        {product.title}
                      </h4>
                      <div className="text-red-500 font-bold text-[13px] mt-1">
                        {new Intl.NumberFormat('vi-VN').format(product.sale_price)}đ
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="text-[12px] font-bold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1 mt-1">
                Xem tất cả <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

          </aside>

          {/* MAIN CONTENT (RIGHT COLUMN) */}
          <main className="min-w-0 flex flex-col gap-5">
            {/* Task 2: Category Tabs */}
            <div className="flex flex-nowrap overflow-x-auto gap-2 pb-1 scrollbar-hide">
              {MOCK_DOC_TYPES.map((docType) => {
                const isActive = docType.slug === 'tat-ca'; // Hardcoded for demo
                return (
                  <button
                    key={docType.id}
                    className={`rounded-md px-3 py-1.5 text-[13px] font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0 border ${
                      isActive 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                        : 'bg-white text-slate-600 border-slate-200 hover:border-blue-600 hover:text-blue-600'
                    }`}
                  >
                    {docType.name}
                  </button>
                );
              })}
            </div>

            {/* Task 2: Control Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="text-[14px] text-slate-600 font-medium">
                Hiển thị <span className="font-bold text-slate-800">1 - 24</span> trong tổng số <span className="font-bold text-slate-800">1.248</span> kết quả
              </div>
              <div className="flex items-center gap-5">
                <div className="flex items-center gap-2 text-[13px]">
                  <span className="text-slate-500 font-medium">Sắp xếp:</span>
                  <select className="border border-slate-200 rounded-lg px-3 py-2 text-slate-700 font-medium focus:outline-none focus:border-blue-600 bg-white cursor-pointer hover:border-slate-300 transition-colors">
                    <option>Mới nhất</option>
                    <option>Cũ nhất</option>
                    <option>Giá cao đến thấp</option>
                    <option>Giá thấp đến cao</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 text-[13px]">
                  <span className="text-slate-500 font-medium">Hiển thị:</span>
                  <div className="flex items-center gap-1">
                    <button className="p-2 rounded-lg bg-blue-600 text-white shadow-sm hover:bg-blue-700 transition-colors">
                      <List className="h-4 w-4" />
                    </button>
                    <button className="p-2 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-600 transition-colors">
                      <Grid3X3 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Task 3: Product List */}
            <div className="flex flex-col gap-4">
              {MOCK_PRODUCTS.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Task 4: Pagination */}
            <div className="flex items-center justify-center pt-4 pb-2">
              <div className="flex items-center gap-1 bg-white rounded-lg border border-slate-200 p-1 shadow-sm">
                <button className="px-3 py-1.5 text-[13px] font-medium text-slate-400 cursor-not-allowed rounded-md">
                  Trang trước
                </button>
                <button className="w-8 h-8 flex items-center justify-center text-[14px] font-bold bg-blue-600 text-white rounded-md shadow-sm">
                  1
                </button>
                <button className="w-8 h-8 flex items-center justify-center text-[14px] font-medium text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-md transition-colors">
                  2
                </button>
                <button className="w-8 h-8 flex items-center justify-center text-[14px] font-medium text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-md transition-colors">
                  3
                </button>
                <span className="w-8 h-8 flex items-center justify-center text-[14px] text-slate-400">
                  ...
                </span>
                <button className="w-8 h-8 flex items-center justify-center text-[14px] font-medium text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-md transition-colors">
                  52
                </button>
                <button className="px-3 py-1.5 text-[13px] font-medium text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-md transition-colors">
                  Trang sau
                </button>
              </div>
            </div>
          </main>
          
        </div>
      </div>
    </div>
  );
}