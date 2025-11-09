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
  const [cameraReady, setCameraReady] = useState(false);

  // giữ stream hiện tại để dừng khi đổi camera/thoát trang
  const currentStream = useRef<MediaStream | null>(null);
  const detectInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const user = getUserFromToken();
    if (!user) return router.push("/login");
    if ((user.role || "").toLowerCase() !== "nhanvien") return router.push("/");

    (async () => {
      try {
        setMaNV(user.maNV);
        await loadFaceModels();

        // kiểm tra đã đăng ký chưa
        const checkRes = await api.get(`/facedata/check/${user.maNV}`);
        if (checkRes.data?.hasFace) {
          setHasRegistered(true);
          toast.success("Bạn đã đăng ký khuôn mặt. Chuyển đến trang chấm công…");
          router.push("/employee/home");
          return;
        }
      } catch (e) {
        console.error(e);
        toast.error("Không thể tải mô hình/kiểm tra trạng thái.");
      } finally {
        setLoading(false);
      }
    })();

    return () => stopStream();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // xin quyền + liệt kê thiết bị + bật preview
  const enableCamera = async () => {
    try {
      setCameraReady(false);
      // xin quyền (gọi sau click mới bật popup trên mobile)
      const temp = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" }, // "environment" nếu muốn ưu tiên cam sau
        audio: false,
      });
      temp.getTracks().forEach(t => t.stop()); // chỉ để xin quyền

      // sau khi có quyền mới enumerate
      const all = await navigator.mediaDevices.enumerateDevices();
      const vids = all.filter(d => d.kind === "videoinput");
      setDevices(vids);

      // chọn camera đầu tiên rồi thật sự mở preview
      const firstId = vids[0]?.deviceId || undefined;
      if (firstId) {
        setSelectedDeviceId(firstId);
        await startPreview(firstId);
        setCameraReady(true);
      } else {
        toast.error("Không tìm thấy thiết bị camera.");
      }
    } catch (e: any) {
      console.error(e);
      if (e?.name === "NotAllowedError") {
        toast.error("Bạn đang chặn quyền camera. Hãy bấm biểu tượng 🔒 trên thanh địa chỉ → Quyền → Camera → Cho phép, rồi tải lại trang.");
      } else {
        toast.error(e?.message || "Không thể truy cập camera.");
      }
    }
  };

  const startPreview = async (deviceId: string) => {
    stopStream();

    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        deviceId: { exact: deviceId },
        width: { ideal: 720 },
        height: { ideal: 720 },
      },
      audio: false,
    });
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
        faceapi.draw.drawFaceLandmarks(canvas, resized);
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
    s?.getTracks().forEach(t => t.stop());
    currentStream.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  // đổi camera trong select
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
    if (video.readyState < 2) {
      return toast.warn("Camera chưa sẵn sàng. Thử lại.");
    }

    setIsProcessing(true);
    try {
      const detection = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection?.descriptor) {
        toast.error("Không nhận diện được khuôn mặt. Hãy để mặt rõ và đủ sáng.");
        return;
      }

      await api.post("/facedata/register", {
        // nếu backend yêu cầu maNV thì thêm: maNV,
        faceDescriptor: Array.from(detection.descriptor),
      });

      toast.success("Đăng ký khuôn mặt thành công!");
      router.push("/employee/home");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || err.message || "Lỗi không xác định!");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    setIsProcessing(false);
    stopStream();
    toast.warn("Đã hủy quá trình đăng ký.");
  };

  return (
    <MobileLayout>
      <div className="p-4 flex flex-col items-center relative">
        <h1 className="text-xl font-bold mb-4">Đăng ký khuôn mặt</h1>

        {loading ? (
          <p>⏳ Đang tải mô hình và kiểm tra trạng thái…</p>
        ) : hasRegistered ? (
          <p className="text-center mb-4 text-yellow-500">Bạn đã đăng ký khuôn mặt. Đang chuyển hướng…</p>
        ) : (
          <>
            <p className="text-center mb-4 text-gray-400">
              📸 Đặt khuôn mặt vào giữa khung hình, ánh sáng tốt, rồi nhấn "Bật camera" → "Đăng ký khuôn mặt".
            </p>

            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                width={300}
                height={300}
                className="rounded-lg bg-black"
              />
              <canvas
                ref={canvasRef}
                width={300}
                height={300}
                className="absolute top-0 left-0"
              />
            </div>

            <div className="mt-4 flex gap-3">
              <button onClick={enableCamera} className="bg-blue-600 text-white px-4 py-2 rounded">
                Bật camera
              </button>
              <button onClick={handleCancel} className="bg-gray-500 text-white px-4 py-2 rounded">
                Tắt
              </button>
            </div>

            <div className="mt-4 w-full max-w-md">
              <label className="block mb-1 font-medium">Chọn thiết bị camera:</label>
              <select
                value={selectedDeviceId ?? ""}
                onChange={(e) => onChangeDevice(e.target.value)}
                className="border px-2 py-1 rounded w-full text-black"
                disabled={!cameraReady || devices.length === 0}
              >
                {devices.length === 0 && <option>Chưa có quyền camera</option>}
                {devices.map((d, i) => (
                  <option key={d.deviceId || `cam-${i}`} value={d.deviceId}>
                    {d.label || `Camera ${i + 1}`}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex space-x-4 mt-4">
              <button
                onClick={handleRegister}
                className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
                disabled={isProcessing || !cameraReady || !faceDetected}
              >
                {isProcessing ? "Đang xử lý…" : "Đăng ký khuôn mặt"}
              </button>
              <button
                onClick={handleCancel}
                className="bg-red-500 text-white px-4 py-2 rounded"
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
