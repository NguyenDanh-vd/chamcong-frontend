"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import MobileLayout from "@/layouts/MobileLayout";
import styles from "@/styles/MobileLayout.module.css";
import api from "@/utils/api";
import * as faceapi from "face-api.js";
import { loadFaceModels } from "@/utils/face";
import { getUserFromToken } from "@/utils/auth";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { getCurrentPosition } from "@/utils/location";
import AiChatWidget from "@/components/AiChatWidget";
import { History, CameraOff } from "lucide-react";

interface AttendanceRecord { gioVao?: string; gioRa?: string; }
interface CaLamViec { maCa:number; tenCa:string; gioBatDau:string; gioKetThuc:string; }

const formatTime = (dateString?:string)=> {
  if(!dateString) return "--:--";
  const d = new Date(dateString);
  return `${d.getHours().toString().padStart(2,"0")}:${d.getMinutes().toString().padStart(2,"0")}`;
};

const useClock = ()=>{
  const [time,setTime]=useState(new Date());
  useEffect(()=>{ const t=setInterval(()=>setTime(new Date()),1000); return ()=>clearInterval(t); },[]);
  const timeStr = time.toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
  const dateStr = time.toLocaleDateString('vi-VN',{weekday:'long',day:'2-digit',month:'2-digit',year:'numeric'});
  return {timeStr,dateStr};
}

