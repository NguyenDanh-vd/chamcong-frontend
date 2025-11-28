"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import api from "@/utils/api";
import MobileLayout from "@/layouts/MobileLayout";
import {
  User, Mail, Phone, Shield, Lock,
  Eye, EyeOff, LogOut, Sun, Moon,
  Settings, Check, X, Camera, Loader2, MapPin,
  Image as ImageIcon, UserCog, ChevronRight
} from "lucide-react";
import Webcam from "react-webcam";
import CustomButton from "@/components/CustomButton";
import { useTheme } from "@/contexts/ThemeContext";

interface UserInfo {
  id: number;
  hoTen: string;
  email: string;
  soDienThoai?: string;
  role: string;
  avatarUrl?: string;
  cccd?: string;
  diaChi?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme(); 
  const [mounted, setMounted] = useState(false);

  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  
  // State điều khiển các Modal/Chế độ
  const [showSettingsModal, setShowSettingsModal] = useState(false); 
  const [editingProfile, setEditingProfile] = useState(false); 

  // Password states
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Edit states
  const [tempEmail, setTempEmail] = useState("");
  const [tempPhone, setTempPhone] = useState("");
  const [tempCCCD, setTempCCCD] = useState("");
  const [tempDiaChi, setTempDiaChi] = useState("");

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [cameraVisible, setCameraVisible] = useState(false);
  const webcamRef = useRef<Webcam | null>(null);

  const [authLoading, setAuthLoading] = useState(true);
  const defaultAvatar = "https://via.placeholder.com/150?text=Avatar";

