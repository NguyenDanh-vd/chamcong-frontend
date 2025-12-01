"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Webcam from "react-webcam"; 
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { FaCamera, FaSpinner, FaExclamationTriangle, FaArrowLeft } from "react-icons/fa";

import MobileLayout from "@/layouts/MobileLayout";
import api from "@/utils/api";
import { getUserFromToken } from "@/utils/auth";

export default function RegisterFacePage() {
  const router = useRouter();
  const webcamRef = useRef<Webcam>(null);

  // --- State quản lý ---
  const [loading, setLoading] = useState(true); 
  const [processing, setProcessing] = useState(false); 
  const [userInfo, setUserInfo] = useState<any>(null);
  const [hasFaceData, setHasFaceData] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);

  // 1. Khởi tạo: Kiểm tra quyền & Trạng thái khuôn mặt
  useEffect(() => {
    const user = getUserFromToken();
    if (!user) {
      router.push("/auth/login");
      return;
    }
    
    // Kiểm tra vai trò (Role)
    const role = (user.role || "").toLowerCase();
    if (!["nhanvien", "quantrivien", "nhansu"].includes(role)) {
       toast.error("Bạn không có quyền truy cập");
       router.push("/");
       return;
    }

    setUserInfo(user);

    // Gọi API kiểm tra xem user này đã có dữ liệu khuôn mặt chưa
    const checkStatus = async () => {
      try {
        const res = await api.get(`/facedata/check/${user.maNV}`);
        
        if (res.data?.hasFace) {
          setHasFaceData(true);
          // Thông báo: ĐÃ CÓ DỮ LIỆU
          toast.success("✅ Tài khoản này ĐÃ ĐĂNG KÝ khuôn mặt!", {
            position: "top-center",
            autoClose: 4000,
            hideProgressBar: false,
          });
        } else {
          // Thông báo: CHƯA CÓ DỮ LIỆU
          toast.info("ℹ️ Bạn chưa có dữ liệu khuôn mặt. Vui lòng đăng ký.", {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: false,
          });
        }
      } catch (error) {
        console.error("Lỗi kiểm tra trạng thái:", error);
        toast.error("Không thể kiểm tra trạng thái khuôn mặt.");
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
  }, [router]);

  // 2. Hàm Xử lý chính: Chụp ảnh & Gửi Server
  const handleRegister = useCallback(async () => {
    // Nếu camera chưa bật thì thôi
    if (!webcamRef.current) return;
    
    // A. Chụp ảnh màn hình (Lấy chuỗi Base64)
    const imageSrc = webcamRef.current.getScreenshot();

    if (!imageSrc) {
      toast.error("Lỗi Camera: Không chụp được ảnh.");
      return;
    }

    setProcessing(true);
    const loadingToast = toast.loading("Đang gửi ảnh về máy chủ xử lý...");

    try {
      // B. Gửi ảnh về API MỚI (Dùng chung với Mobile)
      // API này sẽ tự dùng AI trên Server để phân tích khuôn mặt
      await api.post("/facedata/register-mobile", {
        maNV: userInfo.maNV,
        imageBase64: imageSrc,
      });

      // C. Thông báo thành công
      toast.update(loadingToast, { 
        render: "🎉 Đăng ký thành công!", 
        type: "success", 
        isLoading: false, 
        autoClose: 2000 
      });

      // D. Chuyển hướng sau 1.5s
      setTimeout(() => {
        if (["quantrivien", "nhansu"].includes(userInfo.role)) {
           router.push("/admin/profile");
        } else {
           router.push("/employee/home");
        }
      }, 1500);

    } catch (err: any) {
      // E. Xử lý lỗi (Nếu server không tìm thấy mặt hoặc lỗi khác)
      console.error(err);
      const msg = err.response?.data?.message || "Không tìm thấy khuôn mặt. Vui lòng thử lại.";
      
      toast.update(loadingToast, { 
        render: `❌ ${msg}`, 
        type: "error", 
        isLoading: false, 
        autoClose: 4000 
      });
    } finally {
      setProcessing(false);
    }
  }, [userInfo, router]);

  // Màn hình Loading khi mới vào trang
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <FaSpinner className="animate-spin text-4xl text-blue-600" />
      </div>
    );
  }

  // --- GIAO DIỆN CHÍNH ---
  return (
    <MobileLayout>
      <div className="flex flex-col items-center min-h-screen bg-white p-4 pt-8">
        
        {/* Tiêu đề */}
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          {hasFaceData ? "Cập nhật khuôn mặt" : "Đăng ký khuôn mặt"}
        </h1>
        
        <p className="text-gray-500 text-sm text-center mb-6 max-w-xs">
          Giữ khuôn mặt ở giữa khung hình, đảm bảo đủ ánh sáng và không đeo khẩu trang.
        </p>

        {/* Khung Camera */}
        <div className={`relative w-full max-w-sm aspect-square bg-black rounded-full overflow-hidden border-[6px] shadow-xl mb-8 group transition-colors duration-300 ${processing ? 'border-yellow-400' : 'border-blue-100'}`}>
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            width={720}
            height={720}
            videoConstraints={{
              facingMode: "user",
              aspectRatio: 1,
            }}
            onUserMedia={() => setCameraReady(true)}
            onUserMediaError={() => toast.error("Không thể truy cập Camera. Hãy cấp quyền.")}
            className="w-full h-full object-cover scale-x-[-1]" // Lật ngược như gương
          />
          
          {/* Hiệu ứng lưới hướng dẫn (Thay cho khung xanh AI cũ) */}
          {cameraReady && !processing && (
            <div className="absolute inset-0 border-4 border-dashed border-white/40 rounded-full animate-pulse pointer-events-none"></div>
          )}

          {/* Loading Overlay khi đang xử lý */}
          {processing && (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white z-10">
                <FaSpinner className="animate-spin text-5xl mb-3 text-yellow-400" />
                <span className="font-bold text-lg">Đang phân tích...</span>
            </div>
          )}
        </div>

        {/* Cụm Nút Bấm */}
        <div className="w-full max-w-xs space-y-3">
          <button
            onClick={handleRegister}
            disabled={!cameraReady || processing}
            className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 text-white font-bold text-lg shadow-lg transition-transform active:scale-95
              ${!cameraReady || processing 
                ? "bg-gray-400 cursor-not-allowed" 
                : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"}`}
          >
            <FaCamera /> 
            {hasFaceData ? "Chụp lại & Cập nhật" : "Chụp & Lưu"}
          </button>

          <button
            onClick={() => router.back()}
            disabled={processing}
            className="w-full py-3 rounded-2xl text-gray-600 font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
          >
            <FaArrowLeft /> Quay lại
          </button>
        </div>

        {/* Cảnh báo nếu đã có dữ liệu */}
        {hasFaceData && (
          <div className="mt-8 flex items-start gap-3 text-yellow-700 bg-yellow-50 px-4 py-3 rounded-xl text-sm border border-yellow-200 max-w-xs">
            <FaExclamationTriangle className="mt-0.5 text-lg flex-shrink-0" />
            <span>
              <strong>Lưu ý:</strong> Tài khoản này đã có dữ liệu. Nếu bạn tiếp tục, dữ liệu cũ sẽ bị xóa và thay thế.
            </span>
          </div>
        )}

      </div>
    </MobileLayout>
  );
}