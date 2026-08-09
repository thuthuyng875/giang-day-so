import Link from "next/link";
import { CheckCircle2, ChevronRight, ShoppingCart } from "lucide-react";
import { formatCurrencyVND } from "@/lib/format";

export function ProductCardGrid({ product }: { product: any }) {
  const currentPrice = product.sale_price ?? product.original_price ?? 0;
  const oldPrice = product.original_price ?? currentPrice;
  const discount = oldPrice > currentPrice ? Math.round(100 - (currentPrice / oldPrice * 100)) : 0;

  return (
    <div className="bg-white rounded-xl border border-gray-100 hover:shadow-md flex flex-col p-2 transition-shadow relative group h-full">
      {/* Top Tags & Image */}
      <div className="relative w-full h-[130px] mb-2 flex flex-col shrink-0">
        <div className="absolute top-0 left-0 right-0 flex justify-between items-start z-10 pointer-events-none">
          {product.grade ? (
            <div className="bg-blue-50 text-[#0066cc] text-[9px] font-bold px-1.5 py-0.5 rounded-none pointer-events-auto leading-none">
              {product.grade}
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
            <img src={product.image_url} alt={product.name} className="max-w-full max-h-full object-contain drop-shadow-sm group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="text-slate-300 font-medium text-xs">IMG</div>
          )}
        </Link>
      </div>

      {/* Title */}
      <Link href={`/product/${product.id}`} className="text-[12px] font-bold text-gray-800 line-clamp-2 mt-0.5 group-hover:text-[#0066cc] transition-colors leading-snug">
        {product.name}
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
            {formatCurrencyVND(currentPrice)}
          </span>
          {oldPrice > currentPrice && (
            <span className="text-gray-400 line-through text-[10px] leading-none">
              {formatCurrencyVND(oldPrice)}
            </span>
          )}
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
