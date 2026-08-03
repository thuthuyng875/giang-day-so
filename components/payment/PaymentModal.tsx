'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { usePayment } from './PaymentProvider';
import { QRCodeSVG } from 'qrcode.react';
import { X, CheckCircle2, Zap, Lock, User, ChevronDown, Copy, Check, Info, Star, ShieldCheck, ScanLine, Wallet, Mail, DownloadCloud } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

type PaymentData = {
  orderCode: number;
  qrCode: string;
};

type UpsellItem = {
  id: string;
  name: string;
  price: number;
  oldPrice: number;
  image_url: string;
};

const STATIC_UPSELLS: UpsellItem[] = [
  {
    id: 'u1',
    name: 'BỘ 20 ĐỀ LUYỆN THI THPTQG MÔN VẬT LÝ 2026',
    price: 120000,
    oldPrice: 170000,
    image_url: 'https://via.placeholder.com/80x100/2563EB/ffffff?text=De+Thi'
  },
  {
    id: 'u2',
    name: 'TỔNG HỢP LÝ THUYẾT TRỌNG TÂM VẬT LÝ 12',
    price: 79000,
    oldPrice: 113000,
    image_url: 'https://via.placeholder.com/80x100/10B981/ffffff?text=Ly+Thuyet'
  }
];

