import { FaHistory, FaMapMarkerAlt } from "react-icons/fa";
import { formatTime } from "@/utils/date";
import { MdLogin, MdLogout } from "react-icons/md";

interface HistorySidebarProps {
  attendanceRecord: { gioVao?: string; gioRa?: string };
}

export default function HistorySidebar({ attendanceRecord }: HistorySidebarProps) {
  return (
    <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_45px_-26px_rgba(2,132,199,0.35)] lg:col-span-1">
      <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4">
        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-800">
          <FaHistory className="text-sky-600" /> Hoạt động hôm nay
        </h2>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">Realtime</span>
      </div>

      {attendanceRecord?.gioVao ? (
        <div className="space-y-5">
          <div className="flex gap-3">
            <div className="flex flex-col items-center pt-1">
              <span className="h-3.5 w-3.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
              <span className="mt-2 h-10 w-0.5 bg-slate-200" />
            </div>
            <div className="flex-1 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Check-in</p>
              <p className="mt-1 flex items-center gap-2 text-lg font-bold text-emerald-700">
                <MdLogin /> {formatTime(attendanceRecord.gioVao)}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex flex-col items-center pt-1">
              <span className={`h-3.5 w-3.5 rounded-full ${attendanceRecord.gioRa ? "bg-orange-500 ring-4 ring-orange-100" : "bg-slate-300 ring-4 ring-slate-100"}`} />
            </div>
            <div
              className={`flex-1 rounded-2xl border p-3 ${
                attendanceRecord.gioRa
                  ? "border-orange-200 bg-orange-50/70"
                  : "border-slate-200 bg-slate-50"
              }`}
            >
              <p className={`text-xs font-semibold uppercase tracking-wide ${attendanceRecord.gioRa ? "text-orange-700" : "text-slate-600"}`}>
                Check-out
              </p>
              <p className={`mt-1 flex items-center gap-2 text-lg font-bold ${attendanceRecord.gioRa ? "text-orange-700" : "text-slate-500"}`}>
                <MdLogout /> {attendanceRecord.gioRa ? formatTime(attendanceRecord.gioRa) : "Chưa ghi nhận"}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-cyan-200 bg-cyan-50/80 p-3 text-sm text-cyan-800">
            <p className="font-semibold">Vị trí xác thực</p>
            <p className="mt-1 flex items-center gap-2">
              <FaMapMarkerAlt className="text-cyan-600" /> Văn phòng IT-Global
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-12 text-slate-500">
          <FaMapMarkerAlt className="mb-3 text-3xl opacity-60" />
          <p className="text-sm font-medium">Chưa có dữ liệu chấm công hôm nay</p>
        </div>
      )}
    </aside>
  );
}
