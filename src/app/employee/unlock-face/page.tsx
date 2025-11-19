"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import api from "@/utils/api";
import * as faceapi from "face-api.js";
import { toast } from "react-toastify";

export default function LoginWithFaceAuto() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  // Lấy token từ localStorage / sessionStorage
  const getToken = () =>
    localStorage.getItem("token") || sessionStorage.getItem("token");

  // Load face-api models
  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = "/models";
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);
    };
    loadModels();
  }, []);

  // Start video
  useEffect(() => {
    const startVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        console.error("Cannot access camera", err);
        toast.error("Không thể truy cập camera");
      }
    };
    startVideo();
  }, []);

  // Auto Face Unlock nếu có token
  useEffect(() => {
    const autoFaceUnlock = async () => {
      const token = getToken();
      if (!token) return; // chưa login → không làm gì

      try {
        // Kiểm tra đã đăng ký FaceID chưa
        const checkRes = await api.get("/facedata/check-me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!checkRes.data?.hasFace) return;

        setLoading(true);
        setStatus("Đang nhận diện khuôn mặt...");

        if (!videoRef.current) return;

        const detection = await faceapi
          .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceDescriptor();

        if (!detection || !detection.descriptor) {
          setStatus("Không nhận diện được khuôn mặt");
          setLoading(false);
          return;
        }

        const descriptor = Array.from(detection.descriptor);
        const maCa = 1; // Thay bằng ca hiện tại nếu có

        // Gửi FaceID lên backend để chấm công
        const res = await api.post(
          "/facedata/point",
          { faceDescriptor: descriptor, maCa },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setStatus(res.data.message);
        toast.success(res.data.message);

        setTimeout(() => router.replace("/employee/home"), 1200);
      } catch (err: any) {
        console.error(err);
        setStatus("Lỗi nhận diện khuôn mặt");
      } finally {
        setLoading(false);
      }
    };

    autoFaceUnlock();
  }, [router]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-purple-600 via-blue-500 to-blue-400 p-4">
      <h2 className="text-white text-2xl font-bold mb-4">Mở khóa bằng khuôn mặt</h2>

      <div className="relative w-64 h-64">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full rounded-2xl object-cover border-4 border-purple-200 shadow-lg"
        />
      </div>

      {status && <p className="text-white mt-4 font-medium">{status}</p>}
      {loading && <p className="text-white mt-2">Đang xử lý...</p>}
    </div>
  );
}
