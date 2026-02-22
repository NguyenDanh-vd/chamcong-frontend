import { MdLogin, MdLogout, MdAccessTime } from "react-icons/md";
import { formatTime } from "@/utils/date";

interface AttendanceStatsProps {
  attendanceRecord: { gioVao?: string; gioRa?: string };
}

export default function AttendanceStats({ attendanceRecord }: AttendanceStatsProps) {
  const gioVao = attendanceRecord?.gioVao ? formatTime(attendanceRecord.gioVao) : "--:--";
  const gioRa = attendanceRecord?.gioRa ? formatTime(attendanceRecord.gioRa) : "--:--";

  return (
    <div className="grid w-full gap-4 md:grid-cols-2">
      <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-[0_10px_30px_-22px_rgba(16,185,129,0.65)]">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
          <MdAccessTime className="text-sm" /> Chấm vào
        </div>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm text-slate-500">Giờ vào</p>
            <p className="text-3xl font-extrabold text-emerald-700">{gioVao}</p>
          </div>
          <div className="rounded-xl bg-emerald-100 p-2.5 text-emerald-700">
            <MdLogin className="text-2xl" />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 to-white p-5 shadow-[0_10px_30px_-22px_rgba(249,115,22,0.65)]">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-orange-700">
          <MdAccessTime className="text-sm" /> Chấm ra
        </div>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm text-slate-500">Giờ ra</p>
            <p className="text-3xl font-extrabold text-orange-700">{gioRa}</p>
          </div>
          <div className="rounded-xl bg-orange-100 p-2.5 text-orange-700">
            <MdLogout className="text-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
