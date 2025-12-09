import { useState } from "react";
import Link from "next/link";
import api from "@/utils/api";
import { toast } from "react-toastify";
import { FaUser, FaLock, FaEye, FaEyeSlash, FaSpinner } from "react-icons/fa";

interface LoginFormProps {
  onSuccess: (token: string, remember: boolean) => void;
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [matKhau, setMatKhau] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    const loadingToast = toast.loading("🔄 Đang đăng nhập...");

    try {
      const res = await api.post("/auth/login", { email, matKhau });
      if (res.data?.access_token) {
        toast.update(loadingToast, { render: "Đăng nhập thành công!", type: "success", isLoading: false, autoClose: 1000 });
        onSuccess(res.data.access_token, remember);
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Sai email hoặc mật khẩu.";
      toast.update(loadingToast, { render: msg, type: "error", isLoading: false, autoClose: 3000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="w-full space-y-5">
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-500"><FaUser size={20} /></div>
        <input
          type="text" placeholder="Email / Mã NV"
          value={email} onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-slate-50 text-gray-700 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-300 placeholder-gray-400 font-medium"
          required
        />
      </div>

      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-500"><FaLock size={20} /></div>
        <input
          type={showPassword ? "text" : "password"} placeholder="Mật khẩu"
          value={matKhau} onChange={(e) => setMatKhau(e.target.value)}
          className="w-full bg-slate-50 text-gray-700 rounded-2xl py-4 pl-12 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-300 placeholder-gray-400 font-medium"
          required
        />
        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
          {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
        </button>
      </div>

      <div className="flex items-center justify-between text-sm px-1">
        <label className="flex items-center gap-2 cursor-pointer text-gray-600 font-medium select-none">
          <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
          Ghi nhớ
        </label>
        <Link href="/auth/forgot-password" className="text-purple-600 font-semibold hover:text-purple-700">Quên mật khẩu?</Link>
      </div>

      <button type="submit" disabled={loading} className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-500 text-white font-bold text-lg uppercase tracking-wide shadow-lg hover:opacity-95 transition-all disabled:opacity-70 mt-2 flex justify-center gap-2">
        {loading && <FaSpinner className="animate-spin" />} {loading ? "Đang xử lý..." : "ĐĂNG NHẬP"}
      </button>
    </form>
  );
}