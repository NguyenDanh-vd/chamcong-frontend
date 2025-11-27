"use client";

import { useEffect, useRef, useState } from "react";
import MobileLayout from "@/layouts/MobileLayout";
import api from "@/utils/api";
import * as faceapi from "face-api.js";
import { loadFaceModels } from "@/utils/face";
import { getUserFromToken } from "@/utils/auth";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export default function RegisterFacePage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [loading, setLoading] = useState(true);
  const [maNV, setMaNV] = useState<number | null>(null);
  const [userRole, setUserRole] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);

  const [hasRegistered, setHasRegistered] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);

  const currentStream = useRef<MediaStream | null>(null);
  const detectInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const user = getUserFromToken();
    if (!user) return router.push("/auth/login");

    const allowedRoles = ["nhanvien", "quantrivien", "nhansu"];
    const role = (user.role || "").toLowerCase();

    if (!allowedRoles.includes(role)) {
      toast.error("Bạn không có quyền truy cập trang này.");
      return router.push("/");
    }

    setUserRole(role);

    (async () => {
      try {
        setMaNV(user.maNV);
        await loadFaceModels();

        const checkRes = await api.get(`/facedata/check/${user.maNV}`);
        if (checkRes.data?.hasFace) {
          setHasRegistered(true);
          if (role === "nhanvien") {
            toast.info("Bạn đã có dữ liệu khuôn mặt. Đang chuyển về trang chủ...");
            router.push("/employee/home");
          } else {
             toast.info("Bạn đã có dữ liệu khuôn mặt. Bạn có thể quét lại để cập nhật.");
          }
        }
      } catch (e) {
        console.error(e);
        toast.error("Không thể tải mô hình/kiểm tra trạng thái.");
      } finally {
        setLoading(false);
      }
    })();

    return () => stopStream();
  }, []);

  // xin quyền + liệt kê thiết bị + bật preview
  const enableCamera = async () => {
    try {
      setCameraReady(false);
      // xin quyền
      const temp = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      temp.getTracks().forEach((t) => t.stop()); 

      // enumerate
      const all = await navigator.mediaDevices.enumerateDevices();
      const vids = all.filter((d) => d.kind === "videoinput");
      setDevices(vids);

      const firstId = vids[0]?.deviceId || undefined;
      if (firstId || vids.length === 0) { 
        const idToUse = firstId || undefined;
        setSelectedDeviceId(idToUse || null);
        await startPreview(idToUse);
        setCameraReady(true);
      } else {
        toast.error("Không tìm thấy thiết bị camera.");
      }
    } catch (e: any) {
      console.error(e);
      if (e?.name === "NotAllowedError") {
        toast.error("Bạn đang chặn quyền camera. Hãy cho phép trong cài đặt trình duyệt.");
      } else {
        toast.error("Không thể truy cập camera.");
      }
    }
  };

  const startPreview = async (deviceId?: string) => {
    stopStream();

    const constraints = {
      video: deviceId 
        ? { deviceId: { exact: deviceId }, width: { ideal: 720 }, height: { ideal: 720 } }
        : { facingMode: "user", width: { ideal: 720 }, height: { ideal: 720 } },
      audio: false,
    };

    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    currentStream.current = stream;

    const video = videoRef.current!;
    video.srcObject = stream;
    await video.play();

    // vẽ khung & phát hiện
    const canvas = canvasRef.current!;
    const dims = faceapi.matchDimensions(canvas, video, true);

    if (detectInterval.current) clearInterval(detectInterval.current);
    detectInterval.current = setInterval(async () => {
      if (video.paused || video.ended) return;
      
      const detection = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks();

      const ctx = canvas.getContext("2d")!;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (detection) {
        setFaceDetected(true);
        const resized = faceapi.resizeResults(detection, dims);
        faceapi.draw.drawDetections(canvas, resized);
      } else {
        setFaceDetected(false);
      }
    }, 120); 
  };

  const stopStream = () => {
    if (detectInterval.current) {
      clearInterval(detectInterval.current);
      detectInterval.current = null;
    }
    const s = currentStream.current;
    s?.getTracks().forEach((t) => t.stop());
    currentStream.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  const onChangeDevice = async (id: string) => {
    setSelectedDeviceId(id);
    try {
      await startPreview(id);
    } catch (e) {
      console.error(e);
      toast.error("Không thể chuyển camera.");
    }
  };

  const handleRegister = async () => {
    if (isProcessing || !videoRef.current || !maNV) return;
    if (!cameraReady) return toast.warn("Hãy bật camera trước.");

    const video = videoRef.current;
    
    setIsProcessing(true);
    const loadingToast = toast.loading("Đang xử lý dữ liệu khuôn mặt...");

    try {
      const detection = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection?.descriptor) {
        toast.dismiss(loadingToast);
        toast.error("Không nhận diện được khuôn mặt. Giữ yên và thử lại.");
        setIsProcessing(false);
        return;
      }

      await api.post("/facedata/register", {
        faceDescriptor: Array.from(detection.descriptor),
      });

      toast.dismiss(loadingToast);
      toast.success("Đăng ký khuôn mặt thành công!");
      stopStream();

      if (["quantrivien", "nhansu"].includes(userRole)) {
        router.push("/admin/profile"); 
      } else {
        router.replace("/employee/home");
      }

    } catch (err: any) {
      toast.dismiss(loadingToast);
      console.error(err);
      toast.error(err?.response?.data?.message || "Lỗi đăng ký khuôn mặt.");
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    setIsProcessing(false);
    stopStream();
    if (["quantrivien", "nhansu"].includes(userRole)) {
        router.back();
    } else {
        router.push("/employee/home");
    }
  };

  return (
    <MobileLayout>
      <div className="p-4 flex flex-col items-center relative min-h-screen bg-white">
        <h1 className="text-xl font-bold mb-4 text-gray-800">
            {hasRegistered ? "Cập nhật khuôn mặt" : "Đăng ký khuôn mặt"}
        </h1>

        {loading ? (
          <div className="flex flex-col items-center mt-10">
            <Spin size="large" />
            <p className="mt-4 text-gray-500">Đang tải mô hình AI...</p>
          </div>
        ) : (
          <>
            {!cameraReady && (
                <p className="text-center mb-6 text-gray-500 px-4">
                📸 Để sử dụng tính năng đăng nhập bằng khuôn mặt, vui lòng cho phép truy cập camera và giữ khuôn mặt ở giữa khung hình.
                </p>
            )}

            <div className="relative rounded-2xl overflow-hidden shadow-xl border-4 border-gray-100">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                width={300}
                height={300}
                className="bg-black object-cover"
              />
              <canvas
                ref={canvasRef}
                width={300}
                height={300}
                className="absolute top-0 left-0"
              />
            </div>

            {/* Các nút điều khiển */}
            <div className="mt-8 flex flex-col items-center gap-4 w-full max-w-xs">
              {!cameraReady ? (
                <div className="flex gap-3 w-full">
                     <button 
                        onClick={enableCamera} 
                        className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition"
                    >
                        Bật Camera
                    </button>
                    <button 
                        onClick={handleCancel} 
                        className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-300 transition"
                    >
                        Quay lại
                    </button>
                </div>
               
              ) : (
                <>
                  <div className="w-full">
                    <label className="text-xs text-gray-400 font-medium ml-1">Chọn Camera:</label>
                    <select
                        value={selectedDeviceId ?? ""}
                        onChange={(e) => onChangeDevice(e.target.value)}
                        className="w-full mt-1 p-2 border border-gray-200 rounded-lg bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={!cameraReady || devices.length === 0}
                    >
                        {devices.map((d, i) => (
                        <option key={d.deviceId || i} value={d.deviceId}>
                            {d.label || `Camera ${i + 1}`}
                        </option>
                        ))}
                    </select>
                  </div>

                  <div className="flex gap-3 w-full mt-2">
                    <button
                        onClick={handleRegister}
                        disabled={isProcessing || !faceDetected}
                        className={`flex-1 py-3 rounded-xl font-bold text-white shadow-lg transition ${
                            isProcessing || !faceDetected 
                            ? "bg-gray-400 cursor-not-allowed" 
                            : "bg-green-600 hover:bg-green-700 animate-pulse"
                        }`}
                    >
                        {isProcessing ? "Đang xử lý..." : "Chụp & Lưu"}
                    </button>
                    
                    <button
                        onClick={handleCancel}
                        className="px-6 py-3 rounded-xl font-bold bg-red-100 text-red-600 hover:bg-red-200 transition"
                    >
                        Huỷ
                    </button>
                  </div>
                  {!faceDetected && (
                      <p className="text-red-500 text-sm font-medium animate-bounce">
                          ⚠️ Không tìm thấy khuôn mặt
                      </p>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>
    </MobileLayout>
  );
}

function Spin({ size = "default" }: { size?: "small" | "default" | "large" }) {
    const dims = size === "large" ? "w-10 h-10" : "w-6 h-6";
    return (
        <div className={`${dims} border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin`}></div>
    );
}