export function PaymentModal() {
  const { isModalOpen, selectedProduct, closePaymentModal } = usePayment();

  // Left Column States
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedUpsells, setSelectedUpsells] = useState<Set<string>>(new Set()); // Default empty
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);

  // Right Column States
  const [paymentTab, setPaymentTab] = useState<'qr' | 'manual'>('qr');
  const [copied, setCopied] = useState(false);

  // Payment Logic States
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [orderStatus, setOrderStatus] = useState<'pending' | 'paid'>('pending');
  const [signedUrl, setSignedUrl] = useState('');
  const [isDynamic, setIsDynamic] = useState(false);
  const [accessLink, setAccessLink] = useState('');

  // Reset state when modal opens/closes or product changes
  useEffect(() => {
    if (isModalOpen) {
      setEmail('');
      setLoading(false);
      setSelectedUpsells(new Set()); // Default empty
      setPaymentData(null);
      setOrderStatus('pending');
      setSignedUrl('');
      setIsDynamic(false);
      setAccessLink('');
      setPaymentTab('qr');
      setIsSummaryOpen(false);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    }
  }, [isModalOpen, selectedProduct]);

  // Calculate Total Amount
  const totalAmount = useMemo(() => {
    if (!selectedProduct) return 0;
    let total = selectedProduct.price;
    STATIC_UPSELLS.forEach(upsell => {
      if (selectedUpsells.has(upsell.id)) {
        total += upsell.price;
      }
    });
    return total;
  }, [selectedProduct, selectedUpsells]);

  const oldTotalAmount = useMemo(() => {
    if (!selectedProduct) return 0;
    let old = Math.round((selectedProduct.price * 1.25) / 5000) * 5000; // Fake old price
    STATIC_UPSELLS.forEach(upsell => {
      if (selectedUpsells.has(upsell.id)) {
        old += upsell.oldPrice;
      }
    });
    return old;
  }, [selectedProduct, selectedUpsells]);

  const savedAmount = oldTotalAmount - totalAmount;

  const toggleUpsell = (id: string) => {
    const newSet = new Set(selectedUpsells);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedUpsells(newSet);
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !email) return;

    setLoading(true);
    try {
      const orderCode = Math.floor(100000 + Math.random() * 900000);

      const { error } = await supabase.from('orders').insert({
        product_id: selectedProduct.id,
        customer_email: email,
        amount: totalAmount,
        order_code: orderCode,
        status: 'pending'
      });

      if (error) {
        alert('Lỗi tạo đơn hàng: ' + error.message);
        setLoading(false);
        return;
      }

      const res = await fetch('/api/create-payment-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: totalAmount,
          description: `Thanh toan don ${orderCode}`,
          orderCode: orderCode,
          returnUrl: window.location.href,
          cancelUrl: window.location.href,
        })
      });

      if (!res.ok) {
        alert('Lỗi tạo link thanh toán');
        setLoading(false);
        return;
      }

      const data = await res.json();
      setPaymentData(data);
    } catch (err) {
      console.error(err);
      alert('Đã xảy ra lỗi không xác định.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (paymentData && orderStatus === 'pending' && selectedProduct) {
      interval = setInterval(async () => {
        try {
          const res = await fetch('/api/check-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderCode: paymentData.orderCode }),
          });

          if (!res.ok) {
            console.error('Lỗi API /api/check-order');
            if (interval) clearInterval(interval);
            return;
          }

          const result: any = await res.json();
          const status = result?.status;
          const downloadUrl = result?.signedUrl;
          const isProductDynamic = Boolean(result?.isDynamic);
          const productAccessLink = String(result?.accessLink || '');

          if (status === 'PAID') {
            if (isProductDynamic) {
              setIsDynamic(true);
              setAccessLink(productAccessLink);
              setOrderStatus('paid');
              if (interval) clearInterval(interval);
            } else if (typeof downloadUrl === 'string' && downloadUrl.length > 0) {
              setSignedUrl(downloadUrl);
              setOrderStatus('paid');
              if (interval) clearInterval(interval);
            }
          }
        } catch {
          console.error('Lỗi fetch /api/check-order');
          if (interval) clearInterval(interval);
        }
      }, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [paymentData, orderStatus, selectedProduct]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isModalOpen || !selectedProduct) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-[1200px] bg-white rounded-[20px] shadow-2xl overflow-hidden flex flex-col h-[90vh] max-h-[900px] animate-in zoom-in-95 duration-200 font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={closePaymentModal}
          className="absolute top-4 right-4 z-50 w-8 h-8 flex items-center justify-center bg-white hover:bg-slate-100 rounded-full shadow-sm border border-slate-200 transition-colors text-slate-500 hover:text-slate-800 focus:outline-none"
          aria-label="Đóng"
        >
          <X className="w-4 h-4" />
        </button>
        {/* CONTENT - 2 COLUMNS */}
        <div className="flex flex-col lg:flex-row flex-1 min-h-0 bg-slate-50/50">

          {/* ========================================================= */}
          {/* LEFT COLUMN: ORDER SUMMARY (45%) */}
          {/* ========================================================= */}
          <div className="w-full lg:w-[45%] flex flex-col p-5 lg:overflow-y-auto border-r border-slate-100 bg-white">
            <div className="space-y-5 max-w-lg mx-auto w-full">

              {/* 1. TÀI LIỆU CHỌN MUA */}
              <div className="space-y-2.5">
                <h3 className="text-[12px] font-extrabold text-slate-800 uppercase tracking-wide">1. Tài liệu bạn chọn</h3>
                <div className="flex gap-3 p-3 rounded-2xl border border-blue-100 bg-blue-50/30 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600"></div>
                  {selectedProduct.image_url ? (
                    <img
                      src={selectedProduct.image_url}
                      alt={selectedProduct.name}
                      className="w-[64px] h-[86px] object-cover rounded-xl border border-slate-200/60 shadow-sm shrink-0 bg-white"
                    />
                  ) : (
                    <div className="w-[64px] h-[86px] bg-slate-50 rounded-xl flex items-center justify-center border border-slate-200 text-[10px] text-slate-400 text-center p-2 shrink-0">
                      Chưa có ảnh
                    </div>
                  )}
                  <div className="flex-1 flex flex-col py-0.5">
                    <h4 className="font-bold text-slate-800 text-[14px] leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {selectedProduct.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="inline-block bg-blue-100/50 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold">
                        {selectedProduct.category || 'Tài liệu'}
                      </span>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      </div>
                    </div>
                    <div className="mt-auto flex items-end gap-2 flex-wrap">
                      <span className="text-lg font-extrabold text-red-600 leading-none">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedProduct.price)}
                      </span>
                      <span className="text-[12px] text-slate-400 line-through font-medium leading-none mb-[1px]">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Math.round((selectedProduct.price * 1.25) / 5000) * 5000)}
                      </span>
                      <span className="text-[9px] font-bold bg-green-100 text-green-700 px-1.5 py-0.5 rounded ml-auto mb-[1px]">Giảm 20%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. TỔNG GIÁ TRỊ THANH TOÁN */}
              <div className="space-y-2.5">
                <div className="flex justify-between items-center">
                  <h3 className="text-[12px] font-extrabold text-slate-800 uppercase tracking-wide">2. Tổng giá trị thanh toán</h3>
                  {savedAmount > 0 && (
                    <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">
                      Tiết kiệm {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(savedAmount)}
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="text-[28px] font-black text-red-600 tracking-tight leading-none">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalAmount)}
                  </span>
                  <span className="text-[14px] font-semibold text-slate-400 line-through decoration-slate-300">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(oldTotalAmount)}
                  </span>
                </div>
              </div>

              {/* 3. TÓM TẮT ĐƠN HÀNG */}
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                <button
                  onClick={() => setIsSummaryOpen(!isSummaryOpen)}
                  className="w-full flex items-center justify-between p-3 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                >
                  <h3 className="text-[12px] font-extrabold text-slate-800 uppercase tracking-wide">3. Tóm tắt đơn hàng</h3>
                  <div className="flex items-center gap-1.5 text-[11px] text-blue-600 font-semibold">
                    Xem chi tiết <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isSummaryOpen ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                {/* Summary quick stats */}
                <div className="flex items-center justify-between px-3 py-2 border-t border-slate-100 text-[11px] font-medium text-slate-600 bg-white">
                  <div className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-slate-400" /> {selectedUpsells.size + 1} sản phẩm</div>
                  <div className="flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-yellow-500" /> Giảm giá 24%</div>
                  <div className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-green-500" /> Tiết kiệm {savedAmount / 1000}k</div>
                </div>

                {isSummaryOpen && (
                  <div className="p-3 border-t border-slate-100 bg-slate-50/50 space-y-2 text-[12px]">
                    <div className="flex justify-between items-start gap-4">
                      <span className="text-slate-700 font-medium line-clamp-1">{selectedProduct.name}</span>
                      <span className="font-bold text-slate-900 shrink-0">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedProduct.price)}</span>
                    </div>
                    {STATIC_UPSELLS.filter(u => selectedUpsells.has(u.id)).map(upsell => (
                      <div key={upsell.id} className="flex justify-between items-start gap-4">
                        <span className="text-slate-600 line-clamp-1 flex items-center gap-1.5">
                          <Check className="w-3 h-3 text-green-500" /> {upsell.name}
                        </span>
                        <span className="font-bold text-slate-900 shrink-0">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(upsell.price)}</span>
                      </div>
                    ))}
                    <div className="border-t border-slate-200/80 pt-2.5 flex justify-between items-center font-extrabold text-slate-800">
                      <span>Tổng cộng</span>
                      <span className="text-red-600 text-[14px]">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalAmount)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* 4. GỢI Ý MUA KÈM */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <h3 className="text-[12px] font-extrabold text-slate-800 uppercase tracking-wide">4. Gợi ý mua kèm</h3>
                  <span className="text-[9px] font-bold text-orange-700 bg-orange-100 px-1.5 py-0.5 rounded border border-orange-200 uppercase">Tiết kiệm 30%</span>
                </div>
                <div className="space-y-2">
                  {STATIC_UPSELLS.map(upsell => {
                    const isChecked = selectedUpsells.has(upsell.id);
                    return (
                      <label
                        key={upsell.id}
                        className={`flex items-center gap-3 p-2 rounded-xl border cursor-pointer transition-all duration-200 ${isChecked ? 'bg-blue-50/30 border-blue-400 shadow-sm' : 'bg-white border-slate-200 hover:border-blue-200'}`}
                      >
                        <div className="relative flex items-center justify-center shrink-0 ml-1">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleUpsell(upsell.id)}
                            className="peer appearance-none w-4 h-4 border-2 border-slate-300 rounded hover:border-blue-500 checked:bg-blue-600 checked:border-blue-600 transition-colors cursor-pointer"
                          />
                          <Check className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" strokeWidth={3} />
                        </div>
                        <img src={upsell.image_url} alt={upsell.name} className="w-9 h-11 object-cover rounded border border-slate-200 shrink-0" />
                        <div className="flex-1 flex flex-col justify-center min-w-0">
                          <h4 className="text-[11px] font-bold text-slate-700 line-clamp-1 leading-tight">{upsell.name}</h4>
                          <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-[12px] font-extrabold text-red-600">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(upsell.price)}</span>
                            <span className="text-[10px] font-semibold text-slate-400 line-through">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(upsell.oldPrice)}</span>
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* 5. FORM THU THẬP EMAIL & CTA */}
              <div className="space-y-2.5 pt-1">
                <h3 className="text-[12px] font-extrabold text-slate-800 uppercase tracking-wide">5. Thông tin nhận tài liệu</h3>
                <form id="payment-form" onSubmit={handlePayment} className="space-y-3">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="email"
                      required
                      placeholder="Nhập email của bạn..."
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 text-[13px] font-medium text-slate-800 border border-slate-300 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all bg-white"
                    />
                  </div>
                  <div className="flex gap-1.5 text-[11px] text-green-700 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Link tải tài liệu sẽ được gửi vào email ngay sau khi thanh toán thành công!</span>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || paymentData !== null}
                    className="w-full h-[44px] bg-[#FFC107] hover:bg-[#FFB300] text-slate-900 font-extrabold text-[14px] rounded-xl shadow-[0_4px_14px_rgba(255,193,7,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed uppercase tracking-wide"
                  >
                    {loading ? (
                      <>
                        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
                        Đang tạo đơn...
                      </>
                    ) : paymentData ? (
                      <>
                        <Check className="w-4 h-4" /> Đã tạo đơn hàng
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" /> Tiến hành thanh toán
                      </>
                    )}
                  </button>
                  <p className="text-center text-[11px] text-slate-500 font-medium flex items-center justify-center gap-1.5 pb-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-green-600" /> Giảng Dạy Số cam kết bảo mật thông tin
                  </p>
                </form>
              </div>

            </div>
          </div>


          {/* ========================================================= */}
          {/* RIGHT COLUMN: PAYMENT METHODS (55%) */}
          {/* ========================================================= */}
          <div className="w-full lg:w-[55%] flex flex-col p-5 lg:overflow-y-auto relative">
            <div className="max-w-xl mx-auto w-full space-y-5">

              <h3 className="text-[12px] font-extrabold text-slate-800 uppercase tracking-wide">6. Chọn phương thức thanh toán</h3>

              {/* TABS */}
              <div className="grid grid-cols-2 gap-3 relative z-10">
                <button
                  onClick={() => setPaymentTab('qr')}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border-2 transition-all duration-200 ${paymentTab === 'qr' ? 'border-blue-600 bg-blue-50/50' : 'border-slate-200 bg-white hover:border-blue-200 hover:bg-slate-50'}`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-[13px] text-slate-800">
                    <ScanLine className={`w-4 h-4 ${paymentTab === 'qr' ? 'text-blue-600' : 'text-slate-400'}`} />
                    Quét mã QR
                  </div>
                  <span className={`text-[10px] mt-0.5 font-medium ${paymentTab === 'qr' ? 'text-blue-600' : 'text-slate-500'}`}>Thanh toán nhanh 24/7</span>
                </button>
                <button
                  onClick={() => setPaymentTab('manual')}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border-2 transition-all duration-200 ${paymentTab === 'manual' ? 'border-blue-600 bg-blue-50/50' : 'border-slate-200 bg-white hover:border-blue-200 hover:bg-slate-50'}`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-[13px] text-slate-800">
                    <Wallet className={`w-4 h-4 ${paymentTab === 'manual' ? 'text-blue-600' : 'text-slate-400'}`} />
                    Chuyển khoản thủ công
                  </div>
                  <span className={`text-[10px] mt-0.5 font-medium ${paymentTab === 'manual' ? 'text-blue-600' : 'text-slate-500'}`}>Áp dụng cho mọi ngân hàng</span>
                </button>
              </div>

              {/* PAYMENT AREA WRAPPER WITH BLUR IF PENDING */}
              <div className="relative">
                {!paymentData && orderStatus === 'pending' && (
                  <div className="absolute inset-0 z-20 backdrop-blur-md bg-white/60 flex flex-col items-center justify-center rounded-2xl border border-slate-200 shadow-sm transition-all duration-500">
                    <Lock className="w-10 h-10 text-slate-300 mb-2" />
                    <p className="text-[13px] font-bold text-slate-600 text-center px-6 leading-relaxed">
                      Vui lòng nhập Email và bấm <span className="text-[#F5A500]">"TIẾN HÀNH THANH TOÁN"</span><br /> để hiển thị thông tin chuyển khoản.
                    </p>
                  </div>
                )}

                {/* TAB CONTENT: QR */}
                {paymentTab === 'qr' && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-1.5 text-[12px] text-blue-700 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 font-medium">
                      <Info className="w-3.5 h-3.5 shrink-0" />
                      Mở ứng dụng ngân hàng hoặc ví điện tử và quét mã QR để thanh toán
                    </div>

                    <div className="flex flex-col sm:flex-row gap-5 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm items-center sm:items-stretch">

                      {/* QR LEFT */}
                      <div className="shrink-0 flex flex-col items-center justify-center border-r-0 sm:border-r border-slate-200 sm:pr-5 pb-5 sm:pb-0">
                        <div className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-sm relative group">
                          {paymentData?.qrCode ? (
                            <QRCodeSVG value={paymentData.qrCode} size={160} level="H" includeMargin={true} />
                          ) : (
                            <div className="w-[160px] h-[160px] bg-slate-100 animate-pulse rounded-xl" />
                          )}
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-md p-1 shadow-md">
                            <span className="font-black text-red-600 text-[9px] tracking-widest px-1">VietQR</span>
                          </div>
                        </div>
                      </div>

                      {/* INSTRUCTIONS RIGHT */}
                      <div className="flex-1 flex flex-col justify-center gap-3.5 text-[12px] text-slate-700 font-medium">
                        <div className="flex items-start gap-2.5">
                          <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200 text-[11px]">1</div>
                          <span className="pt-0.5">Mở ứng dụng ngân hàng hoặc ví điện tử</span>
                        </div>
                        <div className="flex items-start gap-2.5">
                          <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200 text-[11px]">2</div>
                          <span className="pt-0.5">Chọn chức năng quét mã QR</span>
                        </div>
                        <div className="flex items-start gap-2.5">
                          <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200 text-[11px]">3</div>
                          <span className="pt-0.5">Quét mã QR hiển thị bên cạnh</span>
                        </div>
                        <div className="flex items-start gap-2.5">
                          <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200 text-[11px]">4</div>
                          <span className="pt-0.5">Kiểm tra thông tin và xác nhận thanh toán</span>
                        </div>
                      </div>
                    </div>

                    {/* Bank Logos Mock */}
                    <div className="flex items-center justify-center gap-5 grayscale opacity-60">
                      <span className="text-[11px] font-bold">Vietcombank</span>
                      <span className="text-[11px] font-bold text-red-600">Techcombank</span>
                      <span className="text-[11px] font-bold text-blue-800">BIDV</span>
                      <span className="text-[11px] font-bold text-blue-600">MBBank</span>
                      <span className="text-[11px] font-bold text-purple-600">TPBank</span>
                    </div>
                  </div>
                )}

                {/* TAB CONTENT: MANUAL */}
                {paymentTab === 'manual' && (
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
                    <h4 className="text-[13px] font-bold text-slate-800">Thông tin đơn hàng</h4>

                    <div className="space-y-3 text-[12px]">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                        <span className="text-slate-500 font-medium">Nhà cung cấp</span>
                        <span className="font-bold text-slate-800 text-[13px]">GIANGDAYSO.COM</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                        <span className="text-slate-500 font-medium">Ngân hàng</span>
                        <span className="font-extrabold text-slate-800 text-[14px]">BIDV</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                        <span className="text-slate-500 font-medium">Chủ tài khoản</span>
                        <span className="font-extrabold text-slate-800">NGUYEN THI THU THUY</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                        <span className="text-slate-500 font-medium">Số tài khoản</span>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-800 text-[14px]">8828571638</span>
                          <button onClick={() => handleCopy('8828571638')} className="text-blue-600 hover:text-blue-800 p-1 bg-blue-50 rounded-md transition-colors" title="Copy số tài khoản">
                            {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                        <span className="text-slate-500 font-medium">Số tiền thanh toán</span>
                        <span className="font-extrabold text-red-600 text-[15px]">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalAmount)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                        <span className="text-slate-600 font-bold">Mã đơn hàng (Nội dung CK)</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-blue-700 text-[15px] tracking-wider">{paymentData?.orderCode || 'XXXXXX'}</span>
                          <button onClick={() => handleCopy(paymentData?.orderCode?.toString() || '')} className="text-blue-600 hover:text-blue-800 p-1 bg-blue-100 rounded-md transition-colors" title="Copy nội dung">
                            {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* BANNER NOTE */}
                <div className="mt-3 bg-[#fff8e6] border border-[#fdebb3] rounded-xl p-3 flex gap-2.5 text-orange-800 text-[12px] leading-relaxed shadow-sm">
                  <Info className="w-4 h-4 shrink-0 text-orange-500 mt-0.5" />
                  <div>
                    <span className="font-bold">Lưu ý:</span> Vui lòng GIỮ NGUYÊN nội dung chuyển khoản <span className="font-extrabold text-red-600 bg-white px-1.5 py-0.5 rounded border border-orange-200 shadow-sm mx-1 tracking-wider">{paymentData?.orderCode || 'XXXXXX'}</span> để hệ thống tự động xác nhận và gửi tài liệu cho bạn.
                  </div>
                </div>

              </div>

              {/* 7. TRẠNG THÁI THANH TOÁN */}
              <div className="space-y-2.5 pt-1">
                <h3 className="text-[12px] font-extrabold text-slate-800 uppercase tracking-wide">7. Trạng thái thanh toán</h3>

                {orderStatus === 'pending' ? (
                  <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-white shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 h-full w-1 bg-yellow-400"></div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                        <span className="inline-block h-5 w-5 animate-spin rounded-full border-[2.5px] border-slate-400 border-t-transparent" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-800 text-[14px]">ĐANG CHỜ THANH TOÁN...</h4>
                        <p className="text-[12px] text-slate-500 mt-0.5">Thầy/Cô vui lòng hoàn tất thanh toán để nhận tài liệu ngay.</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-6 rounded-[20px] border-2 border-green-500 bg-green-50 shadow-sm animate-in zoom-in-95 duration-500 text-center">
                    <CheckCircle2 className="w-12 h-12 text-green-500 mb-3" />
                    <h4 className="font-black text-green-700 text-[18px] mb-1.5">Thanh toán thành công!</h4>
                    <p className="text-[13px] text-green-800 font-medium mb-5">
                      Vui lòng kiểm tra email <strong className="text-black bg-white px-2 py-1 rounded shadow-sm mx-1">{email}</strong> để tải tài liệu.
                    </p>

                    {isDynamic ? (
                      <a
                        href={accessLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-[44px] items-center justify-center px-8 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 transition-colors shadow-md gap-2 text-[14px]"
                      >
                        <DownloadCloud className="w-4 h-4" /> Mở Drive Tài Liệu
                      </a>
                    ) : signedUrl ? (
                      <a
                        href={signedUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-[44px] items-center justify-center px-8 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 transition-colors shadow-md gap-2 text-[14px]"
                      >
                        <DownloadCloud className="w-4 h-4" /> Tải tài liệu ngay
                      </a>
                    ) : (
                      <div className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-white border border-green-200 text-[13px] font-bold text-green-700 shadow-sm">
                        <span className="inline-block h-4 w-4 animate-spin rounded-full border-[2.5px] border-green-500 border-t-transparent" />
                        Đang tạo link tải...
                      </div>
                    )}
                  </div>
                )}
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
