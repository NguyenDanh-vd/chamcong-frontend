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
  const [formMessage, setFormMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    const emailValue = email.trim();
    const passwordValue = matKhau.trim();
    if (!emailValue || !passwordValue) {
      setFormMessage({ type: "error", text: "Vui lòng nhập đầy đủ email/mã nhân viên và mật khẩu." });
      toast.error("Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    setFormMessage(null);
    setLoading(true);
    const loadingToast = toast.loading("Đang đăng nhập...");

    try {
      const res = await api.post("/auth/login", { email: emailValue, matKhau: passwordValue });
      if (res.data?.access_token) {
        toast.update(loadingToast, {
          render: "Đăng nhập thành công",
          type: "success",
          isLoading: false,
          autoClose: 1000,
        });
        setFormMessage({ type: "success", text: "Đăng nhập thành công. Đang chuyển vào hệ thống..." });
        onSuccess(res.data.access_token, remember);
      } else {
        throw new Error("Không nhận được access token");
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Sai email hoặc mật khẩu.";
      setFormMessage({ type: "error", text: msg });
      toast.update(loadingToast, {
        render: msg,
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="w-full space-y-4">
      {formMessage ? (
        <div
          className={`rounded-xl border px-4 py-2.5 text-sm font-medium ${
            formMessage.type === "error"
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}
        >
          {formMessage.text}
        </div>
      ) : null}

      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sky-600">
          <FaUser size={18} />
        </span>
        <input
          type="text"
          placeholder="Email hoặc mã nhân viên"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-slate-700 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
          required
        />
      </div>

      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sky-600">
          <FaLock size={18} />
        </span>
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Mật khẩu"
          value={matKhau}
          onChange={(e) => setMatKhau(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-11 text-slate-700 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
          required
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
          aria-label="Hiển thị hoặc ẩn mật khẩu"
        >
          {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
        </button>
      </div>

      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center gap-2 text-slate-600">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-sky-600"
          />
          Ghi nhớ đăng nhập
        </label>

        <Link href="/auth/forgot-password" className="font-semibold text-sky-700 hover:text-sky-800">
          Quên mật khẩu?
        </Link>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 py-3.5 text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-cyan-200 transition hover:opacity-95 disabled:opacity-70"
      >
        {loading ? <FaSpinner className="animate-spin" /> : null}
        {loading ? "Đang xử lý..." : "Đăng nhập"}
      </button>
    </form>
  );
}
