import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/app/globals.css";
import "antd/dist/reset.css";
import { ThemeProvider } from "@/contexts/ThemeContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "It-Global",
  description: "Ứng dụng chấm công nhân viên",
  icons: "/logo.png",
};

export default function RootLayout({ children }: React.PropsWithChildren) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased min-h-svh`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
