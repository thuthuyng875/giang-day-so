import { NextResponse } from 'next/server';
import { PayOS } from '@payos/node';

// Khởi tạo PayOS với object options đúng theo mã nguồn thư viện version 2.x
// Lưu ý quan trọng: 
// 1. PayOS constructor nhận vào 1 object { clientId, apiKey, checksumKey }
// 2. Thư viện @payos/node version 2.x sử dụng named export { PayOS }
const payos = new PayOS({
  clientId: process.env.PAYOS_CLIENT_ID!,
  apiKey: process.env.PAYOS_API_KEY!,
  checksumKey: process.env.PAYOS_CHECKSUM_KEY!
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("📥 Nhận request body:", body);

    // Ép kiểu dữ liệu Number cho orderCode và amount theo yêu cầu của PayOS
    const paymentLinkRequest = {
      orderCode: Number(body.orderCode),
      amount: Number(body.amount),
      description: body.description || "Thanh toan don hang",
      cancelUrl: body.cancelUrl || "http://localhost:3000",
      returnUrl: body.returnUrl || "http://localhost:3000",
    };

    console.log("✅ Dữ liệu chuẩn bị gửi PayOS:", paymentLinkRequest);

    const paymentLinkData = await payos.paymentRequests.create(paymentLinkRequest);

    console.log("🚀 Kết quả từ PayOS:", paymentLinkData);

    return NextResponse.json(paymentLinkData);

  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : typeof error === 'string'
          ? error
          : 'Unknown error';
    const stack = error instanceof Error ? error.stack : undefined;
    const code =
      error && typeof error === 'object' && 'code' in error && typeof (error as { code?: unknown }).code === 'string'
        ? (error as { code: string }).code
        : "UNKNOWN_ERROR";

    console.error("❌ LỖI TẠI API ROUTE:", {
      message,
      stack,
      error: error
    });

    return NextResponse.json(
      {
        error: "Lỗi tạo link PayOS",
        details: message,
        code
      },
      { status: 500 }
    );
  }
}