  const infoCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const handler = (e: any) => {
      try { localStorage.removeItem("token"); sessionStorage.removeItem("token"); } catch {}
      router.replace("/auth/login");
    };
    if (typeof window !== "undefined") window.addEventListener("app:unauthorized", handler);
    return () => { if (typeof window !== "undefined") window.removeEventListener("app:unauthorized", handler); };
  }, [router]);

  useEffect(() => {
    let isMounted = true;
    const fetchProfile = async () => {
      setAuthLoading(true);
      try {
        const res = await api.get("/nhanvien/profile");
        if (!isMounted) return;
        setUserInfo(res.data);
        setTempEmail(res.data.email || "");
        setTempPhone(res.data.soDienThoai || "");
        setTempCCCD(res.data.cccd || "");
        setTempDiaChi(res.data.diaChi || "");
      } catch (err: any) {
        if (err.response?.status !== 401) setMessage({ type: "error", text: "Không thể tải thông tin." });
      } finally {
        if (isMounted) setAuthLoading(false);
      }
    };
    fetchProfile();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    return () => { if (avatarPreview && avatarPreview.startsWith("blob:")) URL.revokeObjectURL(avatarPreview); };
  }, [avatarPreview]);

  // Auto update Avatar
  useEffect(() => {
    const updateAvatarOnly = async () => {
        if (avatarFile && userInfo) {
            setLoadingProfile(true);
            try {
                const formData = new FormData();
                formData.append("avatar", avatarFile);
                formData.append("maNV", String(userInfo.id));
                const avatarRes = await api.post(`/nhanvien/${String(userInfo.id)}/avatar`, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                const newAvatarUrl = avatarRes.data.avatarUrl || avatarRes.data.avatar;
                setUserInfo(prev => prev ? ({ ...prev, avatarUrl: `${newAvatarUrl}?t=${Date.now()}` }) : null);
                setMessage({ type: "success", text: "Đổi ảnh đại diện thành công!" });
                setAvatarFile(null); 
            } catch (err) {
                setMessage({ type: "error", text: "Lỗi cập nhật ảnh đại diện." });
            } finally {
                setLoadingProfile(false);
            }
        }
    }
    if (!editingProfile && avatarFile) updateAvatarOnly();
  }, [avatarFile, userInfo, editingProfile]);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 3000);
    return () => clearTimeout(t);
  }, [message]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    router.replace("/auth/login");
  };

  const handleSaveChanges = async () => {
    if (!userInfo) return;
    setLoadingProfile(true);
    setMessage(null);
    try {
      const profilePayload = {
        email: tempEmail,
        soDienThoai: tempPhone,
        cccd: tempCCCD,
        diaChi: tempDiaChi
      };
      await api.patch("/nhanvien/profile", profilePayload);
      
      let updatedUserInfo = { ...userInfo, ...profilePayload };

      if (avatarFile) {
        const formData = new FormData();
        formData.append("avatar", avatarFile);
        formData.append("maNV", String(userInfo.id));
        const avatarRes = await api.post(`/nhanvien/${String(userInfo.id)}/avatar`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        const newAvatarUrl = avatarRes.data.avatarUrl || avatarRes.data.avatar;
        updatedUserInfo = { ...updatedUserInfo, avatarUrl: `${newAvatarUrl}?t=${Date.now()}` };
      }

      setUserInfo(updatedUserInfo);
      setMessage({ type: "success", text: "Cập nhật thành công!" });
      setEditingProfile(false);
    } catch (err: any) {
      setMessage({ type: "error", text: err.response?.data?.message || "Lỗi cập nhật." });
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword) {
      setMessage({ type: "error", text: "Nhập đầy đủ mật khẩu" });
      return;
    }
    setLoadingPassword(true);
    try {
      await api.put(`/nhanvien/${String(userInfo?.id)}/password`, { oldPassword, newPassword });
      setMessage({ type: "success", text: "Đổi mật khẩu thành công!" });
      setOldPassword(""); setNewPassword("");
    } catch (err: any) {
      setMessage({ type: "error", text: err.response?.data?.message || "Lỗi đổi mật khẩu" });
    } finally {
      setLoadingPassword(false);
    }
  };

  const capturePhoto = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
        const byteString = atob(imageSrc.split(",")[1]);
        const mimeString = imageSrc.split(",")[0].split(":")[1].split(";")[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
        const file = new File([ab], "avatar.jpg", { type: mimeString });
        handleFileInput(file);
        setCameraVisible(false);
    }
  };

  const handleFileInput = (file?: File | null) => {
    if (file) {
        if (avatarPreview && avatarPreview.startsWith("blob:")) URL.revokeObjectURL(avatarPreview);
        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const triggerFileInput = () => fileInputRef.current?.click();

  const startEditing = () => {
      setShowSettingsModal(false);
      setEditingProfile(true);
      infoCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  const formatRole = (vaiTro?: string) => {
    if (!vaiTro) return "Không xác định";
    const roleMap: Record<string, string> = { "nhanvien": "Nhân viên", "nhansu": "Nhân sự", "quantrivien": "Quản trị viên" };
    return roleMap[vaiTro.toLowerCase()] || vaiTro;
  };

  if (!mounted || authLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900 text-gray-500 animate-pulse">
        <Loader2 className="animate-spin text-3xl text-blue-500" />
      </div>
    );
  }

  if (!userInfo) return null;

  return (
    <MobileLayout>
      <div className="min-h-screen pb-24 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        
        <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={e => handleFileInput(e.target.files?.[0])} />

        {/* --- HEADER --- */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-gray-800 dark:to-gray-900 p-6 pt-10 pb-16 text-white relative rounded-b-[2.5rem] shadow-lg">
          
          {/* Nút Cài đặt (Góc phải) */}
          <button
            onClick={() => setShowSettingsModal(true)}
            className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition shadow-md active:scale-95"
          >
            <Settings size={22} />
          </button>

          <div className="flex flex-col items-center">
            <div className="relative w-28 h-28 mb-3 group">
              <div className="w-full h-full rounded-full p-1 bg-white/30 backdrop-blur-sm">
                 <img
                    src={avatarPreview ?? (userInfo.avatarUrl ? `${userInfo.avatarUrl}?t=${Date.now()}` : defaultAvatar)}
                    alt="avatar"
                    className="w-full h-full rounded-full object-cover bg-white"
                 />
              </div>
            </div>
            <h1 className="text-2xl font-bold">{userInfo.hoTen}</h1>
            <p className="text-blue-100 text-sm opacity-90">{formatRole(userInfo.role)}</p>
          </div>
        </div>

        {/* --- MAIN CONTENT --- */}
        <div className="px-4 -mt-10 space-y-6">

          {/* CARD 1: THÔNG TIN */}
          <div ref={infoCardRef} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
             <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                <h2 className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                    <User size={18} className="text-blue-500"/> Thông tin cá nhân
                </h2>
                {!editingProfile && (
                    <button onClick={() => setEditingProfile(true)} className="text-xs font-semibold text-blue-600 hover:underline">Chỉnh sửa</button>
                )}
             </div>
             
             <div className="p-4 space-y-4">
                <div className="flex items-center gap-3">
                    <Mail size={18} className="text-gray-400" />
                    {editingProfile ? <input value={tempEmail} onChange={e=>setTempEmail(e.target.value)} className="input-field" placeholder="Email" /> : <span className="text-gray-700 dark:text-gray-300">{userInfo.email}</span>}
                </div>
                <div className="flex items-center gap-3">
                    <Phone size={18} className="text-green-500" />
                    {editingProfile ? <input value={tempPhone} onChange={e=>setTempPhone(e.target.value)} className="input-field" placeholder="Số điện thoại" /> : <span className="text-gray-700 dark:text-gray-300">{userInfo.soDienThoai || "Chưa có SĐT"}</span>}
                </div>
                <div className="flex items-center gap-3">
                    <Shield size={18} className="text-orange-500" />
                    {editingProfile ? <input value={tempCCCD} onChange={e=>setTempCCCD(e.target.value)} className="input-field" placeholder="CCCD" /> : <span className="text-gray-700 dark:text-gray-300">{userInfo.cccd || "Chưa có CCCD"}</span>}
                </div>
                <div className="flex items-center gap-3">
                    <MapPin size={18} className="text-red-500" />
                    {editingProfile ? <textarea rows={2} value={tempDiaChi} onChange={e=>setTempDiaChi(e.target.value)} className="input-field resize-none" placeholder="Địa chỉ" /> : <span className="text-gray-700 dark:text-gray-300">{userInfo.diaChi || "Chưa có địa chỉ"}</span>}
                </div>

                {editingProfile && (
                    <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                        <CustomButton onClick={handleSaveChanges} disabled={loadingProfile} style={{width: '100%'}}>
                            {loadingProfile ? <Loader2 className="animate-spin"/> : "Lưu thay đổi"}
                        </CustomButton>
                        <CustomButton onClick={() => { setEditingProfile(false); setTempEmail(userInfo.email); setTempPhone(userInfo.soDienThoai||""); setTempCCCD(userInfo.cccd||""); setTempDiaChi(userInfo.diaChi||""); }} style={{width: '100%', background: '#ef4444'}}>
                            Hủy bỏ
                        </CustomButton>
                    </div>
                )}
             </div>
          </div>

          {/* 👇 NÚT ĐĂNG XUẤT (ĐÃ CHUYỂN RA NGOÀI) */}
          <button
            onClick={handleLogout}
            className="w-full py-4 rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold flex items-center justify-center gap-2 active:scale-95 transition shadow-sm border border-red-100 dark:border-red-900/30"
          >
            <LogOut size={20} /> Đăng xuất
          </button>

        </div>

        {/* --- MODAL CÀI ĐẶT --- */}
        {showSettingsModal && (
            <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="absolute inset-0" onClick={() => setShowSettingsModal(false)}></div>
                <div className="relative bg-white dark:bg-gray-800 w-full sm:max-w-md sm:mx-auto rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-700/50">
                        <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                            <Settings className="text-purple-500" /> Cài đặt & Bảo mật
                        </h2>
                        <button onClick={() => setShowSettingsModal(false)} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                            <X size={24} className="text-gray-500" />
                        </button>
                    </div>

                    <div className="p-5 space-y-6">
                        {/* Giao diện */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-full ${theme === 'dark' ? 'bg-purple-100 text-purple-600' : 'bg-orange-100 text-orange-500'}`}>
                                    {theme === 'dark' ? <Moon size={20}/> : <Sun size={20}/>}
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-800 dark:text-gray-200">Giao diện</p>
                                    <p className="text-xs text-gray-500">{theme === 'dark' ? 'Chế độ Tối' : 'Chế độ Sáng'}</p>
                                </div>
                            </div>
                            <button onClick={toggleTheme} className={`w-12 h-6 rounded-full p-1 flex items-center transition-colors ${theme === 'dark' ? 'bg-blue-600 justify-end' : 'bg-gray-300 justify-start'}`}>
                                <div className="w-4 h-4 bg-white rounded-full shadow-md"></div>
                            </button>
                        </div>

                        <div className="h-px bg-gray-100 dark:bg-gray-700"></div>

                        {/* Ảnh đại diện */}
                        <div className="space-y-3">
                            <p className="text-sm font-bold text-gray-400 uppercase">Ảnh đại diện</p>
                            <div className="flex gap-3">
                                <button onClick={triggerFileInput} className="flex-1 flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition">
                                    <ImageIcon size={24} />
                                    <span className="text-xs font-semibold">Thư viện ảnh</span>
                                </button>
                                <button onClick={() => { setShowSettingsModal(false); setCameraVisible(true); }} className="flex-1 flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/40 transition">
                                    <Camera size={24} />
                                    <span className="text-xs font-semibold">Chụp ảnh</span>
                                </button>
                            </div>
                        </div>

                        <div className="h-px bg-gray-100 dark:bg-gray-700"></div>

                        {/* Sửa thông tin */}
                        <button onClick={startEditing} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition group">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300">
                                    <UserCog size={20} />
                                </div>
                                <div className="text-left">
                                    <p className="font-semibold text-gray-800 dark:text-gray-200">Sửa thông tin cá nhân</p>
                                    <p className="text-xs text-gray-500">SĐT, Email, CCCD, Địa chỉ</p>
                                </div>
                            </div>
                            <ChevronRight size={18} className="text-gray-400 group-hover:text-blue-500 transition" />
                        </button>

                        <div className="h-px bg-gray-100 dark:bg-gray-700"></div>

                        {/* Đổi mật khẩu */}
                        <div className="space-y-3">
                            <p className="text-sm font-bold text-gray-400 uppercase flex items-center gap-2"><Lock size={14}/> Đổi mật khẩu</p>
                            {message && (
                                <div className={`text-xs p-2 rounded flex items-center gap-2 ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {message.type === 'success' ? <Check size={14}/> : <X size={14}/>} {message.text}
                                </div>
                            )}
                            <div className="relative">
                                <input type={showOld ? "text" : "password"} placeholder="Mật khẩu hiện tại" value={oldPassword} onChange={e => setOldPassword(e.target.value)} className="input-field pr-10"/>
                                <button type="button" onClick={() => setShowOld(!showOld)} className="absolute right-3 top-3 text-gray-400">{showOld ? <EyeOff size={16}/> : <Eye size={16}/>}</button>
                            </div>
                            <div className="relative">
                                <input type={showNew ? "text" : "password"} placeholder="Mật khẩu mới" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="input-field pr-10"/>
                                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-3 text-gray-400">{showNew ? <EyeOff size={16}/> : <Eye size={16}/>}</button>
                            </div>
                            <button onClick={handleChangePassword} disabled={loadingPassword} className="w-full py-2 bg-gray-800 dark:bg-gray-600 text-white rounded-lg font-bold text-sm hover:bg-gray-900 transition flex justify-center">
                                {loadingPassword ? <Loader2 className="animate-spin" size={18}/> : "Cập nhật mật khẩu"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* WEBCAM MODAL */}
        {cameraVisible && (
            <div className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl w-full max-w-sm">
                    <div className="relative rounded-lg overflow-hidden bg-black aspect-square mb-4">
                        <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" className="w-full h-full object-cover" videoConstraints={{facingMode: "user"}} />
                    </div>
                    <div className="flex gap-3">
                        <button onClick={capturePhoto} className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-500/30">Chụp</button>
                        <button onClick={() => setCameraVisible(false)} className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white py-3 rounded-xl font-bold">Hủy</button>
                    </div>
                </div>
            </div>
        )}

        <style jsx>{`
            .input-field { width: 100%; padding: 10px 12px; border-radius: 8px; border: 1px solid #e5e7eb; background-color: #f9fafb; color: #1f2937; outline: none; font-size: 0.95rem; }
            :global(.dark) .input-field { background-color: #374151; border-color: #4b5563; color: white; }
            .input-field:focus { border-color: #3b82f6; background-color: white; }
            :global(.dark) .input-field:focus { background-color: #1f2937; }
        `}</style>
      </div>
    </MobileLayout>
  );
}