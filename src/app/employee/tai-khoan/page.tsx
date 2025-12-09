"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import api from "@/utils/api";
import MobileLayout from "@/layouts/MobileLayout";
import { Loader2, LogOut } from "lucide-react";
import Webcam from "react-webcam";
import { useTheme } from "@/contexts/ThemeContext";

// Import Components
import ProfileHeader from "@/components/employee/tai-khoan/ProfileHeader";
import UserInfoCard from "@/components/employee/tai-khoan/UserInfoCard";
import SettingsModal from "@/components/employee/tai-khoan/SettingsModal";
import CameraModal from "@/components/employee/tai-khoan/CameraModal";

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

  // States for Modals & Editing
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [cameraVisible, setCameraVisible] = useState(false);

  // States for Data Editing
  const [tempData, setTempData] = useState({ email: "", phone: "", cccd: "", diaChi: "" });
  
  // States for Password
  const [expandPassword, setExpandPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({ old: "", new: "" });
  const [passwordVisibility, setPasswordVisibility] = useState({ old: false, new: false });

  // States for Loading & Messages
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Refs & Avatar
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const webcamRef = useRef<Webcam | null>(null);
  const infoCardRef = useRef<HTMLDivElement>(null);
  const defaultAvatar = "https://via.placeholder.com/150?text=Avatar";

  useEffect(() => { setMounted(true); }, []);

  // --- LOGIC FETCH PROFILE & AUTH ---
  useEffect(() => {
    let isMounted = true;
    const fetchProfile = async () => {
      setAuthLoading(true);
      try {
        const res = await api.get("/nhanvien/profile");
        if (!isMounted) return;
        setUserInfo(res.data);
        setTempData({
          email: res.data.email || "",
          phone: res.data.soDienThoai || "",
          cccd: res.data.cccd || "",
          diaChi: res.data.diaChi || ""
        });
      } catch (err: any) {
        if (err.response?.status !== 401) setMessage({ type: "error", text: "Không thể tải thông tin." });
      } finally {
        if (isMounted) setAuthLoading(false);
      }
    };
    fetchProfile();
    return () => { isMounted = false; };
  }, []);

  // --- LOGIC UPDATE AVATAR ---
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

  // --- HANDLERS ---
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
        email: tempData.email,
        soDienThoai: tempData.phone,
        cccd: tempData.cccd,
        diaChi: tempData.diaChi
      };
      await api.patch("/nhanvien/profile", profilePayload);
      setUserInfo({ ...userInfo, ...profilePayload });
      setMessage({ type: "success", text: "Cập nhật thành công!" });
      setEditingProfile(false);
    } catch (err: any) {
      setMessage({ type: "error", text: err.response?.data?.message || "Lỗi cập nhật." });
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordData.old || !passwordData.new) {
      setMessage({ type: "error", text: "Nhập đầy đủ mật khẩu" });
      return;
    }
    setLoadingPassword(true);
    try {
      await api.put(`/nhanvien/${String(userInfo?.id)}/password`, { oldPassword: passwordData.old, newPassword: passwordData.new });
      setMessage({ type: "success", text: "Đổi mật khẩu thành công!" });
      setPasswordData({ old: "", new: "" });
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
      
      if (avatarPreview && avatarPreview.startsWith("blob:")) URL.revokeObjectURL(avatarPreview);
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      setCameraVisible(false);
    }
  };

  // --- RENDER ---
  if (!mounted || authLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900 animate-pulse">
        <Loader2 className="animate-spin text-3xl text-blue-500" />
      </div>
    );
  }

  if (!userInfo) return null;

  return (
    <MobileLayout>
      <div className="min-h-screen pb-24 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <input 
            type="file" accept="image/*" className="hidden" 
            ref={fileInputRef} 
            onChange={e => {
                const file = e.target.files?.[0];
                if(file) {
                    setAvatarFile(file);
                    setAvatarPreview(URL.createObjectURL(file));
                }
            }} 
        />

        {/* 1. Header Component */}
        <ProfileHeader 
            userInfo={userInfo} 
            avatarPreview={avatarPreview} 
            defaultAvatar={defaultAvatar}
            onOpenSettings={() => setShowSettingsModal(true)}
        />

        <div className="px-4 -mt-10 space-y-6">
          {/* 2. User Info Card Component */}
          <UserInfoCard 
            userInfo={userInfo}
            editing={editingProfile}
            setEditing={setEditingProfile}
            tempData={tempData}
            setTempData={(key, val) => setTempData(prev => ({ ...prev, [key]: val }))}
            onSave={handleSaveChanges}
            onCancel={() => {
                setEditingProfile(false);
                setTempData({
                    email: userInfo.email,
                    phone: userInfo.soDienThoai || "",
                    cccd: userInfo.cccd || "",
                    diaChi: userInfo.diaChi || ""
                });
            }}
            loading={loadingProfile}
            infoCardRef={infoCardRef}
          />

          <button
            onClick={handleLogout}
            className="w-full py-4 rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold flex items-center justify-center gap-2 active:scale-95 transition shadow-sm border border-red-100 dark:border-red-900/30"
          >
            <LogOut size={20} /> Đăng xuất
          </button>
        </div>

        {/* 3. Settings Modal */}
        {showSettingsModal && (
          <SettingsModal 
            onClose={() => setShowSettingsModal(false)}
            theme={theme}
            toggleTheme={toggleTheme}
            onTriggerFile={() => fileInputRef.current?.click()}
            onOpenCamera={() => { setShowSettingsModal(false); setCameraVisible(true); }}
            onStartEditing={() => {
                setShowSettingsModal(false);
                setEditingProfile(true);
                setTimeout(() => infoCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
            }}
            
            expandPassword={expandPassword}
            setExpandPassword={setExpandPassword}
            passwordData={passwordData}
            setPasswordData={(key, val) => setPasswordData(prev => ({ ...prev, [key]: val }))}
            onChangePassword={handleChangePassword}
            loadingPassword={loadingPassword}
            message={message}
            passwordVisibility={passwordVisibility}
            togglePasswordVisibility={(key) => setPasswordVisibility(prev => ({ ...prev, [key]: !prev[key] }))}
          />
        )}

        {/* 4. Camera Modal */}
        {cameraVisible && (
          <CameraModal 
            webcamRef={webcamRef} 
            onCapture={capturePhoto} 
            onCancel={() => setCameraVisible(false)} 
          />
        )}

      </div>
    </MobileLayout>
  );
}