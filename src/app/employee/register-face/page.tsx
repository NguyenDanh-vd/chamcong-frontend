"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
  FaCamera,
  FaSpinner,
  FaExclamationTriangle,
  FaArrowLeft,
  FaShieldAlt,
} from "react-icons/fa";

import MobileLayout from "@/layouts/MobileLayout";
import api from "@/utils/api";
import { getUserFromToken } from "@/utils/auth";
import FaceCameraFrame from "@/components/employee/register-face/FaceCameraFrame";

export default function RegisterFacePage() {
  const router = useRouter();
  const webcamRef = useRef<Webcam>(null);

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [hasFaceData, setHasFaceData] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);

  useEffect(() => {
    const user = getUserFromToken();
    if (!user) {
      router.push("/auth/login");
      return;
    }

    const role = (user.role || "").toLowerCase();
    if (!["nhanvien", "quantrivien", "nhansu"].includes(role)) {
      toast.error("Bạn không có quyền truy cập");
      router.push("/");
      return;
    }

    setUserInfo(user);

    const checkStatus = async () => {
      try {
        const res = await api.get(`/facedata/check/${user.maNV}`);
        if (res.data?.hasFace) {
          setHasFaceData(true);
          toast.success("Tài khoản đã có dữ liệu khuôn mặt. Bạn có thể cập nhật lại.", {
            position: "top-center",
            autoClose: 2600,
          });
        } else {
          toast.info("Bạn chưa đăng ký khuôn mặt. Hãy thực hiện ngay.", {
            position: "top-center",
            autoClose: 2600,
          });
        }
      } catch (error) {
        console.error("Lỗi kiểm tra trạng thái khuôn mặt:", error);
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
  }, [router]);

  const handleRegister = useCallback(async () => {
    if (!webcamRef.current || !userInfo) return;

    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) {
      toast.error("Không chụp được ảnh. Vui lòng thử lại.");
      return;
    }

    setProcessing(true);
    const loadingToast = toast.loading("Đang gửi ảnh và xử lý nhận diện...");

    try {
      await api.post("/facedata/register-mobile", {
        maNV: userInfo.maNV,
        imageBase64: imageSrc,
      });

      toast.update(loadingToast, {
        render: "Đăng ký khuôn mặt thành công.",
        type: "success",
        isLoading: false,
        autoClose: 1800,
      });

      setTimeout(() => {
        if (["quantrivien", "nhansu"].includes((userInfo.role || "").toLowerCase())) {
          router.push("/admin/profile");
        } else {
          router.push("/employee/home");
        }
      }, 1200);
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Không nhận diện được khuôn mặt. Vui lòng thử lại.";
      toast.update(loadingToast, {
        render: `Lỗi: ${msg}`,
        type: "error",
        isLoading: false,
        autoClose: 3600,
      });
    } finally {
      setProcessing(false);
    }
  }, [router, userInfo]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <FaSpinner className="animate-spin text-4xl text-sky-500" />
      </div>
    );
  }

  return (
    <MobileLayout>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-cyan-50/25 to-white px-4 pb-24 pt-6 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <section className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_18px_45px_-28px_rgba(2,132,199,0.45)] dark:border-slate-700 dark:bg-slate-900">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="inline-flex items-center rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-700 dark:border-cyan-500/40 dark:bg-cyan-900/30 dark:text-cyan-300">
                <FaShieldAlt className="mr-2" /> Face ID
              </div>
              <h1 className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                {hasFaceData ? "Cập nhật khuôn mặt" : "Đăng ký khuôn mặt"}
              </h1>
              <p className="mt-1 max-w-xl text-sm text-slate-600 dark:text-slate-300">
                Giữ khuôn mặt ở trung tâm khung hình, đủ ánh sáng, không đeo khẩu trang để hệ thống nhận diện chính xác.
              </p>
            </div>
          </div>

          <FaceCameraFrame
            webcamRef={webcamRef}
            processing={processing}
            cameraReady={cameraReady}
            setCameraReady={setCameraReady}
            onError={() => toast.error("Không thể truy cập camera. Hãy kiểm tra quyền trình duyệt.")}
          />

          <div className="mx-auto w-full max-w-sm space-y-3">
            <button
              onClick={handleRegister}
              disabled={!cameraReady || processing}
              className={`flex w-full items-center justify-center gap-3 rounded-2xl py-3.5 text-base font-bold text-white shadow-lg transition active:scale-[0.99] ${
                !cameraReady || processing
                  ? "cursor-not-allowed bg-slate-400"
                  : "bg-gradient-to-r from-sky-600 to-cyan-500 hover:opacity-95"
              }`}
            >
              {processing ? <FaSpinner className="animate-spin" /> : <FaCamera />}
              {hasFaceData ? "Chụp lại và cập nhật" : "Chụp và lưu"}
            </button>

            <button
              onClick={() => router.back()}
              disabled={processing}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 py-3 font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <FaArrowLeft /> Quay lại
            </button>
          </div>

          {hasFaceData ? (
            <div className="mx-auto mt-5 flex w-full max-w-sm items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-500/40 dark:bg-amber-900/25 dark:text-amber-300">
              <FaExclamationTriangle className="mt-0.5 flex-shrink-0" />
              <span>
                Lưu ý: dữ liệu khuôn mặt cũ sẽ bị thay thế khi bạn bấm lưu lại.
              </span>
            </div>
          ) : null}
        </section>
      </div>
    </MobileLayout>
  );
}
