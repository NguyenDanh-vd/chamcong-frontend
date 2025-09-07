"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MobileLayout from "@/layouts/MobileLayout";
import { getUserFromToken } from "@/utils/auth";

interface EmployeeLayoutProps {
  children: ReactNode;
}

export default function EmployeeLayout({ children }: EmployeeLayoutProps) {
  const router = useRouter();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  useEffect(() => {
    const user = getUserFromToken();

    if (!user || user.role !== "nhanvien") {
      router.replace("/login"); // Redirect nếu không có quyền
      setHasAccess(false);
    } else {
      setHasAccess(true);
    }
  }, [router]);

  if (hasAccess === null) {
    // Loading hoặc đang kiểm tra quyền
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <p className="text-gray-500 dark:text-gray-200 animate-pulse">Đang kiểm tra quyền...</p>
      </div>
    );
  }

  if (!hasAccess) return null; // Nếu không có quyền, không render gì cả

  return <MobileLayout>{children}</MobileLayout>;
}
