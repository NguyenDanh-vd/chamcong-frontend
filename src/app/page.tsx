"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUserFromToken } from "@/utils/auth";
import api from "@/utils/api";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const checkRedirect = async () => {
      const user = getUserFromToken();

      if (!user) {
        router.replace("/login");
        return;
      }

      try {
        switch (user.role) {
          case "nhanvien":
            const res = await api.get(`/facedata/check/${user.maNV}`);
            if (res.data?.hasFace) {
              router.replace("/employee/home");
            } else {
              router.replace("/employee/register-face");
            }
            break;

          case "quantrivien":
          case "nhansu":
            router.replace("/admin/dashboard");
            break;

          default:
            router.replace("/unauthorized");
        }
      } catch {
        if (user.role === "nhanvien") {
          router.replace("/employee/home");
        } else {
          router.replace("/unauthorized");
        }
      }
    };

    checkRedirect();
  }, [router]);

  return <div>Đang chuyển hướng...</div>;
}
