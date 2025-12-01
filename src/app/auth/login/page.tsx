"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import api from "@/utils/api";
import { FaUser, FaLock, FaEye, FaEyeSlash, FaRegSmile, FaTimes, FaSpinner } from "react-icons/fa";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import Link from "next/link";
import Webcam from "react-webcam";

interface JwtPayload {
  maNV: number;
  role: string;
  hoTen?: string;
}

export default function LoginPage() {
  const router = useRouter();

  // State
  const [email, setEmail] = useState("");
  const [matKhau, setMatKhau] = useState("");
  const [loading, setLoading] = useState(false); 
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);

  // Camera State
  const [showCamera, setShowCamera] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); 

  const webcamRef = useRef<Webcam>(null);

  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    if (!showCamera || !cameraReady || isProcessing) return;

    const timer = setTimeout(() => {
      if (!isProcessing) handleFaceLogin(); 
    }, 900); 

    return () => clearTimeout(timer);
  }, [showCamera, cameraReady, isProcessing]);

  // 2. Đồng hồ
  useEffect(() => {
    setTime(new Date());
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);


  // Hàm xử lý chung khi có token
  const handleLoginSuccess = async (token: string) => {
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    const loadingToast = toast.loading("🔄 Đang đăng nhập...");

    try {
      const res = await api.post("/auth/login", { email, matKhau });
      const token = res.data?.access_token;

      if (token) {
         toast.update(loadingToast, { render: "Đăng nhập thành công!", type: "success", isLoading: false, autoClose: 1000 });
         await handleLoginSuccess(token);
      } else {
         throw new Error("Không nhận được phản hồi");
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Email hoặc mật khẩu không đúng.";
      toast.update(loadingToast, { render: msg, type: "error", isLoading: false, autoClose: 3000 });
    } finally {
      setLoading(false);
    }
  };

  const handleFaceLogin = async () => {
    setIsProcessing(true); 

    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) {
        toast.error("Lỗi Camera: Không chụp được ảnh.");
        setIsProcessing(false);
        return;
    }

    const loadingToast = toast.loading("🔄 Đang xác thực khuôn mặt...");

    try {
      const res = await api.post("/auth/login-face-mobile", { 
        imageBase64: imageSrc 
      });

      if (res.data?.access_token) {
         toast.update(loadingToast, { render: "Xác thực thành công!", type: "success", isLoading: false, autoClose: 1000 });
         await handleLoginSuccess(res.data.access_token);
      } else {
         throw new Error("Không tìm thấy khuôn mặt");
      }

    } catch (err: any) {
      const msg = err.response?.data?.message || "Khuôn mặt không khớp.";
      toast.update(loadingToast, { render: msg, type: "error", isLoading: false, autoClose: 3000 });
    } finally {
      setIsProcessing(false);
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

        {/* Form nhập Pass */}
        {!showCamera && (
          <form onSubmit={handleLogin} className="w-full space-y-5">
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-500"><FaUser size={20} /></div>
              <input
                type="text" placeholder="Email / Mã NV" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 text-gray-700 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-300 placeholder-gray-400 font-medium"
                required
              />
            </div>

            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-500"><FaLock size={20} /></div>
              <input
                type={showPassword ? "text" : "password"} placeholder="Mật khẩu" value={matKhau} onChange={(e) => setMatKhau(e.target.value)}
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
        )}

        {/* Khu vực Face ID */}
        <div className="mt-8 mb-6 flex flex-col items-center gap-3 w-full">
          {showCamera ? (
            <div className="relative w-full max-w-[280px] aspect-square bg-black rounded-3xl overflow-hidden shadow-xl border-4 border-purple-400 animate-in zoom-in duration-300">
                <Webcam
                    audio={false} ref={webcamRef} screenshotFormat="image/jpeg"
                    width={300} height={300} videoConstraints={{ facingMode: "user" }}
                    onUserMedia={() => setCameraReady(true)}
                    className="w-full h-full object-cover scale-x-[-1]"
                />
                
                {/* Loading khi xử lý */}
                {isProcessing && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white">
                        <FaSpinner className="animate-spin text-3xl"/>
                    </div>
                )}
                {/* Nút đóng */}
                <button onClick={() => setShowCamera(false)} className="absolute top-2 right-2 bg-white/20 p-2 rounded-full text-white hover:bg-red-500 transition">
                    <FaTimes />
                </button>
            </div>
          ) : (
            <button
                onClick={() => setShowCamera(true)}
                className="relative w-20 h-20 rounded-3xl bg-purple-50 flex items-center justify-center border-4 border-purple-300 shadow-lg hover:scale-105 transition-transform cursor-pointer group"
                title="Mở khóa bằng khuôn mặt"
            >
                <div className="relative w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-inner group-hover:rotate-12 transition-transform duration-300">
                    <FaRegSmile size={28} className="text-purple-600" />
                </div>
            </button>
          )}
          <span className="text-gray-500 text-sm font-medium">
             {showCamera ? "Đang quét khuôn mặt..." : "Đăng nhập bằng khuôn mặt"}
          </span>
        </div>

        {/* Đồng hồ */}
        {!showCamera && time && (
           <div className="flex flex-col items-center gap-2 mb-4">
             <span className="text-gray-400 text-xs font-medium">Thời gian hiện tại:</span>
             <div className="bg-indigo-50 text-indigo-600 px-6 py-2 rounded-full text-sm font-semibold shadow-sm">
               {time.toLocaleTimeString("vi-VN", { hour12: false })}
               <span className="mx-2">•</span>
               <span className="capitalize">
                 {time.toLocaleDateString("vi-VN", {
                   weekday: "long",
                   day: "numeric",
                   month: "long",
                   year: "numeric"
                 })}
               </span>
             </div>
           </div>
        )}

        <div className="mt-auto pb-2 text-sm font-medium text-gray-500">
           Nhân viên mới? <Link href="/auth/register" className="text-purple-600 hover:underline font-bold">Đăng ký</Link>
        </div>

      </section>
    </main>
  );
}