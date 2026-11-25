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
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [retryCount, setRetryCount] = useState(0);
  const webcamRef = useRef<Webcam>(null);
  const MAX_AUTO_RETRIES = 4;

  useEffect(() => {
    onCameraToggle(showCamera);
    if (!showCamera) {
      setCameraReady(false);
      setRetryCount(0);
      setStatusMessage("");
    }
  }, [showCamera, onCameraToggle]);

  useEffect(() => {
    if (!showCamera || !cameraReady || isProcessing || retryCount >= MAX_AUTO_RETRIES) return;
    const delay = retryCount === 0 ? 900 : 2200;
    const timer = setTimeout(() => {
      if (!isProcessing) handleFaceLogin();
    }, delay);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showCamera, cameraReady, isProcessing, retryCount]);

  const handleFaceLogin = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    setStatusMessage("Đang xác thực khuôn mặt...");
    const imageSrc = webcamRef.current?.getScreenshot();

    if (!imageSrc) {
      setIsProcessing(false);
      return;
    }

    try {
      const res = await api.post("/auth/login-face-mobile", { imageBase64: imageSrc });
      if (res.data?.access_token) {
        toast.success("Xác thực khuôn mặt thành công!");
        setStatusMessage("Xác thực thành công!");
        onSuccess(res.data.access_token);
      } else {
        throw new Error("Không nhận diện được");
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "Khuôn mặt không khớp hoặc chưa rõ.";
      setStatusMessage(msg);
      setRetryCount((prev) => {
        const next = prev + 1;
        if (next >= MAX_AUTO_RETRIES) {
          toast.error(msg);
        }
        return next;
      });
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
            screenshotQuality={0.92}
            width={480}
            height={480}
            videoConstraints={{ width: 480, height: 480, facingMode: "user" }}
            onUserMedia={() => setCameraReady(true)}
            onUserMediaError={() => {
              toast.error("Không thể mở camera. Vui lòng cấp quyền trình duyệt.");
              setShowCamera(false);
            }}
            className="h-full w-full scale-x-[-1] object-cover"
          />

          {isProcessing ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
              <FaSpinner className="text-3xl animate-spin" />
            </div>
          ) : null}

          <button
            type="button"
            onClick={() => setShowCamera(false)}
            className="absolute right-2 top-2 rounded-full bg-white/20 p-2 text-white transition hover:bg-red-500"
            aria-label="Đóng camera"
          >
            <FaTimes />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowCamera(true)}
          className="group relative flex h-20 w-20 cursor-pointer items-center justify-center rounded-3xl border-4 border-sky-300 bg-sky-50 shadow-lg transition-transform hover:scale-105"
          title="Mở khóa bằng khuôn mặt"
        >
          <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-inner transition-transform duration-300 group-hover:rotate-12">
            <FaRegSmile size={28} className="text-sky-600" />
          </div>
        </button>
      )}

      <span className="text-center text-sm font-medium text-slate-600">
        {showCamera
          ? statusMessage || "Đang quét khuôn mặt..."
          : "Đăng nhập bằng khuôn mặt"}
      </span>

      {showCamera && retryCount >= MAX_AUTO_RETRIES && !isProcessing ? (
        <button
          type="button"
          onClick={() => {
            setRetryCount(0);
            handleFaceLogin();
          }}
          className="rounded-xl bg-sky-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-sky-700"
        >
          Quét lại khuôn mặt
        </button>
      ) : null}
    </div>
  );
}
