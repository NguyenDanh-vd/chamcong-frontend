import { Settings, BadgeCheck } from "lucide-react";

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
    <div className="relative overflow-hidden rounded-b-[2.2rem] border-b border-cyan-200/60 bg-gradient-to-br from-sky-600 via-cyan-500 to-teal-500 px-5 pb-16 pt-10 text-white shadow-[0_24px_55px_-28px_rgba(2,132,199,0.85)]">
      <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-white/15 blur-xl" />
      <div className="pointer-events-none absolute -left-12 bottom-1 h-32 w-32 rounded-full bg-white/10 blur-xl" />

      <button
        onClick={onOpenSettings}
        className="absolute right-4 top-4 rounded-full border border-white/35 bg-white/20 p-2 text-white backdrop-blur transition hover:bg-white/30 active:scale-95"
      >
        <Settings size={20} />
      </button>

      <div className="relative z-10 flex flex-col items-center">
        <div className="mb-3 h-28 w-28 rounded-full border-2 border-white/60 bg-white/25 p-1.5 backdrop-blur-md">
          <img
            src={
              avatarPreview ??
              (userInfo.avatarUrl
                ? `${userInfo.avatarUrl}?t=${Date.now()}`
                : defaultAvatar)
            }
            alt="avatar"
            className="h-full w-full rounded-full object-cover bg-white"
          />
        </div>

        <h1 className="text-2xl font-extrabold tracking-tight">{userInfo.hoTen}</h1>
        <p className="mt-1 inline-flex items-center gap-1 rounded-full border border-white/35 bg-white/20 px-3 py-1 text-xs font-semibold">
          <BadgeCheck size={14} /> {formatRole(userInfo.role)}
        </p>
      </div>
    </div>
  );
}
