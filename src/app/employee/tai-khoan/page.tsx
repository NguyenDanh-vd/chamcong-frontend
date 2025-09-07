"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  User, Mail, Phone, Shield, Lock,
  Eye, EyeOff, LogOut, Sun, Moon
} from "lucide-react";
import { FaCheckCircle, FaTimesCircle, FaSpinner } from "react-icons/fa";
import Webcam from "react-webcam";
import CustomButton from "@/components/CustomButton";
// --- Giao diện (Interface) cho thông tin người dùng ---
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

// --- Cấu hình Axios mặc định ---
axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_URL;
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default function ProfilePage() {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [darkMode, setDarkMode] = useState(false);

  const [tempEmail, setTempEmail] = useState("");
  const [tempPhone, setTempPhone] = useState("");
  const [tempCCCD, setTempCCCD] = useState("");
  const [tempDiaChi, setTempDiaChi] = useState("");

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [cameraVisible, setCameraVisible] = useState(false);
  const webcamRef = useRef<Webcam>(null);

  const defaultAvatar = "https://via.placeholder.com/150?text=Avatar";

  // --- Lấy thông tin người dùng ---
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");

    axios.get("/nhanvien/profile")
      .then(res => {
        setUserInfo(res.data);
        setTempEmail(res.data.email);
        setTempPhone(res.data.soDienThoai || "");
        setTempCCCD(res.data.cccd || "");
        setTempDiaChi(res.data.diaChi || "");
      })
      .catch(() => router.push("/login"));
  }, [router]);

  // --- Ẩn message sau 3 giây ---
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [message]);

  useEffect(() => {
  const savedTheme = localStorage.getItem("theme");
  const isDark = savedTheme === "dark";

  setDarkMode(isDark);
  document.documentElement.classList.toggle("dark", isDark);
}, []);

