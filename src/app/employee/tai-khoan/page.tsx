"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import api from "@/utils/api";
import MobileLayout from "@/layouts/MobileLayout";
import { Loader2, LogOut, BellRing } from "lucide-react";
import Webcam from "react-webcam";
import { useTheme } from "@/contexts/ThemeContext";

import ProfileHeader from "@/components/employee/tai-khoan/ProfileHeader";
import UserInfoCard from "@/components/employee/tai-khoan/UserInfoCard";
import SettingsModal from "@/components/employee/tai-khoan/SettingsModal";
import CameraModal from "@/components/employee/tai-khoan/CameraModal";
import PersonalStatsSection from "@/components/employee/tai-khoan/PersonalStatsSection";

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

  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [cameraVisible, setCameraVisible] = useState(false);

  const [tempData, setTempData] = useState({ email: "", phone: "", cccd: "", diaChi: "" });

  const [expandPassword, setExpandPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({ old: "", new: "" });
  const [passwordVisibility, setPasswordVisibility] = useState({ old: false, new: false });

  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const webcamRef = useRef<Webcam | null>(null);
  const infoCardRef = useRef<HTMLDivElement>(null);
  const defaultAvatar = "https://via.placeholder.com/150?text=Avatar";

  useEffect(() => {
    setMounted(true);
  }, []);

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
          diaChi: res.data.diaChi || "",
        });
      } catch (err: any) {
        if (err.response?.status !== 401) {
          setMessage({ type: "error", text: "Không thể tải thông tin tài khoản." });
        }
      } finally {
        if (isMounted) setAuthLoading(false);
      }
    };
    fetchProfile();
    return () => {
      isMounted = false;
    };
  }, []);

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
          setUserInfo((prev) => (prev ? { ...prev, avatarUrl: `${newAvatarUrl}?t=${Date.now()}` } : null));
          setMessage({ type: "success", text: "Đổi ảnh đại diện thành công." });
          setAvatarFile(null);
        } catch {
          setMessage({ type: "error", text: "Lỗi cập nhật ảnh đại diện." });
        } finally {
          setLoadingProfile(false);
        }
      }
    };
    if (!editingProfile && avatarFile) updateAvatarOnly();
  }, [avatarFile, userInfo, editingProfile]);

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
        diaChi: tempData.diaChi,
      };
      await api.patch("/nhanvien/profile", profilePayload);
      setUserInfo({ ...userInfo, ...profilePayload });
      setMessage({ type: "success", text: "Cập nhật thông tin thành công." });
      setEditingProfile(false);
    } catch (err: any) {
      setMessage({ type: "error", text: err.response?.data?.message || "Lỗi cập nhật." });
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordData.old || !passwordData.new) {
      setMessage({ type: "error", text: "Nhập đầy đủ mật khẩu." });
      return;
    }
    setLoadingPassword(true);
    try {
      await api.put(`/nhanvien/${String(userInfo?.id)}/password`, {
        oldPassword: passwordData.old,
        newPassword: passwordData.new,
      });
      setMessage({ type: "success", text: "Đổi mật khẩu thành công." });
      setPasswordData({ old: "", new: "" });
    } catch (err: any) {
      setMessage({ type: "error", text: err.response?.data?.message || "Lỗi đổi mật khẩu." });
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

  if (!mounted || authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="animate-spin text-3xl text-sky-500" />
      </div>
    );
  }

  if (!userInfo) return null;

  return (
    <MobileLayout>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-cyan-50/25 to-white pb-24 transition-colors duration-300 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              setAvatarFile(file);
              setAvatarPreview(URL.createObjectURL(file));
            }
          }}
        />

        <ProfileHeader
          userInfo={userInfo}
          avatarPreview={avatarPreview}
          defaultAvatar={defaultAvatar}
          onOpenSettings={() => setShowSettingsModal(true)}
        />

        <div className="relative z-10 mt-4 space-y-5 px-4">
          {message ? (
            <div
              className={`flex items-center gap-2 rounded-2xl border p-3 text-sm shadow-sm ${
                message.type === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-900/30 dark:text-emerald-300"
                  : "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/40 dark:bg-rose-900/30 dark:text-rose-300"
              }`}
            >
              <BellRing size={16} /> {message.text}
            </div>
          ) : null}

          <UserInfoCard
            userInfo={userInfo}
            editing={editingProfile}
            setEditing={setEditingProfile}
            tempData={tempData}
            setTempData={(key, val) => setTempData((prev) => ({ ...prev, [key]: val }))}
            onSave={handleSaveChanges}
            onCancel={() => {
              setEditingProfile(false);
              setTempData({
                email: userInfo.email,
                phone: userInfo.soDienThoai || "",
                cccd: userInfo.cccd || "",
                diaChi: userInfo.diaChi || "",
              });
            }}
            loading={loadingProfile}
            infoCardRef={infoCardRef}
          />

          <PersonalStatsSection userId={userInfo?.id} />

          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 py-4 font-bold text-rose-700 shadow-sm transition active:scale-[0.99] dark:border-rose-500/40 dark:bg-rose-900/30 dark:text-rose-300"
          >
            <LogOut size={18} /> Đăng xuất
          </button>
        </div>

        {showSettingsModal ? (
          <SettingsModal
            onClose={() => setShowSettingsModal(false)}
            theme={theme}
            toggleTheme={toggleTheme}
            onTriggerFile={() => fileInputRef.current?.click()}
            onOpenCamera={() => {
              setShowSettingsModal(false);
              setCameraVisible(true);
            }}
            onStartEditing={() => {
              setShowSettingsModal(false);
              setEditingProfile(true);
              setTimeout(() => infoCardRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 100);
            }}
            expandPassword={expandPassword}
            setExpandPassword={setExpandPassword}
            passwordData={passwordData}
            setPasswordData={(key, val) => setPasswordData((prev) => ({ ...prev, [key]: val }))}
            onChangePassword={handleChangePassword}
            loadingPassword={loadingPassword}
            message={message}
            passwordVisibility={passwordVisibility}
            togglePasswordVisibility={(key) =>
              setPasswordVisibility((prev) => ({ ...prev, [key]: !prev[key] }))
            }
          />
        ) : null}

        {cameraVisible ? (
          <CameraModal webcamRef={webcamRef} onCapture={capturePhoto} onCancel={() => setCameraVisible(false)} />
        ) : null}
      </div>
    </MobileLayout>
  );
}
