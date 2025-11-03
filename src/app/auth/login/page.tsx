"use client";
import { useState, useEffect } from "react";
import api from "@/utils/api";
import { FaUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import Link from 'next/link';
interface JwtPayload {
  maNV: number;
  role: string;
  name?: string;
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [matKhau, setMatKhau] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Fix hydration error
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setMounted(true);
    setTime(new Date());
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, matKhau });
      const token = res.data.access_token;
      if (!token) {
        toast.error("Không nhận được token từ server!");
        setLoading(false);
        return;
      }
      localStorage.setItem("token", token);
      const user: JwtPayload = jwtDecode(token);
      toast.success("Đăng nhập thành công!");

      const adminRoles = ["quantrivien", "nhansu"];
      if (adminRoles.includes(user.role)) {
        window.location.href = "/admin/dashboard";
        return;
      }
      if (user.role === "nhanvien") {
        const checkRes = await api.get(`facedata/check/${user.maNV}`);
        if (!checkRes.data.hasFace) {
          window.location.href = "/employee/register-face";
          return;
        }
      }
      window.location.href = "/employee/home";
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  // Hàm check login trước khi đi tới Chấm công / Lịch làm
  const goToPage = (path: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Vui lòng đăng nhập trước khi sử dụng!");
      return;
    }
    window.location.href = path;
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-600 to-blue-600">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        {/* Logo + Title */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-xl">
            IT
          </div>
          <h1 className="text-2xl font-bold mt-3">ITGlobal</h1>
          <p className="text-gray-500 text-sm">Hệ Thống Chấm Công Thông Minh</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div className="relative">
            <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Email hoặc Mã nhân viên"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          <div className="relative">
            <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Mật khẩu"
              value={matKhau}
              onChange={(e) => setMatKhau(e.target.value)}
              className="w-full pl-10 pr-10 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {/* Remember me + Forgot password */}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="accent-blue-600" /> Ghi nhớ đăng nhập
            </label>
            <Link href="/auth/forgot-password" className="text-blue-600 hover:underline">
              Quên mật khẩu?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl text-white font-semibold transition bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        {/* OR */}
        <div className="flex items-center my-6">
          <div className="flex-1 h-px bg-gray-300"></div>
          <span className="px-3 text-gray-400">Hoặc</span>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>

        {/* Quick buttons */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => goToPage("/employee/home")}
            className="border rounded-xl py-3 text-center font-medium hover:bg-gray-50"
          >
            Chấm Công
          </button>
          <button
            onClick={() => goToPage("/employee/history")}
            className="border rounded-xl py-3 text-center font-medium hover:bg-gray-50"
          >
            Lịch Làm
          </button>
        </div>

        {/* Clock */}
        <div className="text-center text-sm text-gray-600 mb-4">
          Thời gian hiện tại:
          <br />
          {mounted && time && (
            <span className="font-medium text-blue-600">
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

        {/* Register link */}
        <p className="text-center text-gray-500">
          Bạn chưa có tài khoản?{" "}
          <Link href="/auth/register" className="text-blue-600 font-medium hover:underline">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
}
