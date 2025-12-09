import { useState, useEffect, useRef } from "react";
import Webcam from "react-webcam";
import api from "@/utils/api";
import { toast } from "react-toastify";
import { FaRegSmile, FaSpinner, FaTimes } from "react-icons/fa";

interface FaceLoginSectionProps {
  onSuccess: (token: string) => void;
  onCameraToggle: (isOpen: boolean) => void; // Để báo cho cha biết đang mở cam
}

export default function FaceLoginSection({ onSuccess, onCameraToggle }: FaceLoginSectionProps) {
  const [showCamera, setShowCamera] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const webcamRef = useRef<Webcam>(null);

  // Báo cho cha biết trạng thái camera
  useEffect(() => {
    onCameraToggle(showCamera);
  }, [showCamera, onCameraToggle]);

  // Logic tự động chụp sau 1s
  useEffect(() => {
    if (!showCamera || !cameraReady || isProcessing) return;
    const timer = setTimeout(() => {
      if (!isProcessing) handleFaceLogin();
    }, 1000);
    return () => clearTimeout(timer);
  }, [showCamera, cameraReady, isProcessing]);

  const handleFaceLogin = async () => {
    setIsProcessing(true);
    const imageSrc = webcamRef.current?.getScreenshot();
    
    if (!imageSrc) {
      // Nếu chưa lấy được ảnh thì thử lại sau
      setIsProcessing(false);
      return;
    }

    const loadingToast = toast.loading("🔄 Đang xác thực khuôn mặt...");

    try {
      const res = await api.post("/auth/login-face-mobile", { imageBase64: imageSrc });
      if (res.data?.access_token) {
        toast.update(loadingToast, { render: "Xác thực thành công!", type: "success", isLoading: false, autoClose: 1000 });
        onSuccess(res.data.access_token); // Gửi token về cha
      } else {
        throw new Error("Không nhận diện được");
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "Khuôn mặt không khớp.";
      toast.update(loadingToast, { render: msg, type: "error", isLoading: false, autoClose: 2000 });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="mt-8 mb-6 flex flex-col items-center gap-3 w-full">
      {showCamera ? (
        <div className="relative w-full max-w-[280px] aspect-square bg-black rounded-3xl overflow-hidden shadow-xl border-4 border-purple-400 animate-in zoom-in duration-300">
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            width={300}
            height={300}
            videoConstraints={{ facingMode: "user" }}
            onUserMedia={() => setCameraReady(true)}
            className="w-full h-full object-cover scale-x-[-1]"
          />
          {isProcessing && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white">
              <FaSpinner className="animate-spin text-3xl" />
            </div>
          )}
          <button
            onClick={() => setShowCamera(false)}
            className="absolute top-2 right-2 bg-white/20 p-2 rounded-full text-white hover:bg-red-500 transition"
          >
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
  );
}