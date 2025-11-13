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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = getUserFromToken();

    if (!user) {
      setLoading(false);
      return;
    }

    if (user.role !== "nhanvien") {
      router.replace("/unauthorized");
      return;
    }

    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <p className="text-gray-500 dark:text-gray-200 animate-pulse">Đang kiểm tra quyền...</p>
      </div>
    );
  }

  return <MobileLayout>{children}</MobileLayout>;
}
