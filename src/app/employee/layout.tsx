"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation"; 
import MobileLayout from "@/layouts/MobileLayout";
import { getUserFromToken } from "@/utils/auth";

interface EmployeeLayoutProps {
  children: ReactNode;
}

export default function EmployeeLayout({ children }: EmployeeLayoutProps) {
  const router = useRouter();
  const pathname = usePathname(); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = getUserFromToken();

    if (!user) {
      setLoading(false);
      return;
    }

    const role = user.role || "";
    
    //  Nếu là Nhân viên -> Cho phép hết
    if (role === "nhanvien") {
        setLoading(false);
        return;
    }

    // Nếu là Admin hoặc HR -> Chỉ cho phép nếu đang ở trang Đăng ký khuôn mặt
    if (["quantrivien", "nhansu"].includes(role)) {
        if (pathname?.includes("/employee/register-face")) {
            setLoading(false);
            return;
        }
    }

    router.replace("/unauthorized");
    
  }, [router, pathname]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <p className="text-gray-500 dark:text-gray-200 animate-pulse">Đang kiểm tra quyền...</p>
      </div>
    );
  }

  return <MobileLayout>{children}</MobileLayout>;
}