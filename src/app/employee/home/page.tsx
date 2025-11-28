"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import MobileLayout from "@/layouts/MobileLayout";
import styles from "@/styles/Camera.module.css"; 
import api from "@/utils/api";
import * as faceapi from "face-api.js";
import { loadFaceModels } from "@/utils/face";
import { getUserFromToken } from "@/utils/auth";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { getCurrentPosition } from "@/utils/location";
import AiChatWidget from "@/components/AiChatWidget";
import { History, CameraOff, Briefcase, User, MapPin } from "lucide-react";

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
        
        const caRes = await api.get("/calamviec/current-shift");
        setCaLamViec(caRes.data||null);

        const res = await api.get(`/chamcong/today/${user.maNV}`);
        setAttendanceRecord(res.data||{});
      }catch(err:any){ toast.error(`${icons.error} Không thể tải dữ liệu chấm công!`); }
      finally{ setLoading(false); }
    }
    init();
  },[router]);

  // --- Camera start ---
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
        toast.error(`Không thể mở camera. Vui lòng cấp quyền.`);
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
      catch(err:any){ setIsProcessing(false); return false; }
      const { latitude, longitude } = pos.coords;

      const detection = await faceapi.detectSingleFace(videoRef.current,new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor();
      if(!detection?.descriptor){ setIsProcessing(false); return false; }

      const payload:any = { maNV:Number(maNV), faceDescriptor:Array.from(detection.descriptor).map(n=>Number(n.toFixed(6))), latitude:Number(latitude), longitude:Number(longitude) };
      if(caLamViec?.maCa!=null) payload.maCa=Number(caLamViec.maCa);

      let res;
      if(!attendanceRecord?.gioVao){
        res = await api.post("/chamcong/point-face",payload); toast.success(`${icons.success} Check-in thành công!`);
      }else if(attendanceRecord?.gioVao && !attendanceRecord?.gioRa){
        const now = new Date();
        const gioKetThuc = caLamViec? new Date(`1970-01-01T${caLamViec.gioKetThuc}:00`):null;
        if(gioKetThuc && now<gioKetThuc && !checkoutWarning){ 
            setCheckoutWarning(true); 
            toast.warn("Cảnh báo: Bạn đang về sớm!");
            setIsProcessing(false); return false; 
        }
        res = await api.post("/chamcong/point-face",payload); toast.success(`${icons.success} Check-out thành công!`);
      }

      if(res?.data){
        try{
          const todayRes = await api.get(`/chamcong/today/${maNV}`);
          if(todayRes.data) setAttendanceRecord(todayRes.data);
        }catch(e){ console.error(e); }
      }
      return true;
    }catch(err:any){ return false; }
    finally{ setIsProcessing(false); }
  },[isProcessing,maNV,caLamViec,attendanceRecord,checkoutWarning]);

  // --- Auto trigger ---
  useEffect(()=>{
    if(!loading && cameraAllowed && !isProcessing && (!attendanceRecord.gioVao || !attendanceRecord.gioRa)){
      const tryCheck=async()=>{ await handleAutoCheck(); }
      const timer = setInterval(tryCheck, 3000);
      return ()=>{ clearInterval(timer); }
    }
  },[loading,cameraAllowed,isProcessing,attendanceRecord,handleAutoCheck]);

  return (
    <MobileLayout>
      {/* Sửa: Dùng text-gray-800 thay vì text-gray-100 */}
      <div className="flex flex-col min-h-full pb-20 text-gray-800">
        
        {/* Header Sáng */}
        <header className="flex justify-between items-start mb-6">
          <div className="flex flex-col">
            <h1 className="text-4xl font-extrabold text-blue-600 tracking-tight">{timeStr}</h1>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mt-1">{dateStr}</p>
          </div>
          <div className="text-right">
            <div className="flex items-center justify-end gap-2 text-gray-600 font-bold text-lg">
                <Briefcase size={20} className="text-blue-500"/>
                <span>IT-Global</span>
            </div>
            <div className="flex items-center justify-end gap-2 text-sm text-gray-500 mt-1">
                <User size={16}/>
                <span className="font-semibold text-gray-700">{hoTen}</span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex flex-col md:flex-row gap-6">
          
          {/* Card Camera: Nền trắng, bóng đổ */}
          <div className="flex-[2] bg-white rounded-3xl shadow-xl p-6 flex flex-col items-center border border-gray-100">
            
            <div className="text-center mb-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Ca làm việc hiện tại</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">
                {caLamViec ? caLamViec.tenCa : "Không có ca"}
                </p>
                <p className="text-sm text-blue-500 font-medium bg-blue-50 px-3 py-1 rounded-full inline-block mt-2">
                    {caLamViec ? `${caLamViec.gioBatDau} - ${caLamViec.gioKetThuc}` : "--:--"}
                </p>
            </div>

            {/* Camera Frame */}
            <div className="relative w-64 h-64 rounded-full p-1 bg-gradient-to-tr from-blue-500 to-purple-500 shadow-lg mb-6">
              {/* Sử dụng CSS Module mới */}
              <div className={`w-full h-full rounded-full bg-black relative ${styles.cameraWrapper}`}>
                 <video ref={videoRef} playsInline muted className="w-full h-full object-cover scale-x-[-1] rounded-full" />
                 
                 <div className={`${styles.scanCircle} ${isProcessing ? styles.scanActive : ''}`}></div>

                 {(cameraAllowed === false) && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/80 text-white p-4 text-center rounded-full">
                        <CameraOff className="w-10 h-10 text-red-500 mb-2" />
                        <span className="text-xs">Chưa cấp quyền Camera</span>
                    </div>
                 )}
              </div>
            </div>

            {/* Trạng thái chấm công */}
            <div className="grid grid-cols-2 gap-4 w-full">
                <div className="bg-green-50 p-4 rounded-2xl flex flex-col items-center border border-green-100">
                    <span className="text-xs text-green-600 font-bold uppercase mb-1">Giờ vào</span>
                    <span className="text-xl font-bold text-green-800">{formatTime(attendanceRecord?.gioVao)}</span>
                </div>
                <div className="bg-orange-50 p-4 rounded-2xl flex flex-col items-center border border-orange-100">
                    <span className="text-xs text-orange-600 font-bold uppercase mb-1">Giờ ra</span>
                    <span className="text-xl font-bold text-orange-800">{formatTime(attendanceRecord?.gioRa)}</span>
                </div>
            </div>
          </div>
          
          {/* Card Lịch sử */}
          <div className="flex-[1] bg-white rounded-3xl shadow-xl p-6 flex flex-col border border-gray-100 h-fit">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 border-b border-gray-100 pb-3">
              <History className="w-5 h-5 text-blue-500" /> Hoạt động
            </h2>
            <div className="flex-1 text-sm text-gray-500">
              {attendanceRecord?.gioVao ? (
                  <ul className="space-y-3">
                      <li className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          <span>Check-in lúc <span className="font-bold text-gray-800">{formatTime(attendanceRecord.gioVao)}</span></span>
                      </li>
                      {attendanceRecord?.gioRa && (
                          <li className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                            <span>Check-out lúc <span className="font-bold text-gray-800">{formatTime(attendanceRecord.gioRa)}</span></span>
                        </li>
                      )}
                  </ul>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 opacity-60">
                    <MapPin className="w-8 h-8 mb-2 text-gray-300"/>
                    <p>Chưa có dữ liệu hôm nay</p>
                </div>
              )}
            </div>
          </div>

        </main>

        {/* Chat Widget */}
        <div className="fixed bottom-24 right-4 z-50">
          {maNV && <AiChatWidget employeeId={maNV} role="nhanvien" />}
        </div>
      </div>
    </MobileLayout>
  );
}