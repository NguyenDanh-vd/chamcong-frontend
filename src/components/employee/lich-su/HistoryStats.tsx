import { formatDuration, formatHours } from "./history.utils";
import { MdAccessTime, MdOutlineWatchLater, MdTrendingDown } from "react-icons/md";

interface HistoryStatsProps {
  totalHours: number;
  totalLateMinutes: number;
  totalEarlyMinutes: number;
}

export default function HistoryStats({ totalHours, totalLateMinutes, totalEarlyMinutes }: HistoryStatsProps) {
  return (
    <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <div className="rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50 to-white p-4 shadow-[0_10px_30px_-24px_rgba(14,165,233,0.8)]">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-sky-700">
          <MdAccessTime /> Tổng giờ làm
        </div>
        <p className="text-2xl font-extrabold text-sky-700">{formatHours(totalHours)}</p>
      </div>

      <div className="rounded-2xl border border-rose-200 bg-gradient-to-br from-rose-50 to-white p-4 shadow-[0_10px_30px_-24px_rgba(244,63,94,0.65)]">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-rose-700">
          <MdOutlineWatchLater /> Đi trễ
        </div>
        <p className="text-2xl font-extrabold text-rose-700">{formatDuration(totalLateMinutes)}</p>
      </div>

      <div className="rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 to-white p-4 shadow-[0_10px_30px_-24px_rgba(249,115,22,0.65)] sm:col-span-2 lg:col-span-1">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-orange-700">
          <MdTrendingDown /> Về sớm
        </div>
        <p className="text-2xl font-extrabold text-orange-700">{formatDuration(totalEarlyMinutes)}</p>
      </div>
    </div>
  );
}
