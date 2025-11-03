"use client";
import { useEffect, useRef, useState } from "react";
import MobileLayout from "@/layouts/MobileLayout";
import api from "@/utils/api";
import * as faceapi from "face-api.js";
import { loadFaceModels } from "@/utils/face";
import { getUserFromToken } from "@/utils/auth";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify"; 
import { getCurrentPosition } from "@/utils/location";

// --- Interface ---
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

// --- Format time ---
const formatTime = (dateString: string | undefined): string => {
  if (!dateString) return "--:--";
  const date = new Date(dateString);
  const hour = date.getHours().toString().padStart(2, "0");
  const minute = date.getMinutes().toString().padStart(2, "0");
  return `${hour}:${minute}`;
};

export default function EmployeeHome() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loading, setLoading] = useState(true);
  const [maNV, setMaNV] = useState<number | null>(null);
  const [hoTen, setHoTen] = useState("");
  const [attendanceRecord, setAttendanceRecord] = useState<AttendanceRecord>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [caLamViec, setCaLamViec] = useState<CaLamViec | null>(null);
  const [checkoutWarning, setCheckoutWarning] = useState(false);
  const [checkoutPayload, setCheckoutPayload] = useState<any>(null);

  const icons = { success: "✅", error: "❌", info: "ℹ️" };

  // --- Load user, ca làm việc & bản ghi ---
  useEffect(() => {
    const init = async () => {
      try {
        const user = getUserFromToken();
        if (!user) return router.push("/login");

        setMaNV(user.maNV);
        setHoTen(user.hoTen || "");

        await loadFaceModels();
        toast.info(`${icons.info} Tải mô hình nhận diện thành công.`);

        const caRes = await api.get("/calamviec/current-shift");
        if (caRes.data) {
          setCaLamViec(caRes.data);
        } else {
          setCaLamViec(null);
          toast.info(`${icons.info} Hiện tại bạn chưa có ca làm việc.`);
        }

        const res = await api.get(`/chamcong/today/${user.maNV}`);
        if (res.data) {
          setAttendanceRecord(res.data); 
        }
      } catch (err: any) {
        console.error("❌ init error:", err);
        toast.error(`${icons.error} Không thể tải dữ liệu chấm công!`);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [router]);

  // --- Camera ---
  useEffect(() => {
    const startCamera = async () => {
      const video = videoRef.current;
      if (!video) return;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
        video.onloadedmetadata = () => video.play();
      } catch (err) {
        console.error("❌ camera error:", err);
        toast.error(`${icons.error} Không thể mở camera. Vui lòng cấp quyền.`);
      }
    };

    if (!loading) startCamera();

    return () => {
      const video = videoRef.current;
      if (video?.srcObject) {
        const stream = video.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [loading]);

  const handleAutoCheck = async (): Promise<boolean> => {
    if (isProcessing || !videoRef.current || !maNV) return false;
    setIsProcessing(true);
    console.log("🚀 handleAutoCheck start...");

    try {
      // --- Lấy vị trí GPS ---
      let position;
      try {
        position = await getCurrentPosition();
      } catch (locationError: any) {
        let errorMessage = "Không thể lấy vị trí. Vui lòng cấp quyền và thử lại.";
        if (locationError.code === 1) errorMessage = "Bạn đã từ chối quyền truy cập vị trí.";
        if (locationError.code === 2) errorMessage = "Không thể xác định vị trí.";
        if (locationError.code === 3) errorMessage = "Yêu cầu vị trí đã hết hạn.";

        toast.error(`${icons.error} ${errorMessage}`);
        setIsProcessing(false);
        return false;
      }

      const { latitude, longitude } = position.coords;
      console.log("📍 GPS:", latitude, longitude);

      // --- Nhận diện khuôn mặt ---
      const detection = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection?.descriptor) {
        toast.error(`${icons.error} Không nhận diện được khuôn mặt!`);
        setIsProcessing(false);
        return false;
      }
      console.log("😀 Face detected");

      // --- Tạo payload ---
      const payload: any = {
        maNV: Number(maNV), 
        faceDescriptor: Array.from(detection.descriptor).map((n) => Number(n.toFixed(6))),
        latitude: Number(latitude),
        longitude: Number(longitude),
      };

      if (caLamViec?.maCa != null) {
        payload.maCa = Number(caLamViec.maCa);
      }

      console.log("📤 Payload gửi lên:", payload);

      // ---Gọi API ---
      let res;
      if (!attendanceRecord?.gioVao) {
        // Check-in
        res = await api.post("/chamcong/point-face", payload);
        toast.success(`${icons.success} Check-in thành công!`);
      } else if (attendanceRecord?.gioVao && !attendanceRecord?.gioRa) {
        // Check-out
        const now = new Date();
        const gioKetThuc = caLamViec
          ? new Date(`1970-01-01T${caLamViec.gioKetThuc}:00`)
          : null;

        if (gioKetThuc && now < gioKetThuc) {
          setCheckoutWarning(true);       // bật cảnh báo UI
          setCheckoutPayload(payload);    // lưu dữ liệu chuẩn bị gửi check-out
          setIsProcessing(false);
          return false;
        }

        res = await api.post("/chamcong/point-face", payload);
        toast.success(`${icons.success} Check-out thành công!`);
      }

      if (res?.data) {
        const action = res.data.action?.toLowerCase();

         if (action === "checkin") {
           try {
             const todayRes = await api.get(`/chamcong/today/${maNV}`);
                if (todayRes.data) {
                   setAttendanceRecord(todayRes.data);
                }
            } catch (e) {
                console.error("❌ reload after checkin error:", e);
                toast.error(`${icons.error} Không tải được dữ liệu sau khi checkin!`);
              }
          } else if (action === "checkout") {
             try {
               const todayRes = await api.get(`/chamcong/today/${maNV}`);
                 if (todayRes.data) {
                 setAttendanceRecord(todayRes.data);
                }
              } catch (e) {
                console.error("❌ reload after checkout error:", e);
                toast.error(`${icons.error} Không tải được dữ liệu sau khi checkout!`);
              }
            }

             console.log("📥 API response:", res.data);
      }

      return true;
    } catch (err: any) {
      console.error("❌ check error:", err);
      toast.error(`${icons.error} ${err.response?.data?.message || "Lỗi chấm công!"}`);
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  // --- Auto trigger check khi camera sẵn sàng ---
  useEffect(() => {
    if (!loading && !isProcessing && (!attendanceRecord.gioVao || !attendanceRecord.gioRa)) {
      let attempts = 0;

      const tryCheck = async () => {
        attempts++;
        console.log(`🔄 Auto attempt #${attempts}`);
        const success = await handleAutoCheck();
        if (!success && attempts < 3) {
          setTimeout(tryCheck, 2000); // thử lại sau 2s
        }
      };

      const timer = setTimeout(tryCheck, 2000); // delay lúc đầu
      return () => clearTimeout(timer);
    }
  }, [loading, attendanceRecord.gioVao, attendanceRecord.gioRa]);

  // --- JSX ---
  return (
    <MobileLayout>
      <div className="p-4 flex flex-col items-center min-h-screen bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] text-white">
        <p className="text-lg font-semibold mb-2">Xin Chào, {hoTen}</p>
        <h1 className="text-2xl font-bold mb-6">Chấm công hôm nay</h1>

        {/* Camera */}
        <div
            className="relative mb-6 border-4 rounded-full overflow-hidden shadow-[0_0_40px_rgba(59,130,246,0.9)]"
            style={{ width: 360, height: 360 }}>

          <video
            ref={videoRef} autoPlay muted className="w-full h-full object-cover object-center rounded-full"
          />
          {/* Hiệu ứng quét cong quanh khung tròn */}
        <div className="absolute inset-0 rounded-full pointer-events-none z-10">
           <div className="scan-circle"></div>
          </div>
        </div>

        {/* Ca làm việc */}
        <div className="w-full max-w-sm text-center mb-4 bg-white/10 backdrop-blur-md p-4 rounded-xl shadow-md border border-white/20">
          {caLamViec ? (
            <>
              <p className="text-lg font-semibold">{caLamViec.tenCa}</p>
              <p>
                {caLamViec.gioBatDau} - {caLamViec.gioKetThuc}
              </p>
            </>
          ) : (
            <p className="text-gray-300 italic">Chưa có ca làm việc hiện tại</p>
          )}
        </div>

        {/* Giờ vào/ra */}
        <div className="w-full max-w-sm text-center mb-6 bg-white/10 backdrop-blur-md p-5 rounded-2xl shadow-lg space-y-3 border border-white/20">
          <p className="text-lg">
            Giờ vào:{" "}
            <span className="font-semibold text-green-400">
              {formatTime(attendanceRecord?.gioVao)}
            </span>
          </p>
          <p className="text-lg">
            Giờ ra:{" "}
            <span className="font-semibold text-red-400">
              {formatTime(attendanceRecord?.gioRa)}
            </span>
          </p>
        </div>
          {checkoutWarning && (
             <div className="mt-3 p-3 bg-yellow-100 border border-yellow-400 rounded-lg text-center">
              <p className="text-yellow-700 font-semibold">
               ⚠️ Ca làm việc chưa kết thúc. Bạn có chắc muốn check-out sớm không?
              </p>
              <div className="flex justify-center gap-3 mt-2">
               <button
                 onClick={async () => {
                   try {
                     const res = await api.post("/chamcong/point-face", checkoutPayload);
                       toast.success("✅ Check-out sớm thành công!");
                         if (res?.data) {
                            const todayRes = await api.get(`/chamcong/today/${maNV}`);
                            if (todayRes.data) setAttendanceRecord(todayRes.data);
                          }
                    } catch (err: any) {
                        toast.error(`❌ ${err.response?.data?.message || "Lỗi check-out!"}`);
                      }
                        setCheckoutWarning(false);
                        setCheckoutPayload(null);
                  }}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                  >
                  Xác nhận
                </button>
                    <button
                       onClick={() => {
                         setCheckoutWarning(false);
                         setCheckoutPayload(null);
                        }}
                          className="bg-gray-300 text-black px-4 py-2 rounded-lg hover:bg-gray-400"
                        >
                   Hủy
                </button>
              </div>
            </div>
       )}  
    </div>  
  </MobileLayout>
  );
}