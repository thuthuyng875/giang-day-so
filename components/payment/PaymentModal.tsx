'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { usePayment } from './PaymentProvider';
import { QRCodeCanvas } from 'qrcode.react';
import { X, CheckCircle2, Zap, Lock, User, ChevronDown, Copy, Check, Info, Star, ShieldCheck, ScanLine, Wallet, Mail, DownloadCloud } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

type PaymentData = {
  orderCode: number;
  qrCode: string;
};



export function PaymentModal() {
  const { isModalOpen, selectedProduct, closePaymentModal } = usePayment();

  // Left Column States
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  // Right Column States
  const [paymentTab, setPaymentTab] = useState<'qr' | 'manual'>('qr');
  const [copiedText, setCopiedText] = useState<string | null>(null);

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
      setPaymentData(null);
      setOrderStatus('pending');
      setSignedUrl('');
      setIsDynamic(false);
      setAccessLink('');
      setPaymentTab('qr');
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    }
  }, [isModalOpen, selectedProduct]);

  // Calculate Total Amount
  const baseProductPrice = useMemo(() => {
    if (!selectedProduct) return 0;
    return selectedProduct.price ?? (selectedProduct as any).sale_price ?? 0;
  }, [selectedProduct]);

  const totalAmount = useMemo(() => {
    if (!selectedProduct) return 0;
    return baseProductPrice;
  }, [selectedProduct, baseProductPrice]);

  const oldTotalAmount = useMemo(() => {
    if (!selectedProduct) return 0;
    return (selectedProduct as any).original_price ?? Math.round((baseProductPrice * 1.25) / 5000) * 5000;
  }, [selectedProduct, baseProductPrice]);

  const savedAmount = oldTotalAmount > totalAmount ? oldTotalAmount - totalAmount : 0;
  const discountPercent = oldTotalAmount > 0 ? Math.round((savedAmount / oldTotalAmount) * 100) : 0;

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
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleDownloadQR = () => {
    const canvas = document.getElementById('payment-qr-code') as HTMLCanvasElement;
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = 'QR_Thanh_Toan.png';
      a.click();
    }
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



              {/* 1. TÓM TẮT ĐƠN HÀNG */}
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                <div className="w-full flex items-center justify-between p-3 bg-slate-50/50">
                  <h3 className="text-[12px] font-extrabold text-slate-800 uppercase tracking-wide">1. Tóm tắt đơn hàng</h3>
                </div>

                {/* Summary quick stats */}
                <div className="flex items-center justify-between px-3 py-2 border-t border-slate-100 text-[11px] font-medium text-slate-600 bg-white">
                  <div className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-slate-400" /> 1 sản phẩm</div>
                  <div className="flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-yellow-500" /> Giảm giá {discountPercent}%</div>
                  <div className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-green-500" /> Tiết kiệm {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(savedAmount)}</div>
                </div>

                <div className="p-3 border-t border-slate-100 bg-slate-50/50 space-y-2 text-[12px]">
                  <div className="flex justify-between items-start gap-4">
                    <span className="text-slate-700 font-medium line-clamp-1">{selectedProduct.name}</span>
                    <span className="font-bold text-slate-900 shrink-0">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(baseProductPrice)}</span>
                  </div>
                  <div className="border-t border-slate-200/80 pt-2.5 flex justify-between items-center font-extrabold text-slate-800">
                    <span>Tổng cộng</span>
                    <span className="text-red-600 text-[18px] font-black tracking-tight">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalAmount)}</span>
                  </div>
                </div>
              </div>

              {/* 2. FORM THU THẬP EMAIL & CTA */}
              <div className="space-y-2.5 pt-1">
                <h3 className="text-[12px] font-extrabold text-slate-800 uppercase tracking-wide">2. Thông tin nhận tài liệu</h3>
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

              {/* 3. TRẠNG THÁI THANH TOÁN (MOVED TO LEFT) */}
              <div className="space-y-2.5 pt-1">
                <h3 className="text-[12px] font-extrabold text-slate-800 uppercase tracking-wide">3. Trạng thái thanh toán</h3>

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
                      Link tải dự phòng đã được gửi về email <strong className="text-black bg-white px-2 py-1 rounded shadow-sm mx-1">{email}</strong>
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


          {/* ========================================================= */}
          {/* RIGHT COLUMN: PAYMENT METHODS (55%) */}
          {/* ========================================================= */}
          <div className="w-full lg:w-[55%] flex flex-col p-5 lg:overflow-y-auto relative">
            <div className="max-w-xl mx-auto w-full space-y-5">

              <h3 className="text-[12px] font-extrabold text-slate-800 uppercase tracking-wide">4. Phương thức thanh toán</h3>

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
                  <div className="w-full flex flex-col">
                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-md max-w-sm mx-auto flex flex-col items-center w-full">
                      {/* Top Logo */}
                      <img src="/images/qr/vietqr-text.png" alt="VietQR" className="h-5 mb-3 object-contain" />

                      {/* QR Code */}
                      <div className="border-2 border-[#1B3687] p-1.5 bg-white mb-3 relative">
                        {paymentData?.qrCode ? (
                          <QRCodeCanvas
                            id="payment-qr-code"
                            value={paymentData.qrCode}
                            size={180}
                            level="H"
                            imageSettings={{ src: "/images/qr/v-icon.png", height: 24, width: 24, excavate: true }}
                          />
                        ) : (
                          <div className="w-[180px] h-[180px] bg-slate-100 animate-pulse flex items-center justify-center">
                            <span className="text-slate-400 font-medium text-[12px]">Đang tải mã QR...</span>
                          </div>
                        )}
                      </div>

                      {/* Bottom Logos */}
                      <div className="flex flex-row items-center justify-center gap-3 mb-4 w-full">
                        <img src="/images/qr/napas.png" alt="Napas 247" className="h-5 object-contain" />
                        <div className="h-6 w-[1px] bg-gray-300"></div>
                        <img src="/images/qr/bank-logo.png" alt="Bank Logo" className="h-5 object-contain" />
                      </div>

                      {/* Account Details */}
                      <div className="text-center text-sm leading-relaxed text-[#1B3687]">
                        <p>Tên TK: NGUYEN THI THU THUY</p>
                        <p className="font-bold text-base">Số TK: 8828571638</p>
                        <p>Ngân hàng BIDV</p>
                      </div>
                    </div>

                    {/* Download Button */}
                    <button
                      onClick={handleDownloadQR}
                      className="flex items-center justify-center gap-2 w-full max-w-sm mx-auto mt-4 py-3 bg-blue-50 text-blue-700 font-bold rounded-lg border border-blue-200 hover:bg-blue-100 active:bg-blue-200 transition-colors"
                    >
                      <DownloadCloud className="w-4 h-4" />
                      Tải ảnh QR về máy
                    </button>


                  </div>
                )}

                {/* TAB CONTENT: MANUAL */}
                {paymentTab === 'manual' && (
                  <div className="w-full max-w-sm mx-auto bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <h4 className="text-[13px] font-bold text-slate-800 mb-4 px-1">Thông tin chuyển khoản</h4>

                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <div>
                        <span className="text-sm text-gray-500">Ngân hàng</span>
                        <span className="text-base font-bold text-gray-900 block mt-0.5">BIDV</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <div>
                        <span className="text-sm text-gray-500">Chủ tài khoản</span>
                        <span className="text-base font-bold text-gray-900 block mt-0.5">NGUYEN THI THU THUY</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <div>
                        <span className="text-sm text-gray-500">Số tài khoản</span>
                        <span className="text-base font-bold text-gray-900 block mt-0.5">8828571638</span>
                      </div>
                      <button
                        onClick={() => handleCopy('8828571638')}
                        className="p-2 bg-gray-50 hover:bg-gray-100 rounded-md text-blue-600 font-medium text-sm flex items-center gap-1 transition-colors"
                      >
                        {copiedText === '8828571638' ? (
                          <><Check className="w-4 h-4 text-green-600" /> <span className="text-green-600">Đã chép</span></>
                        ) : (
                          <><Copy className="w-4 h-4" /> Sao chép</>
                        )}
                      </button>
                    </div>

                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <div>
                        <span className="text-sm text-gray-500">Số tiền</span>
                        <span className="text-base font-bold text-gray-900 block mt-0.5">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalAmount)}
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopy(totalAmount.toString())}
                        className="p-2 bg-gray-50 hover:bg-gray-100 rounded-md text-blue-600 font-medium text-sm flex items-center gap-1 transition-colors"
                      >
                        {copiedText === totalAmount.toString() ? (
                          <><Check className="w-4 h-4 text-green-600" /> <span className="text-green-600">Đã chép</span></>
                        ) : (
                          <><Copy className="w-4 h-4" /> Sao chép</>
                        )}
                      </button>
                    </div>

                    <div className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
                      <div>
                        <span className="text-sm text-gray-500">Nội dung chuyển khoản</span>
                        <span className="text-base font-bold text-gray-900 block mt-0.5 uppercase">
                          {paymentData?.orderCode || 'XXXXXX'}
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopy(paymentData?.orderCode?.toString() || '')}
                        className="p-2 bg-gray-50 hover:bg-gray-100 rounded-md text-blue-600 font-medium text-sm flex items-center gap-1 transition-colors"
                      >
                        {copiedText === (paymentData?.orderCode?.toString() || '') ? (
                          <><Check className="w-4 h-4 text-green-600" /> <span className="text-green-600">Đã chép</span></>
                        ) : (
                          <><Copy className="w-4 h-4" /> Sao chép</>
                        )}
                      </button>
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

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
