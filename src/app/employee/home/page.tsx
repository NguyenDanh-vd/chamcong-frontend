"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";
import MobileLayout from "@/layouts/MobileLayout";
import api from "@/utils/api";
import { getUserFromToken } from "@/utils/auth";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { FaSpinner, FaCamera, FaExclamationCircle } from "react-icons/fa";
import styles from "@/styles/Camera.module.css";
import { toVN7, formatTime } from "@/utils/date"; 
import dayjs from "dayjs";
import dynamic from "next/dynamic"; // 1. Import dynamic

/* --- IMPORT CÁC COMPONENT --- */
import HeaderSection from "@/components/employee/home/HeaderSection";
import AttendanceStats from "@/components/employee/home/AttendanceStats";
import HistorySidebar from "@/components/employee/home/HistorySidebar";

/* --- 2. LAZY LOAD BIỂU ĐỒ (Để web load nhanh hơn) --- */
const WorkChart = dynamic(() => import("@/components/employee/home/WorkChart"), {
  loading: () => <div className="h-72 mt-6 w-full bg-gray-100 dark:bg-gray-800 rounded-3xl animate-pulse"></div>,
  ssr: false, // Tắt render phía server vì biểu đồ cần window
});

/* ----------------- Clock Hook ----------------- */
const useVNClock = () => {
  const [time, setTime] = useState<dayjs.Dayjs | null>(null);

  useEffect(() => {
    setTime(toVN7(new Date()));
    const timer = setInterval(() => {
      setTime(toVN7(new Date()));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return { 
    timeStr: time ? time.format("HH:mm:ss") : "--:--:--", 
    dateStr: time ? time.format("dddd, DD/MM/YYYY") : "Đang tải..." 
  };
};

/* ----------------- Types ----------------- */
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

/* ----------------- Component Chính ----------------- */
export default function EmployeeHomePage() {
  const router = useRouter();
  const webcamRef = useRef<Webcam>(null);
  const { timeStr, dateStr } = useVNClock();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Trạng thái Camera & Scan
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [autoScan, setAutoScan] = useState(true);
  
  // Trạng thái hiển thị
  const [scanStatus, setScanStatus] = useState<string>("");
  const [scanError, setScanError] = useState<boolean>(false);
  const [scanClass, setScanClass] = useState(styles.scanActive);
  
  // Dữ liệu
  const [attendanceRecord, setAttendanceRecord] = useState<AttendanceRecord>({});
  const [caLamViec, setCaLamViec] = useState<CaLamViec|null>(null);

  // Refs
  const attendanceRef = useRef(attendanceRecord);
  const autoScanRef = useRef(autoScan);
  
  useEffect(() => { attendanceRef.current = attendanceRecord; }, [attendanceRecord]);
  useEffect(() => { autoScanRef.current = autoScan; }, [autoScan]);

  /* ----------------- Fetch Data ----------------- */
  const fetchData = useCallback(async () => {
    try {
      const u = getUserFromToken();
      if (!u) { router.push("/auth/login"); return; }
      setUser(u);
      
      const [resShift, resToday] = await Promise.all([
        api.get("/calamviec/current-shift"),
        api.get(`/chamcong/today/${u.maNV}`),
      ]);
      
      setCaLamViec(resShift.data || null);
      setAttendanceRecord(resToday.data || {});

      if (resToday.data?.gioVao && resToday.data?.gioRa) {
        setAutoScan(false);
        setScanStatus("Đã hoàn thành chấm công hôm nay!");
        setScanClass(styles.scanSuccess);
      }
    } catch (error) {
      console.error(error);
      toast.error("Lỗi tải dữ liệu chấm công!");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { fetchData(); }, [fetchData]);

  /* ----------------- Auto Scan Logic ----------------- */
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const scanFace = async () => {
      if (!webcamRef.current || !cameraReady || isProcessing || !autoScanRef.current) return;
      
      const record = attendanceRef.current;
      if (record.gioVao && record.gioRa) return;

      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) return;

      setIsProcessing(true);
      setScanStatus("Đang nhận diện...");
      setScanError(false);
      setScanClass(styles.scanActive);

      try {
        const res = await api.post("/facedata/point-mobile", {
          maNV: user.maNV,
          imageBase64: imageSrc,
          maCa: caLamViec?.maCa
        });

        if (res.data.type === 'ignored') {
          setScanStatus("⏳ Vui lòng đợi 5 phút trước khi tiếp tục...");
          setScanClass(styles.scanActive);
          setAutoScan(false); 
          
          setTimeout(() => {
             if(window.location.pathname.includes('chamcong')) setAutoScan(true);
          }, 5 * 60 * 1000);
          
          return; 
        }

        toast.success(res.data.message);
        setScanStatus("✅ " + res.data.message);
        setScanClass(styles.scanSuccess);

        await fetchData();

        if (attendanceRef.current.gioVao && !attendanceRef.current.gioRa) {
          setAutoScan(false);
          setTimeout(() => setAutoScan(true), 10000); 
        }

      } catch (err: any) {
        setScanError(true);
        setScanClass(styles.scanError);
        const msg = err.response?.data?.message || "";
        if (msg.toLowerCase().includes("không khớp") || msg.toLowerCase().includes("unknown")) {
            setScanStatus("Khuôn mặt không khớp. Thử lại...");
        } else {
            setScanStatus("Không tìm thấy khuôn mặt...");
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

  if (loading) return <div className="flex justify-center p-10"><FaSpinner className="animate-spin text-3xl text-blue-500 dark:text-blue-400"/></div>;

  return (
    <MobileLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8 transition-colors duration-300">

        <HeaderSection timeStr={timeStr} dateStr={dateStr} user={user} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Cột trái: Camera & Stats */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6 border border-gray-100 dark:border-gray-700 flex flex-col items-center transition-colors duration-300">
              
              <div className="text-center mb-6">
                <p className="text-xs font-bold text-gray-400 dark:text-gray-300 uppercase tracking-widest">Ca làm việc hiện tại</p>
                <p className="text-3xl font-bold text-gray-800 dark:text-gray-100 mt-2">{caLamViec ? caLamViec.tenCa : "Tự do"}</p>
                {caLamViec && (
                  <span className="text-sm text-blue-600 dark:text-blue-400 font-semibold bg-blue-50 dark:bg-blue-900 px-3 py-1 rounded-full inline-block mt-2">
                      {formatTime(caLamViec.gioBatDau, "HH:mm")} - {formatTime(caLamViec.gioKetThuc, "HH:mm")}
                  </span>
                )}
              </div>

              <div className="relative w-72 h-72 md:w-80 md:h-80 rounded-full p-1 bg-gradient-to-tr from-blue-500 to-purple-500 shadow-2xl mb-4">
                <div className={`w-full h-full rounded-full bg-black dark:bg-gray-900 relative overflow-hidden ${styles.cameraWrapper}`}>
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    width={400}
                    height={400}
                    videoConstraints={{ facingMode: "user", aspectRatio: 1 }}
                    onUserMedia={() => setCameraReady(true)}
                    className="w-full h-full object-cover scale-x-[-1] rounded-full"
                  />
                  <div className={`${styles.scanCircle} ${scanClass}`}></div>
                  
                  {!cameraReady && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 dark:bg-gray-800/80 text-white p-4 text-center rounded-full">
                      <FaCamera className="w-8 h-8 mb-2 animate-bounce" />
                      <span className="text-xs">Đang bật Camera...</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="h-8 mb-6 flex items-center justify-center">
                {isProcessing ? (
                  <p className="text-blue-600 dark:text-blue-400 font-medium flex items-center gap-2 text-sm">
                    <FaSpinner className="animate-spin"/> Đang nhận diện...
                  </p>
                ) : scanStatus ? (
                  <p className={`text-sm font-bold flex items-center gap-2 ${scanError ? 'text-red-500' : 'text-green-600 dark:text-green-400'}`}>
                    {scanError && <FaExclamationCircle />} {scanStatus}
                  </p>
                ) : autoScan ? (
                  <p className="text-gray-400 dark:text-gray-500 text-xs italic animate-pulse">
                    ◉ Đang tự động quét...
                  </p>
                ) : (
                  <button onClick={() => { setScanStatus(""); setAutoScan(true); }} className="text-blue-500 dark:text-blue-400 font-bold hover:underline text-sm flex items-center gap-1">
                      ▶ Tiếp tục quét
                  </button>
                )}
              </div>

              <AttendanceStats attendanceRecord={attendanceRecord} />
            </div>

            <WorkChart />
            
          </div>

          {/* Cột phải: Lịch sử */}
          <HistorySidebar attendanceRecord={attendanceRecord} />
          
        </div>
      </div>
    </MobileLayout>
  );
}