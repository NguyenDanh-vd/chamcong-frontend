import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/app/globals.css";
import "antd/dist/reset.css";
import { Providers } from "./providers";
import { ThemeProvider } from '@/contexts/ThemeContext'; // <-- Bạn đã import đúng

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "It-Global",
  description: "Ứng dụng chấm công nhân viên",
  icons: '/logo.png',
};

export default function RootLayout({ children }: React.PropsWithChildren) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        {/* ============================================== */}
        {/* ======> THÊM THEMEPROVIDER BỌC NGOÀI Ở ĐÂY <====== */}
        {/* ============================================== */}
        <ThemeProvider>
          <Providers>{children}</Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}