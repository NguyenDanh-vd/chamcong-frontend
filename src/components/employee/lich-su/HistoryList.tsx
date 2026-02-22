import { format } from "date-fns";
import { FaSpinner } from "react-icons/fa";
import { MdLogin, MdLogout, MdSchedule, MdAccessTime } from "react-icons/md";
import { STATUS_INFO, formatHours, formatDuration, getStatusClasses } from "./history.utils";

interface ChamCong {
  gioVao: string;
  gioRa?: string;
  soGioLam?: number | null;
  trangThai: string;
  caLamViec: { tenCa: string };
  soPhutDiTre?: number;
  soPhutVeSom?: number;
}

interface HistoryListProps {
  loading: boolean;
  records: ChamCong[];
}

export default function HistoryList({ loading, records }: HistoryListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white py-10">
        <FaSpinner className="animate-spin text-3xl text-sky-500" />
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-10 text-center text-slate-500">
        Không có dữ liệu chấm công.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 pb-10">
      {records.map((r, i) => {
        const statusInfo = STATUS_INFO[r.trangThai] || STATUS_INFO.default;
        const badgeClass = getStatusClasses(statusInfo.tone);

        return (
          <article key={i} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_10px_32px_-26px_rgba(2,132,199,0.38)]">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <p className="text-sm font-semibold text-slate-700">{format(new Date(r.gioVao), "dd/MM/yyyy")}</p>
              <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${badgeClass}`}>{statusInfo.text}</span>
            </div>

            <div className="grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
              <p className="flex items-center gap-2">
                <MdLogin className="text-emerald-600" /> Giờ vào: {format(new Date(r.gioVao), "HH:mm")}
              </p>
              <p className="flex items-center gap-2">
                <MdLogout className="text-orange-600" /> Giờ ra: {r.gioRa ? format(new Date(r.gioRa), "HH:mm") : "--:--"}
              </p>
              <p className="flex items-center gap-2">
                <MdAccessTime className="text-sky-600" /> Số giờ: {formatHours(r.soGioLam)}
              </p>
              <p className="flex items-center gap-2">
                <MdSchedule className="text-violet-600" /> Ca: {r.caLamViec?.tenCa ?? "--"}
              </p>

              {r.soPhutDiTre && r.soPhutDiTre > 0 ? (
                <p className="sm:col-span-2 rounded-lg bg-rose-50 px-3 py-2 font-medium text-rose-700">Đi trễ: {formatDuration(r.soPhutDiTre)}</p>
              ) : null}
              {r.soPhutVeSom && r.soPhutVeSom > 0 ? (
                <p className="sm:col-span-2 rounded-lg bg-orange-50 px-3 py-2 font-medium text-orange-700">Về sớm: {formatDuration(r.soPhutVeSom)}</p>
              ) : null}
            </div>
          </article>
        );
      })}
    </div>
  );
}
