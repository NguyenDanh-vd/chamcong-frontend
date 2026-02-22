"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";
import MobileLayout from "@/layouts/MobileLayout";
import api from "@/utils/api";
import { getUserFromToken } from "@/utils/auth";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { FaSpinner, FaCamera, FaExclamationCircle, FaPlay } from "react-icons/fa";
import styles from "@/styles/Camera.module.css";
import { formatTime } from "@/utils/date";
import dayjs from "dayjs";

import HeaderSection from "@/components/employee/home/HeaderSection";
import AttendanceStats from "@/components/employee/home/AttendanceStats";
import HistorySidebar from "@/components/employee/home/HistorySidebar";

const useVNClock = () => {
  const [time, setTime] = useState<dayjs.Dayjs | null>(null);

  useEffect(() => {
    setTime(dayjs());
    const timer = setInterval(() => {
      setTime(dayjs());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return {
    timeStr: time ? time.format("HH:mm:ss") : "--:--:--",
    dateStr: time ? time.format("dddd, DD/MM/YYYY") : "Đang tải...",
  };
};

interface AttendanceRecord {
  gioVao?: string;
  gioRa?: string;
}

interface CaLamViec {
  maCa: number;
  tenCa: string;
  gioBatDau: string;
  gioKetThuc: string;
}

export default function EmployeeHomePage() {
  const router = useRouter();
  const webcamRef = useRef<Webcam>(null);
  const { timeStr, dateStr } = useVNClock();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [autoScan, setAutoScan] = useState(true);

  const [scanStatus, setScanStatus] = useState<string>("");
  const [scanError, setScanError] = useState<boolean>(false);
  const [scanClass, setScanClass] = useState(styles.scanActive);

  const [attendanceRecord, setAttendanceRecord] = useState<AttendanceRecord>({});
  const [caLamViec, setCaLamViec] = useState<CaLamViec | null>(null);

  const attendanceRef = useRef(attendanceRecord);
  const autoScanRef = useRef(autoScan);

  useEffect(() => {
    attendanceRef.current = attendanceRecord;
  }, [attendanceRecord]);

  useEffect(() => {
    autoScanRef.current = autoScan;
  }, [autoScan]);

  const fetchData = useCallback(async () => {
    try {
      const u = getUserFromToken();
      if (!u) {
        router.push("/auth/login");
        return;
      }
      const [resProfile, resShift, resToday] = await Promise.all([
        api.get("/nhanvien/profile"),
        api.get("/calamviec/current-shift"),
        api.get(`/chamcong/today/${u.maNV}`),
      ]);
      const profileData = resProfile?.data || {};
      setUser({ ...u, avatarUrl: profileData.avatarUrl || u.avatarUrl });

      setCaLamViec(resShift.data || null);
      setAttendanceRecord(resToday.data || {});

      if (resToday.data?.gioVao && resToday.data?.gioRa) {
        setAutoScan(false);
        setScanStatus("Bạn đã hoàn thành chấm công hôm nay.");
        setScanClass(styles.scanSuccess);
      }
    } catch (error) {
      console.error(error);
      toast.error("Lỗi tải dữ liệu chấm công!");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const scanFace = async () => {
      if (!webcamRef.current || !cameraReady || isProcessing || !autoScanRef.current || !user) return;

      const record = attendanceRef.current;
      if (record.gioVao && record.gioRa) return;

      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) return;

      setIsProcessing(true);
      setScanStatus("Đang nhận diện khuôn mặt...");
      setScanError(false);
      setScanClass(styles.scanActive);

      try {
        const res = await api.post("/facedata/point-mobile", {
          maNV: user.maNV,
          imageBase64: imageSrc,
          maCa: caLamViec?.maCa,
        });

        if (res.data.type === "ignored") {
          setScanStatus("Vui lòng đợi 5 phút trước khi tiếp tục.");
          setScanClass(styles.scanActive);
          setAutoScan(false);
          setTimeout(() => setAutoScan(true), 5 * 60 * 1000);
          return;
        }

        toast.success(res.data.message);
        setScanStatus(`Thành công: ${res.data.message}`);
        setScanClass(styles.scanSuccess);

        await fetchData();

        if (attendanceRef.current.gioVao && !attendanceRef.current.gioRa) {
          setAutoScan(false);
          setTimeout(() => setAutoScan(true), 10000);
        }
      } catch (err: any) {
        setScanError(true);
        setScanClass(styles.scanError);

        const msg = err?.response?.data?.message || "";
        if (msg.toLowerCase().includes("không khớp") || msg.toLowerCase().includes("unknown")) {
          setScanStatus("Khuôn mặt không khớp, vui lòng thử lại.");
        } else {
          setScanStatus("Không tìm thấy khuôn mặt hợp lệ.");
        }
      } finally {
        setIsProcessing(false);
      }
    };

    if (autoScan && cameraReady) {
      intervalId = setInterval(scanFace, 3000);
    }

    return () => clearInterval(intervalId);
  }, [cameraReady, isProcessing, autoScan, user, caLamViec, fetchData]);

  if (loading) {
    return (
      <div className="flex justify-center p-10">
        <FaSpinner className="animate-spin text-3xl text-sky-500" />
      </div>
    );
  }

  return (
    <MobileLayout>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-cyan-50/30 to-white p-4 md:p-8">
        <HeaderSection timeStr={timeStr} dateStr={dateStr} user={user} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_45px_-22px_rgba(2,132,199,0.35)]">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="inline-flex items-center rounded-full border border-teal-200 bg-gradient-to-r from-teal-50 to-cyan-50 px-3 py-1 shadow-sm">
                    <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-teal-700">Ca làm việc hiện tại</p>
                  </div>
                  <h2 className="mt-1 text-2xl font-bold text-slate-900">{caLamViec ? caLamViec.tenCa : "Không có ca cố định"}</h2>
                </div>
                {caLamViec ? (
                  <span className="rounded-full border border-sky-200 bg-sky-50 px-4 py-1.5 text-sm font-semibold text-sky-700">
                    {formatTime(caLamViec.gioBatDau, "HH:mm")} - {formatTime(caLamViec.gioKetThuc, "HH:mm")}
                  </span>
                ) : null}
              </div>

              <div className="mb-5 flex justify-center">
                <div className="relative h-72 w-72 rounded-full bg-gradient-to-tr from-sky-500 via-cyan-500 to-teal-500 p-1.5 shadow-[0_20px_40px_-15px_rgba(6,182,212,0.6)] md:h-80 md:w-80">
                  <div className={`relative h-full w-full overflow-hidden rounded-full bg-slate-900 ${styles.cameraWrapper}`}>
                    <Webcam
                      audio={false}
                      ref={webcamRef}
                      screenshotFormat="image/jpeg"
                      width={400}
                      height={400}
                      videoConstraints={{ facingMode: "user", aspectRatio: 1 }}
                      onUserMedia={() => setCameraReady(true)}
                      className="h-full w-full scale-x-[-1] rounded-full object-cover"
                    />
                    <div className={`${styles.scanCircle} ${scanClass}`} />

                    {!cameraReady ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center rounded-full bg-black/75 p-4 text-center text-white">
                        <FaCamera className="mb-2 h-8 w-8 animate-pulse" />
                        <span className="text-xs font-medium">Đang khởi động camera...</span>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="mb-6 flex min-h-10 items-center justify-center">
                {isProcessing ? (
                  <p className="flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-4 py-1.5 text-sm font-semibold text-sky-700">
                    <FaSpinner className="animate-spin" /> Đang nhận diện...
                  </p>
                ) : scanStatus ? (
                  <p
                    className={`flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-semibold ${
                      scanError
                        ? "border-red-200 bg-red-50 text-red-600"
                        : "border-emerald-200 bg-emerald-50 text-emerald-600"
                    }`}
                  >
                    {scanError ? <FaExclamationCircle /> : null}
                    {scanStatus}
                  </p>
                ) : autoScan ? (
                  <p className="text-sm italic text-slate-500">Hệ thống đang tự động quét...</p>
                ) : (
                  <button
                    onClick={() => {
                      setScanStatus("");
                      setAutoScan(true);
                    }}
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-600 to-cyan-500 px-4 py-1.5 text-sm font-semibold text-white shadow-md shadow-cyan-200/70 transition hover:opacity-95"
                  >
                    <FaPlay className="text-xs" /> Tiếp tục quét
                  </button>
                )}
              </div>

              <AttendanceStats attendanceRecord={attendanceRecord} />
            </div>
          </div>

          <HistorySidebar attendanceRecord={attendanceRecord} />
        </div>
      </div>
    </MobileLayout>
  );
}
