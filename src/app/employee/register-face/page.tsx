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
import { FaceCameraFrame } from "@/components/employee/register-face/FaceCameraFrame";


const CAPTURE_STEPS = [
  {
    title: "Nhin thang vao camera",
    description: "Giu mat o giua khung va nhin thang vao ong kinh.",
  },
  {
    title: "Xoay nhe sang trai",
    description: "Xoay khoang 20-30 do va giu mat trong khung.",
  },
  {
    title: "Xoay nhe sang phai",
    description: "Giu mat can doi va khong di ra khoi vong tron.",
  },
] as const;

export default function RegisterFacePage() {
  const router = useRouter();
  const webcamRef = useRef<Webcam>(null);
  const isMountedRef = useRef(true);

  const [loading, setLoading] = useState(true);
  const [capturing, setCapturing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [hasFaceData, setHasFaceData] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [capturedCount, setCapturedCount] = useState(0);

  useEffect(() => {
    isMountedRef.current = true;

    const user = getUserFromToken();
    if (!user) {
      router.push("/auth/login");
      return;
    }

    const role = (user.role || "").toLowerCase();
    if (!["nhanvien", "quantrivien", "nhansu"].includes(role)) {
      toast.error("Ban khong co quyen truy cap");
      router.push("/");
      return;
    }

    setUserInfo(user);

    const checkStatus = async () => {
      try {
        const res = await api.get(`/facedata/check/${user.maNV}`);
        if (res.data?.hasFace) {
          setHasFaceData(true);
          toast.success("Tai khoan da co du lieu khuon mat. Ban co the cap nhat lai.", {
            position: "top-center",
            autoClose: 2600,
          });
        } else {
          toast.info("Ban chua dang ky khuon mat. Hay thuc hien ngay.", {
            position: "top-center",
            autoClose: 2600,
          });
        }
      } catch (error) {
        console.error("Loi kiem tra trang thai khuon mat:", error);
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    };

    checkStatus();

    return () => {
      isMountedRef.current = false;
    };
  }, [router]);

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const submitCapturedImages = useCallback(
    async (imagesBase64: string[]) => {
      if (!userInfo) return;

      setSubmitting(true);
      const loadingToast = toast.loading("Dang gui anh va tao du lieu Face ID...");

      try {
        await api.post("/facedata/register-mobile", {
          maNV: userInfo.maNV,
          imagesBase64,
        });

        toast.update(loadingToast, {
          render: "Dang ky khuon mat thanh cong.",
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
        const msg = err?.response?.data?.message || "Khong nhan dien duoc khuon mat. Vui long thu lai.";
        toast.update(loadingToast, {
          render: `Loi: ${msg}`,
          type: "error",
          isLoading: false,
          autoClose: 3600,
        });
      } finally {
        if (isMountedRef.current) {
          setSubmitting(false);
        }
      }
    },
    [router, userInfo],
  );

  const handleRegister = useCallback(async () => {
    if (!webcamRef.current || !userInfo) return;

    try {
      setCapturing(true);
      setCapturedCount(0);
      setCurrentStep(0);

      const images: string[] = [];
      for (let index = 0; index < CAPTURE_STEPS.length; index++) {
        if (!isMountedRef.current) return;

        setCurrentStep(index);

        for (let second = 3; second >= 1; second--) {
          if (!isMountedRef.current) return;
          setCountdown(second);
          await sleep(700);
        }

        setCountdown(null);
        await sleep(150);

        const imageSrc = webcamRef.current?.getScreenshot();
        if (!imageSrc) {
          throw new Error("capture_failed");
        }

        images.push(imageSrc);
        setCapturedCount(images.length);
        await sleep(350);
      }

      setCapturing(false);
      await submitCapturedImages(images);
    } catch (_err) {
      toast.error("Khong chup duoc du anh khuon mat. Vui long giu may on dinh va thu lai.");
      if (isMountedRef.current) {
        setCapturing(false);
        setCountdown(null);
      }
    }
  }, [submitCapturedImages, userInfo]);

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
                {hasFaceData ? "Cap nhat khuon mat" : "Dang ky khuon mat"}
              </h1>
              <p className="mt-1 max-w-xl text-sm text-slate-600 dark:text-slate-300">
                He thong se huong dan ban xoay dau theo 3 buoc de capture nhieu goc, sau do tao descriptor trung binh de tang do chinh xac nhan dien.
              </p>
            </div>
          </div>

          <FaceCameraFrame
            webcamRef={webcamRef}
            processing={submitting}
            processingLabel="Dang tao descriptor trung binh..."
            cameraReady={cameraReady}
            setCameraReady={setCameraReady}
            guideTitle={CAPTURE_STEPS[currentStep]?.title}
            guideDescription={CAPTURE_STEPS[currentStep]?.description}
            stepProgress={capturing ? `Buoc ${currentStep + 1}/${CAPTURE_STEPS.length}` : undefined}
            countdown={capturing ? countdown : null}
            onError={() => toast.error("Khong the truy cap camera. Hay kiem tra quyen trinh duyet.")}
          />

          <div className="mx-auto w-full max-w-sm space-y-3">
            <button
              onClick={handleRegister}
              disabled={!cameraReady || capturing || submitting}
              className={`flex w-full items-center justify-center gap-3 rounded-2xl py-3.5 text-base font-bold text-white shadow-lg transition active:scale-[0.99] ${
                !cameraReady || capturing || submitting
                  ? "cursor-not-allowed bg-slate-400"
                  : "bg-gradient-to-r from-sky-600 to-cyan-500 hover:opacity-95"
              }`}
            >
              {capturing || submitting ? <FaSpinner className="animate-spin" /> : <FaCamera />}
              {capturing
                ? `Dang chup ${capturedCount}/${CAPTURE_STEPS.length}`
                : hasFaceData
                  ? "Quet lai va cap nhat"
                  : "Bat dau quet da goc"}
            </button>

            <button
              onClick={() => router.back()}
              disabled={capturing || submitting}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 py-3 font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <FaArrowLeft /> Quay lai
            </button>
          </div>

          <div className="mx-auto mt-4 w-full max-w-sm rounded-xl border border-cyan-100 bg-cyan-50/70 p-3 text-xs text-cyan-800 dark:border-cyan-500/30 dark:bg-cyan-900/20 dark:text-cyan-200">
            He thong tu dong chup {CAPTURE_STEPS.length} anh o cac huong khac nhau va gui tat ca len server trong mot lan.
          </div>

          {hasFaceData ? (
            <div className="mx-auto mt-5 flex w-full max-w-sm items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-500/40 dark:bg-amber-900/25 dark:text-amber-300">
              <FaExclamationTriangle className="mt-0.5 flex-shrink-0" />
              <span>Luu y: du lieu khuon mat cu se bi thay the khi ban luu lai.</span>
            </div>
          ) : null}
        </section>
      </div>
    </MobileLayout>
  );
}
