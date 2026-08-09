import type { Metadata } from "next";
import { Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/layout/Header";
import { PaymentProvider } from "@/components/payment/PaymentProvider";
import { PaymentModal } from "@/components/payment/PaymentModal";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "vietnamese"],
});

export const metadata: Metadata = {
  title: "Giảng Dạy Số",
  description: "Kho tài liệu, giáo án và đề thi chất lượng cao"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-white text-slate-800 leading-relaxed font-sans text-[14px]">
        <PaymentProvider>
          <Header />
          <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 md:px-6">
            <main className="flex-1 py-3 md:py-4">{children}</main>
          </div>
          <Footer />
          <PaymentModal />
        </PaymentProvider>
      </body>
    </html>
  );
}