// Hàm toggle
const toggleDarkMode = () => {
  const newMode = !darkMode;
  setDarkMode(newMode);
  localStorage.setItem("theme", newMode ? "dark" : "light");
  document.documentElement.classList.toggle("dark", newMode);
};

  const handleLogout = () => {
    localStorage.clear();
    router.push("/auth/login");
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
      const profileRes = await axios.patch("/nhanvien/profile", profilePayload);
      let updatedUserInfo = profileRes.data;

      if (avatarFile) {
        console.log("DEBUG userInfo.id (avatar):", userInfo?.id); 

        const formData = new FormData();
        formData.append("avatar", avatarFile);
        formData.append("maNV", String(userInfo.id));
        const avatarRes = await axios.post(`/nhanvien/${String(userInfo.id)}/avatar`, 
        formData,
          {
           headers: { "Content-Type": "multipart/form-data" }, // 👈 quan trọng
          }
        );
        const newAvatarUrl = avatarRes.data.avatarUrl || avatarRes.data.avatar;
        updatedUserInfo = { ...updatedUserInfo, avatarUrl: `${newAvatarUrl}?t=${Date.now()}` };
      }

      setUserInfo(updatedUserInfo);
      setMessage({ type: "success", text: "Cập nhật thông tin thành công!" });
      setEditingProfile(false);
      setAvatarFile(null);
      setAvatarPreview(null);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại.";
      setMessage({ type: "error", text: errorMessage });
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword) {
      setMessage({ type: "error", text: "Vui lòng nhập đầy đủ thông tin" });
      return;
    }
    if (!userInfo) return;

    setLoadingPassword(true);
    try {
      await axios.put(`/nhanvien/${String(userInfo.id)}/password`, { oldPassword, newPassword });
      setMessage({ type: "success", text: "Đổi mật khẩu thành công!" });
      setOldPassword("");
      setNewPassword("");
    } catch (err: any) {
      setMessage({ type: "error", text: err.response?.data?.message || "Lỗi đổi mật khẩu" });
    } finally {
      setLoadingPassword(false);
    }
  };

  const capturePhoto = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) return;

    const byteString = atob(imageSrc.split(",")[1]);
    const mimeString = imageSrc.split(",")[0].split(":")[1].split(";")[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);

    const file = new File([ab], "avatar.jpg", { type: mimeString });
    setAvatarFile(file);
    setAvatarPreview(imageSrc);
    setCameraVisible(false);
  };

  const formatRole = (vaiTro?: string) => {
  if (!vaiTro) return "Không xác định"; // fallback nếu null/undefined

  switch (vaiTro.toLowerCase()) {
    case "nhanvien": return "Nhân viên";
    case "nhansu": return "Nhân sự";
    case "quantrivien": return "Quản trị viên";
    default: return vaiTro;
  }
};

  if (!userInfo) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100 dark:bg-gray-900 text-gray-500 text-lg animate-pulse">
        Đang tải thông tin...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex justify-center items-center p-4 bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="max-w-lg w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white text-center relative">
          <div className="absolute top-4 right-4 cursor-pointer" onClick={toggleDarkMode}>
            {darkMode ? <Sun size={24} /> : <Moon size={24} />}
          </div>

          <div className="mx-auto w-24 h-24 mb-3 relative">
            <img
              src={avatarPreview ||(userInfo.avatarUrl ? `${userInfo.avatarUrl}?t=${Date.now()}` : defaultAvatar)}
              alt="avatar"
              className="w-full h-full rounded-full object-cover shadow-lg bg-white/20"
            />
            {editingProfile && (
              <label className="absolute inset-0 flex justify-center items-center bg-black/50 rounded-full cursor-pointer opacity-0 hover:opacity-100 transition-opacity">
                <User size={24} className="text-white" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0] || null;
                    setAvatarFile(file);
                    if (file) setAvatarPreview(URL.createObjectURL(file));
                  }}
                />
              </label>
            )}
          </div>

          <h1 className="text-2xl font-bold">{userInfo.hoTen}</h1>
          <p className="text-sm text-blue-100">Thông tin tài khoản</p>
        </div>

        {/* Profile info */}
        <div className="p-6 space-y-4 border-b border-gray-200 dark:border-gray-700">
          {/* Email */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm">
            <Mail className="text-blue-500" />
            {editingProfile ? (
              <input
                type="email"
                value={tempEmail}
                onChange={e => setTempEmail(e.target.value)}
                className="w-full p-1 rounded-md border dark:border-gray-600 dark:bg-gray-800"
              />
            ) : (
              <span>{userInfo.email}</span>
            )}
          </div>

          {/* Số điện thoại */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm">
            <Phone className="text-green-500" />
            {editingProfile ? (
              <input
                type="text"
                value={tempPhone}
                onChange={e => setTempPhone(e.target.value)}
                className="w-full p-1 rounded-md border dark:border-gray-600 dark:bg-gray-800"
              />
            ) : (
              <span>{userInfo.soDienThoai || "Chưa có"}</span>
            )}
          </div>

          {/* CCCD */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm">
            <Shield className="text-orange-500" />
            {editingProfile ? (
              <input
                type="text"
                value={tempCCCD}
                onChange={e => setTempCCCD(e.target.value)}
                className="w-full p-1 rounded-md border dark:border-gray-600 dark:bg-gray-800"
              />
            ) : (
              <span>CCCD: {userInfo.cccd || "Chưa có"}</span>
            )}
          </div>

          {/* Địa chỉ */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm">
            <Shield className="text-pink-500" />
            {editingProfile ? (
              <textarea
                value={tempDiaChi}
                onChange={e => setTempDiaChi(e.target.value)}
                className="w-full p-1 rounded-md border dark:border-gray-600 dark:bg-gray-800"
                rows={2}
              />
            ) : (
              <span>Địa chỉ: {userInfo.diaChi || "Chưa có"}</span>
            )}
          </div>

          {/* Role */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm">
            <Shield className="text-purple-500" />
            <span className="capitalize">Vai trò: {formatRole(userInfo.role)}</span>
          </div>

          {/* Buttons */}
          {editingProfile ? (
            <>
              <CustomButton
                onClick={handleSaveChanges}
                disabled={loadingProfile}
                style={{ width: "100%",
                  background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                 }}
              >
                {loadingProfile ? <FaSpinner className="animate-spin" /> : "Lưu thay đổi"}
              </CustomButton>

              <CustomButton
                onClick={() => setCameraVisible(true)}
                style={{ width: "100%" ,
                  background: "linear-gradient(135deg, #22c55e, #16a34a)",
                }}
              >
                Chụp ảnh webcam
              </CustomButton>

              <CustomButton
                onClick={() => {
                  setEditingProfile(false);
                  setAvatarFile(null);
                  setAvatarPreview(null);
                  setTempEmail(userInfo.email);
                  setTempPhone(userInfo.soDienThoai || "");
                  setTempCCCD(userInfo.cccd || "");
                  setTempDiaChi(userInfo.diaChi || "");
                }}
                style={{ width: "100%",
                  background: "linear-gradient(135deg, #ef4444, #dc2626)",
                 }}
              >
                Hủy
              </CustomButton>
            </>
          ) : (
            <CustomButton
              onClick={() => setEditingProfile(true)}
              style={{ width: "100%" }}
            >
              Chỉnh sửa thông tin
            </CustomButton>
          )}
        </div>

        {/* Change password */}
        <div className="p-6 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-800 dark:text-gray-200">
            <Lock className="text-red-500" /> Đổi mật khẩu
          </h2>

          {message && (
            <div
              className={`flex items-center gap-2 p-3 rounded-lg ${
                message.type === "success"
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
              }`}
            >
              {message.type === "success" ? <FaCheckCircle /> : <FaTimesCircle />}
              <span>{message.text}</span>
            </div>
          )}

          <div className="relative">
            <input
              type={showOld ? "text" : "password"}
              placeholder="Mật khẩu cũ"
              value={oldPassword}
              onChange={e => setOldPassword(e.target.value)}
              className="w-full p-3 rounded-lg border dark:border-gray-600 dark:bg-gray-700 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowOld(!showOld)}
              className="absolute inset-y-0 right-3 text-gray-500"
            >
              {showOld ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <div className="relative">
            <input
              type={showNew ? "text" : "password"}
              placeholder="Mật khẩu mới"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="w-full p-3 rounded-lg border dark:border-gray-600 dark:bg-gray-700 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute inset-y-0 right-3 text-gray-500"
            >
              {showNew ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <CustomButton
            onClick={handleChangePassword}
            disabled={loadingPassword}
            style={{ width: "100%" }}
          >
            {loadingPassword ? <FaSpinner className="animate-spin" /> : "Cập nhật mật khẩu"}
          </CustomButton>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-100 dark:bg-gray-700/50 flex justify-end">
          <CustomButton
            onClick={handleLogout}
            style={{background: "linear-gradient(135deg, #ef4444, #dc2626)",}}
          >
            <LogOut /> Đăng xuất
          </CustomButton>
        </div>
      </div>

      {/* Modal webcam */}
      {cameraVisible && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl relative max-w-md w-full">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              width="100%"
              videoConstraints={{ facingMode: "user" }}
            />
            <div className="mt-4 flex justify-between gap-2">
              <CustomButton
                onClick={capturePhoto}
                style={{width: "50%" ,background: "linear-gradient(135deg, #3b82f6, #2563eb)",}}
              >
                Chụp & Lưu
              </CustomButton>
              <CustomButton
                onClick={() => setCameraVisible(false)}
                style={{width: "50%" ,background: "linear-gradient(135deg, #ef4444, #dc2626)",}}
              >
                Hủy
              </CustomButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
