"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
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
      router.replace("/auth/login");
      return;
    }

    const role = user.role || "";

    if (role === "nhanvien") {
      setLoading(false);
      return;
    }

    if (["quantrivien", "nhansu"].includes(role)) {
      if (pathname === "/employee/register-face") {
        setLoading(false);
        return;
      }
    }

    router.replace("/unauthorized");
  }, [router, pathname]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="animate-pulse text-slate-500">Đang kiểm tra quyền truy cập...</p>
      </div>
    );
  }

  return <>{children}</>;
}