export default function EmployeeHome(){
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const {timeStr,dateStr} = useClock();

  const [loading,setLoading]=useState(true);
  const [maNV,setMaNV]=useState<number|null>(null);
  const [hoTen,setHoTen]=useState<string>("");
  const [attendanceRecord,setAttendanceRecord]=useState<AttendanceRecord>({});
  const [isProcessing,setIsProcessing]=useState(false);
  const [caLamViec,setCaLamViec]=useState<CaLamViec|null>(null);
  const [checkoutWarning,setCheckoutWarning]=useState(false);
  const [checkoutPayload,setCheckoutPayload]=useState<any>(null);
  const [cameraAllowed,setCameraAllowed]=useState<boolean|null>(null);
  const icons = { success:"✅", error:"❌", info:"ℹ️" };

  // --- Load user & dữ liệu ---
  useEffect(()=>{
    const init = async()=>{
      try{
        const user = getUserFromToken();
        if(!user) return router.push("/login");
        setMaNV(user.maNV);
        setHoTen(user.hoTen || "");

        await loadFaceModels();
        toast.info(`${icons.info} Tải mô hình nhận diện thành công.`);

        const caRes = await api.get("/calamviec/current-shift");
        setCaLamViec(caRes.data||null);

        const res = await api.get(`/chamcong/today/${user.maNV}`);
        setAttendanceRecord(res.data||{});
      }catch(err:any){ toast.error(`${icons.error} Không thể tải dữ liệu chấm công!`); }
      finally{ setLoading(false); }
    }
    init();
  },[router]);

  // --- Camera start + permission status ---
  useEffect(()=>{
    const startCamera=async()=>{
      const video = videoRef.current;
      if(!video) return;
      try{
        const stream = await navigator.mediaDevices.getUserMedia({video:{ facingMode: "user" }});
        video.srcObject=stream;
        await video.play();
        setCameraAllowed(true);
      }catch(err:any){
        setCameraAllowed(false);
        toast.error(`${icons.error} Không thể mở camera. Vui lòng cấp quyền camera cho trình duyệt.`);
      }
    }
    if(!loading) startCamera();
    return ()=>{
      const video = videoRef.current;
      if(video?.srcObject) (video.srcObject as MediaStream).getTracks().forEach(t=>t.stop());
    }
  },[loading]);

  // --- Auto check-in/out ---
  const handleAutoCheck = useCallback(async()=>{
    if(isProcessing || !videoRef.current || !maNV) return false;
    setIsProcessing(true);
    try{
      let pos;
      try { pos = await getCurrentPosition(); }
      catch(err:any){
        let msg="Không thể lấy vị trí.";
        if(err.code===1) msg="Bạn đã từ chối quyền truy cập vị trí.";
        toast.error(`${icons.error} ${msg}`);
        setIsProcessing(false); return false;
      }
      const { latitude, longitude } = pos.coords;

      const detection = await faceapi.detectSingleFace(videoRef.current,new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor();
      if(!detection?.descriptor){ toast.error(`${icons.error} Không nhận diện được khuôn mặt!`); setIsProcessing(false); return false; }

      const payload:any = { maNV:Number(maNV), faceDescriptor:Array.from(detection.descriptor).map(n=>Number(n.toFixed(6))), latitude:Number(latitude), longitude:Number(longitude) };
      if(caLamViec?.maCa!=null) payload.maCa=Number(caLamViec.maCa);

      let res;
      if(!attendanceRecord?.gioVao){
        res = await api.post("/chamcong/point-face",payload); toast.success(`${icons.success} Check-in thành công!`);
      }else if(attendanceRecord?.gioVao && !attendanceRecord?.gioRa){
        const now = new Date();
        const gioKetThuc = caLamViec? new Date(`1970-01-01T${caLamViec.gioKetThuc}:00`):null;
        if(gioKetThuc && now<gioKetThuc){ setCheckoutWarning(true); setCheckoutPayload(payload); setIsProcessing(false); return false; }
        res = await api.post("/chamcong/point-face",payload); toast.success(`${icons.success} Check-out thành công!`);
      }

      if(res?.data){
        try{
          const todayRes = await api.get(`/chamcong/today/${maNV}`);
          if(todayRes.data) setAttendanceRecord(todayRes.data);
        }catch(e){ console.error(e); }
      }
      return true;
    }catch(err:any){ toast.error(`${icons.error} ${err.response?.data?.message||"Lỗi chấm công!"}`); return false; }
    finally{ setIsProcessing(false); }
  },[isProcessing,maNV,caLamViec,attendanceRecord]);

  // --- Auto trigger (3 attempts) ---
  useEffect(()=>{
    if(!loading && cameraAllowed && !isProcessing && (!attendanceRecord.gioVao || !attendanceRecord.gioRa)){
      let attempts=0;
      let cancelled = false;
      const tryCheck=async()=>{
        if(cancelled) return;
        attempts++;
        const success = await handleAutoCheck();
        if(!success && attempts<3 && !checkoutWarning) setTimeout(tryCheck,2000);
      }
      const timer = setTimeout(tryCheck,1200);
      return ()=>{ cancelled=true; clearTimeout(timer); }
    }
  },[loading,cameraAllowed,isProcessing,attendanceRecord.gioVao,attendanceRecord.gioRa,checkoutWarning,handleAutoCheck]);

  return (
    <MobileLayout>
      <div className={`flex flex-col min-h-screen text-gray-100 ${styles.glassBg}`}>
        {/* Header */}
        <header className="p-4 flex justify-between items-start">
          <div className="flex flex-col headerInfo">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-cyan-400 drop-shadow-lg">{timeStr}</h1>
            <p className="text-sm sm:text-base text-gray-300 mt-1">{dateStr}</p>
          </div>
          <div className="text-right">
            <p className="text-lg sm:text-xl font-semibold text-gray-300 truncate drop-shadow-md">Hệ Thống Chấm Công</p>
            <p className="text-xl sm:text-2xl font-semibold text-gray-300 truncate drop-shadow-md">
             ID: <span className="text-cyan-400">{maNV || "Đang tải..."} • </span>
                 <span className="text-green-400 ml-2">{hoTen || "Đang tải..."}</span> 

            </p>
          </div>
        </header>

        {/* Main */}
        <main className="flex-1 flex flex-col md:flex-row p-4 gap-4 overflow-hidden">
          {/* Camera + Info */}
          <div className="flex-[2] flex flex-col items-center p-4 md:p-6 shadow-lg max-w-full rounded-xl glassCard min-h-[420px]">
            <p className="text-sm font-semibold text-gray-300 mb-2">CA HIỆN TẠI</p>


            <p className="text-lg md:text-xl font-bold text-white mb-4 text-center">
              {caLamViec ? caLamViec.tenCa : "Không có ca"}
              <span className="block text-sm md:text-base text-gray-300">
                {caLamViec ? `${caLamViec.gioBatDau} - ${caLamViec.gioKetThuc}` : "--:-- - --:--"}
              </span>
            </p>

            <div className={`${styles.cameraWrapper} relative w-full max-w-[340px] aspect-square rounded-full overflow-hidden`}>
              <video ref={videoRef} playsInline muted className="w-full h-full object-cover rounded-full" />
              <div className={`${styles.scanCircle} ${isProcessing ? styles.scanActive : ''}`}></div>

              {/* Overlay khi chưa cấp quyền hoặc stream chưa active */}
              {(cameraAllowed === false || (!videoRef.current?.srcObject && cameraAllowed !== null)) && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 z-20 bg-black/55 rounded-full">
                  <CameraOff className="w-12 h-12 text-red-400 mb-2" />
                  <p className="text-sm text-red-300 font-semibold">Không thể truy cập camera. Vui lòng cấp quyền.</p>
                </div>
              )}
            </div>

            <div className="w-full text-center mt-4 p-3 rounded-lg shadow-inner border-none glassCard">
              <p className="attendanceIn text-xl">Giờ vào: {formatTime(attendanceRecord?.gioVao)}</p>
              <p className="attendanceOut text-xl">Giờ ra: {formatTime(attendanceRecord?.gioRa)}</p>
            </div>
          </div>
          
          <div className="w-full h-px bg-white/20 my-4 md:hidden"></div>

          {/* Lịch sử */}
          <div className="flex-[1] p-4 md:p-6 shadow-lg flex flex-col rounded-xl glassCard min-h-[420px]">
            <h2 className="text-lg font-bold text-white mb-2 border-b border-white/20 pb-2 flex items-center gap-2">
              <History className="w-5 h-5 text-gray-400" /> Lịch Sử Gần Đây
            </h2>
            <div className="flex-1 overflow-y-auto text-gray-200 text-sm mt-2">
              <p>Chức năng này sẽ hiển thị lịch sử chấm công của bạn.</p>
              <p className="mt-1 italic text-xs">Chưa có lịch sử chấm công nào.</p>
            </div>
          </div>
        </main>

        {/* Chat Widget */}
        <div className="fixed bottom-20 right-4 z-30">
          {maNV && <AiChatWidget employeeId={maNV} role="nhanvien" />}
        </div>
      </div>
    </MobileLayout>
  );
}
