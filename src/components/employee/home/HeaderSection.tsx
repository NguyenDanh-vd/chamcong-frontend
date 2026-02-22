import { MdPerson, MdWork, MdVerifiedUser } from "react-icons/md";

interface HeaderSectionProps {
  timeStr: string;
  dateStr: string;
  user: any;
}

export default function HeaderSection({ timeStr, dateStr, user }: HeaderSectionProps) {
  const avatarText = user?.hoTen
    ? String(user.hoTen)
        .split(" ")
        .filter(Boolean)
        .slice(-2)
        .map((w: string) => w[0]?.toUpperCase())
        .join("")
    : "NV";

  return (
    <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_18px_40px_-28px_rgba(2,132,199,0.45)] md:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="inline-flex items-center rounded-full border border-sky-200 bg-gradient-to-r from-sky-50 to-cyan-50 px-3 py-1 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-sky-700">Trung tâm chấm công khuôn mặt</p>
          </div>
          <h1 className="mt-2 bg-gradient-to-r from-sky-700 via-cyan-600 to-teal-600 bg-clip-text text-3xl font-extrabold text-transparent md:text-4xl">
            {timeStr}
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-600 md:text-base">{dateStr}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-2xl border border-cyan-200 bg-cyan-50 px-3 py-2 text-sm font-semibold text-cyan-800">
            <MdWork className="text-cyan-600" /> IT-Global
          </div>
          <div className="inline-flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">
            <MdVerifiedUser className="text-emerald-600" /> Xác thực khuôn mặt
          </div>
          <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-2.5 py-2">
            <div className="h-9 w-9 overflow-hidden rounded-xl bg-gradient-to-br from-sky-600 to-cyan-500">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user?.hoTen || "Avatar"} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs font-bold text-white">{avatarText}</div>
              )}
            </div>
            <div>
              <p className="text-xs text-slate-500">Nhân viên</p>
              <p className="flex items-center gap-1.5 text-sm font-bold text-slate-800">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-sky-100 text-sky-700">
                  <MdPerson className="text-sm" />
                </span>
                {user?.hoTen || "Đang cập nhật"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
