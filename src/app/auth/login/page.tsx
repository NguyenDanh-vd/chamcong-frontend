"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import api from "@/utils/api";
import { FaUser, FaLock, FaEye, FaEyeSlash, FaRegSmile } from "react-icons/fa";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import Link from "next/link";
import * as faceapi from "face-api.js";

interface JwtPayload {
  maNV: number;
  role: string;
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
  const [faceActive, setFaceActive] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);

  // Load Face API models
  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = "/models";
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        setModelsLoaded(true);
        console.log("Face API models loaded");
      } catch (err) {
        console.error("Face API models load error:", err);
        toast.error("Không load được Face API.");
      }
    };
    loadModels();
  }, []);

  // Update time
  useEffect(() => {
    setMounted(true);
    setTime(new Date());
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Hàm xử lý chung khi có token (Dùng cho cả Login thường và Face ID)
  const handleLoginSuccess = async (token: string) => {
    if (remember) localStorage.setItem("token", token);
    else sessionStorage.setItem("token", token);

    let user: JwtPayload;
    try {
      user = jwtDecode(token);
    } catch {
      toast.error("Token không hợp lệ.");
      return;
    }

    toast.success(`Xin chào, ${user.hoTen || "Nhân viên"}!`);

    // Điều hướng dựa trên role
    if (["quantrivien", "nhansu"].includes(user.role)) {
      router.replace("/admin/dashboard");
      return;
    }

    if (user.role === "nhanvien") {
      // Logic kiểm tra xem nhân viên đã có dữ liệu khuôn mặt chưa (tuỳ chọn)
      try {
         // Lưu ý: Lúc này đã có token trong storage, api gọi đi sẽ tự attach token nếu bạn đã config axios interceptor
         // Hoặc truyền header thủ công
         const checkRes = await api.get(`/facedata/check/${user.maNV}`, {
            headers: { Authorization: `Bearer ${token}` }
         });
         if (!checkRes.data?.hasFace) {
           router.replace("/employee/register-face");
           return;
         }
      } catch (err) {
         console.warn("Không kiểm tra được trạng thái Face ID", err);
      }
      router.replace("/employee/home");
    }
  };

  // Login bằng form (Email/Pass)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      const res = await api.post("/auth/login", { email, matKhau });
      const token = res.data?.access_token;
      if (!token) {
        toast.error("Không nhận được token từ server!");
        setLoading(false);
        return;
      }
      await handleLoginSuccess(token);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  // Login bằng Face ID
  const handleFaceUnlock = async () => {
    if (!modelsLoaded) {
      toast.error("Đang tải dữ liệu AI, vui lòng đợi giây lát...");
      return;
    }

    setFaceActive(true);
    // Tự tắt hiệu ứng sau 5s nếu không detect được để tiết kiệm resource
    const timeout = setTimeout(() => setFaceActive(false), 5000); 

    try {
      // 1. Mở camera
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      // 2. Detect khuôn mặt
      // Đợi một chút cho camera ổn định ánh sáng
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (!videoRef.current) return;

      const detection = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      // Dừng camera ngay sau khi chụp xong để tiết kiệm pin/RAM
      stream.getTracks().forEach(track => track.stop());
      setFaceActive(false);
      clearTimeout(timeout);

      if (!detection) {
        toast.error("Không nhìn thấy khuôn mặt. Vui lòng thử lại sát hơn.");
        return;
      }

      // 3. Gửi lên Server để đăng nhập
      const loadingToast = toast.loading("Đang xác thực khuôn mặt...");
      
      try {
        // GỌI API MỚI: /auth/login-face (Không cần token header)
        const res = await api.post("/auth/login-face", {
          descriptor: Array.from(detection.descriptor),
        });

        toast.dismiss(loadingToast);

        if (res.data?.access_token) {
           await handleLoginSuccess(res.data.access_token);
        } else {
           toast.error("Khuôn mặt không khớp với bất kỳ nhân viên nào.");
        }
      } catch (apiErr: any) {
        toast.dismiss(loadingToast);
        console.error(apiErr);
        toast.error(apiErr?.response?.data?.message || "Lỗi xác thực khuôn mặt.");
      }

    } catch (err) {
      setFaceActive(false);
      console.error("Face ID error:", err);
      toast.error("Không thể mở camera. Vui lòng kiểm tra quyền truy cập.");
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

        <form onSubmit={handleLogin} className="w-full space-y-5">
          {/* Email */}
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-500">
              <FaUser size={20} />
            </div>
            <input
              type="text"
              inputMode="email"
              autoComplete="username"
              placeholder="Email / Mã NV"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 text-gray-700 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-300 placeholder-gray-400 font-medium"
              required
            />
          </div>

          {/* Password */}
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-500">
              <FaLock size={20} />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Mật khẩu"
              value={matKhau}
              onChange={(e) => setMatKhau(e.target.value)}
              className="w-full bg-slate-50 text-gray-700 rounded-2xl py-4 pl-12 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-300 placeholder-gray-400 font-medium"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
            </button>
          </div>

          {/* Options */}
          <div className="flex items-center justify-between text-sm px-1">
            <label className="flex items-center gap-2 cursor-pointer text-gray-600 font-medium select-none">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              Ghi nhớ
            </label>
            <Link
              href="/auth/forgot-password"
              className="text-purple-600 font-semibold hover:text-purple-700 cursor-pointer"
            >
              Quên mật khẩu?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-500 text-white font-bold text-lg uppercase tracking-wide shadow-lg shadow-blue-200 hover:opacity-95 hover:shadow-xl transition-all disabled:opacity-70 mt-2"
          >
            {loading ? "Đang xử lý..." : "ĐĂNG NHẬP"}
          </button>
        </form>

        {/* Face ID Button */}
        <div className="mt-8 mb-6 flex flex-col items-center gap-3">
          {/* Video ẩn để face-api dùng */}
          <video ref={videoRef} className="hidden" muted playsInline /> 
          
          <button
            onClick={handleFaceUnlock}
            disabled={faceActive}
            className="relative w-20 h-20 rounded-3xl bg-purple-50 flex items-center justify-center border-4 border-purple-300 shadow-lg overflow-visible hover:scale-105 transition-transform cursor-pointer"
            title="Mở khóa bằng khuôn mặt"
          >
            <span
              className={`absolute inset-0 rounded-3xl border-2 border-purple-400 opacity-50 ${
                faceActive ? "animate-ping" : ""
              }`}
            ></span>
            <div
              className={`relative w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-inner ${
                faceActive ? "scale-110 animate-bounce" : "scale-100"
              } transition-transform duration-300`}
            >
              <FaRegSmile
                size={28}
                className={`text-purple-600 ${faceActive ? "animate-pulse" : ""}`}
              />
            </div>
          </button>
          <span className="text-gray-500 text-sm font-medium">
             {faceActive ? "Đang quét..." : "Đăng nhập bằng khuôn mặt"}
          </span>
        </div>

        {/* Time Display */}
        {mounted && time && (
          <div className="flex flex-col items-center gap-2 mb-4">
            <span className="text-gray-400 text-xs font-medium">Thời gian hiện tại:</span>
            <div className="bg-indigo-50 text-indigo-600 px-6 py-2 rounded-full text-sm font-semibold shadow-sm">
              {time.toLocaleTimeString("vi-VN", { hour12: false })}
              <span className="mx-1">•</span>
              {time.toLocaleDateString("vi-VN", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </div>
          </div>
        )}

        <div className="mt-auto pb-2 text-sm font-medium text-gray-500">
          Nhân viên mới?{" "}
          <Link
            href="/auth/register"
            className="text-purple-600 hover:underline font-bold cursor-pointer"
          >
            Đăng ký
          </Link>
        </div>
      </section>
    </main>
  );
}