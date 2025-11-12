"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/utils/api";
import { FaUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import {jwtDecode} from "jwt-decode"; 
import { toast } from "react-toastify";
import Link from "next/link";

interface JwtPayload {
  maNV: number;
  role: string;
  name?: string;
  hoTen?: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [matKhau, setMatKhau] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState<Date | null>(null);
  const [remember, setRemember] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTime(new Date());
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      const res = await api.post("/auth/login", { email, matKhau });

      const token = res.data?.access_token;
      if (!token) {
        setLoading(false); // <- quan trọng
        toast.error("Không nhận được token từ server!");
        return;
      }

      // lưu token (localStorage nếu ghi nhớ, ngược lại sessionStorage)
      (remember ? localStorage : sessionStorage).setItem("token", token);

      // decode token (cẩn thận nếu backend trả khác)
      let user: JwtPayload;
      try {
        user = jwtDecode(token);
      } catch (err) {
        console.error("JWT decode failed:", err);
        setLoading(false);
        toast.error("Token không hợp lệ.");
        return;
      }

      toast.success("Đăng nhập thành công!");

      const adminRoles = ["quantrivien", "nhansu"];
      if (adminRoles.includes(user.role)) {
        router.replace("/admin/dashboard"); // SPA navigation
        return;
      }

      if (user.role === "nhanvien") {
        try {
          const checkRes = await api.get(`facedata/check/${user.maNV}`);
          if (!checkRes.data?.hasFace) {
            router.replace("/employee/register-face");
            return;
          }
        } catch (err: any) {
          console.error("Lỗi kiểm tra face:", err);
          // Nếu lỗi mạng thì vẫn chuyển về home hoặc show thông báo
          toast.warn("Không kiểm tra được face. Về trang chính.");
          router.replace("/employee/home");
          return;
        }
      }

      router.replace("/employee/home");
    } catch (err: any) {
      console.error("Login error:", err);
      toast.error(err?.response?.data?.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  const goToPage = (path: string) => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      toast.error("Vui lòng đăng nhập trước khi sử dụng!");
      return;
    }
    router.push(path);
  };

  // ... phần JSX không đổi (giữ lại)


  return (
    <main
      className="relative min-h-svh flex items-center justify-center p-4 overflow-hidden
                 bg-gradient-to-br from-fuchsia-600 via-purple-600 to-blue-600
                 dark:from-[#201233] dark:via-[#23183e] dark:to-[#0d1a3a]"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-32 h-80 w-80 rounded-full blur-3xl opacity-30 bg-white" />
        <div className="absolute -bottom-40 -right-32 h-96 w-96 rounded-full blur-3xl opacity-20 bg-sky-200" />
      </div>

      <section
        className="relative w-full max-w-md rounded-2xl backdrop-blur
                   bg-white/95 text-gray-800 ring-1 ring-black/5 shadow-[0_20px_60px_rgba(0,0,0,0.25)]
                   dark:bg-zinc-900/95 dark:text-zinc-100 dark:ring-white/10"
      >
        <div className="px-8 pt-8 pb-6 text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-xl bg-gradient-to-tr from-blue-500 to-fuchsia-500
                          text-white grid place-items-center font-bold">IT</div>
          <h1 className="text-xl font-semibold">ITGlobal</h1>
          <p className="text-gray-500 text-sm dark:text-zinc-400">
            Hệ Thống Chấm Công Thông Minh
          </p>
        </div>

        <form onSubmit={handleLogin} className="px-8 pb-6 space-y-4">
          <label className="block">
            <span className="block text-sm mb-1">Email hoặc Mã nhân viên</span>
            <div className="relative">
              <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
              <input
                type="text"
                inputMode="email"
                autoComplete="username"
                placeholder="nhanvien@congty.com hoặc Mã NV"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border pl-9 pr-3 py-2.5 outline-none transition
                           border-gray-200 focus:border-primary ring-0 focus:ring-2 focus:ring-primary/30
                           dark:border-zinc-700 dark:bg-zinc-900 dark:placeholder-zinc-400"
                required
              />
            </div>
          </label>

          <label className="block">
            <span className="block text-sm mb-1">Mật khẩu</span>
            <div className="relative">
              <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                value={matKhau}
                onChange={(e) => setMatKhau(e.target.value)}
                className="w-full rounded-xl border pl-9 pr-10 py-2.5 outline-none transition
                           border-gray-200 focus:border-primary ring-0 focus:ring-2 focus:ring-primary/30
                           dark:border-zinc-700 dark:bg-zinc-900 dark:placeholder-zinc-400"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100 transition"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </label>

          <div className="flex items-center justify-between text-sm">
            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                className="accent-blue-600"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              Ghi nhớ đăng nhập
            </label>
            <Link href="/auth/forgot-password" className="text-blue-600 hover:underline">
              Quên mật khẩu?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-white font-semibold transition shadow-md
                       bg-gradient-to-r from-blue-600 to-fuchsia-600 hover:opacity-95
                       disabled:opacity-70 disabled:cursor-not-allowed
                       dark:from-blue-500 dark:to-fuchsia-500"
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        <div className="px-8">
          <div className="flex items-center my-6">
            <div className="flex-1 h-px bg-gray-200 dark:bg-zinc-700" />
            <span className="px-3 text-gray-400 text-sm dark:text-zinc-500">Hoặc</span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-zinc-700" />
          </div>
        </div>

        <div className="px-8 grid grid-cols-2 gap-3 pb-6">
          <button
            onClick={() => goToPage("/employee/home")}
            style={{
              background: "linear-gradient(135deg, #06b6d4, #3b82f6)",
              color: "#fff",
              border: "none",
              fontWeight: 600,
              borderRadius: "8px",
              padding: "8px 20px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "0.9";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "1";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            Chấm Công
          </button>

          <button
            onClick={() => goToPage("/employee/history")}
            style={{
              background: "linear-gradient(135deg, #06b6d4, #3b82f6)",
              color: "#fff",
              border: "none",
              fontWeight: 600,
              borderRadius: "8px",
              padding: "8px 20px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "0.9";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "1";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            Lịch Làm
          </button>
        </div>

        <div className="px-8 pb-6 text-center text-sm text-gray-600 dark:text-zinc-400">
          Thời gian hiện tại:
          <br />
          {mounted && time && (
            <span className="font-medium text-blue-600 dark:text-blue-400">
              {time.toLocaleTimeString("vi-VN")}{" "}
              {time.toLocaleDateString("vi-VN", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          )}
        </div>

        <p className="text-center text-gray-500 dark:text-zinc-400 pb-6">
          Bạn chưa có tài khoản?{" "}
          <Link href="/auth/register" className="text-blue-600 font-medium hover:underline">
            Đăng ký ngay
          </Link>
        </p>
      </section>
    </main>
  );
}
