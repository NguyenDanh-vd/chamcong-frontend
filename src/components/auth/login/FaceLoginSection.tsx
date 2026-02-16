import { useState, useEffect, useRef } from "react";
import Webcam from "react-webcam";
import api from "@/utils/api";
import { toast } from "react-toastify";
import { FaRegSmile, FaSpinner, FaTimes } from "react-icons/fa";

interface FaceLoginSectionProps {
  onSuccess: (token: string) => void;
  onCameraToggle: (isOpen: boolean) => void;
}

export default function FaceLoginSection({ onSuccess, onCameraToggle }: FaceLoginSectionProps) {
  const [showCamera, setShowCamera] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const webcamRef = useRef<Webcam>(null);

  useEffect(() => {
    onCameraToggle(showCamera);
  }, [showCamera, onCameraToggle]);

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
      setIsProcessing(false);
      return;
    }

    const loadingToast = toast.loading("Đang xác thực khuôn mặt...");

    try {
      const res = await api.post("/auth/login-face-mobile", { imageBase64: imageSrc });
      if (res.data?.access_token) {
        toast.update(loadingToast, { render: "Xác thực thành công", type: "success", isLoading: false, autoClose: 1000 });
        onSuccess(res.data.access_token);
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
    <div className="mb-6 mt-7 flex w-full flex-col items-center gap-3">
      {showCamera ? (
        <div className="relative aspect-square w-full max-w-[300px] overflow-hidden rounded-3xl border-4 border-sky-300 bg-black shadow-xl animate-in zoom-in duration-300">
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            width={300}
            height={300}
            videoConstraints={{ facingMode: "user" }}
            onUserMedia={() => setCameraReady(true)}
            className="h-full w-full scale-x-[-1] object-cover"
          />

          {isProcessing ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
              <FaSpinner className="text-3xl animate-spin" />
            </div>
          ) : null}

          <button
            onClick={() => setShowCamera(false)}
            className="absolute right-2 top-2 rounded-full bg-white/20 p-2 text-white transition hover:bg-red-500"
            aria-label="Đóng camera"
          >
            <FaTimes />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowCamera(true)}
          className="group relative flex h-20 w-20 cursor-pointer items-center justify-center rounded-3xl border-4 border-sky-300 bg-sky-50 shadow-lg transition-transform hover:scale-105"
          title="Mở khóa bằng khuôn mặt"
        >
          <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-inner transition-transform duration-300 group-hover:rotate-12">
            <FaRegSmile size={28} className="text-sky-600" />
          </div>
        </button>
      )}

      <span className="text-sm font-medium text-slate-500">
        {showCamera ? "Đang quét khuôn mặt..." : "Đăng nhập bằng khuôn mặt"}
      </span>
    </div>
  );
}
