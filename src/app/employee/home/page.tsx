"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";
import MobileLayout from "@/layouts/MobileLayout";
import api from "@/utils/api";
import { getUserFromToken } from "@/utils/auth";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { FaSpinner, FaHistory, FaMapMarkerAlt, FaCamera, FaExclamationCircle } from "react-icons/fa";
import { MdWork, MdPerson } from "react-icons/md";
import styles from "@/styles/Camera.module.css";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const VN_TZ = "Asia/Ho_Chi_Minh";

/* ----------------- Helpers ----------------- */
const toVN = (v?: string | Date | number | null): dayjs.Dayjs | null => {
  if (!v) return null;
  const d = dayjs(v).tz(VN_TZ);
  return d.isValid() ? d : null;
};

const formatTime = (v?: string | Date | null) => {
  const d = toVN(v);
  return d ? d.format("HH:mm") : "--:--";
};

const formatTimeFull = (v?: string | Date | null) => {
  const d = toVN(v);
  return d ? d.format("HH:mm:ss") : "--:--:--";
};

const useClock = () => {
  const [time, setTime] = useState(dayjs().tz(VN_TZ));
  useEffect(() => {
    const timer = setInterval(() => setTime(dayjs().tz(VN_TZ)), 1000);
    return () => clearInterval(timer);
  }, []);
  const timeStr = time.format("HH:mm:ss");
  const dateStr = time.format("dddd, DD/MM/YYYY");
  return { timeStr, dateStr };
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

/* ----------------- Component ----------------- */
export default function EmployeeHomePage() {
  const router = useRouter();
  const webcamRef = useRef<Webcam>(null);
  const { timeStr, dateStr } = useClock();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [autoScan, setAutoScan] = useState(true);
  const [scanStatus, setScanStatus] = useState<string>(""); 
  const [scanError, setScanError] = useState<boolean>(false);
  const [scanClass, setScanClass] = useState(styles.scanActive);
  const [attendanceRecord, setAttendanceRecord] = useState<AttendanceRecord>({});
  const [caLamViec, setCaLamViec] = useState<CaLamViec|null>(null);

  const attendanceRef = useRef(attendanceRecord);
  const autoScanRef = useRef(autoScan);
  attendanceRef.current = attendanceRecord;
  autoScanRef.current = autoScan;

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

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    const scanFace = async () => {
      const record = attendanceRef.current;
      if (!webcamRef.current || !cameraReady || isProcessing || !autoScanRef.current) return;
      if (record.gioVao && record.gioRa) {
        setAutoScan(false);
        setScanClass(styles.scanSuccess);
        return;
      }

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
          setScanStatus("⏳ Check-in đã thực hiện, đợi 5 phút trước khi check-out...");
          setScanClass(styles.scanActive);
          setIsProcessing(false);
          setAutoScan(false);
          setTimeout(() => setAutoScan(true), 5 * 60 * 1000);
          return;
        }

        toast.success(res.data.message);
        setScanStatus("✅ " + res.data.message);
        setScanClass(styles.scanSuccess);

        await fetchData();

        if (attendanceRef.current.gioVao && !attendanceRef.current.gioRa) {
          setAutoScan(false);
          setTimeout(() => setAutoScan(true), 5 * 60 * 1000);
        }

        if (attendanceRef.current.gioVao && attendanceRef.current.gioRa) {
          setAutoScan(false);
          setScanClass(styles.scanSuccess);
        }

      } catch (err: any) {
        setScanError(true);
        setScanClass(styles.scanError);
        if (err.response?.data?.message?.includes("không khớp")) {
            setScanStatus("Khuôn mặt không khớp. Thử lại...");
        } else {
            setScanStatus("Không tìm thấy khuôn mặt...");
        }
      } finally {
        setIsProcessing(false);
      }
    };

    if (autoScan) intervalId = setInterval(scanFace, 3000);
    return () => { if(intervalId) clearInterval(intervalId); };
  }, [cameraReady, isProcessing, user, caLamViec, fetchData]);

  if (loading) return <div className="flex justify-center p-10"><FaSpinner className="animate-spin text-3xl text-blue-500 dark:text-blue-400"/></div>;

  return (
    <MobileLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8 transition-colors duration-300">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 w-full gap-4 border-b border-gray-200 dark:border-gray-700 pb-4">
          <div className="flex flex-col">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-blue-600 tracking-tight">{timeStr}</h1>
            <p className="text-gray-500 font-medium text-sm sm:text-base">{dateStr}</p>
          </div>
          <div className="flex flex-row items-center gap-4">
            <div className="flex items-center gap-1 sm:gap-2 text-gray-600 dark:text-gray-300 font-bold">
              <MdWork className="text-blue-500" />
              <span>IT-Global</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 text-gray-700 dark:text-gray-200 font-bold">
              <MdPerson className="text-blue-500" />
              <span>{user?.hoTen || "..."}</span>
            </div>
          </div>
        </div>

        {/* CAMERA + STATUS + GIỜ VÀO/RA */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Camera & Attendance */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6 border border-gray-100 dark:border-gray-700 flex flex-col items-center transition-colors duration-300">
            
            {/* Ca làm việc */}
            <div className="text-center mb-6">
              <p className="text-xs font-bold text-gray-400 dark:text-gray-300 uppercase tracking-widest">Ca làm việc hiện tại</p>
              <p className="text-3xl font-bold text-gray-800 dark:text-gray-100 mt-2">{caLamViec ? caLamViec.tenCa : "Không có ca"}</p>
              <span className="text-sm text-blue-600 dark:text-blue-400 font-semibold bg-blue-50 dark:bg-blue-900 px-3 py-1 rounded-full inline-block mt-2">
                {caLamViec ? `${formatTime(caLamViec.gioBatDau)} - ${formatTime(caLamViec.gioKetThuc)}` : "--:--"}
              </span>
            </div>

            {/* CAMERA */}
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

            {/* STATUS */}
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
                <button onClick={() => setAutoScan(true)} className="text-red-500 dark:text-red-400 font-bold hover:underline text-sm">
                  ▶ Tiếp tục quét
                </button>
              )}
            </div>

            {/* GIỜ VÀO / RA */}
            <div className="grid grid-cols-2 gap-6 w-full max-w-lg">
              <div className="bg-green-50 dark:bg-green-900 p-5 rounded-2xl border border-green-100 dark:border-green-700 flex flex-col items-center transition-colors duration-300">
                <span className="text-sm text-green-600 dark:text-green-400 font-bold uppercase mb-1">Giờ vào</span>
                <span className="text-2xl font-bold text-green-800 dark:text-green-300">{formatTime(attendanceRecord?.gioVao)}</span>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900 p-5 rounded-2xl border border-orange-100 dark:border-orange-700 flex flex-col items-center transition-colors duration-300">
                <span className="text-sm text-orange-600 dark:text-orange-400 font-bold uppercase mb-1">Giờ ra</span>
                <span className="text-2xl font-bold text-orange-800 dark:text-orange-300">{formatTime(attendanceRecord?.gioRa)}</span>
              </div>
            </div>
          </div>

          {/* HISTORY */}
          <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6 border border-gray-100 dark:border-gray-700 h-fit transition-colors duration-300">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-4">
              <FaHistory className="text-blue-500 dark:text-blue-400" /> Hoạt động
            </h2>
            <div className="space-y-6">
              {attendanceRecord?.gioVao ? (
                <>
                  <div className="flex gap-4 items-start">
                    <div className="flex flex-col items-center">
                      <div className="w-4 h-4 rounded-full bg-green-500 dark:bg-green-400 ring-4 ring-green-100 dark:ring-green-700"></div>
                      <div className="w-0.5 h-full bg-gray-200 dark:bg-gray-700 my-1"></div>
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 dark:text-gray-100">Check-in</p>
                      <p className="text-green-600 dark:text-green-400 font-bold text-lg">{formatTime(attendanceRecord.gioVao)}</p>
                    </div>
                  </div>
                  {attendanceRecord?.gioRa && (
                    <div className="flex gap-4 items-start">
                      <div className="flex flex-col items-center">
                        <div className="w-4 h-4 rounded-full bg-orange-500 dark:bg-orange-400 ring-4 ring-orange-100 dark:ring-orange-700"></div>
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 dark:text-gray-100">Check-out</p>
                        <p className="text-orange-600 dark:text-orange-400 font-bold text-lg">{formatTime(attendanceRecord.gioRa)}</p>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-gray-400 dark:text-gray-500">
                  <FaMapMarkerAlt className="text-4xl mb-3 opacity-50"/>
                  <p>Chưa có dữ liệu hôm nay</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
