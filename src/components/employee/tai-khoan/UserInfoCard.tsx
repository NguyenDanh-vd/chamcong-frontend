//Phần hiển thị Email, SĐT, Địa chỉ và Form chỉnh sửa.

import { User, Mail, Phone, Shield, MapPin, Loader2 } from "lucide-react";
import CustomButton from "@/components/CustomButton";

interface UserInfoCardProps {
  userInfo: any;
  editing: boolean;
  setEditing: (val: boolean) => void;
  tempData: {
    email: string;
    phone: string;
    cccd: string;
    diaChi: string;
  };
  setTempData: (key: string, val: string) => void;
  onSave: () => void;
  onCancel: () => void;
  loading: boolean;
  infoCardRef: any;
}

export default function UserInfoCard({
  userInfo,
  editing,
  setEditing,
  tempData,
  setTempData,
  onSave,
  onCancel,
  loading,
  infoCardRef,
}: UserInfoCardProps) {
  return (
    <div
      ref={infoCardRef}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
    >
      <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
        <h2 className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
          <User size={18} className="text-blue-500" /> Thông tin cá nhân
        </h2>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="text-xs font-semibold text-blue-600 hover:underline"
          >
            Chỉnh sửa
          </button>
        )}
      </div>

      <div className="p-4 space-y-4">
        {/* Email */}
        <div className="flex items-center gap-3">
          <Mail size={18} className="text-gray-400" />
          {editing ? (
            <input
              value={tempData.email}
              onChange={(e) => setTempData("email", e.target.value)}
              className="input-field"
              placeholder="Email"
            />
          ) : (
            <span className="text-gray-700 dark:text-gray-300">
              {userInfo.email}
            </span>
          )}
        </div>

        {/* Phone */}
        <div className="flex items-center gap-3">
          <Phone size={18} className="text-green-500" />
          {editing ? (
            <input
              value={tempData.phone}
              onChange={(e) => setTempData("phone", e.target.value)}
              className="input-field"
              placeholder="Số điện thoại"
            />
          ) : (
            <span className="text-gray-700 dark:text-gray-300">
              {userInfo.soDienThoai || "Chưa có SĐT"}
            </span>
          )}
        </div>

        {/* CCCD */}
        <div className="flex items-center gap-3">
          <Shield size={18} className="text-orange-500" />
          {editing ? (
            <input
              value={tempData.cccd}
              onChange={(e) => setTempData("cccd", e.target.value)}
              className="input-field"
              placeholder="CCCD"
            />
          ) : (
            <span className="text-gray-700 dark:text-gray-300">
              {userInfo.cccd || "Chưa có CCCD"}
            </span>
          )}
        </div>

        {/* Địa chỉ */}
        <div className="flex items-center gap-3">
          <MapPin size={18} className="text-red-500" />
          {editing ? (
            <textarea
              rows={2}
              value={tempData.diaChi}
              onChange={(e) => setTempData("diaChi", e.target.value)}
              className="input-field resize-none"
              placeholder="Địa chỉ"
            />
          ) : (
            <span className="text-gray-700 dark:text-gray-300">
              {userInfo.diaChi || "Chưa có địa chỉ"}
            </span>
          )}
        </div>

        {/* Actions Buttons */}
        {editing && (
          <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
            <CustomButton
              onClick={onSave}
              disabled={loading}
              style={{ width: "100%" }}
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Lưu thay đổi"
              )}
            </CustomButton>
            <CustomButton
              onClick={onCancel}
              style={{ width: "100%", background: "#ef4444" }}
            >
              Hủy bỏ
            </CustomButton>
          </div>
        )}
      </div>

      <style jsx>{`
        .input-field {
          width: 100%;
          padding: 10px 12px;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
          background-color: #ffffff;
          color: #1f2937;
          outline: none;
          font-size: 0.95rem;
        }
        :global(.dark) .input-field {
          background-color: #374151;
          border-color: #4b5563;
          color: white;
        }
        .input-field:focus {
          border-color: #3b82f6;
        }
      `}</style>
    </div>
  );
}