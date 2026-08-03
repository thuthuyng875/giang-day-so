import { NextResponse } from 'next/server';
import { PayOS } from '@payos/node';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const payos = new PayOS({
  clientId: process.env.PAYOS_CLIENT_ID!,
  apiKey: process.env.PAYOS_API_KEY!,
  checksumKey: process.env.PAYOS_CHECKSUM_KEY!,
});

const resend = new Resend(process.env.RESEND_API_KEY);
const STORAGE_BUCKET = 'digital-docs';
const signedUrlCache = new Map<number, { signedUrl: string; expiresAtMs: number }>();

function normalizeStoragePath(rawPath: string, bucket: string) {
  const trimmed = rawPath.trim();
  if (trimmed.length === 0) return '';

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const url = new URL(trimmed);
      const parts = url.pathname.split('/').filter(Boolean);
      const bucketIndex = parts.findIndex((p) => p === bucket);
      if (bucketIndex >= 0) {
        return decodeURIComponent(parts.slice(bucketIndex + 1).join('/'));
      }
      return decodeURIComponent(parts[parts.length - 1] ?? '');
    } catch {
      return trimmed;
    }
  }

  const bucketMarker = `${bucket}/`;
  const markerIndex = trimmed.indexOf(bucketMarker);
  const withoutBucketPrefix = markerIndex >= 0 ? trimmed.slice(markerIndex + bucketMarker.length) : trimmed;

  return withoutBucketPrefix.replace(/^\/+/, '');
}

