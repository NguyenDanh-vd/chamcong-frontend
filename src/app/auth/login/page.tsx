"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import Link from "next/link";

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
  const REDIRECT_DELAY_MS = 1800;

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

    toast.success(`Xin chào, ${user.hoTen || "Nhân viên"}! Đang vào hệ thống...`, {
      position: "top-center",
      autoClose: REDIRECT_DELAY_MS,
    });

    await new Promise((resolve) => setTimeout(resolve, REDIRECT_DELAY_MS));

    if (["quantrivien", "nhansu"].includes(user.role)) {
      router.replace("/admin/dashboard");
    } else {
      router.replace("/employee/home");
    }
  };

  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-cyan-100 via-sky-100 to-blue-200 p-4 md:p-8">
      <section className="mx-auto grid min-h-[86vh] w-full max-w-5xl overflow-hidden rounded-3xl border border-white/70 bg-white/80 shadow-2xl backdrop-blur-md lg:grid-cols-2">
        <div className="relative hidden flex-col justify-between bg-gradient-to-br from-sky-700 via-cyan-700 to-teal-700 p-8 text-white lg:flex">
          <div>
            <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-white/30 bg-white/10 text-xl font-bold">
              IT
            </div>
            <h2 className="text-3xl font-extrabold leading-tight">Nền tảng quản trị nhân sự IT-GLOBAL</h2>
            <p className="mt-3 text-sm text-cyan-100">
              Theo dõi chấm công, xử lý nghỉ phép, lương và báo cáo trên một hệ thống tập trung.
            </p>
          </div>

          <div className="rounded-2xl border border-white/20 bg-white/10 p-4 text-sm text-cyan-50">
            Bảo mật đăng nhập bằng tài khoản hoặc xác thực khuôn mặt.
          </div>
        </div>

        <div className="flex flex-col justify-center p-6 sm:p-10">
          <div className="mb-8 text-center lg:text-left">
            <h1 className="text-2xl font-bold text-slate-800">Đăng nhập hệ thống</h1>
            <p className="mt-1 text-sm text-slate-500">Vui lòng nhập thông tin để tiếp tục làm việc</p>
          </div>

          {!isCameraOpen ? <LoginForm onSuccess={handleLoginSuccess} /> : null}

          <FaceLoginSection onSuccess={(token) => handleLoginSuccess(token)} onCameraToggle={setIsCameraOpen} />

          {!isCameraOpen ? <DigitalClock /> : null}

          <div className="mt-4 text-center text-sm text-slate-500 lg:text-left">
            Nhân viên mới?{" "}
            <Link href="/auth/register" className="font-semibold text-sky-700 hover:underline">
              Đăng ký
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
