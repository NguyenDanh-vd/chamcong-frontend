//Phần này hiển thị Avatar, Tên và Nút mở cài đặt.

import { Settings } from "lucide-react";

interface ProfileHeaderProps {
  userInfo: any;
  avatarPreview: string | null;
  defaultAvatar: string;
  onOpenSettings: () => void;
}

export default function ProfileHeader({
  userInfo,
  avatarPreview,
  defaultAvatar,
  onOpenSettings,
}: ProfileHeaderProps) {
  const formatRole = (vaiTro?: string) => {
    if (!vaiTro) return "Không xác định";
    const roleMap: Record<string, string> = {
      nhanvien: "Nhân viên",
      nhansu: "Nhân sự",
      quantrivien: "Quản trị viên",
    };
    return roleMap[vaiTro.toLowerCase()] || vaiTro;
  };

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-gray-800 dark:to-gray-900 p-6 pt-10 pb-16 text-white relative rounded-b-[2.5rem] shadow-lg">
      <button
        onClick={onOpenSettings}
        className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition shadow-md active:scale-95"
      >
        <Settings size={22} />
      </button>

      <div className="flex flex-col items-center">
        <div className="relative w-28 h-28 mb-3 group">
          <div className="w-full h-full rounded-full p-1 bg-white/30 backdrop-blur-sm">
            <img
              src={
                avatarPreview ??
                (userInfo.avatarUrl
                  ? `${userInfo.avatarUrl}?t=${Date.now()}`
                  : defaultAvatar)
              }
              alt="avatar"
              className="w-full h-full rounded-full object-cover bg-white"
            />
          </div>
        </div>
        <h1 className="text-2xl font-bold">{userInfo.hoTen}</h1>
        <p className="text-blue-100 text-sm opacity-90">
          {formatRole(userInfo.role)}
        </p>
      </div>
    </div>
  );
}