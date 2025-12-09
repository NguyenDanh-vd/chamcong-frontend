"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import Link from "next/link";

// Import Components đã tách
import LoginForm from "@/components/auth/login/LoginForm";
import FaceLoginSection from "@/components/auth/login/FaceLoginSection";
import DigitalClock from "@/components/auth/login/DigitalClock";

interface JwtPayload {
  maNV: number;
  role: string;
  hoTen?: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  // Xử lý chung: Khi có Token (từ Form hoặc từ Face ID) thì chạy hàm này
  const handleLoginSuccess = async (token: string, remember: boolean = false) => {
    if (remember) localStorage.setItem("token", token);
    else sessionStorage.setItem("token", token);

    let user: JwtPayload;
    try {
      user = jwtDecode(token);
    } catch {
      toast.error("Lỗi: Token không hợp lệ.");
      return;
    }

    toast.success(`👋 Xin chào, ${user.hoTen || "Nhân viên"}!`, {
      position: "top-center",
      autoClose: 2000
    });

    if (["quantrivien", "nhansu"].includes(user.role)) {
      router.replace("/admin/dashboard");
    } else {
      router.replace("/employee/home");
    }
  };

  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-purple-600 via-blue-500 to-blue-400 flex items-center justify-center p-4">
      <section className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl flex flex-col items-center min-h-[600px]">
        
        {/* Logo */}
        <div className="mt-4 mb-4 w-20 h-20 bg-gradient-to-b from-[#8b5cf6] to-[#3b82f6] rounded-3xl flex items-center justify-center shadow-lg shadow-blue-200">
          <span className="text-white text-3xl font-bold tracking-wider">IT</span>
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-1">Xin chào!</h1>
        <p className="text-gray-500 text-sm mb-8">Đăng nhập để bắt đầu làm việc</p>

        {/* Form Đăng Nhập (Ẩn khi mở Camera) */}
        {!isCameraOpen && (
           <LoginForm onSuccess={handleLoginSuccess} />
        )}

        {/* Phần Face ID */}
        <FaceLoginSection 
            onSuccess={(token) => handleLoginSuccess(token)} 
            onCameraToggle={setIsCameraOpen}
        />

        {/* Đồng hồ (Ẩn khi mở Camera) */}
        {!isCameraOpen && <DigitalClock />}

        <div className="mt-auto pb-2 text-sm font-medium text-gray-500">
           Nhân viên mới? <Link href="/auth/register" className="text-purple-600 hover:underline font-bold">Đăng ký</Link>
        </div>

      </section>
    </main>
  );
}