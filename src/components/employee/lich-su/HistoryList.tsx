import { format } from "date-fns";
import { FaSpinner } from "react-icons/fa";
import { STATUS_INFO, formatHours, formatDuration } from "./history.utils";

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
      <div className="flex justify-center items-center py-10">
        <FaSpinner className="animate-spin text-blue-500 text-3xl" />
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <p className="text-center text-gray-500 dark:text-gray-400">
        Không có dữ liệu chấm công.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3 overflow-y-auto pb-10">
      {records.map((r, i) => {
        const statusInfo = STATUS_INFO[r.trangThai] || STATUS_INFO.default;
        return (
          <div
            key={i}
            className={`p-4 rounded-lg shadow-md border transition-colors duration-300 
                        bg-white text-gray-900 border-gray-300 
                        dark:bg-gray-800 dark:text-white dark:border-gray-700 ${statusInfo.style}`}
          >
            <div className="flex justify-between items-center font-semibold mb-2">
              <span>{format(new Date(r.gioVao), "dd/MM/yyyy")}</span>
              <span className="flex items-center gap-1.5 text-sm font-bold">
                {statusInfo.icon} {statusInfo.text}
              </span>
            </div>
            <div className="text-sm grid grid-cols-2 gap-x-4 gap-y-1">
              <p>🕒 Giờ vào: {format(new Date(r.gioVao), "HH:mm")}</p>
              <p>
                🏁 Giờ ra:{" "}
                {r.gioRa ? format(new Date(r.gioRa), "HH:mm") : "--:--"}
              </p>
              <p>⏳ Số giờ: {formatHours(r.soGioLam)}</p>
              <p>📅 Ca: {r.caLamViec?.tenCa ?? "--"}</p>
              {r.soPhutDiTre && r.soPhutDiTre > 0 ? (
                <p className="text-red-600 dark:text-red-400 col-span-2">
                  Đi trễ: {formatDuration(r.soPhutDiTre)}
                </p>
              ) : null}
              {r.soPhutVeSom && r.soPhutVeSom > 0 ? (
                <p className="text-orange-600 dark:text-orange-400 col-span-2">
                  Về sớm: {formatDuration(r.soPhutVeSom)}
                </p>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}