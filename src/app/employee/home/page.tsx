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
import { toVN7, formatTime } from "@/utils/date"; 
import dayjs from "dayjs";

/* ----------------- Clock Hook (Chuẩn Timezone VN) ----------------- */
const useVNClock = () => {
  // Khởi tạo null để tránh lỗi Hydration
  const [time, setTime] = useState<dayjs.Dayjs | null>(null);

  useEffect(() => {
    // Set giờ ngay khi mount
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

/* ----------------- Component ----------------- */
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

  // Refs để truy cập state mới nhất trong setInterval
  const attendanceRef = useRef(attendanceRecord);
  const autoScanRef = useRef(autoScan);
  
  // Update refs khi state thay đổi
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

      // Nếu đã check-in và check-out đủ thì dừng scan
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
      // Các điều kiện dừng quét
      if (!webcamRef.current || !cameraReady || isProcessing || !autoScanRef.current) return;
      
      const record = attendanceRef.current;
      // Nếu đã xong cả vào/ra
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

        // Trường hợp backend báo "ignored" (ví dụ: vừa check-in xong, phải đợi 5p)
        if (res.data.type === 'ignored') {
          setScanStatus("⏳ Vui lòng đợi 5 phút trước khi tiếp tục...");
          setScanClass(styles.scanActive);
          setAutoScan(false); // Dừng scan
          
          // Tự động bật lại sau 5 phút (tùy chọn)
          setTimeout(() => {
             // Chỉ bật lại nếu người dùng vẫn ở trang này và chưa xong
             if(window.location.pathname.includes('chamcong')) setAutoScan(true);
          }, 5 * 60 * 1000);
          
          return; // Return sớm, finally sẽ chạy sau
        }

        // Thành công
        toast.success(res.data.message);
        setScanStatus("✅ " + res.data.message);
        setScanClass(styles.scanSuccess);

        // Load lại data mới nhất
        await fetchData();

        // Sau khi check-in thành công (chưa check-out), tạm dừng scan 1 chút để tránh spam request
        if (attendanceRef.current.gioVao && !attendanceRef.current.gioRa) {
          setAutoScan(false);
          // Đợi 10s rồi bật lại scan (để sẵn sàng cho check-out nếu cần, hoặc user tự tắt)
          // Hoặc giữ nguyên logic đợi 5 phút của bạn
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
        intervalId = setInterval(scanFace, 3000); // Quét mỗi 3 giây
    }
    
    return () => clearInterval(intervalId);
  }, [cameraReady, isProcessing, autoScan, user, caLamViec, fetchData]);

  if (loading) return <div className="flex justify-center p-10"><FaSpinner className="animate-spin text-3xl text-blue-500 dark:text-blue-400"/></div>;

  return (
    <MobileLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8 transition-colors duration-300">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 w-full gap-4 border-b border-gray-200 dark:border-gray-700 pb-4">
          <div className="flex flex-col">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-blue-600 tracking-tight min-h-[40px]">
                {timeStr}
            </h1>
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
              <p className="text-3xl font-bold text-gray-800 dark:text-gray-100 mt-2">{caLamViec ? caLamViec.tenCa : "Tự do"}</p>
              {caLamViec && (
                <span className="text-sm text-blue-600 dark:text-blue-400 font-semibold bg-blue-50 dark:bg-blue-900 px-3 py-1 rounded-full inline-block mt-2">
                    {/* Dùng formatTime để đảm bảo hiện giờ VN */}
                    {formatTime(caLamViec.gioBatDau, "HH:mm")} - {formatTime(caLamViec.gioKetThuc, "HH:mm")}
                </span>
              )}
            </div>

            {/* CAMERA FRAME */}
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
                
                {/* Hiệu ứng quét */}
                <div className={`${styles.scanCircle} ${scanClass}`}></div>
                
                {/* Loading Camera */}
                {!cameraReady && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 dark:bg-gray-800/80 text-white p-4 text-center rounded-full">
                    <FaCamera className="w-8 h-8 mb-2 animate-bounce" />
                    <span className="text-xs">Đang bật Camera...</span>
                  </div>
                )}
              </div>
            </div>

            {/* STATUS TEXT & BUTTON */}
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

            {/* DISPLAY TIME IN/OUT */}
            <div className="grid grid-cols-2 gap-6 w-full max-w-lg">
              <div className="bg-green-50 dark:bg-green-900 p-5 rounded-2xl border border-green-100 dark:border-green-700 flex flex-col items-center transition-colors duration-300">
                <span className="text-sm text-green-600 dark:text-green-400 font-bold uppercase mb-1">Giờ vào</span>
                <span className="text-2xl font-bold text-green-800 dark:text-green-300">
                    {attendanceRecord?.gioVao ? formatTime(attendanceRecord.gioVao) : "--:--"}
                </span>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900 p-5 rounded-2xl border border-orange-100 dark:border-orange-700 flex flex-col items-center transition-colors duration-300">
                <span className="text-sm text-orange-600 dark:text-orange-400 font-bold uppercase mb-1">Giờ ra</span>
                <span className="text-2xl font-bold text-orange-800 dark:text-orange-300">
                    {attendanceRecord?.gioRa ? formatTime(attendanceRecord.gioRa) : "--:--"}
                </span>
              </div>
            </div>
          </div>

          {/* HISTORY SIDEBAR */}
          <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6 border border-gray-100 dark:border-gray-700 h-fit transition-colors duration-300">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-4">
              <FaHistory className="text-blue-500 dark:text-blue-400" /> Hoạt động hôm nay
            </h2>
            <div className="space-y-6">
              {attendanceRecord?.gioVao ? (
                <>
                  <div className="flex gap-4 items-start">
                    <div className="flex flex-col items-center">
                      <div className="w-4 h-4 rounded-full bg-green-500 dark:bg-green-400 ring-4 ring-green-100 dark:ring-green-700"></div>
                      <div className="w-0.5 h-full bg-gray-200 dark:bg-gray-700 my-1 min-h-[30px]"></div>
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
                  <p>Chưa có dữ liệu chấm công</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}