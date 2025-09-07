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
  const [isProcessing, setIsProcessing] = useState(false);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [hasRegistered, setHasRegistered] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);

  const icons = {
    success: "✅",
    error: "❌",
    info: "ℹ️",
    warn: "⚠️",
  };

  useEffect(() => {
    const user = getUserFromToken();
    if (!user) return router.push("/login");
    if (user.role !== "nhanvien") return router.push("/");

    const init = async () => {
      try {
        setMaNV(user.maNV);
        toast.info(`${icons.info} Đang tải mô hình nhận diện và kiểm tra trạng thái...`);

        await loadFaceModels();

        const videoDevices = (await navigator.mediaDevices.enumerateDevices())
          .filter(d => d.kind === "videoinput");
        setDevices(videoDevices);
        if (videoDevices.length > 0) setSelectedDeviceId(videoDevices[0].deviceId);

        const checkRes = await api.get(`/facedata/check/${user.maNV}`);
        const hasFace = checkRes.data.hasFace;
        setHasRegistered(hasFace);

        if (hasFace) {
          toast.success(`${icons.success} Bạn đã đăng ký khuôn mặt. Chuyển hướng tới trang chấm công...`);
          return router.push("/employee/home");
        }

        setLoading(false);
      } catch (err) {
        console.error(err);
        toast.error(`${icons.error} Không thể tải mô hình hoặc thiết bị camera.`);
        setLoading(false);
      }
    };

    init();
  }, [router]);

  useEffect(() => {
    const videoElement = videoRef.current;
    let stream: MediaStream | null = null;
    let intervalId: NodeJS.Timeout;

    const startCamera = async () => {
      if (!selectedDeviceId || !videoElement) return;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { deviceId: selectedDeviceId } });
        videoElement.srcObject = stream;
        videoElement.onloadedmetadata = () => videoElement.play();

        const onPlay = () => {
          const canvas = canvasRef.current;
          if (!canvas) return;

          const dims = faceapi.matchDimensions(canvas, videoElement, true);

          intervalId = setInterval(async () => {
            if (!videoElement.paused && !videoElement.ended) {
              const detection = await faceapi
                .detectSingleFace(videoElement, new faceapi.TinyFaceDetectorOptions())
                .withFaceLandmarks();

              const ctx = canvas.getContext("2d");
              if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                if (detection) {
                  setFaceDetected(true);
                  const resized = faceapi.resizeResults(detection, dims);
                  faceapi.draw.drawDetections(canvas, resized);
                  faceapi.draw.drawFaceLandmarks(canvas, resized);
                } else {
                  setFaceDetected(false);
                }
              }
            }
          }, 100);
        };

        videoElement.addEventListener("play", onPlay);
      } catch (err) {
        console.error(err);
        toast.error(`${icons.error} Không thể mở camera. Vui lòng cấp quyền.`);
      }
    };

    if (!loading && !hasRegistered) startCamera();

    return () => {
      if (videoElement) videoElement.srcObject = null;
      if (stream) stream.getTracks().forEach(track => track.stop());
      clearInterval(intervalId);
    };
  }, [loading, selectedDeviceId, hasRegistered]);

  const handleRegister = async () => {
    if (isProcessing || !videoRef.current || !maNV) return;

    const video = videoRef.current;
    if (video.readyState < 2) {
      return toast.warn(`${icons.warn} Camera chưa sẵn sàng. Thử lại.`);
    }

    setIsProcessing(true);
    toast.info(`${icons.info} Đang nhận diện khuôn mặt và gửi dữ liệu...`);

    try {
      const detection = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection?.descriptor) {
        return toast.error(`${icons.error} Không nhận diện được khuôn mặt. Hãy đảm bảo khuôn mặt rõ ràng và ánh sáng tốt.`);
      }

      await api.post("/facedata/register", {
        faceDescriptor: Array.from(detection.descriptor),
      });

      toast.success(`${icons.success} Đăng ký khuôn mặt thành công!`);
      router.push("/employee/home");
    } catch (err: any) {
      console.error(err);
      toast.error(`${icons.error} ${err?.response?.data?.message || err.message || "Lỗi không xác định!"}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    setIsProcessing(false);
    toast.warn(`${icons.warn} Bạn đã hủy quá trình đăng ký.`);
  };

  return (
    <MobileLayout>
      <div className="p-4 flex flex-col items-center relative">
        <h1 className="text-xl font-bold mb-4">Đăng ký khuôn mặt</h1>

        {loading ? (
          <p>⏳ Đang tải mô hình và kiểm tra trạng thái...</p>
        ) : hasRegistered ? (
          <p className="text-center mb-4 text-yellow-500">Bạn đã đăng ký khuôn mặt. Đang chuyển hướng...</p>
        ) : (
          <>
            <p className="text-center mb-4 text-gray-600">
              📸 Đặt khuôn mặt vào giữa khung hình, đảm bảo ánh sáng tốt, rồi nhấn "Đăng ký khuôn mặt".
            </p>

            <div className="relative">
              <video ref={videoRef} autoPlay muted width="300" height="300" className="rounded-lg" />
              <canvas ref={canvasRef} width="300" height="300" className="absolute top-0 left-0" />
            </div>

            <div className="mt-4 w-full max-w-md">
              <label className="block mb-1 font-medium">Chọn thiết bị camera:</label>
              <select
                value={selectedDeviceId ?? ""}
                onChange={(e) => setSelectedDeviceId(e.target.value)}
                className="border px-2 py-1 rounded w-full"
              >
                {devices.map(d => <option key={d.deviceId} value={d.deviceId}>{d.label || `Camera ${d.deviceId}`}</option>)}
              </select>
            </div>

            <div className="flex space-x-4 mt-4">
              <button
                onClick={handleRegister}
                className="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50"
                disabled={isProcessing || !faceDetected}
              >
                {isProcessing ? "Đang xử lý..." : "Đăng ký khuôn mặt"}
              </button>
              <button
                onClick={handleCancel}
                className="bg-red-500 text-white px-4 py-2 rounded disabled:opacity-50"
                disabled={!isProcessing}
              >
                Hủy
              </button>
            </div>
          </>
        )}
      </div>
    </MobileLayout>
  );
}