export async function POST(request: Request) {
  try {
    console.log('1. Bắt đầu gọi PayOS kiểm tra mã...');

    const body: unknown = await request.json();
    const orderCodeRaw =
      body && typeof body === 'object' && 'orderCode' in body
        ? (body as { orderCode?: unknown }).orderCode
        : undefined;

    const orderCode = Number(orderCodeRaw);
    if (!Number.isFinite(orderCode)) {
      return NextResponse.json(
        { error: 'orderCode không hợp lệ', details: { orderCode: orderCodeRaw } },
        { status: 400 },
      );
    }

    const cached = signedUrlCache.get(orderCode);
    if (cached && cached.expiresAtMs > Date.now()) {
      console.log('2. Trạng thái PayOS là: PAID');
      return NextResponse.json({
        orderCode,
        status: 'PAID',
        signedUrl: cached.signedUrl,
      });
    }

    let paymentLink;
    if (typeof (payos as unknown as { getPaymentLinkInformation?: unknown }).getPaymentLinkInformation === 'function') {
      paymentLink = await (payos as unknown as { getPaymentLinkInformation: (code: number) => Promise<unknown> }).getPaymentLinkInformation(orderCode);
    } else {
      paymentLink = await payos.paymentRequests.get(orderCode);
    }

    const status =
      paymentLink && typeof paymentLink === 'object' && 'status' in paymentLink
        ? (paymentLink as { status?: unknown }).status
        : undefined;

    console.log(`2. Trạng thái PayOS là: ${String(status)}`);
    console.log('3. Bắt đầu chọc vào DB lấy path...');

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      console.error('Thiếu env NEXT_PUBLIC_SUPABASE_URL ở backend');
    }
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Thiếu env SUPABASE_SERVICE_ROLE_KEY (khuyến nghị dùng để tránh lỗi RLS khi bucket Private)');
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
    const { data: orderRow, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('order_code', orderCode)
      .maybeSingle();

    if (orderError) {
      return NextResponse.json(
        { error: 'Không thể lấy đơn hàng', details: orderError.message },
        { status: 500 },
      );
    }

    const productId =
      orderRow && typeof orderRow === 'object' && 'product_id' in orderRow
        ? (orderRow as { product_id?: unknown }).product_id
        : undefined;

    console.log('3.1. Đã lấy đơn hàng:', { hasOrder: Boolean(orderRow), orderCode, productId });

    const existingSignedUrl =
      orderRow && typeof orderRow === 'object' && 'signed_url' in orderRow
        ? (orderRow as { signed_url?: unknown }).signed_url
        : undefined;

    const existingExpiresAt =
      orderRow && typeof orderRow === 'object' && 'signed_url_expires_at' in orderRow
        ? (orderRow as { signed_url_expires_at?: unknown }).signed_url_expires_at
        : undefined;

    if (typeof existingSignedUrl === 'string' && existingSignedUrl.length > 0) {
      if (typeof existingExpiresAt === 'string') {
        const expiresAtMs = Date.parse(existingExpiresAt);
        if (!Number.isNaN(expiresAtMs) && expiresAtMs > Date.now()) {
          signedUrlCache.set(orderCode, { signedUrl: existingSignedUrl, expiresAtMs });
        }
        return NextResponse.json({
          orderCode,
          status,
          signedUrl: existingSignedUrl,
          paymentLink,
        });
      }

      return NextResponse.json({
        orderCode,
        status,
        signedUrl: existingSignedUrl,
        paymentLink,
      });
    }

    if (status === 'PAID') {
      const { error: updateOrderStatusError } = await supabase
        .from('orders')
        .update({ status: 'PAID' })
        .eq('order_code', orderCode);

      if (updateOrderStatusError) {
        return NextResponse.json(
          { error: 'Không thể cập nhật trạng thái đơn hàng', details: updateOrderStatusError.message, status },
          { status: 500 },
        );
      }

      if (!productId) {
        return NextResponse.json(
          { error: 'Không tìm thấy product_id của đơn hàng', details: { orderCode } },
          { status: 500 },
        );
      }

      const { data: productRow, error: productError } = await supabase
        .from('products')
        .select('file_url, is_dynamic, access_link')
        .eq('id', productId)
        .maybeSingle();

      if (productError) {
        return NextResponse.json(
          { error: 'Không thể lấy file_path của sản phẩm', details: productError.message },
          { status: 500 },
        );
      }

      const filePath =
        productRow && typeof productRow === 'object' && 'file_url' in productRow
          ? (productRow as { file_url?: unknown }).file_url
          : undefined;

      const isDynamic =
        productRow && typeof productRow === 'object' && 'is_dynamic' in productRow
          ? Boolean((productRow as { is_dynamic?: unknown }).is_dynamic)
          : false;

      const accessLink =
        productRow && typeof productRow === 'object' && 'access_link' in productRow
          ? String((productRow as { access_link?: unknown }).access_link || '')
          : '';

      let signedUrl: string | undefined;

      if (!isDynamic) {
        if (typeof filePath !== 'string' || filePath.length === 0) {
          return NextResponse.json(
            { error: 'Sản phẩm chưa có file_url', details: { productId } },
            { status: 500 },
          );
        }

        const normalizedFilePath = normalizeStoragePath(filePath, STORAGE_BUCKET);
        console.log('3.2. file_url lấy từ products:', { filePathRaw: filePath, normalizedFilePath, bucket: STORAGE_BUCKET });

        if (!normalizedFilePath) {
          return NextResponse.json(
            {
              error: 'file_url không hợp lệ (sau khi chuẩn hoá rỗng)',
              details: { productId, filePathRaw: filePath, bucket: STORAGE_BUCKET },
            },
            { status: 500 },
          );
        }

        console.log('4. Bắt đầu tạo Signed URL từ Storage...');

        const { data: signedData, error: signedError } = await supabase.storage
          .from(STORAGE_BUCKET)
          .createSignedUrl(normalizedFilePath, 86400);

        if (signedError) {
          console.error('Lỗi createSignedUrl:', {
            bucket: STORAGE_BUCKET,
            filePathRaw: filePath,
            normalizedFilePath,
            message: signedError.message,
          });

          try {
            const segments = normalizedFilePath.split('/').filter(Boolean);
            const fileName = segments.pop() ?? '';
            const dir = segments.join('/');
            const { data: listData, error: listError } = await supabase.storage
              .from(STORAGE_BUCKET)
              .list(dir, { search: fileName, limit: 20 });

            if (listError) {
              console.error('Storage list check error:', { dir, fileName, message: listError.message });
            } else {
              console.log('Storage list check:', { dir, fileName, matches: (listData ?? []).map((x) => x.name) });
            }
          } catch (e) {
            console.error('Storage list check threw:', e);
          }

          return NextResponse.json(
            {
              error: 'Không thể tạo Signed URL',
              details: signedError.message,
              meta: { bucket: STORAGE_BUCKET, filePathRaw: filePath, normalizedFilePath },
            },
            { status: 500 },
          );
        }

        signedUrl = signedData?.signedUrl;
        if (!signedUrl) {
          return NextResponse.json(
            { error: 'Không nhận được signedUrl từ Supabase' },
            { status: 500 },
          );
        }

        const expiresAtMs = Date.now() + 86400 * 1000;
        signedUrlCache.set(orderCode, { signedUrl, expiresAtMs });

        const { error: persistSignedUrlError } = await supabase
          .from('orders')
          .update({
            signed_url: signedUrl,
            signed_url_expires_at: new Date(expiresAtMs).toISOString(),
          })
          .eq('order_code', orderCode);

        if (persistSignedUrlError) {
          console.error('Không thể lưu signed_url vào DB (kiểm tra đã tạo cột signed_url, signed_url_expires_at chưa):', {
            message: persistSignedUrlError.message,
          });
        }
      }

      try {
        if (!process.env.RESEND_API_KEY) {
          console.error('Thiếu env RESEND_API_KEY');
        } else {
          const { data: orderEmailRow, error: orderEmailError } = await supabase
            .from('orders')
            .select('customer_email, product_id')
            .eq('order_code', orderCode)
            .maybeSingle();

          if (orderEmailError) {
            console.error('Không thể lấy email khách hàng từ orders:', { message: orderEmailError.message });
          } else {
            const customerEmail =
              orderEmailRow && typeof orderEmailRow === 'object' && 'customer_email' in orderEmailRow
                ? (orderEmailRow as { customer_email?: unknown }).customer_email
                : undefined;
            const paidProductId =
              orderEmailRow && typeof orderEmailRow === 'object' && 'product_id' in orderEmailRow
                ? (orderEmailRow as { product_id?: unknown }).product_id
                : productId;

            if (typeof customerEmail !== 'string' || customerEmail.length === 0) {
              console.error('Không có customer_email hợp lệ trong orders:', { orderCode });
            } else {
              let productName = 'Tài liệu của bạn';
              if (paidProductId) {
                const { data: productNameRow, error: productNameError } = await supabase
                  .from('products')
                  .select('name')
                  .eq('id', paidProductId)
                  .maybeSingle();

                if (productNameError) {
                  console.error('Không thể lấy tên tài liệu từ products:', { message: productNameError.message });
                } else {
                  const name =
                    productNameRow && typeof productNameRow === 'object' && 'name' in productNameRow
                      ? (productNameRow as { name?: unknown }).name
                      : undefined;
                  if (typeof name === 'string' && name.length > 0) {
                    productName = name;
                  }
                }
              }

              let html = '';
              if (isDynamic) {
                html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body style="margin:0;padding:0;background:#f6f7fb;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;">
    <div style="padding:24px 12px;">
      <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;">
        <div style="padding:20px 20px;background:linear-gradient(135deg,#16a34a,#22c55e);color:#fff;">
          <div style="font-size:18px;font-weight:700;letter-spacing:0.2px;">Thanh toán thành công</div>
          <div style="margin-top:6px;font-size:13px;opacity:0.95;">Cảm ơn bạn đã ủng hộ Digital Docs</div>
        </div>
        <div style="padding:22px 20px;color:#111827;">
          <h3>🎉 Kích hoạt thành công Gói cập nhật tài liệu!</h3>
          <p>Cảm ơn Thầy/Cô đã mua bộ tài liệu <b>${productName}</b>.</p>
          <p>Thầy/Cô vui lòng bấm vào nút bên dưới để truy cập vào Drive lưu trữ. Bất cứ khi nào có bản cập nhật mới, Tài Liệu Giảng Dạy 365 sẽ thêm ngay vào thư mục này mà Thầy/Cô sẽ không cần thao tác gì thêm.</p>
          <div style="text-align:center;margin:18px 0 8px 0;">
            <a href="${accessLink}" target="_blank" rel="noreferrer"
               style="background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Mở Drive Tài Liệu
            </a>
          </div>
        </div>
        <div style="padding:14px 20px;border-top:1px solid #e5e7eb;color:#9ca3af;font-size:12px;">
          Digital Docs • Email tự động từ hệ thống
        </div>
      </div>
    </div>
  </body>
</html>`;
              } else {
                html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body style="margin:0;padding:0;background:#f6f7fb;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;">
    <div style="padding:24px 12px;">
      <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;">
        <div style="padding:20px 20px;background:linear-gradient(135deg,#16a34a,#22c55e);color:#fff;">
          <div style="font-size:18px;font-weight:700;letter-spacing:0.2px;">Thanh toán thành công</div>
          <div style="margin-top:6px;font-size:13px;opacity:0.95;">Cảm ơn bạn đã ủng hộ Digital Docs</div>
        </div>
        <div style="padding:22px 20px;color:#111827;">
          <p style="margin:0 0 12px 0;font-size:14px;line-height:1.6;">
            Xin chào,<br/>
            Cảm ơn bạn đã thanh toán thành công. Dưới đây là link tải tài liệu của bạn:
          </p>
          <div style="margin:14px 0 6px 0;padding:12px 14px;border:1px solid #e5e7eb;border-radius:12px;background:#f9fafb;">
            <div style="font-size:12px;color:#6b7280;margin-bottom:4px;">Tên tài liệu</div>
            <div style="font-size:15px;font-weight:700;color:#111827;">${productName}</div>
          </div>
          <div style="text-align:center;margin:18px 0 8px 0;">
            <a href="${signedUrl}" target="_blank" rel="noreferrer"
               style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:12px 18px;border-radius:12px;font-weight:700;font-size:14px;">
              Tải tài liệu ngay
            </a>
          </div>
          <p style="margin:12px 0 0 0;font-size:13px;line-height:1.6;color:#b91c1c;font-weight:700;">
            Link tải chỉ có hiệu lực trong 24 giờ. Vui lòng tải xuống máy tính của bạn.
          </p>
          <p style="margin:14px 0 0 0;font-size:12px;line-height:1.6;color:#6b7280;">
            Nếu bạn gặp vấn đề khi tải file, hãy phản hồi email này để được hỗ trợ.
          </p>
        </div>
        <div style="padding:14px 20px;border-top:1px solid #e5e7eb;color:#9ca3af;font-size:12px;">
          Digital Docs • Email tự động từ hệ thống
        </div>
      </div>
    </div>
  </body>
</html>`;
              }

              await resend.emails.send({
                from: 'onboarding@resend.dev',
                to: customerEmail,
                subject: '🎁 Thanh toán thành công! Đây là tài liệu của bạn',
                html,
              });
            }
          }
        }
      } catch (emailError: unknown) {
        console.error('Gửi email thất bại:', {
          message: emailError instanceof Error ? emailError.message : String(emailError),
          stack: emailError instanceof Error ? emailError.stack : undefined,
        });
      }

      return NextResponse.json({
        orderCode,
        status,
        signedUrl,
        paymentLink,
        isDynamic,
        accessLink,
      });
    }

    return NextResponse.json({ orderCode, status, paymentLink });
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : typeof error === 'string'
          ? error
          : 'Unknown error';

    console.error('Lỗi /api/check-order:', {
      message,
      error,
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      { error: 'Lỗi kiểm tra trạng thái đơn hàng', details: message },
      { status: 500 },
    );
  }
}
