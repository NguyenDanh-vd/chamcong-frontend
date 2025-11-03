"use client";
import { useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { getUserFromToken } from "@/utils/auth";
import api from "@/utils/api";

interface ProtectedRouteProps {
  allowedRoles: string[];
  children: ReactNode;
}

export default function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const router = useRouter();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAccess = async () => {
      const user = getUserFromToken();

      // Không có user → login
      if (!user) {
        router.replace("/login");
        return;
      }

      // Không đúng role → unauthorized
      if (!allowedRoles.includes(user.role)) {
        router.replace("/unauthorized");
        return;
      }

      // Nếu là nhân viên, cần có maNV hợp lệ
      if (user.role === "nhanvien") {
        if (!user.maNV) {
          router.replace("/login");
          return;
        }

        try {
          // Gọi API chamcong/status 
          const res = await api.get(`chamcong/status/${user.maNV}`);

          // Nếu backend trả thông tin chưa đăng ký khuôn mặt
          if (res.data && res.data.hasFaceRegistered === false) {
            router.replace("/employee/register-face");
            return;
          }
        } catch (error) {
          console.error("Lỗi khi kiểm tra face-status:", error);
          router.replace("/employee/home"); // fallback nếu API lỗi
          return;
        }
      }

      setHasAccess(true);
    };

    checkAccess();
  }, [router, allowedRoles]);

  if (hasAccess === null) {
    return <div>Đang kiểm tra quyền truy cập...</div>;
  }

  return <>{children}</>;
}
